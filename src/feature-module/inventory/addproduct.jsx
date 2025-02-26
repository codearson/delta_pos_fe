import React, { } from "react";
import { Link } from "react-router-dom";
import Select from "react-select";
import { all_routes } from "../../Router/all_routes";
import AddCategory from "../../core/modals/inventory/addcategory";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Info,
  LifeBuoy,
  PlusCircle, 
} from "feather-icons-react/build/IconComponents";
import { useDispatch, useSelector } from "react-redux";
import { setToogleHeader } from "../../core/redux/action";
import { OverlayTrigger, Tooltip } from "react-bootstrap";


const AddProduct = () => {
  const route = all_routes;
  const dispatch = useDispatch();

  const data = useSelector((state) => state.toggle_header);

  
  
  
  const renderCollapseTooltip = (props) => (
    <Tooltip id="refresh-tooltip" {...props}>
      Collapse
    </Tooltip>
  );
  
  const categoryOptions = [
    { value: "choose", label: "Choose" },
    { value: "lenovo", label: "Lenovo" },
    { value: "electronics", label: "Electronics" },
  ];
 
  const taxtype = [
    { value: "choose", label: "Choose" },
    { value: "gst", label: "GST" },
    { value: "vat", label: "VAT" },
  ];
  // const discounttype = [
  //   { value: "choose", label: "Choose" },
  //   { value: "percentage", label: "Percentage" },
  //   { value: "cash", label: "Cash" },
  // ];
  
  
  return (
    <div className="page-wrapper">
      <div className="content">
        {/* header part */}
        <div className="page-header">
          <div className="add-item d-flex">
            <div className="page-title">
              <h4>New Product</h4>
              <h6>Create new product</h6>
            </div>
          </div>
          <ul className="table-top-head">
            <li>
              <div className="page-btn">
                <Link to={route.productlist} className="btn btn-secondary">
                  <ArrowLeft className="me-2" />
                  Back to Product
                </Link>
              </div>
            </li>
            <li>
              <OverlayTrigger placement="top" overlay={renderCollapseTooltip}>
                <Link
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Collapse"
                  id="collapse-header"
                  className={data ? "active" : ""}
                  onClick={() => {
                    dispatch(setToogleHeader(!data));
                  }}
                >
                  <ChevronUp className="feather-chevron-up" />
                </Link>
              </OverlayTrigger>
            </li>
          </ul>
        </div>

        {/* /add */}
        <form>
          <div className="card">
            <div className="card-body add-product pb-0">
              
            {/* Product Information */}
              <div
                className="accordion-card-one accordion"
                id="accordionExample"
              >
                <div className="accordion-item">
                  <div className="accordion-header" id="headingOne">
                    <div
                      className="accordion-button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseOne"
                      aria-controls="collapseOne"
                    >
                      <div className="addproduct-icon">
                        <h5>
                          <Info className="add-info" />

                          <span>Product Information</span>
                        </h5>
                        <Link to="#">
                          <ChevronDown className="chevron-down-add" />
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div
                    id="collapseOne"
                    className="accordion-collapse collapse show"
                    aria-labelledby="headingOne"
                    data-bs-parent="#accordionExample"
                  >
                    <div className="accordion-body">
                     <div className="row">
                        <div className="col-lg-4 col-sm-6 col-12">
                          <div className="mb-3 add-product">
                            <label className="form-label">Product Name</label>
                            <input type="text" 
                            className="form-control"
                            placeholder="Enter Product Name"
                            
                            />
                            
                          </div>
                        </div>
                        <div className="col-lg-4 col-sm-6 col-12">
                          <div className="input-blocks add-product list">
                            <label>Barcode</label>
                            <input
                              type="text"
                              className="form-control list"
                              placeholder="Enter Barcode"
                              />
                            
                            {/* <Link
                              to={route.addproduct}
                              className="btn btn-primaryadd"
                            >
                              Generate Code
                            </Link> */}
                          </div>
                        </div>
                      </div>
                      <div className="addservice-info">
                        <div className="row">
                          <div className="col-lg-4 col-sm-6 col-12">
                            <div className="mb-3 add-product">
                              <div className="add-newplus">
                                <label className="form-label">Category</label>
                                <Link
                                  to="#"
                                  data-bs-toggle="modal"
                                  data-bs-target="#add-units-category"
                                >
                                  <PlusCircle className="plus-down-add" />
                                  <span>Add New</span>
                                </Link>
                              </div>
                              <Select
                                className="select"
                                options={categoryOptions}
                                placeholder="Choose"
                                
                                />
                                                           
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Pricing and Stocks */}
              <div
                className="accordion-card-one accordion"
                id="accordionExample2">                
                <div className="accordion-item">
                  <div className="accordion-header" id="headingTwo">
                    <div
                      className="accordion-button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseTwo"
                      aria-controls="collapseTwo"
                    >
                      <div className="text-editor add-list">
                        <div className="addproduct-icon list icon">
                          <h5>
                            <LifeBuoy className="add-info" />
                            <span>Pricing &amp; Stocks</span>
                          </h5>
                          <Link to="#">
                            <ChevronDown className="chevron-down-add" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    id="collapseTwo"
                    className="accordion-collapse collapse show"
                    aria-labelledby="headingTwo"
                    data-bs-parent="#accordionExample2"
                  >
                    <div className="accordion-body">
                       <div className="tab-content" id="pills-tabContent">
                        <div
                          className="tab-pane fade show active"
                          id="pills-home"
                          role="tabpanel"
                          aria-labelledby="pills-home-tab"
                        >
                          <div className="row">
                            <div className="col-lg-4 col-sm-6 col-12">
                              <div className="input-blocks add-product">
                                <label>Quantity</label>
                                <input type="text" 
                                className="form-control"
                                placeholder="Enter Quantity"
                                />
                               </div>
                            </div>
                            <div className="col-lg-4 col-sm-6 col-12">
                              <div className="input-blocks add-product">
                                <label>Purchased Price</label>
                                <input type="text" 
                                className="form-control" 
                                placeholder="Enter Purchased Price"
                                />
                                 </div>
                            </div>
                            <div className="row">
                            <div className="col-lg-4 col-sm-6 col-12">
                              <div className="input-blocks add-product">
                                <label>Price Per Unit</label>
                                <input type="text" 
                                className="form-control" 
                                placeholder="Enter Price Per Unit"
                                />
                                </div>
                            </div>
                            <div className="col-lg-4 col-sm-6 col-12">
                              <div className="input-blocks add-product">
                                <label>Tax Percentage</label>
                                <Select
                                  className="select"
                                  options={taxtype}
                                  placeholder="Select Option"
                                  />
                                  </div>
                            </div>
                            </div>
                          </div>
                          <div className="row">
                          <div className="col-lg-4 col-sm-6 col-12">
                            <div className="input-blocks add-product">
                              <label>Low Stock</label>
                              <input type="text" 
                                className="form-control" 
                                placeholder="Enter Low Stock"
                                />
                                </div>
                          </div>
                          </div>
                         </div>
                        <div
                          className="tab-pane fade"
                          id="pills-profile"
                          role="tabpanel"
                          aria-labelledby="pills-profile-tab"
                        >
                         
                          <div
                            className="modal-body-table variant-table"
                            id="variant-table"
                          >
                            
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-12">
            <div className="btn-addproduct mb-4">
              <button type="button" className="btn btn-cancel me-2">
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-submit"
              >
                Save Product
              </button>
              {/* <Link to={route.addproduct} className="btn btn-submit">
                Save Product
              </Link> */}
            </div>
          </div>
        </form>
        {/* /add */}
      </div>
      {/* <Addunits /> */}
      <AddCategory />
      {/* <AddBrand /> */}
    </div>
  );
};

export default AddProduct;
