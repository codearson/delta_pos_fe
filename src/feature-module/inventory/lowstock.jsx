import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import ImageWithBasePath from "../../core/img/imagewithbasebath";
import {
  ChevronUp,
  Mail,
  RotateCcw,
} from "feather-icons-react/build/IconComponents";
import Table from "../../core/pagination/datatable";
import { setToogleHeader } from "../../core/redux/action";
import EditLowStock from "../../core/modals/inventory/editlowstock";
import { fetchProducts } from "../Api/productApi";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";

const LowStock = () => {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.toggle_header);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // Store all products for filtering
  const [searchQueryLow, setSearchQueryLow] = useState("");
  const [searchQueryOut, setSearchQueryOut] = useState("");
  const [activeTab, setActiveTab] = useState("low");

  const MySwal = withReactContent(Swal);

  const loadProductsData = async () => {
    try {
      const products = await fetchProducts();
      const reversedProducts = products.reverse();
      setAllProducts(reversedProducts); // Store all products
      const lowStock = reversedProducts.filter((product) => 
        product.isActive === true && 
        product.quantity < product.lowStock && 
        product.quantity > 0
      );
      setLowStockProducts(lowStock);
      const outOfStock = reversedProducts.filter((product) => 
        product.isActive === true && 
        product.quantity === 0
      );
      setOutOfStockProducts(outOfStock);
    } catch (error) {
      MySwal.fire({
        title: "Error!",
        text: "Failed to fetch products: " + error.message,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  useEffect(() => {
    loadProductsData();
  }, []);

  const handleSearchChangeLow = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQueryLow(query);

    if (query.trim() !== "") {
      const filteredLowStock = allProducts.filter((product) =>
        product.isActive === true &&
        product.quantity < product.lowStock && 
        product.quantity > 0 &&
        (
          (product.name && product.name.toLowerCase().includes(query)) ||
          (product.barcode && product.barcode.toLowerCase().includes(query)) ||
          (product.productCategoryDto?.productCategoryName && product.productCategoryDto.productCategoryName.toLowerCase().includes(query))
        )
      );
      setLowStockProducts(filteredLowStock);
    } else {
      const lowStock = allProducts.filter((product) => 
        product.isActive === true &&
        product.quantity < product.lowStock && 
        product.quantity > 0
      );
      setLowStockProducts(lowStock);
    }
  };

  const handleSearchChangeOut = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQueryOut(query);

    if (query.trim() !== "") {
      const filteredOutOfStock = allProducts.filter((product) =>
        product.isActive === true &&
        product.quantity === 0 &&
        (
          (product.name && product.name.toLowerCase().includes(query)) ||
          (product.barcode && product.barcode.toLowerCase().includes(query)) ||
          (product.productCategoryDto?.productCategoryName && product.productCategoryDto.productCategoryName.toLowerCase().includes(query))
        )
      );
      setOutOfStockProducts(filteredOutOfStock);
    } else {
      const outOfStock = allProducts.filter((product) => 
        product.isActive === true &&
        product.quantity === 0
      );
      setOutOfStockProducts(outOfStock);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const renderTooltip = (props) => (
    <Tooltip id="pdf-tooltip" {...props}>
      Pdf
    </Tooltip>
  );
  const renderExcelTooltip = (props) => (
    <Tooltip id="excel-tooltip" {...props}>
      Excel
    </Tooltip>
  );
  const renderRefreshTooltip = (props) => (
    <Tooltip id="refresh-tooltip" {...props}>
      Refresh
    </Tooltip>
  );
  const renderCollapseTooltip = (props) => (
    <Tooltip id="refresh-tooltip" {...props}>
      Collapse
    </Tooltip>
  );

  const exportToPDF = () => {
    const data = activeTab === "low" ? lowStockProducts : outOfStockProducts;
    const title = activeTab === "low" ? "Low Stocks" : "Out of Stocks";
    try {
      if (!data || data.length === 0) {
        MySwal.fire({
          title: "No Data",
          text: "There are no products to export",
          icon: "warning",
          confirmButtonText: "OK",
        });
        return;
      }

      const doc = new jsPDF();
      doc.text(title, 14, 15);

      const tableColumn = ["Product Name", "Bar Code", "Category", "Tax %", "Purchase Price", "Price/Unit", "Qty", "Low Stock"];
      const tableRows = data.map(product => [
        product.name || "",
        product.barcode || "",
        product.productCategoryDto?.productCategoryName || "N/A",
        product.taxDto?.taxPercentage ? `${product.taxDto.taxPercentage}%` : "N/A",
        `$${product.purchasePrice?.toFixed(2) || "0.00"}`,
        `$${product.pricePerUnit?.toFixed(2) || "0.00"}`,
        product.quantity?.toString() || "0",
        product.lowStock?.toString() || "0"
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        theme: "grid",
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      });

      doc.save(`${title.toLowerCase().replace(" ", "_")}.pdf`);
    } catch (error) {
      MySwal.fire({
        title: "Error!",
        text: "Failed to generate PDF: " + error.message,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const exportToExcel = () => {
    const data = activeTab === "low" ? lowStockProducts : outOfStockProducts;
    const title = activeTab === "low" ? "Low Stocks" : "Out of Stocks";
    try {
      if (!data || data.length === 0) {
        MySwal.fire({
          title: "No Data",
          text: "There are no products to export",
          icon: "warning",
          confirmButtonText: "OK",
        });
        return;
      }

      const worksheetData = data.map(product => ({
        "Product Name": product.name || "",
        "Bar Code": product.barcode || "",
        "Category": product.productCategoryDto?.productCategoryName || "N/A",
        "Tax Percentage": product.taxDto?.taxPercentage ? `${product.taxDto.taxPercentage}%` : "N/A",
        "Purchase Price": `$${product.purchasePrice?.toFixed(2) || "0.00"}`,
        "Price Per Unit": `$${product.pricePerUnit?.toFixed(2) || "0.00"}`,
        "Quantity": product.quantity || 0,
        "Low Stock": product.lowStock || 0
      }));

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

      worksheet["!cols"] = [
        { wch: 20 },
        { wch: 15 },
        { wch: 15 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 10 },
        { wch: 10 }
      ];

      XLSX.writeFile(workbook, `${title.toLowerCase().replace(" ", "_")}.xlsx`);
    } catch (error) {
      MySwal.fire({
        title: "Error!",
        text: "Failed to export to Excel: " + error.message,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const columns = [
    {
      title: "Product Name",
      dataIndex: "name",
      sorter: (a, b) => a.name.length - b.name.length,
    },
    {
      title: "Bar Code",
      dataIndex: "barcode",
      sorter: (a, b) => a.barcode.length - b.barcode.length,
    },
    {
      title: "Category",
      dataIndex: "productCategoryDto",
      render: (productCategoryDto) =>
        productCategoryDto?.productCategoryName || "N/A",
      sorter: (a, b) =>
        (a.productCategoryDto?.productCategoryName || "").localeCompare(
          b.productCategoryDto?.productCategoryName || ""
        ),
    },
    {
      title: "Tax Percentage",
      dataIndex: "taxDto",
      render: (taxDto) => (taxDto ? `${taxDto.taxPercentage}%` : "N/A"),
      sorter: (a, b) => (a.taxDto?.taxPercentage || 0) - (b.taxDto?.taxPercentage || 0),
    },
    {
      title: "Purchase Price",
      dataIndex: "purchasePrice",
      render: (purchasePrice) => `$${purchasePrice.toFixed(2)}`,
      sorter: (a, b) => a.purchasePrice - b.purchasePrice,
    },
    {
      title: "Price Per Unit",
      dataIndex: "pricePerUnit",
      render: (pricePerUnit) => `$${pricePerUnit.toFixed(2)}`,
      sorter: (a, b) => a.pricePerUnit - b.pricePerUnit,
    },
    {
      title: "Qty",
      dataIndex: "quantity",
      sorter: (a, b) => a.quantity - b.quantity,
    },
    {
      title: "Low Stock",
      dataIndex: "lowStock",
      sorter: (a, b) => a.lowStock - b.lowStock,
    },
  ];

  return (
    <div>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="page-title me-auto">
              <h4>{activeTab === "low" ? "Low Stocks" : "Out of Stocks"}</h4>
              <h6>{activeTab === "low" ? "Manage your low stocks" : "Manage your out of stocks"}</h6>
            </div>
            <ul className="table-top-head">
              <li>
                <div className="status-toggle d-flex justify-content-between align-items-center">
                  <input type="checkbox" id="user2" className="check" defaultChecked="true" />
                  <label htmlFor="user2" className="checktoggle">
                    checkbox
                  </label>
                  Notify
                </div>
              </li>
              <li>
                <Link
                  to=""
                  className="btn btn-secondary"
                  data-bs-toggle="modal"
                  data-bs-target="#send-email"
                >
                  <Mail className="feather-mail" />
                  Send Email
                </Link>
              </li>
              <li>
                <OverlayTrigger placement="top" overlay={renderTooltip}>
                  <Link onClick={exportToPDF}>
                    <ImageWithBasePath src="assets/img/icons/pdf.svg" alt="img" />
                  </Link>
                </OverlayTrigger>
              </li>
              <li>
                <OverlayTrigger placement="top" overlay={renderExcelTooltip}>
                  <Link onClick={exportToExcel}>
                    <ImageWithBasePath src="assets/img/icons/excel.svg" alt="img" />
                  </Link>
                </OverlayTrigger>
              </li>
              <li>
                <OverlayTrigger placement="top" overlay={renderRefreshTooltip}>
                  <Link onClick={loadProductsData}>
                    <RotateCcw />
                  </Link>
                </OverlayTrigger>
              </li>
              <li>
                <OverlayTrigger placement="top" overlay={renderCollapseTooltip}>
                  <Link
                    id="collapse-header"
                    className={data ? "active" : ""}
                    onClick={() => dispatch(setToogleHeader(!data))}
                  >
                    <ChevronUp />
                  </Link>
                </OverlayTrigger>
              </li>
            </ul>
          </div>
          <div className="table-tab">
            <ul className="nav nav-pills" id="pills-tab" role="tablist">
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link active"
                  id="pills-home-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#pills-home"
                  type="button"
                  role="tab"
                  aria-controls="pills-home"
                  aria-selected="true"
                  onClick={() => handleTabChange("low")}
                >
                  Low Stocks
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link"
                  id="pills-profile-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#pills-profile"
                  type="button"
                  role="tab"
                  aria-controls="pills-profile"
                  aria-selected="false"
                  onClick={() => handleTabChange("out")}
                >
                  Out of Stocks
                </button>
              </li>
            </ul>
            <div className="tab-content" id="pills-tabContent">
              {/* Low Stocks Tab */}
              <div
                className="tab-pane fade show active"
                id="pills-home"
                role="tabpanel"
                aria-labelledby="pills-home-tab"
              >
                <div className="card table-list-card">
                  <div className="card-body">
                    <div className="table-top">
                      <div className="search-set">
                        <div className="search-input">
                          <input
                            type="text"
                            placeholder="Search"
                            className="form-control form-control-sm formsearch"
                            value={searchQueryLow}
                            onChange={handleSearchChangeLow}
                          />
                          <Link to="#" className="btn btn-searchset">
                            <i data-feather="search" className="feather-search" />
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div className="table-responsive">
                      <Table columns={columns} dataSource={lowStockProducts} />
                    </div>
                  </div>
                </div>
              </div>
              {/* Out of Stocks Tab */}
              <div
                className="tab-pane fade"
                id="pills-profile"
                role="tabpanel"
                aria-labelledby="pills-profile-tab"
              >
                <div className="card table-list-card">
                  <div className="card-body">
                    <div className="table-top">
                      <div className="search-set">
                        <div className="search-input">
                          <input
                            type="text"
                            placeholder="Search"
                            className="form-control form-control-sm formsearch"
                            value={searchQueryOut}
                            onChange={handleSearchChangeOut}
                          />
                          <Link to="#" className="btn btn-searchset">
                            <i data-feather="search" className="feather-search" />
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div className="table-responsive">
                      <Table columns={columns} dataSource={outOfStockProducts} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <EditLowStock />
    </div>
  );
};

export default LowStock;