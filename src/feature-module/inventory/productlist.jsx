import {
  ChevronUp,
  Edit,
  Filter,
  PlusCircle,
  RotateCcw,
  Trash2,
} from "feather-icons-react/build/IconComponents";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Select from "react-select";
import ImageWithBasePath from "../../core/img/imagewithbasebath";
import Brand from "../../core/modals/inventory/brand";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import { all_routes } from "../../Router/all_routes";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import Table from "../../core/pagination/datatable";
import { setToogleHeader } from "../../core/redux/action";
import { fetchProducts, updateProductStatus, getProductByName, getProductByBarcode } from '../Api/productApi';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const dispatch = useDispatch();
  const data = useSelector((state) => state.toggle_header);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleFilterVisibility = () => {
    setIsFilterVisible((prevVisibility) => !prevVisibility);
  };

  const loadProductsData = async () => {
    try {
      const data = await fetchProducts();
      const reversedData = [...data].reverse();
      setProducts(reversedData);
    } catch (error) {
      console.error("Error fetching products:", error.message);
    }
  };

  useEffect(() => {
    loadProductsData();
  }, []);

  const route = all_routes;

  // const subcategorylist = [
  //   { value: "choose", label: "Choose Sub Category" },
  //   { value: "computers", label: "Computers" },
  //   { value: "fruits", label: "Fruits" },
  // ];
  // const brandlist = [
  //   { value: "all", label: "All Brand" },
  //   { value: "lenovo", label: "Lenovo" },
  //   { value: "nike", label: "Nike" },
  // ];

  const MySwal = withReactContent(Swal);

  const handleStatusUpdate = async (productId) => {
    try {
      const result = await MySwal.fire({
        title: 'Are you sure?',
        text: "You want to delete this product?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        reverseButtons: false
      });

      if (result.isConfirmed) {
        MySwal.fire({
          title: 'Deleting...',
          text: 'Please wait while we delete the product.',
          allowOutsideClick: false,
          showConfirmButton: false,
          willOpen: () => {
            MySwal.showLoading();
          }
        });

        const response = await updateProductStatus(productId, 0);
        if (response && response.success !== false) {
          MySwal.fire({
            title: 'Deleted!',
            text: 'Product has been deleted.',
            icon: 'success',
            confirmButtonColor: '#3085d6'
          }).then(() => {
            loadProductsData(); // Refresh the product list
          });
        } else {
          MySwal.fire({
            title: 'Error!',
            text: response?.message || 'Failed to delete product. Please try again.',
            icon: 'error',
            confirmButtonColor: '#d33'
          });
        }
      }
    } catch (error) {
      console.error("Error updating product status:", error);
      MySwal.fire({
        title: 'Error!',
        text: 'An unexpected error occurred. Please try again.',
        icon: 'error',
        confirmButtonColor: '#d33'
      });
    }
  };

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    try {
      if (query.trim() !== '') {
        // Try searching by name first
        const nameSearchResponse = await getProductByName(query);
        let searchProducts = nameSearchResponse?.responseDto || [];

        // If no results found by name, try searching by barcode
        if (!searchProducts.length) {
          const barcodeSearchResponse = await getProductByBarcode(query);
          searchProducts = barcodeSearchResponse?.responseDto || [];
        }

        setProducts(Array.isArray(searchProducts) ? searchProducts : []);
      } else {
        loadProductsData();
      }
    } catch (error) {
      console.error('Error searching products:', error);
      setProducts([]);
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
      render: (productCategoryDto) => productCategoryDto?.productCategoryName || 'N/A', // Ensure this matches your API response structure
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
            <Link
              className="confirm-text p-2"
              to="#"
              onClick={() => handleStatusUpdate(record.id)}
            >
              <Trash2 className="feather-trash-2" />
            </Link>
          </div>
        </td>
      ),
    },
  ];

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
      console.error("Error generating PDF:", error);
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
      
      // Set column widths
      worksheet["!cols"] = [
        { wch: 20 }, // Product Name
        { wch: 15 }, // Bar Code
        { wch: 15 }, // Category
        { wch: 12 }, // Tax
        { wch: 12 }, // Purchase Price
        { wch: 12 }, // Price Per Unit
        { wch: 10 }, // Quantity
        { wch: 10 }  // Low Stock
      ];

      XLSX.writeFile(workbook, "product_list.xlsx");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      MySwal.fire({
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
          <div className="add-item d-flex">
            <div className="page-title">
              <h4>Product List</h4>
              <h6>Manage your products</h6>
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
                  <Link to className="btn btn-searchset">
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
                  <div className="col-lg-12 col-sm-12">
                    <div className="row">
                      <div className="col-lg-2 col-sm-6 col-12">
                        <div className="input-blocks">
                          <Select
                            className="select"
                            //options={subcategorylist}
                            placeholder="Choose Category"
                          />
                        </div>
                      </div>
                      {/* <div className="col-lg-2 col-sm-6 col-12">
                        <div className="input-blocks">
                          <Select
                            className="select"
                            //options={brandlist}
                            placeholder="Tax"
                          />
                        </div>
                      </div> */}
                      <div className="col-lg-2 col-sm-6 col-12">
                        <div className="input-blocks">
                          <Link className="btn btn-filters">
                            <i data-feather="search" className="feather-search" />
                            Search
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="table-responsive">
              <Table columns={columns} dataSource={products} />
            </div>
          </div>
        </div>
        <Brand />
      </div>
    </div>
  );
};

export default ProductList;