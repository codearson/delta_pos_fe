import React, { useState, useEffect } from "react";
import { Filter, PlusCircle, Edit, ChevronUp, RotateCcw } from "feather-icons-react/build/IconComponents";
import ImageWithBasePath from "../../core/img/imagewithbasebath";
import Brand from "../../core/modals/inventory/brand";
import Swal from "sweetalert2";
import withReactContent from 'sweetalert2-react-content';
import { all_routes } from "../../Router/all_routes";
import Select from "react-select";
import { Link } from "react-router-dom";
import Table from "../../core/pagination/datatable";
import { fetchProducts, updateProductStatus } from '../Api/productApi';
import { fetchProductCategories } from '../Api/ProductCategoryApi';
import { fetchTaxes } from '../Api/TaxApi';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { setToogleHeader } from "../../core/redux/action";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import "../../style/scss/pages/_categorylist.scss";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTax, setSelectedTax] = useState(null);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [showActive, setShowActive] = useState(true);

  const dispatch = useDispatch();
  const data = useSelector((state) => state.toggle_header);
  const MySwal = withReactContent(Swal);
  const route = all_routes;

  const loadProductsData = async () => {
    try {
      const data = await fetchProducts();
      if (Array.isArray(data)) {
        setAllProducts(data);
        const filteredData = data.filter(product => product.isActive === showActive).reverse();
        setProducts(filteredData);
      } else {
        setAllProducts([]);
        setProducts([]);
      }
    } catch (error) {
      setAllProducts([]);
      setProducts([]);
    }
  };

  const loadFilterOptions = async () => {
    const [categoriesData, taxesData] = await Promise.all([
      fetchProductCategories(),
      fetchTaxes()
    ]);

    const formattedCategories = categoriesData.map(category => ({
      value: category.id,
      label: category.productCategoryName
    }));
    setCategories(formattedCategories);

    const formattedTaxes = taxesData.map(tax => ({
      value: tax.id,
      label: `${tax.taxPercentage}%`
    }));
    setTaxes(formattedTaxes);
  };

  useEffect(() => {
    loadProductsData();
    loadFilterOptions();
  }, [showActive]);

  const handleToggleStatus = async (productId, currentStatus) => {
    const newStatusText = currentStatus ? 'Inactive' : 'Active';

    const result = await MySwal.fire({
      title: 'Are you sure?',
      text: `Do you want to change this product to ${newStatusText}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, change it!',
      cancelButtonText: 'No, cancel'
    });

    if (result.isConfirmed) {
      try {
        const newStatus = currentStatus ? 0 : 1;
        const response = await updateProductStatus(productId, newStatus);
        if (response && response.success !== false) {
          loadProductsData();
          Swal.fire({
            title: 'Success!',
            text: `Product status changed to ${newStatusText}`,
            icon: 'success',
          });
        } else {
          Swal.fire({
            title: 'Error!',
            text: response?.message || 'Failed to update product status.',
            icon: 'error',
          });
        }
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: 'An unexpected error occurred.',
          icon: 'error',
        });
      }
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query.trim() !== '') {
      const filteredData = allProducts.filter(product =>
        product.name?.toLowerCase().includes(query) ||
        product.barcode?.toLowerCase().includes(query) ||
        product.price?.toString().includes(query) ||
        product.quantity?.toString().includes(query) ||
        product.taxDto?.taxPercentage?.toString().includes(query) ||
        product.productCategoryDto?.productCategoryName?.toLowerCase().includes(query)
      );
      setProducts(filteredData.filter(product => product.isActive === showActive));
    } else {
      loadProductsData();
    }
  };

  const applyFilters = () => {
    let filteredData = [...allProducts].filter(product => product.isActive === showActive);

    if (selectedCategory) {
      filteredData = filteredData.filter(product =>
        product.productCategoryDto?.id === selectedCategory.value
      );
    }

    if (selectedTax) {
      filteredData = filteredData.filter(product =>
        product.taxDto?.id === selectedTax.value
      );
    }

    setProducts(filteredData);
  };

  const toggleFilterVisibility = () => {
    setIsFilterVisible(prev => !prev);
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      doc.text("Product List", 14, 15);

      const tableColumn = ["Product Name", "Bar Code", "Category", "Tax %", "Purchase Price", "Price/Unit", "Qty", "Low Stock"];
      const tableRows = products.map(product => [
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
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      });

      doc.save("product_list.pdf");
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
    try {
      if (!products || products.length === 0) {
        MySwal.fire({
          title: "No Data",
          text: "There are no products to export",
          icon: "warning",
          confirmButtonText: "OK",
        });
        return;
      }

      const worksheetData = products.map(product => ({
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

      XLSX.writeFile(workbook, "product_list.xlsx");
    } catch (error) {
      MySwal.fire({
        title: "Error!",
        text: "Failed to export to Excel: " + error.message,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
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
      render: (productCategoryDto) => productCategoryDto?.productCategoryName || 'N/A',
      sorter: (a, b) => (a.productCategoryDto?.productCategoryName || '').localeCompare(b.productCategoryDto?.productCategoryName || ''),
    },
    {
      title: "Tax Percentage",
      dataIndex: "taxDto",
      render: (taxDto) => taxDto ? `${taxDto.taxPercentage}%` : 'N/A',
      sorter: (a, b) => (a.taxDto?.taxPercentage || 0) - (b.taxDto?.taxPercentage || 0),
    },
    {
      title: "Purchase Price",
      dataIndex: "purchasePrice",
      render: (purchasePrice) => `${purchasePrice.toFixed(2)}`,
      sorter: (a, b) => a.purchasePrice - b.purchasePrice,
    },
    {
      title: "Price Per Unit",
      dataIndex: "pricePerUnit",
      render: (pricePerUnit) => `${pricePerUnit.toFixed(2)}`,
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
    {
      title: "Status",
      dataIndex: "isActive",
      render: (isActive, record) => (
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            checked={isActive}
            onChange={() => handleToggleStatus(record.id, isActive)}
          />
        </div>
      ),
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_, record) => (
        <td className="action-table-data">
          <div className="edit-delete-action">
            <Link
              className="me-2 p-2"
              to={`${route.editproduct}?id=${record.id}`}
            >
              <Edit className="feather-edit" />
            </Link>
          </div>
        </td>
      ),
    },
  ];

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="add-item d-flex flex-column">
            <div className="page-title">
              <h4>Product List</h4>
              <h6>Manage your products</h6>
            </div>
            <div className="status-toggle-btns mt-2">
              <div className="btn-group" role="group">
                <button
                  type="button"
                  className={`btn ${showActive ? 'btn-primary active' : 'btn-outline-primary'}`}
                  onClick={() => setShowActive(true)}
                >
                  Active
                </button>
                <button
                  type="button"
                  className={`btn ${!showActive ? 'btn-primary active' : 'btn-outline-primary'}`}
                  onClick={() => setShowActive(false)}
                >
                  Inactive
                </button>
              </div>
            </div>
          </div>
          <ul className="table-top-head">
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
                  onClick={(e) => {
                    e.preventDefault();
                    dispatch(setToogleHeader(!data));
                  }}
                >
                  <ChevronUp />
                </Link>
              </OverlayTrigger>
            </li>
          </ul>
          <div className="page-btn">
            <Link to={route.addproduct} className="btn btn-added">
              <PlusCircle className="me-2 iconsize" />
              Add New Product
            </Link>
          </div>
        </div>
        <div className="card table-list-card">
          <div className="card-body">
            <div className="table-top">
              <div className="search-set">
                <div className="search-input">
                  <input
                    type="text"
                    placeholder="Search"
                    className="form-control form-control-sm formsearch"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                  <Link to="#" className="btn btn-searchset">
                    <i data-feather="search" className="feather-search" />
                  </Link>
                </div>
              </div>
              <div className="search-path">
                <Link
                  className={`btn btn-filter ${isFilterVisible ? "setclose" : ""}`}
                  id="filter_search"
                  onClick={toggleFilterVisibility}
                >
                  <Filter className="filter-icon" />
                  <span>
                    <ImageWithBasePath src="assets/img/icons/closes.svg" alt="img" />
                  </span>
                </Link>
              </div>
            </div>
            <div
              className={`card${isFilterVisible ? " visible" : ""}`}
              id="filter_inputs"
              style={{ display: isFilterVisible ? "block" : "none" }}
            >
              <div className="card-body pb-0">
                <div className="row">
                  <div className="col-lg-3 col-sm-6 col-12">
                    <div className="input-blocks">
                      <Select
                        className="select"
                        options={categories}
                        placeholder="Select Category"
                        value={selectedCategory}
                        onChange={setSelectedCategory}
                        isClearable
                      />
                    </div>
                  </div>
                  <div className="col-lg-3 col-sm-6 col-12">
                    <div className="input-blocks">
                      <Select
                        className="select"
                        options={taxes}
                        placeholder="Select Tax"
                        value={selectedTax}
                        onChange={setSelectedTax}
                        isClearable
                      />
                    </div>
                  </div>
                  <div className="col-lg-3 col-sm-6 col-12">
                    <div className="input-blocks">
                      <button
                        className="btn btn-primary"
                        onClick={applyFilters}
                      >
                        <i className="feather-search me-1" />
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="table-responsive">
              <Table columns={columns} dataSource={products} rowKey={(record) => record.id} />
            </div>
          </div>
        </div>
        <Brand />
      </div>
    </div>
  );
};

export default ProductList;