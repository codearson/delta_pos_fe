import {
  ChevronUp,
  Edit,
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
import { fetchProducts, updateProductStatus } from '../Api/productApi';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { fetchProductCategories } from '../Api/ProductCategoryApi';
import { fetchTaxes } from '../Api/TaxApi';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const dispatch = useDispatch();
  const data = useSelector((state) => state.toggle_header);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTax, setSelectedTax] = useState(null);

  const loadProductsData = async () => {
    try {
      const data = await fetchProducts();
      const reversedData = [...data].reverse();
      setProducts(reversedData);
    } catch (error) {
      console.error("Error fetching products:", error.message);
    }
  };

  const loadFilterOptions = async () => {
    try {
      const categoriesData = await fetchProductCategories();
      const formattedCategories = categoriesData.map(category => ({
        value: category.id,
        label: category.productCategoryName
      }));
      setCategories(formattedCategories);

      const taxesData = await fetchTaxes();
      const formattedTaxes = taxesData.map(tax => ({
        value: tax.id,
        label: `${tax.taxPercentage}%`
      }));
      setTaxes(formattedTaxes);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  useEffect(() => {
    loadProductsData();
    loadFilterOptions();
  }, []);

  const route = all_routes;

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
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    try {
      if (query.trim() !== '') {
        const filteredData = products.filter(product => 
          product.name?.toLowerCase().includes(query) ||
          product.barcode?.toLowerCase().includes(query) ||
          product.price?.toString().includes(query) ||
          product.quantity?.toString().includes(query) ||
          product.taxDto?.taxPercentage?.toString().includes(query) ||
          product.productCategoryDto?.productCategoryName?.toLowerCase().includes(query)
        );
        setProducts([...filteredData]);
      } else {
        loadProductsData();
      }
    } catch (error) {
      console.error('Error searching products:', error);
      setProducts([]);
    }
  };

  const applyFilters = (category, tax) => {
    try {
      let filteredData = [...products];

      if (category) {
        filteredData = filteredData.filter(product => 
          product.productCategoryDto?.id === category.value
        );
      }

      if (tax) {
        filteredData = filteredData.filter(product => 
          product.taxDto?.id === tax.value
        );
      }

      setProducts(filteredData);
    } catch (error) {
      console.error('Error applying filters:', error);
    }
  };

  const handleSearch = () => {
    applyFilters(selectedCategory, selectedTax);
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
                <div className="search-path d-flex align-items-center gap-2" style={{ width: '100%' }}>
                  <div className="search-input me-2">
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
                  <div style={{ width: '200px' }}>
                    <Select
                      className="select"
                      options={categories}
                      placeholder="Select Category"
                      value={selectedCategory}
                      onChange={(selected) => setSelectedCategory(selected)}
                      isClearable
                    />
                  </div>
                  <div style={{ width: '200px' }}>
                    <Select
                      className="select"
                      options={taxes}
                      placeholder="Select Tax"
                      value={selectedTax}
                      onChange={(selected) => setSelectedTax(selected)}
                      isClearable
                    />
                  </div>
                  <button 
                    className="btn btn-primary ms-auto"
                    onClick={handleSearch}
                  >
                    <i className="feather-search" />
                    Search
                  </button>
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