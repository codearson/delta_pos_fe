import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Edit } from "feather-icons-react/build/IconComponents";
import Table from "../../core/pagination/datatable";
import Swal from "sweetalert2";
import AddNonSaleProductModal from "../../core/modals/inventory/nonsaleproductlistmodal";
import { fetchProducts, updateProductStatus } from "../Api/productApi";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { setToogleHeader } from "../../core/redux/action";
import { ChevronUp, PlusCircle, RotateCcw } from "feather-icons-react/build/IconComponents";
import ImageWithBasePath from "../../core/img/imagewithbasebath";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import "../../style/scss/pages/_categorylist.scss";
import { getAllManagerToggles, updateManagerToggleStatus } from "../Api/ManagerToggle";

const styles = `
  .nav-tabs-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .nav-tabs-container {
    display: flex;
    align-items: center;
  }

  .toggle-switch {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 20px;
    margin-left: 20px;
  }

  .toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ff4444;
    transition: .4s;
    border-radius: 20px;
  }

  .toggle-slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
  }

  input:checked + .toggle-slider {
    background-color: #00C851;
  }

  input:checked + .toggle-slider:before {
    transform: translateX(20px);
  }

  .toggle-label {
    margin-right: 10px;
    line-height: 20px;
    color: #333;
    font-weight: 500;
    font-size: 14px;
  }

  .toggle-wrapper {
    display: flex;
    align-items: center;
  }

  .toggle-card {
    background: #f8f9fa;
    padding: 8px 16px;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }

  .table-top {
    margin-bottom: 20px;
  }
`;

const NonSaleProductList = () => {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.toggle_header);
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showActive, setShowActive] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toggles, setToggles] = useState([]);

  useEffect(() => {
    loadInitialData();
    fetchToggles();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      fetchProductsData(false);
    }
  }, [showActive]);

  const fetchToggles = async () => {
    try {
      const toggles = await getAllManagerToggles();
      // Filter to only get the Non Scan Product toggle
      const nonScanToggle = toggles.responseDto.find(toggle => toggle.action === "Non Scan Product");
      setToggles(nonScanToggle ? [nonScanToggle] : []);
    } catch (error) {
      console.error('Error fetching toggles:', error);
    }
  };

  const handleToggleChange = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await updateManagerToggleStatus(id, newStatus);
      
      // Update the toggles state
      setToggles(prevToggles => 
        prevToggles.map(toggle => 
          toggle.id === id ? { ...toggle, isActive: newStatus } : toggle
        )
      );
    } catch (error) {
      console.error('Error updating toggle status:', error);
    }
  };

  const loadInitialData = async () => {
    setIsLoading(true);
    await fetchProductsData(true);
    setIsLoading(false);
  };

  const fetchProductsData = async (isInitial = false) => {
    try {
      if (isInitial) setIsLoading(true);
      const data = await fetchProducts();
      if (Array.isArray(data)) {
        const nonScanProducts = data
          .filter((product) => product.productCategoryDto?.productCategoryName?.toLowerCase() === "non scan")
          .map((product) => {
            const [name, icon] = product.name.split("-");
            return {
              ...product,
              name: name.trim(),
              icon: icon?.trim() || "📦",
              isActive: product.isActive === 1 || product.isActive === true,
            };
          });
        setAllProducts(nonScanProducts);
        filterData(nonScanProducts, searchTerm);
      } else {
        setAllProducts([]);
        setProducts([]);
        Swal.fire({
          title: "Warning!",
          text: "No non-scan product data received from the server.",
          icon: "warning",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      setAllProducts([]);
      setProducts([]);
      Swal.fire({
        title: "Error!",
        text: "Failed to fetch non-scan products: " + error.message,
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      if (isInitial) setIsLoading(false);
    }
  };

  const filterData = (productsData, query) => {
    let filteredData = productsData.filter((product) => product.isActive === showActive);
    if (query.trim() !== "") {
      filteredData = filteredData.filter((product) =>
        product.name.toLowerCase().includes(query.toLowerCase())
      );
    }
    setProducts(filteredData.reverse());
  };

  const handleToggleStatus = (productId, currentStatus) => {
    setTogglingId(productId);
    const newStatusText = currentStatus ? "Inactive" : "Active";

    Swal.fire({
      title: "Are you sure?",
      text: `Do you want to change this product to ${newStatusText}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, change it!",
      cancelButtonText: "No, cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const newStatus = currentStatus ? 0 : 1;
          const response = await updateProductStatus(productId, newStatus);
          if (response && response.success !== false) {
            await fetchProductsData(false);
            Swal.fire({
              title: "Success!",
              text: `Product status changed to ${newStatusText}.`,
              icon: "success",
              confirmButtonText: "OK",
              customClass: { confirmButton: "btn btn-success" },
            });
          } else {
            throw new Error(response?.message || "Failed to update status");
          }
        } catch (error) {
          Swal.fire({
            title: "Error!",
            text: "Failed to update product status: " + error.message,
            icon: "error",
            confirmButtonText: "OK",
            customClass: { confirmButton: "btn btn-danger" },
          });
        }
      }
      setTogglingId(null);
    });
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    filterData(allProducts, value);
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      doc.text(`Non-Scan Product List (${showActive ? "Active" : "Inactive"})`, 14, 15);
      const tableColumn = ["Product Name", "Price"];
      const tableRows = products.map((product) => [
        product.name || "",
        parseFloat(product.pricePerUnit || 0).toFixed(2)
      ]);
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        theme: "grid",
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      });
      doc.save(`non_scan_product_list_${showActive ? "active" : "inactive"}.pdf`);
    } catch (error) {
      Swal.fire({
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
        Swal.fire({
          title: "No Data",
          text: "There are no non-scan products to export",
          icon: "warning",
          confirmButtonText: "OK",
        });
        return;
      }
      const worksheetData = products.map((product) => ({
        "Product Name": product.name || "",
        Icon: product.icon || "📦",
        Price: parseFloat(product.pricePerUnit || 0).toFixed(2)
      }));
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "NonScanProducts");
      worksheet["!cols"] = [{ wch: 20 }, { wch: 10 }, { wch: 10 }];
      XLSX.writeFile(workbook, `non_scan_product_list_${showActive ? "active" : "inactive"}.xlsx`);
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Failed to export to Excel: " + error.message,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleAddClick = () => {
    setSelectedProduct(null);
  };

  const handleEditClick = (record) => {
    setSelectedProduct(record);
  };

  const columns = [
    {
      title: "Product Name",
      dataIndex: "name",
      render: (text) => <Link to="#">{text}</Link>,
      sorter: (a, b) => (a.name || "").length - (b.name || "").length,
    },
    {
      title: "Icon",
      dataIndex: "icon",
      sorter: (a, b) => (a.icon || "").length - (b.icon || "").length,
    },
    {
      title: "Price",
      dataIndex: "pricePerUnit",
      render: (price) => parseFloat(price).toFixed(2),
      sorter: (a, b) => parseFloat(a.pricePerUnit || 0) - parseFloat(b.pricePerUnit || 0),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      render: (isActive, record) => (
        <div className={`form-check form-switch ${togglingId === record.id ? "toggling" : ""}`}>
          <input
            className="form-check-input"
            type="checkbox"
            checked={isActive}
            onChange={() => handleToggleStatus(record.id, isActive)}
            disabled={togglingId === record.id}
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
              to="#"
              data-bs-toggle="modal"
              data-bs-target="#edit-units"
              onClick={() => handleEditClick(record)}
            >
              <Edit className="feather-edit" />
            </Link>
          </div>
        </td>
      ),
    },
  ];

  const renderTooltip = () => <Tooltip id="pdf-tooltip">Pdf</Tooltip>;
  const renderExcelTooltip = () => <Tooltip id="excel-tooltip">Excel</Tooltip>;
  const renderRefreshTooltip = () => <Tooltip id="refresh-tooltip">Refresh</Tooltip>;
  const renderCollapseTooltip = () => <Tooltip id="collapse-tooltip">Collapse</Tooltip>;

  if (isLoading) {
    return <div className="page-wrapper">{/* Add loading spinner or message here if desired */}</div>;
  }

  return (
    <div className="page-wrapper">
      <style>{styles}</style>
      <div className="content">
        <div className="page-header">
          <div className="add-item d-flex flex-column">
            <div className="page-title">
              <h4>Non-Scan Product List</h4>
              <h6>Manage Your Non-Scan Products</h6>
            </div>
            <div className="status-toggle-btns mt-2">
              <div className="btn-group" role="group">
                <button
                  type="button"
                  className={`btn ${showActive ? "btn-primary active" : "btn-outline-primary"}`}
                  onClick={() => setShowActive(true)}
                >
                  Active
                </button>
                <button
                  type="button"
                  className={`btn ${!showActive ? "btn-primary active" : "btn-outline-primary"}`}
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
                <Link onClick={() => fetchProductsData(false)}>
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
            <Link
              to="#"
              className="btn btn-added"
              data-bs-toggle="modal"
              data-bs-target="#add-units"
              onClick={handleAddClick}
            >
              <PlusCircle className="me-2 iconsize" />
              Add New 
            </Link>
          </div>
        </div>

        <div className="card table-list-card">
          <div className="card-body">
            <div className="table-top d-flex justify-content-between align-items-center">
              <div className="search-set">
                <div className="search-input">
                  <input
                    type="text"
                    placeholder="Search"
                    className="form-control form-control-sm formsearch"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                  <Link to="#" className="btn btn-searchset">
                    <i data-feather="search" className="feather-search" />
                  </Link>
                </div>
              </div>
              {toggles.map((toggle) => (
                <div key={toggle.id} className="toggle-card">
                  <div className="d-flex align-items-center">
                    <span className="toggle-label">Show In Pos</span>
                    <div className="toggle-wrapper">
                      <label className="toggle-switch">
                        <input 
                          type="checkbox" 
                          checked={toggle.isActive} 
                          onChange={() => handleToggleChange(toggle.id, toggle.isActive)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="table-responsive">
              <Table
                className="table datanew"
                columns={columns}
                dataSource={products}
                rowKey={(record) => record.id}
              />
            </div>
          </div>
        </div>
      </div>
      <AddNonSaleProductModal
        onSave={() => {
          fetchProductsData(false);
        }}
        onUpdate={() => {
          fetchProductsData(false);
        }}
        selectedProduct={selectedProduct}
      />
    </div>
  );
};

export default NonSaleProductList; 