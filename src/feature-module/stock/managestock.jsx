import React, { useState, useEffect } from "react";
import { Filter, Archive, Box } from "react-feather";
import ImageWithBasePath from "../../core/img/imagewithbasebath";
import Breadcrumbs from "../../core/breadcrumbs";
import Select from "react-select";
import { Link } from "react-router-dom";
import ManageStockModal from "../../core/modals/stocks/managestockModal";
import { Edit } from "feather-icons-react/build/IconComponents";
import Swal from "sweetalert2";
import Table from "../../core/pagination/datatable";
import { fetchStocks, updateStockStatus, fetchBranches } from "../Api/StockApi";
import { fetchProducts } from "../Api/productApi";
import "../../style/scss/pages/_categorylist.scss";

const Managestock = () => {
  const [stockData, setStockData] = useState([]);
  const [allStocks, setAllStocks] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const getStocks = async () => {
    setLoading(true);
    try {
      const response = await fetchStocks();
      const stocksData = Array.isArray(response) ? response : 
                        (response.responseDto ? [response.responseDto] : []);

      if (!stocksData.length) {
        throw new Error("No stock data received");
      }

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
      setAllStocks([]);
      setStockData([]);
      setFilteredStockData([]);
      Swal.fire({
        title: "Error!",
        text: "Failed to fetch stocks: " + error.message,
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStocks();
  }, [showActive]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [productsResponse, branchesResponse] = await Promise.all([
          fetchProducts(),
          fetchBranches()
        ]);

        const transformedProducts = productsResponse.map(product => ({
          value: product.id,
          label: product.name || '-'
        }));
        setProducts(transformedProducts);

        const transformedBranches = branchesResponse.map(branch => ({
          value: branch.id,
          label: branch.branchName
        }));
        setBranches(transformedBranches);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to load products or branches",
          icon: "error",
        });
      }
    };
    loadInitialData();
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

  const handleToggleStatus = async (stockId, currentStatus) => {
    setTogglingId(stockId);
    const newStatusText = currentStatus ? 'Inactive' : 'Active';

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to change this stock to ${newStatusText}?`,
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
        const response = await updateStockStatus(stockId, newStatus);
        if (response && response.success !== false) {
          await getStocks();
          Swal.fire({
            title: 'Success!',
            text: `Stock status changed to ${newStatusText}`,
            icon: 'success',
          });
        } else {
          throw new Error(response?.message || 'Failed to update stock status');
        }
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: error.message || 'An unexpected error occurred',
          icon: 'error',
        });
      }
    }
    setTogglingId(null);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query.trim() === '') {
      setFilteredStockData(stockData);
      return;
    }

    const filteredData = allStocks.filter(stock => 
      stock.Branch.toLowerCase().includes(query) ||
      stock.Product.Name.toLowerCase().includes(query) ||
      stock.Quantity.toString().includes(query)
    );
    setFilteredStockData(filteredData);
  };

  const handleSearch = () => {
    if (!selectedFilters.branch && !selectedFilters.product) {
      setFilteredStockData(stockData);
      return;
    }

    const filteredData = allStocks.filter(stock => {
      const matchesBranch = !selectedFilters.branch || stock.branchId === selectedFilters.branch.value;
      const matchesProduct = !selectedFilters.product || stock.productId === selectedFilters.product.value;
      return matchesBranch && matchesProduct && stock.isActive === showActive;
    });

    setFilteredStockData(filteredData);
    setIsFilterVisible(false);
  };

  const toggleFilterVisibility = () => {
    setIsFilterVisible(prev => !prev);
  };

  const exportToPDFData = () => {
    if (loading) return [];
    return filteredStockData.map(stock => ({
      Branch: stock.Branch || "",
      Product: stock.Product.Name || "",
      Quantity: stock.Quantity || "0"
    }));
  };

  const exportToExcelData = () => {
    if (loading) return [];
    return filteredStockData.map(stock => ({
      Branch: stock.Branch || "",
      Product: stock.Product.Name || "",
      Quantity: stock.Quantity || "0"
    }));
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
            disabled={togglingId === record.id || loading}
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
              disabled={loading}
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
        <Breadcrumbs 
          maintitle="Manage Stock"
          subtitle="Manage your stock"
          addButton="Add Stock"
          buttonDataToggle="modal"
          buttonDataTarget="#add-units"
          onDownloadPDF={exportToPDFData}
          onDownloadExcel={exportToExcelData}
          onRefresh={getStocks}
        />
        <div className="page-header">
          <div className="add-item d-flex flex-column">
            <div className="status-toggle-btns mt-2">
              <div className="btn-group" role="group">
                <button
                  type="button"
                  className={`btn ${showActive ? 'btn-primary active' : 'btn-outline-primary'}`}
                  onClick={() => setShowActive(true)}
                  disabled={loading}
                >
                  Active
                </button>
                <button
                  type="button"
                  className={`btn ${!showActive ? 'btn-primary active' : 'btn-outline-primary'}`}
                  onClick={() => setShowActive(false)}
                  disabled={loading}
                >
                  Inactive
                </button>
              </div>
            </div>
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
                    disabled={loading}
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
                  disabled={loading}
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
                        isDisabled={loading}
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
                        isDisabled={loading}
                        isClearable
                      />
                    </div>
                  </div>
                  <div className="col-lg-4 col-sm-6 col-12">
                    <div className="input-blocks">
                      <button
                        className="btn btn-primary"
                        onClick={handleSearch}
                        disabled={loading}
                      >
                        <i className="feather-search me-1" />
                        Search
                      </button>
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