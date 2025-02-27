import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Select from "react-select";
import { all_routes } from "../../Router/all_routes";
import AddCategory from "../../core/modals/inventory/addcategory";
import AddTax from "../../core/modals/inventory/addtax"
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
import { saveProduct } from "../Api/productApi";
import { fetchProductCategories } from "../Api/ProductCategoryApi";
import { fetchTaxes } from "../Api/TaxApi";

const AddProduct = () => {
  const route = all_routes;
  const dispatch = useDispatch();
  const data = useSelector((state) => state.toggle_header);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingTaxes, setLoadingTaxes] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      const data = await fetchProductCategories();
      setCategories(data.map((cat) => ({ value: cat.id, label: cat.name })));
      setLoadingCategories(false);
    };

    const loadTaxes = async () => {
      const data = await fetchTaxes();
      setTaxes(data.map((tax) => ({ value: tax.id, label: `${tax.name} (${tax.percentage}%)` })));
      setLoadingTaxes(false);
    };

    loadCategories();
    loadTaxes();
  }, []);

  const [productName, setProductName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [category, setCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [quantity, setQuantity] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [taxType, setTaxType] = useState(null);
  const [taxes, setTaxes] = useState([]);
  const [lowStock, setLowStock] = useState("");
  //const [expiryDate, setExpiryDate] = useState("");

  const renderCollapseTooltip = (props) => (
    <Tooltip id="refresh-tooltip" {...props}>
      Collapse
    </Tooltip>
  );

  useEffect(() => {
    const loadCategories = async () => {
      const data = await fetchProductCategories();
      setCategories(data.map((cat) => ({
        value: cat.id,
        label: cat.productCategoryName
      })));
    };

    const loadTaxes = async () => {
      const data = await fetchTaxes();
      setTaxes(data.map((tax) => ({
        value: tax.id,
        label: `${tax.taxPercentage}%`
      })));
    };

    loadCategories();
    loadTaxes();
  }, []);

  const handleSaveProduct = async () => {
    if (!productName || !barcode || !category || !taxType) {
      console.error("Please fill out all required fields.");
      return;
    }

    if (isNaN(quantity) || isNaN(purchasePrice) || isNaN(pricePerUnit) || isNaN(lowStock)) {
      console.error("Please enter valid numbers for quantity, purchase price, price per unit, and low stock.");
      return;
    }

    const productData = {
      name: productName,
      barcode: barcode,
      pricePerUnit: parseFloat(pricePerUnit),
      taxDto: { id: parseInt(taxType.value) },
      isActive: true,
      productCategoryDto: { id: parseInt(category.value) },
      expiryDate: "",
      lowStock: parseInt(lowStock),
      purchasePrice: parseFloat(purchasePrice),
      quantity: parseInt(quantity),
    };

    const response = await saveProduct(productData);
    if (response) {
      console.error("Product saved successfully!");
      setProductName("");
      setBarcode("");
      setCategory(null);
      setQuantity("");
      setPurchasePrice("");
      setPricePerUnit("");
      setTaxType(null);
      setLowStock("");
    } else {
      console.error("Failed to save product.");
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        {/* Header part */}
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

        {/* Form */}
        <form>
          <div className="card">
            <div className="card-body add-product pb-0">
              {/* Product Information */}
              <div className="accordion-card-one accordion" id="accordionExample">
                <div className="accordion-item">
                  <div className="accordion-header" id="headingOne">
                    <div className="accordion-button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-controls="collapseOne">
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
                  <div id="collapseOne" className="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                    <div className="accordion-body">
                      <div className="row">
                        <div className="col-lg-4 col-sm-6 col-12">
                          <div className="mb-3 add-product">
                            <label className="form-label">Product Name</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Enter Product Name"
                              value={productName}
                              onChange={(e) => setProductName(e.target.value)}
                              required
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
                              value={barcode}
                              onChange={(e) => setBarcode(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <div className="addservice-info">
                        <div className="row">
                          <div className="col-lg-4 col-sm-6 col-12">
                            <div className="mb-3 add-product">
                              <div className="add-newplus">
                                <label className="form-label">Category</label>
                                <Link to="#" data-bs-toggle="modal" data-bs-target="#add-units-category">
                                  <PlusCircle className="plus-down-add" />
                                  <span>Add New</span>
                                </Link>
                              </div>
                              {loadingCategories ? (
                                <p>Loading categories...</p>
                              ) : (
                                <Select
                                  options={categories}
                                  placeholder="Choose"
                                  value={category}
                                  onChange={setCategory}
                                  required
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing and Stocks */}
              <div className="accordion-card-one accordion" id="accordionExample2">
                <div className="accordion-item">
                  <div className="accordion-header" id="headingTwo">
                    <div className="accordion-button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-controls="collapseTwo">
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
                  <div id="collapseTwo" className="accordion-collapse collapse show" aria-labelledby="headingTwo" data-bs-parent="#accordionExample2">
                    <div className="accordion-body">
                      <div className="tab-content" id="pills-tabContent">
                        <div className="tab-pane fade show active" id="pills-home" role="tabpanel" aria-labelledby="pills-home-tab">
                          <div className="row">
                            <div className="col-lg-4 col-sm-6 col-12">
                              <div className="input-blocks add-product">
                                <label>Quantity</label>
                                <input
                                  type="number"
                                  className="form-control"
                                  placeholder="Enter Quantity"
                                  value={quantity}
                                  onChange={(e) => setQuantity(e.target.value)}
                                  required
                                />
                              </div>
                            </div>
                            <div className="col-lg-4 col-sm-6 col-12">
                              <div className="input-blocks add-product">
                                <label>Purchased Price</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  className="form-control"
                                  placeholder="Enter Purchased Price"
                                  value={purchasePrice}
                                  onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}  // Ensure it is parsed as a float
                                  required
                                />
                              </div>
                            </div>
                            <div className="col-lg-4 col-sm-6 col-12">
                              <div className="input-blocks add-product">
                                <label>Price Per Unit</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  className="form-control"
                                  placeholder="Enter Price Per Unit"
                                  value={pricePerUnit}
                                  onChange={(e) => setPricePerUnit(parseFloat(e.target.value) || 0)}  // Ensure it is parsed as a float
                                  required
                                />
                              </div>
                            </div>
                            <div className="col-lg-4 col-sm-6 col-12">
                              <div className="input-blocks add-product">
                                <div className="add-newplus">
                                  <label>Tax Percentage</label>
                                  <Link to="#" data-bs-toggle="modal" data-bs-target="#add-units-tax">
                                    <PlusCircle className="plus-down-add" />
                                    <span>Add New</span>
                                  </Link>
                                </div>
                                {loadingTaxes ? (
                                  <p>Loading taxes...</p>
                                ) : (
                                  <Select
                                    options={taxes}
                                    placeholder="Select Option"
                                    value={taxType}
                                    onChange={setTaxType}
                                    required />
                                )}
                              </div>
                            </div>
                            <div className="col-lg-4 col-sm-6 col-12">
                              <div className="input-blocks add-product">
                                <label>Low Stock</label>
                                <input
                                  type="number"
                                  className="form-control"
                                  placeholder="Enter Low Stock"
                                  value={lowStock}
                                  onChange={(e) => setLowStock(e.target.value)}
                                  required
                                />
                              </div>
                            </div>
                            {/* <div className="col-lg-4 col-sm-6 col-12">
                              <div className="input-blocks add-product">
                                <label>Expiry Date</label>
                                <input
                                  type="date"
                                  className="form-control"
                                  value={expiryDate}
                                  onChange={(e) => setExpiryDate(e.target.value)}
                                  required
                                />
                              </div>
                            </div> */}
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
                onClick={handleSaveProduct}
              >
                Save Product
              </button>
            </div>
          </div>
        </form>
        {/* /add */}
      </div>
      <AddCategory />
      <AddTax />
    </div>
  );
};

export default AddProduct;