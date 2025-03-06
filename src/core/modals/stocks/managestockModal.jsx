import React, { useState, useEffect } from "react";
import Select from "react-select";
import PropTypes from 'prop-types';
import { fetchProducts } from "../../../feature-module/Api/productApi";
import { updateStock, saveStock, fetchBranches } from "../../../feature-module/Api/StockApi";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const ManageStockModal = ({ selectedStock, refreshData }) => {
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    branch: null,
    product: null,
    quantity: ''
  });
  const [errors, setErrors] = useState({
    branch: '',
    product: '',
    quantity: ''
  });
  const MySwal = withReactContent(Swal);

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

  useEffect(() => {
    const getBranches = async () => {
      setLoading(true);
      try {
        const response = await fetchBranches();
        console.log('Branches response:', response);
        
        // Transform branches for Select component
        const transformedBranches = response.map(branch => ({
          value: branch.id,
          label: branch.branchName
        }));
        
        console.log('Transformed branches:', transformedBranches);
        setBranches(transformedBranches);
      } catch (error) {
        console.error("Error fetching branches:", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to fetch branches",
          icon: "error",
          confirmButtonText: "OK"
        });
      } finally {
        setLoading(false);
      }
    };

    getBranches();
  }, []);

  useEffect(() => {
    if (selectedStock) {
      console.log('Selected Stock:', selectedStock);
      setFormData({
        branch: selectedStock.branchDto ? {
          value: selectedStock.branchDto.id,
          label: selectedStock.branchDto.branchName
        } : null,
        product: selectedStock.productDto ? {
          value: selectedStock.productDto.id,
          label: selectedStock.productDto.name
        } : null,
        quantity: selectedStock.quantity || ''
      });
    } else {
      // Reset form when not editing
      setFormData({
        branch: null,
        product: null,
        quantity: ''
      });
    }
  }, [selectedStock]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.branch?.value) {
      MySwal.fire({
        title: "Validation Error!",
        text: "Please select a branch",
        icon: "warning",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "btn btn-primary",
        },
      });
      return;
    }

    if (!formData.product?.value) {
      MySwal.fire({
        title: "Validation Error!",
        text: "Please select a product",
        icon: "warning",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "btn btn-primary",
        },
      });
      return;
    }

    const quantity = parseInt(formData.quantity);
    if (!formData.quantity || isNaN(quantity) || quantity < 0) {
      MySwal.fire({
        title: "Validation Error!",
        text: "Please enter a valid quantity (must be 0 or greater)",
        icon: "warning",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "btn btn-primary",
        },
      });
      return;
    }

    const updatedData = {
      id: selectedStock?.id,
      isActive: 1,
      quantity: parseInt(formData.quantity),
      branchDto: {
        id: parseInt(formData.branch?.value)
      },
      productDto: {
        id: parseInt(formData.product?.value)
      }
    };

    try {
      const response = await updateStock(updatedData);

      if (response?.data?.status === true) {
        // Close modal
        document.getElementById('edit-units').classList.remove('show');
        document.body.classList.remove('modal-open');
        const modalBackdrop = document.querySelector('.modal-backdrop');
        if (modalBackdrop) {
          modalBackdrop.remove();
        }
        document.body.style.removeProperty('overflow');
        document.body.style.removeProperty('padding-right');

        await MySwal.fire({
          title: "Success!",
          text: "Stock has been updated successfully!",
          icon: "success",
          confirmButtonText: "OK",
          customClass: {
            confirmButton: "btn btn-primary",
          },
        });

        setFormData({
          branch: null,
          product: null,
          quantity: ''
        });

        refreshData();
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      MySwal.fire({
        title: "Error!",
        text: "Failed to update stock: " + (error.message || "Unknown error"),
        icon: "error",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "btn btn-primary",
        },
      });
    }
  };

  // Add onChange handler for quantity
  const handleQuantityChange = (e) => {
    const value = e.target.value;
    
    // Only allow positive numbers and empty string (for backspace)
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= 0)) {
      setFormData(prev => ({
        ...prev,
        quantity: value
      }));
    }
  };

  // Add this function for handling stock creation
  const handleCreate = async (e) => {
    e.preventDefault();

    // Reset previous errors
    setErrors({
      branch: '',
      product: '',
      quantity: ''
    });

    let hasErrors = false;

    // Validation
    if (!formData.branch?.value) {
      setErrors(prev => ({...prev, branch: 'Please select a branch'}));
      hasErrors = true;
    }

    if (!formData.product?.value) {
      setErrors(prev => ({...prev, product: 'Please select a product'}));
      hasErrors = true;
    }

    const quantity = parseInt(formData.quantity);
    if (!formData.quantity || isNaN(quantity) || quantity < 0) {
      setErrors(prev => ({...prev, quantity: 'Please enter a valid quantity (must be 0 or greater)'}));
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    const newStock = {
        quantity: parseInt(formData.quantity),
        productDto: {
            id: parseInt(formData.product.value)
        },
        branchDto: {
            id: parseInt(formData.branch.value)
        },
        isActive: 1
    };

    try {
        const response = await saveStock(newStock);
        
        if (response && response.status === true) {
            MySwal.fire({
                title: "Success!",
                text: "Stock saved successfully!",
                icon: "success",
                confirmButtonText: "OK",
                customClass: {
                    confirmButton: "btn btn-primary",
                },
            });
            
            // Reset form data
            setFormData({
                branch: null,
                product: null,
                quantity: ''
            });

            // Close modal and clean up
            document.getElementById('add-units').classList.remove('show');
            document.querySelector('.modal-backdrop').remove();
            document.body.classList.remove('modal-open');
            document.body.style.removeProperty('overflow');
            document.body.style.removeProperty('padding-right');
            
            // Refresh data
            if (refreshData) {
                refreshData();
            }
        } else {
            MySwal.fire({
                title: "Error!",
                text: "Failed to save stock.",
                icon: "error",
                confirmButtonText: "OK",
                customClass: {
                    confirmButton: "btn btn-primary",
                },
            });
        }
    } catch (err) {
        MySwal.fire({
            title: "Error!",
            text: "An unexpected error occurred.",
            icon: "error",
            confirmButtonText: "OK",
            customClass: {
                confirmButton: "btn btn-primary",
            },
        });
    }
  };

  // Add this function to handle cancel button click
  const handleCancel = () => {
    // Reset form to the original selected stock data if editing
    if (selectedStock) {
      setFormData({
        branch: selectedStock.branchDto ? {
          value: selectedStock.branchDto.id,
          label: selectedStock.branchDto.branchName
        } : null,
        product: selectedStock.productDto ? {
          value: selectedStock.productDto.id,
          label: selectedStock.productDto.name
        } : null,
        quantity: selectedStock.quantity || ''
      });
    }
  };

  useEffect(() => {
    // Expose reset function globally
    window.resetStockForm = () => {
      setFormData({
        branch: null,
        product: null,
        quantity: ''
      });
    };

    // Cleanup
    return () => {
      delete window.resetStockForm;
    };
  }, []);

  // Add event listener for Add Stock modal
  useEffect(() => {
    const addModal = document.getElementById('add-units');
    if (addModal) {
      addModal.addEventListener('show.bs.modal', () => {
        // Clear form data when Add Stock modal opens
        setFormData({
          branch: null,
          product: null,
          quantity: ''
        });
      });
    }

    // Cleanup
    return () => {
      const addModal = document.getElementById('add-units');
      if (addModal) {
        addModal.removeEventListener('show.bs.modal', () => {});
      }
    };
  }, []);

  return (
    <>
      {/* Add Stock */}
      <div 
        className="modal fade" 
        id="add-units"
        tabIndex="-1"
        aria-labelledby="addStockModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered stock-adjust-modal">
          <div className="modal-content">
            <div className="page-wrapper-new p-0">
              <div className="content">
                <div className="modal-header border-0 custom-modal-header">
                  <div className="page-title">
                    <h4 id="addStockModalLabel">Add Stock</h4>
                  </div>
                  <button
                    type="button"
                    className="close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                    tabIndex="0"
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
                <div className="modal-body custom-modal-body">
                  <form onSubmit={handleCreate}>
                    <div className="row">
                      <div className="col-lg-6">
                        <div className="input-blocks">
                          <label>Branch<span className="text-danger">*</span></label>
                          <Select 
                            className={`select ${errors.branch ? 'is-invalid' : ''}`}
                            placeholder="Select Branch"
                            options={branches}
                            value={formData.branch}
                            onChange={(selected) => {
                              setFormData(prev => ({...prev, branch: selected}));
                              setErrors(prev => ({...prev, branch: ''}));
                            }}
                            isLoading={loading}
                            isClearable
                          />
                          {errors.branch && <div className="error-message" style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{errors.branch}</div>}
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="input-blocks">
                          <label>Product<span className="text-danger">*</span></label>
                          <Select 
                            className={`select ${errors.product ? 'is-invalid' : ''}`}
                            options={products}
                            placeholder="Select Product"
                            value={formData.product}
                            onChange={(selected) => {
                              setFormData(prev => ({...prev, product: selected}));
                              setErrors(prev => ({...prev, product: ''}));
                            }}
                            isLoading={loading}
                            isClearable
                          />
                          {errors.product && <div className="error-message" style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{errors.product}</div>}
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="input-blocks">
                          <label>Quantity<span className="text-danger">*</span></label>
                          <input
                            type="number"
                            className={`form-control ${errors.quantity ? 'is-invalid' : ''}`}
                            placeholder="Enter Quantity"
                            value={formData.quantity}
                            onChange={(e) => {
                              handleQuantityChange(e);
                              setErrors(prev => ({...prev, quantity: ''}));
                            }}
                            min="0"
                            step="1"
                            onKeyPress={(e) => {
                              if (e.key === '-' || e.key === '.' || e.key === 'e') {
                                e.preventDefault();
                              }
                            }}
                           
                          />
                          {errors.quantity && <div className="error-message" style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{errors.quantity}</div>}
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer-btn">
                      <button
                        type="button"
                        className="btn btn-cancel me-2"
                        data-bs-dismiss="modal"
                        tabIndex="0"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-submit"
                        tabIndex="0"
                      >
                        Create
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Add Stock */}

      {/* Edit Stock */}
      <div 
        className="modal fade" 
        id="edit-units"
        tabIndex="-1"
        aria-labelledby="editStockModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered stock-adjust-modal">
          <div className="modal-content">
            <div className="page-wrapper-new p-0">
              <div className="content">
                <div className="modal-header border-0 custom-modal-header">
                  <div className="page-title">
                    <h4 id="editStockModalLabel">Edit Stock</h4>
                  </div>
                  <button
                    type="button"
                    className="close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                    tabIndex="0"
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
                <div className="modal-body custom-modal-body">
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-lg-6">
                        <div className="input-blocks">
                          <label>Branch<span className="text-danger">*</span></label>
                          <Select 
                            className="select" 
                            placeholder="Select Branch"
                            options={branches}
                            value={formData.branch}
                            onChange={(selected) => setFormData(prev => ({...prev, branch: selected}))}
                            isLoading={loading}
                            isClearable
                          />
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="input-blocks">
                          <label>Product</label>
                          <Select 
                            className="select" 
                            options={products}
                            placeholder="Select Product"
                            isLoading={loading}
                            value={formData.product}
                            onChange={(selected) => setFormData(prev => ({...prev, product: selected}))}
                          />
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="input-blocks">
                          <label>Quantity</label>
                          <input
                            type="number"
                            className="form-control"
                            value={formData.quantity}
                            onChange={handleQuantityChange}
                            min="0"
                            step="1"
                            onKeyPress={(e) => {
                              // Prevent negative signs and decimals
                              if (e.key === '-' || e.key === '.' || e.key === 'e') {
                                e.preventDefault();
                              }
                            }}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer-btn">
                      <button
                        type="button"
                        className="btn btn-cancel me-2"
                        data-bs-dismiss="modal"
                        onClick={handleCancel}
                        tabIndex="0"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-submit" tabIndex="0">
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Edit Stock */}
    </>
  );
};

ManageStockModal.propTypes = {
  selectedStock: PropTypes.shape({
    id: PropTypes.number,
    branchId: PropTypes.number,
    productId: PropTypes.number,
    branchDto: PropTypes.shape({
      id: PropTypes.number,
      branchName: PropTypes.string
    }),
    productDto: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string
    }),
    quantity: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ])
  }),
  refreshData: PropTypes.func
};

ManageStockModal.defaultProps = {
  selectedStock: null,
  refreshData: () => {}
};

export default ManageStockModal;
