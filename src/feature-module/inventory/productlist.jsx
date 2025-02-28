import {
  //Box,
  ChevronUp,
  Edit,
  Eye,
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
import { fetchProducts } from '../Api/productApi'

const ProductList = () => {
  const [products, setProducts] = useState([]);

  // const dataSource = useSelector((state) => state.product_list);
  const dispatch = useDispatch();
  const data = useSelector((state) => state.toggle_header);

  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const toggleFilterVisibility = () => {
    setIsFilterVisible((prevVisibility) => !prevVisibility);
  };

  useEffect(() => {
    fetchProducts()
      .then((data) => setProducts(data))
      .catch((error) => {
        console.error("Error fetching products:", error.message);
      });
  }, []);

  const route = all_routes;

  const subcategorylist = [
    { value: "choose", label: "Choose Sub Category" },
    { value: "computers", label: "Computers" },
    { value: "fruits", label: "Fruits" },
  ];
  const brandlist = [
    { value: "all", label: "All Brand" },
    { value: "lenovo", label: "Lenovo" },
    { value: "nike", label: "Nike" },
  ];

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
      sorter: (a, b) => a.productCategoryDto.length - b.productCategoryDto.length,
    },

    {
      title: "Tax Percentage",
      dataIndex: "taxDto",
      sorter: (a, b) => a.taxDto.length - b.taxDto.length,
    },
    {
      title: "Purchase Price",
      dataIndex: "purchasePrice",
      sorter: (a, b) => a.purchasePrice.length - b.purchasePrice.length,
    },
    {
      title: "Price Per Unit",
      dataIndex: "pricePerUnit",
      sorter: (a, b) => a.pricePerUnit.length - b.pricePerUnit.length,
    },
    {
      title: "Qty",
      dataIndex: "quantity",
      sorter: (a, b) => a.quantity.length - b.quantity.length,
    },
    {
      title: "Low Stock",
      dataIndex: "lowStock",
      sorter: (a, b) => a.lowStock.length - b.lowStock.length,
    },
    {
      title: "Action",
      dataIndex: "action",
      render: () => (
        <td className="action-table-data">
          <div className="edit-delete-action">
            <div className="input-block add-lists"></div>
            <Link className="me-2 p-2" to={route.productdetails}>
              <Eye className="feather-view" />
            </Link>
            <Link className="me-2 p-2" to={route.editproduct}>
              <Edit className="feather-edit" />
            </Link>
            <Link
              className="confirm-text p-2"
              to="#"
              onClick={showConfirmationAlert}
            >
              <Trash2 className="feather-trash-2" />
            </Link>
          </div>
        </td>
      ),
      sorter: (a, b) => a.createdby.length - b.createdby.length,
    },
  ];
  const MySwal = withReactContent(Swal);

  const showConfirmationAlert = () => {
    MySwal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      showCancelButton: true,
      confirmButtonColor: "#00ff00",
      confirmButtonText: "Yes, delete it!",
      cancelButtonColor: "#ff0000",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        MySwal.fire({
          title: "Deleted!",
          text: "Your file has been deleted.",
          className: "btn btn-success",
          confirmButtonText: "OK",
          customClass: {
            confirmButton: "btn btn-success",
          },
        });
      } else {
        MySwal.close();
      }
    });
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
                <Link>
                  <ImageWithBasePath src="assets/img/icons/pdf.svg" alt="img" />
                </Link>
              </OverlayTrigger>
            </li>
            <li>
              <OverlayTrigger placement="top" overlay={renderExcelTooltip}>
                <Link data-bs-toggle="tooltip" data-bs-placement="top">
                  <ImageWithBasePath
                    src="assets/img/icons/excel.svg"
                    alt="img"
                  />
                </Link>
              </OverlayTrigger>
            </li>
            <li>
              <OverlayTrigger placement="top" overlay={renderRefreshTooltip}>
                <Link data-bs-toggle="tooltip" data-bs-placement="top">
                  <RotateCcw />
                </Link>
              </OverlayTrigger>
            </li>
            <li>
              <OverlayTrigger placement="top" overlay={renderCollapseTooltip}>
                <Link
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
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
                  />
                  <Link to className="btn btn-searchset">
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
              {/* <div className="form-sort">
                <Sliders className="info-img" />
                <Select
                  className="select"
                  options={options}
                  placeholder="14 09 23"
                />
              </div> */}
            </div>
            {/* /Filter */}
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
                            options={subcategorylist}
                            placeholder="Choose Category"
                          />
                        </div>
                      </div>
                      <div className="col-lg-2 col-sm-6 col-12">
                        <div className="input-blocks">
                          {/* <StopCircle className="info-img" /> */}
                          <Select
                            className="select"
                            options={brandlist}
                            placeholder="Tax"
                          />
                        </div>
                        <div className="input-blocks">
                          <Link className="btn btn-filters ms-auto">
                            {" "}
                            <i
                              data-feather="search"
                              className="feather-search"
                            />{" "}
                            Search{" "}
                          </Link>
                        </div>
                      </div>
                      <div className="col-lg-2 col-sm-6 col-12">
                      
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* /Filter */}
            <div className="table-responsive">
              <Table columns={columns} dataSource={products} />
            </div>
          </div>
        </div>
        {/* /product list */}
        <Brand />
      </div>
    </div>
  );
};

export default ProductList;
