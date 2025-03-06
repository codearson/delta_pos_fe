import React, { useState, useEffect } from "react";
import Breadcrumbs from "../../core/breadcrumbs";
import { Filter } from "react-feather";
import ImageWithBasePath from "../../core/img/imagewithbasebath";
import Select from "react-select";
import { Link } from "react-router-dom";
import { Archive, Box } from "react-feather";
import ManageStockModal from "../../core/modals/stocks/managestockModal";
import { Edit, Trash2 } from "react-feather";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Table from "../../core/pagination/datatable";
import { fetchStocks, updateStockStatus } from "../Api/StockApi";
import { fetchProducts } from "../Api/productApi";
import { fetchBranches } from "../Api/StockApi";

const Managestock = () => {
  const [stockData, setStockData] = useState([]);
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
        Quantity: stock.quantity?.toString() || '0'
      }));

      // Reverse the transformed data before setting it
      const reversedData = [...transformedData].reverse();
      console.log("Reversed transformed data:", reversedData);
      setStockData(reversedData);
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
  }, []);

  // Fetch products
  useEffect(() => {
    const getProducts = async () => {
      setLoading(true);
      try {
        const response = await fetchProducts();
        const transformedProducts = response.map(product => ({
          value: product.id,
          label: product.name || '-'
        }));
        setProducts(transformedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, []);

  // Fetch branches
  useEffect(() => {
    const getBranches = async () => {
      setLoading(true);
      try {
        const response = await fetchBranches();
        const transformedBranches = response.map(branch => ({
          value: branch.id,
          label: branch.branchName
        }));
        setBranches(transformedBranches);
      } catch (error) {
        console.error("Error fetching branches:", error);
      } finally {
        setLoading(false);
      }
    };

    getBranches();
  }, []);

  const handleEdit = (record) => {
    const stockData = {
      id: record.id,
      branchId: record.branchId,
      productId: record.productId,
      branchDto: {
        id: record.branchId,
        branchName: record.Branch
      },
      productDto: {
        id: record.productId,
        name: record.Product.Name
      },
      quantity: record.Quantity
    };
    setSelectedStock(stockData);
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
      title: "Action",
      dataIndex: "action",
      render: (_, record) => (
        <td className="action-table-data">
          <div className="edit-delete-action">
            <div className="input-block add-lists"></div>
            <Link
              className="me-2 p-2"
              to="#"
              data-bs-toggle="modal"
              data-bs-target="#edit-units"
              onClick={() => handleEdit(record)}
            >
              <Edit className="feather-edit" />
            </Link>
            <Link
              className="confirm-text p-2"
              to="#"
              onClick={() => showConfirmationAlert(record.id)}
            >
              <Trash2 className="feather-trash-2" />
            </Link>
          </div>
        </td>
      ),
    },
  ];

  const MySwal = withReactContent(Swal);

  const showConfirmationAlert = (stockId) => {
    MySwal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      showCancelButton: true,
      confirmButtonColor: "#00ff00",
      confirmButtonText: "Yes, delete it!",
      cancelButtonColor: "#ff0000",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await updateStockStatus(stockId, 0);
          MySwal.fire({
            title: "Deleted!",
            text: "Stock has been deleted.",
            className: "btn btn-success",
            confirmButtonText: "OK",
            customClass: {
              confirmButton: "btn btn-success",
            },
          });
          getStocks();
        } catch (error) {
          console.error("Error deleting stock:", error);
          MySwal.fire({
            title: "Error!",
            text: "Failed to delete stock.",
            icon: "error",
            confirmButtonText: "OK",
          });
        }
      }
    });
  };

  // Update the handleSearchChange function to maintain reverse order
  const handleSearchChange = async (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    try {
      if (query.trim() !== '') {
        // Filter the existing stockData based on search query
        const filteredData = stockData.filter(stock => 
          stock.Branch.toLowerCase().includes(query) ||
          stock.Product.Name.toLowerCase().includes(query) ||
          stock.Quantity.toString().includes(query)
        );
        
        // Keep the reversed order in filtered results
        setFilteredStockData([...filteredData]);
      } else {
        // If search query is empty, show all data in reversed order
        setFilteredStockData([...stockData]);
      }
    } catch (error) {
      console.error('Error searching stocks:', error);
      setFilteredStockData([]);
    }
  };

  // Update the handleSearch function to maintain reverse order
  const handleSearch = () => {
    if (!selectedFilters.branch && !selectedFilters.product) {
      setFilteredStockData([...stockData]);
      return;
    }

    const filteredData = stockData.filter(stock => {
      const matchesBranch = !selectedFilters.branch || 
        stock.branchId === selectedFilters.branch.value;
      const matchesProduct = !selectedFilters.product || 
        stock.productId === selectedFilters.product.value;
      
      return matchesBranch && matchesProduct;
    });

    // Keep the reversed order in filtered results
    setFilteredStockData([...filteredData]);
    setIsFilterVisible(false);
  };

  // Update useEffect to maintain reverse order when stockData changes
  useEffect(() => {
    setFilteredStockData([...stockData]);
  }, [stockData]);

  return (
    <div className="page-wrapper">
      <div className="content">
        <Breadcrumbs
          maintitle="Manage Stock"
          subtitle="Manage your stock"
          addButton="Add Stock"
          buttonDataToggle="modal"
          buttonDataTarget="#add-units"
          onDownloadPDF={() => {
            const data = stockData.map(stock => ({
              Branch: stock.Branch || "",
              Product: stock.Product.Name || "",
              Quantity: stock.Quantity || "0"
            }));
            return data;
          }}
          onDownloadExcel={() => {
            const data = stockData.map(stock => ({
              Branch: stock.Branch || "",
              Product: stock.Product.Name || "",
              Quantity: stock.Quantity || "0"
            }));
            return data;
          }}
          onRefresh={getStocks}
        />
        {/* /product list */}
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
                  className={`btn btn-filter ${
                    isFilterVisible ? "setclose" : ""
                  }`}
                  id="filter_search"
                >
                  <Filter
                    className="filter-icon"
                    onClick={toggleFilterVisibility}
                  />
                  <span onClick={toggleFilterVisibility}>
                    <ImageWithBasePath
                      src="assets/img/icons/closes.svg"
                      alt="img"
                    />
                  </span>
                </Link>
              </div>
            </div>
            {/* /Filter */}
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
                      <a 
                        className="btn btn-filters ms-auto"
                        onClick={handleSearch}
                      >
                        <i className="feather-search" />
                        Search
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* /Filter */}
            <div className="table-responsive">
              <Table
                className="table datanew"
                columns={columns}
                dataSource={filteredStockData}
                rowKey={(record) => record.id}
                loading={loading}
                defaultSort={{
                  field: 'id',
                  order: 'desc'
                }}
              />
            </div>
          </div>
        </div>
        {/* /product list */}
      </div>
      <ManageStockModal 
        selectedStock={selectedStock}
        refreshData={getStocks}
      />
    </div>
  );
};

export default Managestock;
