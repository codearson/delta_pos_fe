import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";
import { createProduct } from "../Api/productApi";
import { all_routes } from "../../Router/all_routes";
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
import { OverlayTrigger } from "react-bootstrap";

const AddProduct = () => {
  const route = all_routes;
  const dispatch = useDispatch();
  const data = useSelector((state) => state.toggle_header);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    barcode: "",
    pricePerUnit: "",
    taxDto: { id: null },
    isActive: 1,
    productCategoryDto: { id: null },
    expiryDate: "2025-12-31T23:59:59",
    lowStock: "",
    purchasePrice: "",
    quantity: "",
  });

  const [errors, setErrors] = useState({});

  const categoryOptions = [
    { value: null, label: "Choose" },
    { value: 1, label: "Lenovo" },
    { value: 2, label: "Electronics" },
  ];

  const taxOptions = [
    { value: null, label: "Choose" },
    { value: 1, label: "10%" },
    { value: 2, label: "20%" },
  ];

  const renderCollapseTooltip = (props) => (
    <div id="collapse-tooltip" {...props}>
      Collapse
    </div>
  );

  const handleChange = (e, field) => {
    if (field === "taxDto" || field === "productCategoryDto") {
      setFormData((prevData) => ({
        ...prevData,
        [field]: { id: e.value },
      }));
    } else {
      const { name, value } = e.target;
      setFormData((prevData) => ({
        ...prevData,
        [name]: name === "pricePerUnit" || name === "purchasePrice" || name === "quantity" || name === "lowStock" ? parseFloat(value) : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    console.log("Form Data before validation:", formData);
  
    let formErrors = {};
    
    if (!formData.name.trim()) formErrors.productName = "Product name is required.";
    if (!formData.barcode.trim()) formErrors.barcode = "Barcode is required.";
    if (!formData.productCategoryDto?.id) formErrors.category = "Please select a category.";
    
    if (!formData.quantity?.toString().trim()) formErrors.quantity = "Quantity is required.";
    

    if (!formData.purchasePrice?.toString().trim()) formErrors.purchasePrice = "Purchased price is required.";
    if (!formData.pricePerUnit?.toString().trim()) formErrors.pricePerUnit = "Price per unit is required.";
    
    if (!formData.taxDto?.id) formErrors.taxPercentage = "Please select a tax percentage.";
   
    if (!formData.lowStock?.toString().trim()) formErrors.lowStock = "Low stock alert value is required.";
  
    setErrors(formErrors);
  
    console.log("Validation Errors:", formErrors);
  
    if (Object.keys(formErrors).length > 0) return;
  
    try {
      const createdProduct = await createProduct(formData);
      console.log("Product added successfully:", createdProduct);
      toast.success("Stock Added Successfully!");
      navigate("/products");
    } catch (error) {
      console.error("Error adding product:", error);
      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;
        if (errorMessage.includes("Item with the same name already exists")) {
          toast.error("Error: Stock with the same name already exists");
        } else if (errorMessage.includes("Same Item code already exists")) {
          toast.error("Error: Same Item code already exists");
        } else {
          toast.error("Error Adding Stock");
        }
      } else {
        toast.error("Error Adding Stock");
      }
    }
  };
  

  return (
    <div className="page-wrapper">
      <div className="content">
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

        <form onSubmit={handleSubmit}>
          <div className="card">
            <div className="card-body add-product pb-0">
              <div className="accordion-card-one accordion" id="accordionExample">
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
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Product Name"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                            />
                            {errors.productName && <span className="text-danger">{errors.productName}</span>}
                          </div>
                        </div>
                        <div className="col-lg-4 col-sm-6 col-12">
                          <div className="input-blocks add-product list">
                            <label>Barcode</label>
                            <input
                              type="text"
                              className="form-control list"
                              placeholder="Barcode"
                              name="barcode"
                              value={formData.barcode}
                              onChange={handleChange}
                            />
                            {errors.barcode && <span className="text-danger">{errors.barcode}</span>}
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
                                placeholder="Select Category"
                                value={categoryOptions.find((option) => option.value === formData.productCategoryDto.id)}
                                onChange={(e) => handleChange(e, "productCategoryDto")}
                              />
                              {errors.category && <span className="text-danger">{errors.category}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="accordion-card-one accordion" id="accordionExample2">
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
                                <input
                                  type="integer"
                                  className="form-control"
                                  placeholder="Quantity"
                                  name="quantity"
                                  value={formData.quantity}
                                  onChange={handleChange}
                                />
                                {errors.quantity && <span className="text-danger">{errors.quantity}</span>}
                              </div>
                            </div>
                            <div className="col-lg-4 col-sm-6 col-12">
                              <div className="input-blocks add-product">
                                <label>Purchased Price</label>
                                <input
                                  type="float"
                                  className="form-control"
                                  placeholder="Purchased Price"
                                  name="purchasePrice"
                                  value={formData.purchasePrice}
                                  onChange={handleChange}
                                />
                                {errors.purchasePrice && <span className="text-danger">{errors.purchasePrice}</span>}
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-lg-4 col-sm-6 col-12">
                                <div className="input-blocks add-product">
                                  <label>Price Per Unit</label>
                                  <input
                                    type="floct"
                                    className="form-control"
                                    placeholder="Price Per Unit"
                                    name="pricePerUnit"
                                    value={formData.pricePerUnit}
                                    onChange={handleChange}
                                  />
                                  {errors.pricePerUnit && <span className="text-danger">{errors.pricePerUnit}</span>}
                                </div>
                              </div>
                              <div className="col-lg-4 col-sm-6 col-12">
                                <div className="input-blocks add-product">
                                  <label>Tax Percentage</label>
                                  <Select
                                    options={taxOptions}
                                    placeholder="Select Tax Percentage"
                                    value={taxOptions.find((option) => option.value === formData.taxDto.id)}
                                    onChange={(e) => handleChange(e, "taxDto")}
                                  />
                                  {errors.taxPercentage && <span className="text-danger">{errors.taxPercentage}</span>}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-lg-4 col-sm-6 col-12">
                              <div className="input-blocks add-product">
                                <label>Low Stock</label>
                                <input
                                  type="integer"
                                  className="form-control"
                                  placeholder="Low Stock"
                                  name="lowStock"
                                  value={formData.lowStock}
                                  onChange={handleChange}
                                />
                                {errors.lowStock && <span className="text-danger">{errors.lowStock}</span>}
                              </div>
                            </div>
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
              <button type="submit" className="btn btn-submit">
                Save Product
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;