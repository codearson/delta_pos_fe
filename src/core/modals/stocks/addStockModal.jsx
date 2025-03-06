import React, { useState } from 'react';
import Select from 'react-select';
import Swal from 'sweetalert2';
import PropTypes from 'prop-types';

const AddStockModal = ({ onAdd, refreshData }) => {
  const [formData, setFormData] = useState({
    branch: null,
    product: null,
    quantity: ''
  });

  // Separate validation function
  const validateForm = () => {
    if (!formData.branch?.value) {
      Swal.fire({
        title: "Validation Error!",
        text: "Please select a branch",
        icon: "warning",
        confirmButtonText: "OK"
      });
      return false;
    }

    if (!formData.product?.value) {
      Swal.fire({
        title: "Validation Error!",
        text: "Please select a product",
        icon: "warning",
        confirmButtonText: "OK"
      });
      return false;
    }

    const quantity = parseInt(formData.quantity);
    if (!formData.quantity || isNaN(quantity) || quantity < 0) {
      Swal.fire({
        title: "Validation Error!",
        text: "Please enter a valid quantity (must be 0 or greater)",
        icon: "warning",
        confirmButtonText: "OK"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Run validation before proceeding
    if (!validateForm()) {
      return;
    }

    const newStock = {
      isActive: 1,
      quantity: parseInt(formData.quantity),
      branchDto: {
        id: parseInt(formData.branch.value)
      },
      productDto: {
        id: parseInt(formData.product.value)
      }
    };

    try {
      await onAdd(newStock);
      
      // Reset form
      setFormData({
        branch: null,
        product: null,
        quantity: ''
      });

      // Close modal
      document.getElementById('add-units').classList.remove('show');
      document.body.classList.remove('modal-open');
      const modalBackdrop = document.querySelector('.modal-backdrop');
      if (modalBackdrop) {
        modalBackdrop.remove();
      }

      // Show success message
      await Swal.fire({
        title: "Success!",
        text: "Stock has been added successfully",
        icon: "success",
        confirmButtonText: "OK"
      });

      // Refresh data
      refreshData();
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Failed to add stock: " + (error.message || "Unknown error"),
        icon: "error",
        confirmButtonText: "OK"
      });
    }
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= 0)) {
      setFormData(prev => ({
        ...prev,
        quantity: value
      }));
    }
  };

  return (
    <div className="modal fade" id="add-units">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add Stock</h5>
            <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Branch<span className="text-danger">*</span></label>
                <Select
                  value={formData.branch}
                  onChange={(selected) => setFormData(prev => ({ ...prev, branch: selected }))}
                  options={/* your branch options */}
                  isClearable
                  className="mb-3"
                  placeholder="Select Branch"
                />
              </div>

              <div className="form-group">
                <label>Product<span className="text-danger">*</span></label>
                <Select
                  value={formData.product}
                  onChange={(selected) => setFormData(prev => ({ ...prev, product: selected }))}
                  options={/* your product options */}
                  isClearable
                  className="mb-3"
                  placeholder="Select Product"
                />
              </div>

              <div className="form-group">
                <label>Quantity<span className="text-danger">*</span></label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.quantity}
                  onChange={handleQuantityChange}
                  min="0"
                  step="1"
                  onKeyPress={(e) => {
                    if (e.key === '-' || e.key === '.' || e.key === 'e') {
                      e.preventDefault();
                    }
                  }}
                  placeholder="Enter quantity"
                />
              </div>

              <div className="submit-section">
                <button 
                  type="submit" 
                  className="btn btn-primary submit-btn"
                >
                  Create Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

AddStockModal.propTypes = {
  onAdd: PropTypes.func.isRequired,
  refreshData: PropTypes.func.isRequired
};

export default AddStockModal; 