import React, { useEffect, useState } from "react";
//import Breadcrumbs from "../../core/breadcrumbs";
import "react-datepicker/dist/react-datepicker.css";
import StockadjustmentModal from "../../core/modals/stocks/stockadjustmentModal";
import { getAllManagerToggles, updateManagerToggleStatus } from "../Api/ManagerToggle";
import { fetchEmployeeDiscounts, updateEmployeeDiscount, saveEmployeeDiscount } from "../Api/EmployeeDis";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";

const styles = `
  .nav-tabs-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .nav-tabs-container {
    display: flex;
    align-items: center;
  }

  .toggle-switch {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 20px;
    margin-left: 20px;
  }

  .toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ff4444;
    transition: .4s;
    border-radius: 20px;
  }

  .toggle-slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
  }

  input:checked + .toggle-slider {
    background-color: #00C851;
  }

  input:checked + .toggle-slider:before {
    transform: translateX(20px);
  }

  .toggle-label {
    margin-right: 10px;
    line-height: 20px;
    color: #333;
    font-weight: 500;
    font-size: 14px;
  }

  .toggle-wrapper {
    display: flex;
    align-items: center;
  }

  /* Manual Discount card styling */
  .card.mb-4 {
    margin-bottom: 0.5rem !important;
  }

  .card.mb-4 .card-body {
    padding: 0.75rem 1rem;
  }

  .card.mb-4 .card-title {
    margin-bottom: 0;
    font-size: 1rem;
    line-height: 1.2;
  }

  .card.mb-4 .d-flex {
    margin-bottom: 0 !important;
  }

  /* Employee Discount table styling */
  .employee-discount-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
  }

  .employee-discount-table th,
  .employee-discount-table td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #dee2e6;
  }

  .employee-discount-table th {
    background-color: #f8f9fa;
    font-weight: 600;
  }

  .employee-discount-table tr:hover {
    background-color: #f5f5f5;
  }

  .edit-btn {
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
  }

  .edit-btn:hover {
    background-color: #0069d9;
  }

  .discount-input {
    width: 80px;
    padding: 0.25rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
  }

  /* Modal styling */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }

  .modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 5px;
    width: 400px;
    max-width: 90%;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    position: relative;
    z-index: 10000;
  }

  .modal-content h4 {
    margin-top: 0;
    margin-bottom: 20px;
    font-size: 18px;
    font-weight: 600;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }

  .form-group {
    margin-bottom: 15px;
  }

  .form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
  }

  .form-control {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 14px;
  }

  .form-control.is-invalid {
    border-color: #dc3545;
  }

  .invalid-feedback {
    display: block;
    width: 100%;
    margin-top: 0.25rem;
    font-size: 12px;
    color: #dc3545;
  }
`;

// Add Discount Modal Component
const AddDiscountModal = ({ isOpen, onClose, onSave }) => {
  const [discountValue, setDiscountValue] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    // Allow empty value, single decimal point, or valid number
    if (value === "" || value === "." || /^\d*\.?\d*$/.test(value)) {
      setDiscountValue(value);
      // Clear error when user starts typing
      if (error) setError("");
    }
  };

  const validateDiscount = (value) => {
    if (value === "") {
      return "Discount is required";
    }
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return "Please enter a valid number";
    }
    if (numValue < 0) {
      return "Discount cannot be negative";
    }
    if (numValue > 100) {
      return "Discount cannot be more than 100%";
    }
    // Check if the number has more than 2 decimal places
    if (value.split(".")[1]?.length > 2) {
      return "Discount can have maximum 2 decimal places";
    }
    return "";
  };

  const handleSave = () => {
    const validationError = validateDiscount(discountValue);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    onSave(discountValue);
    setDiscountValue("");
    setError("");
  };

  const handleCancel = () => {
    setDiscountValue("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        <h4>Add Employee Discount</h4>
        <div className="form-group">
          <label>Discount</label>
          <input
            type="text"
            className={`form-control ${error ? 'is-invalid' : ''}`}
            value={discountValue}
            onChange={handleChange}
            placeholder="Enter discount percentage"
          />
          {error && <div className="invalid-feedback">{error}</div>}
        </div>
        <div className="modal-actions">
          <button 
            className="btn btn-primary me-2" 
            onClick={handleSave}
          >
            Apply
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// Add PropTypes validation
AddDiscountModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired
};

const StockAdjustment = () => {
  const [toggles, setToggles] = useState([]);
  const [employeeDiscounts, setEmployeeDiscounts] = useState([]);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [showAddDiscountModal, setShowAddDiscountModal] = useState(false);
  const [employeeDiscountEnabled, setEmployeeDiscountEnabled] = useState(false);

  useEffect(() => {
    const fetchToggles = async () => {
      try {
        const toggles = await getAllManagerToggles();
        setToggles(toggles.responseDto);
        
        // Find the employeeDiscount toggle and set its state
        const employeeDiscountToggle = toggles.responseDto.find(
          toggle => toggle.action === "Employee Discount"
        );
        if (employeeDiscountToggle) {
          setEmployeeDiscountEnabled(employeeDiscountToggle.isActive);
        }
      } catch (error) {
        console.error('Error fetching toggles:', error);
      }
    };
    
    fetchToggles();
  }, []);

  useEffect(() => {
    const loadEmployeeDiscounts = async () => {
      try {
        const data = await fetchEmployeeDiscounts(true);
        setEmployeeDiscounts(data);
      } catch (error) {
        console.error("Error loading employee discounts:", error);
      }
    };
    
    // Only load employee discounts if the toggle is enabled
    if (employeeDiscountEnabled) {
      loadEmployeeDiscounts();
    }
  }, [employeeDiscountEnabled]);

  const handleToggleChange = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await updateManagerToggleStatus(id, newStatus);
      
      // Update the toggles state
      setToggles(prevToggles => 
        prevToggles.map(toggle => 
          toggle.id === id ? { ...toggle, isActive: newStatus } : toggle
        )
      );
      
      // If this is the employeeDiscount toggle, update the state
      const updatedToggle = toggles.find(toggle => toggle.id === id);
      if (updatedToggle && updatedToggle.action === "Employee Discount") {
        setEmployeeDiscountEnabled(newStatus);
      }
    } catch (error) {
      console.error('Error updating toggle status:', error);
    }
  };

  const handleEditClick = (discount) => {
    setEditingDiscount(discount);
    setEditValue(discount.discount.toString());
  };

  const handleEditChange = (e) => {
    const value = e.target.value;
    // Allow empty value, single decimal point, or valid number
    if (value === "" || value === "." || /^\d*\.?\d*$/.test(value)) {
      setEditValue(value);
    }
  };

  const handleEditSave = async () => {
    if (!editingDiscount) return;

    const validationError = validateDiscount(editValue);
    if (validationError) {
      const MySwal = withReactContent(Swal);
      MySwal.fire({
        title: "Error!",
        text: validationError,
        icon: "error",
        confirmButtonText: "OK"
      });
      return;
    }

    try {
      const updatedData = {
        ...editingDiscount,
        discount: parseFloat(editValue)
      };
      
      await updateEmployeeDiscount(updatedData);
      
      // Update the local state
      setEmployeeDiscounts(prevDiscounts => 
        prevDiscounts.map(discount => 
          discount.id === editingDiscount.id ? updatedData : discount
        )
      );
      
      const MySwal = withReactContent(Swal);
      MySwal.fire({
        title: "Success!",
        text: "Employee discount updated successfully",
        icon: "success",
        confirmButtonText: "OK"
      });
      
      setEditingDiscount(null);
      setEditValue("");
    } catch (error) {
      console.error("Error updating employee discount:", error);
      const MySwal = withReactContent(Swal);
      MySwal.fire({
        title: "Error!",
        text: "Failed to update employee discount",
        icon: "error",
        confirmButtonText: "OK"
      });
    }
  };

  const validateDiscount = (value) => {
    if (value === "") {
      return "Discount is required";
    }
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return "Please enter a valid number";
    }
    if (numValue < 0) {
      return "Discount cannot be negative";
    }
    if (numValue > 100) {
      return "Discount cannot be more than 100%";
    }
    // Check if the number has more than 2 decimal places
    if (value.split(".")[1]?.length > 2) {
      return "Discount can have maximum 2 decimal places";
    }
    return "";
  };

  const handleEditCancel = () => {
    setEditingDiscount(null);
    setEditValue("");
  };

  const handleAddDiscountClick = () => {
    setShowAddDiscountModal(true);
  };

  const handleAddDiscountSave = async (newDiscountValue) => {
    try {
      const discountData = {
        userDto: {
          id: 1
        },
        discount: parseFloat(newDiscountValue),
        isActive: true
      };
      
      await saveEmployeeDiscount(discountData);
      
      // Refresh the employee discounts list
      const updatedData = await fetchEmployeeDiscounts(true);
      setEmployeeDiscounts(updatedData);
      
      const MySwal = withReactContent(Swal);
      MySwal.fire({
        title: "Success!",
        text: "Employee discount added successfully",
        icon: "success",
        confirmButtonText: "OK"
      });
      
      setShowAddDiscountModal(false);
    } catch (error) {
      console.error("Error adding employee discount:", error);
      const MySwal = withReactContent(Swal);
      MySwal.fire({
        title: "Error!",
        text: "Failed to add employee discount",
        icon: "error",
        confirmButtonText: "OK"
      });
    }
  };

  const handleAddDiscountCancel = () => {
    setShowAddDiscountModal(false);
  };

  return (
    <div className="page-wrapper">
      <style>{styles}</style>
      <div className="content">
        <div className="row">
          {toggles.map((toggle) => (
            <div key={toggle.id} className="col-12 mb-4">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="card-title mb-0">{toggle.action}</h5>
                    <div className="toggle-wrapper">
                      <label className="toggle-switch">
                        <input 
                          type="checkbox" 
                          checked={toggle.isActive} 
                          onChange={() => handleToggleChange(toggle.id, toggle.isActive)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Employee Discounts Section - Only show if toggle is enabled */}
        {employeeDiscountEnabled && (
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  {employeeDiscounts.length === 0 ? (
                    <div className="text-center">
                      <p>No employee discounts found.</p>
                      <button 
                        className="btn btn-primary" 
                        onClick={handleAddDiscountClick}
                      >
                        Add Discount
                      </button>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="employee-discount-table">
                        <thead>
                          <tr>
                            <th>Employee Name</th>
                            <th>Discount</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {employeeDiscounts.map((discount) => (
                            <tr key={discount.id}>
                              <td>Employee</td>
                              <td>
                                {editingDiscount?.id === discount.id ? (
                                  <input
                                    type="text"
                                    className="discount-input"
                                    value={editValue}
                                    onChange={handleEditChange}
                                  />
                                ) : (
                                  `${discount.discount}%`
                                )}
                              </td>
                              <td>
                                {editingDiscount?.id === discount.id ? (
                                  <>
                                    <button 
                                      className="edit-btn me-2" 
                                      onClick={handleEditSave}
                                    >
                                      Save
                                    </button>
                                    <button 
                                      className="edit-btn" 
                                      onClick={handleEditCancel}
                                    >
                                      Cancel
                                    </button>
                                  </>
                                ) : (
                                  <button 
                                    className="edit-btn" 
                                    onClick={() => handleEditClick(discount)}
                                  >
                                    Edit
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Discount Modal */}
        <AddDiscountModal 
          isOpen={showAddDiscountModal}
          onClose={handleAddDiscountCancel}
          onSave={handleAddDiscountSave}
        />

        <StockadjustmentModal />
      </div>
    </div>
  );
};

export default StockAdjustment;
