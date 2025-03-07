import React, { useState, useEffect } from "react";
import { Filter, ChevronUp, PlusCircle, RotateCcw } from "react-feather";
import ImageWithBasePath from "../../core/img/imagewithbasebath";
import Select from "react-select";
import { Link } from "react-router-dom";
import { Archive, Box } from "react-feather";
import ManageStockModal from "../../core/modals/stocks/managestockModal";
import { Edit } from "feather-icons-react/build/IconComponents";
import Swal from "sweetalert2";
import Table from "../../core/pagination/datatable";
import { fetchStocks, updateStockStatus } from "../Api/StockApi";
import { fetchProducts } from "../Api/productApi";
import { fetchBranches } from "../Api/StockApi";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { setToogleHeader } from "../../core/redux/action";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import "../../style/scss/pages/_categorylist.scss";

const Managestock = () => {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.toggle_header);
  const [stockData, setStockData] = useState([]);
  const [allStocks, setAllStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({
    branch: null,
    product: null
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStockData, setFilteredStockData] = useState([]);
  const [showActive, setShowActive] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  const toggleFilterVisibility = () => {
    setIsFilterVisible((prevVisibility) => !prevVisibility);
  };

  const getStocks = async () => {
    setLoading(true);
    try {
      console.log("Fetching updated stocks...");
      const response = await fetchStocks();
      console.log("Fetched stocks:", response);

      const stocksData = Array.isArray(response) ? response : 
                        (response.responseDto ? [response.responseDto] : []);

      const transformedData = stocksData.map(stock => ({
        id: stock.id,
        branchId: stock.branchDto?.id,
        productId: stock.productDto?.id,
        Branch: stock.branchDto?.branchName || '-',
        Product: {
          Name: stock.productDto?.name || '-',
          Image: stock.productDto?.image || 'assets/img/product-placeholder.png'
        },
        Quantity: stock.quantity?.toString() || '0',
        isActive: stock.isActive !== undefined ? stock.isActive : true
      }));

      setAllStocks(transformedData);
      const filteredData = transformedData.filter(stock => stock.isActive === showActive).reverse();
      setStockData(filteredData);
      setFilteredStockData(filteredData);
    } catch (error) {
      console.error("Error fetching stocks:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to fetch stocks",
        icon: "error",
        confirmButtonText: "OK"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStocks();
  }, [showActive]);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const response = await fetchProducts();
        const transformedProducts = response.map(product => ({
          value: product.id,
          label: product.name || '-'
        }));
        setProducts(transformedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    getProducts();
  }, []);

  useEffect(() => {
    const getBranches = async () => {
      try {
        const response = await fetchBranches();
        const transformedBranches = response.map(branch => ({
          value: branch.id,
          label: branch.branchName
        }));
        setBranches(transformedBranches);
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    };
    getBranches();
  }, []);

  const handleEdit = (record) => {
    const stockData = {
      id: record.id,
      branchId: record.branchId,
      productId: record.productId,
      branchDto: { id: record.branchId, branchName: record.Branch },
      productDto: { id: record.productId, name: record.Product.Name },
      quantity: record.Quantity,
      isActive: record.isActive
    };
    setSelectedStock(stockData);
  };

  const handleToggleStatus = (stockId, currentStatus) => {
    setTogglingId(stockId);
    const newStatusText = currentStatus ? 'Inactive' : 'Active';

    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to change this stock to ${newStatusText}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, change it!',
      cancelButtonText: 'No, cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const newStatus = currentStatus ? 0 : 1;
          const response = await updateStockStatus(stockId, newStatus);
          if (response && response.success !== false) {
            getStocks();
          } else {
            Swal.fire({
              title: 'Error!',
              text: response?.message || 'Failed to update stock status.',
              icon: 'error',
              confirmButtonColor: '#d33'
            });
          }
        } catch (error) {
          console.error("Error updating stock status:", error);
          Swal.fire({
            title: 'Error!',
            text: 'An unexpected error occurred.',
            icon: 'error',
            confirmButtonColor: '#d33'
          });
        }
      }
      setTogglingId(null);
    });
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query.trim() !== '') {
      const filteredData = allStocks.filter(stock => 
        stock.Branch.toLowerCase().includes(query) ||
        stock.Product.Name.toLowerCase().includes(query) ||
        stock.Quantity.toString().includes(query)
      );
      setFilteredStockData(filteredData.length > 0 ? filteredData : []);
    } else {
      setFilteredStockData(stockData);
    }
  };

  const handleSearch = () => {
    if (!selectedFilters.branch && !selectedFilters.product) {
      setFilteredStockData(stockData);
      return;
    }

    const filteredData = allStocks.filter(stock => {
      const matchesBranch = !selectedFilters.branch || stock.branchId === selectedFilters.branch.value;
      const matchesProduct = !selectedFilters.product || stock.productId === selectedFilters.product.value;
      return matchesBranch && matchesProduct;
    });

    setFilteredStockData(filteredData.length > 0 ? filteredData : []);
    setIsFilterVisible(false);
  };

  const columns = [
    {
      title: "Branch",
      dataIndex: "Branch",
      render: (text) => text || '-',
      sorter: (a, b) => (a.Branch || '').length - (b.Branch || '').length,
    },
    {
      title: "Product",
      dataIndex: "Product",
      render: (text, record) => (
        <span className="userimgname">
          <Link to="#">{record.Product.Name || '-'}</Link>
        </span>
      ),
      sorter: (a, b) => (a.Product.Name || '').length - (b.Product.Name || '').length,
    },
    {
      title: "Quantity",
      dataIndex: "Quantity",
      sorter: (a, b) => Number(a.Quantity) - Number(b.Quantity),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      render: (isActive, record) => (
        <div className={`form-check form-switch ${togglingId === record.id ? 'toggling' : ''}`}>
          <input
            className="form-check-input"
            type="checkbox"
            checked={isActive}
            onChange={() => handleToggleStatus(record.id, isActive)}
            disabled={togglingId === record.id}
          />
          <label className="form-check-label">
            {isActive ? 'Active' : 'Inactive'}
          </label>
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
              onClick={() => handleEdit(record)}
            >
              <Edit className="feather-edit" />
            </Link>
          </div>
        </td>
      ),
    },
  ];

  const renderTooltip = (props) => (
    <Tooltip id="pdf-tooltip" {...props}>Pdf</Tooltip>
  );
  const renderExcelTooltip = (props) => (
    <Tooltip id="excel-tooltip" {...props}>Excel</Tooltip>
  );
  const renderRefreshTooltip = (props) => (
    <Tooltip id="refresh-tooltip" {...props}>Refresh</Tooltip>
  );
  const renderCollapseTooltip = (props) => (
    <Tooltip id="refresh-tooltip" {...props}>Collapse</Tooltip>
  );

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      doc.text(`Stock List (${showActive ? 'Active' : 'Inactive'})`, 14, 15);
      
      const tableColumn = ["Branch", "Product", "Quantity"];
      const tableRows = filteredStockData.map(stock => [
        stock.Branch || "",
        stock.Product.Name || "",
        stock.Quantity || "0"
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      });

      doc.save(`stock_list_${showActive ? 'active' : 'inactive'}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
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
      if (!filteredStockData || filteredStockData.length === 0) {
        Swal.fire({
          title: "No Data",
          text: "There are no stocks to export",
          icon: "warning",
          confirmButtonText: "OK",
        });
        return;
      }

      const worksheetData = filteredStockData.map(stock => ({
        Branch: stock.Branch || "",
        Product: stock.Product.Name || "",
        Quantity: stock.Quantity || "0"
      }));

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Stocks");
      
      worksheet["!cols"] = [
        { wch: 20 }, { wch: 20 }, { wch: 10 }
      ];

      XLSX.writeFile(workbook, `stock_list_${showActive ? 'active' : 'inactive'}.xlsx`);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to export to Excel: " + error.message,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="add-item d-flex flex-column">
            <div className="page-title">
              <h4>Manage Stock</h4>
              <h6>Manage your stock</h6>
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
                <Link onClick={getStocks}>
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
            >
              <PlusCircle className="me-2 iconsize" />
              Add Stock
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
                    placeholder="Search by Branch, Product, or Quantity"
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
                  <div className="col-lg-4 col-sm-6 col-12">
                    <div className="input-blocks">
                      <Archive className="info-img" />
                      <Select
                        className="select"
                        placeholder="Choose Branch"
                        options={branches}
                        value={selectedFilters.branch}
                        onChange={(selected) => setSelectedFilters(prev => ({
                          ...prev,
                          branch: selected
                        }))}
                        isLoading={loading}
                        isClearable
                      />
                    </div>
                  </div>
                  <div className="col-lg-4 col-sm-6 col-12">
                    <div className="input-blocks">
                      <Box className="info-img" />
                      <Select
                        className="select"
                        placeholder="Choose Product"
                        options={products}
                        value={selectedFilters.product}
                        onChange={(selected) => setSelectedFilters(prev => ({
                          ...prev,
                          product: selected
                        }))}
                        isLoading={loading}
                        isClearable
                      />
                    </div>
                  </div>
                  <div className="col-lg-4 col-sm-6 col-12 ms-auto">
                    <div className="input-blocks">
                      <a className="btn btn-filters ms-auto" onClick={handleSearch}>
                        <i className="feather-search" /> Search
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="table-responsive">
              <Table
                className="table datanew"
                columns={columns}
                dataSource={filteredStockData}
                rowKey={(record) => record.id}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </div>
      <ManageStockModal 
        selectedStock={selectedStock}
        refreshData={getStocks}
      />
    </div>
  );
};

export default Managestock;