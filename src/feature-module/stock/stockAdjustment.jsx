import React, { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import StockadjustmentModal from "../../core/modals/stocks/stockadjustmentModal";
import { getAllManagerToggles, updateManagerToggleStatus } from "../Api/ManagerToggle";
import { fetchEmployeeDiscounts, updateEmployeeDiscount, saveEmployeeDiscount } from "../Api/EmployeeDis";
import { fetchMinimamBanking, updateMinimamBanking, saveMinimamBanking } from "../Api/MinimamBankingApi";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

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

  .card {
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }

  .card:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  .card.age-validation {
    border-left: 4px solid #ff9800;
  }

  .card.discount {
    border-left: 4px solid #2196f3;
  }

  .card.customer {
    border-left: 4px solid #4CAF50;
  }

  .card.non-scan {
    border-left: 4px solid #ff0000;
  }

  .card.banking {
    border-left: 4px solid #ffc107;
  }

  .card.tax {
    border-left: 4px solid #9c27b0;
  }

  .card-title {
    font-size: 1.1rem;
    font-weight: 500;
    color: #333;
  }

  .card-description {
    font-size: 0.9rem;
    color: #666;
    margin-top: 4px;
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

  .discount-info {
    display: flex;
    align-items: center;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid #eee;
  }

  .discount-value {
    font-size: 1.1rem;
    font-weight: 500;
    color: #2196f3;
    margin-right: 12px;
  }

  .edit-discount-btn {
    padding: 4px 12px;
    background-color: #2196f3;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .edit-discount-btn:hover {
    background-color: #1976d2;
  }

  .edit-discount-input {
    width: 80px;
    padding: 4px 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-right: 8px;
    font-size: 1rem;
  }

  .edit-actions {
    display: flex;
    gap: 8px;
  }

  .save-btn, .cancel-btn {
    padding: 4px 12px;
    border: none;
    border-radius: 4px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .save-btn {
    background-color: #4caf50;
    color: white;
  }

  .save-btn:hover {
    background-color: #388e3c;
  }

  .cancel-btn {
    background-color: #f44336;
    color: white;
  }

  .cancel-btn:hover {
    background-color: #d32f2f;
  }
`;

const StockAdjustment = () => {
  const [toggles, setToggles] = useState([]);
  const [employeeDiscounts, setEmployeeDiscounts] = useState([]);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [employeeDiscountEnabled, setEmployeeDiscountEnabled] = useState(false);
  const [isAddingDiscount, setIsAddingDiscount] = useState(false);
  const [newDiscountValue, setNewDiscountValue] = useState("");
  
  // Minimam Banking states
  const [minimamBanking, setMinimamBanking] = useState(null);
  const [editingBanking, setEditingBanking] = useState(false);
  const [bankingValue, setBankingValue] = useState("");
  const [isAddingBanking, setIsAddingBanking] = useState(false);
  const [newBankingValue, setNewBankingValue] = useState("");

  useEffect(() => {
    const fetchToggles = async () => {
      try {
        const toggles = await getAllManagerToggles();
        // Filter to get discount-related toggles, Age Validation toggle, Add Customer toggle, Non Scan Product toggle, and Tax toggle
        const relevantToggles = toggles.responseDto.filter(
          toggle => toggle.action.includes("Discount") || 
                    toggle.action === "Age Validation" ||
                    toggle.action === "Add Customer" ||
                    toggle.action === "Non Scan Product" ||
                    toggle.action === "Tax"
        );
        
        setToggles(relevantToggles);
        
        // Find the employeeDiscount toggle and set its state
        const employeeDiscountToggle = relevantToggles.find(
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
  
  // Load Minimam Banking data when component mounts
  useEffect(() => {
    const loadMinimamBanking = async () => {
      try {
        const data = await fetchMinimamBanking();
        // Filter to get only active banking data
        const activeBanking = data.find(item => item.isActive === true);
        setMinimamBanking(activeBanking || null);
      } catch (error) {
        console.error("Error loading minimam banking:", error);
      }
    };
    
    // Always load minimam banking data regardless of toggle state
    loadMinimamBanking();
  }, []);

  const handleToggleChange = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      
      // Find the toggle to get its name
      const toggle = toggles.find(t => t.id === id);
      const toggleName = toggle ? toggle.action : "this setting";
      
      // Ask for confirmation
      const result = await Swal.fire({
        title: `Confirm ${newStatus ? 'Enable' : 'Disable'} ${toggleName}`,
        text: `Are you sure you want to ${newStatus ? 'enable' : 'disable'} ${toggleName}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33'
      });
      
      // If user confirmed, proceed with the update
      if (result.isConfirmed) {
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
        
        // Show success message
        Swal.fire({
          title: 'Success!',
          text: `${toggleName} has been ${newStatus ? 'enabled' : 'disabled'}`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Error updating toggle status:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update the toggle status',
        icon: 'error'
      });
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

  const validateDiscount = (value) => {
    if (value === "" || value === ".") {
      return "Please enter a valid discount value";
    }
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return "Please enter a valid number";
    }
    
    if (numValue < 0) {
      return "Discount cannot be negative";
    }
    
    if (numValue > 100) {
      return "Discount cannot exceed 100%";
    }
    
    return null; // No error
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

  const handleEditCancel = () => {
    setEditingDiscount(null);
    setEditValue("");
  };

  const handleAddDiscountClick = () => {
    setIsAddingDiscount(true);
    setNewDiscountValue("");
  };

  const handleNewDiscountChange = (e) => {
    const value = e.target.value;
    // Allow empty value, single decimal point, or valid number
    if (value === "" || value === "." || /^\d*\.?\d*$/.test(value)) {
      setNewDiscountValue(value);
    }
  };

  const handleSaveNewDiscount = async () => {
    const validationError = validateDiscount(newDiscountValue);
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
      const userId = localStorage.getItem("userId"); // Get the logged-in user's ID
      if (!userId) {
        throw new Error("User ID not found. Please log in again.");
      }

      const newDiscount = {
        userDto: {
          id: parseInt(userId)
        },
        discount: parseFloat(newDiscountValue),
        isActive: true
      };
      
      console.log('Sending discount data:', newDiscount);
      const response = await saveEmployeeDiscount(newDiscount);
      console.log('API Response:', response);
      
      if (response && !response.error) {
        // Refresh the employee discounts list
        const data = await fetchEmployeeDiscounts(true);
        console.log('Fetched updated discounts:', data);
        setEmployeeDiscounts(data);
        
        setIsAddingDiscount(false);
        setNewDiscountValue("");
        
        const MySwal = withReactContent(Swal);
        MySwal.fire({
          title: "Success!",
          text: "Employee discount added successfully",
          icon: "success",
          confirmButtonText: "OK"
        });
      } else {
        throw new Error(response?.error || "Failed to save employee discount");
      }
    } catch (error) {
      console.error("Error saving employee discount:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to save employee discount";
      const MySwal = withReactContent(Swal);
      MySwal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK"
      });
    }
  };

  const handleCancelAddDiscount = () => {
    setIsAddingDiscount(false);
    setNewDiscountValue("");
  };

  // Minimam Banking functions
  const handleEditBankingClick = () => {
    if (minimamBanking) {
      setEditingBanking(true);
      setBankingValue(minimamBanking.amount.toString());
    }
  };

  const handleBankingValueChange = (e) => {
    const value = e.target.value;
    // Allow empty value, single decimal point, or valid number
    if (value === "" || value === "." || /^\d*\.?\d*$/.test(value)) {
      setBankingValue(value);
    }
  };

  const validateBankingValue = (value) => {
    if (value === "" || value === ".") {
      return "Please enter a valid amount";
    }
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return "Please enter a valid number";
    }
    
    if (numValue < 0) {
      return "Amount cannot be negative";
    }
    
    return null; // No error
  };

  const handleEditBankingSave = async () => {
    if (!minimamBanking) return;

    const validationError = validateBankingValue(bankingValue);
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
        amount: parseFloat(bankingValue),
        isActive: true
      };
      
      await updateMinimamBanking(minimamBanking.id, updatedData);
      
      // Update the local state
      setMinimamBanking({
        ...minimamBanking,
        amount: parseFloat(bankingValue)
      });
      
      const MySwal = withReactContent(Swal);
      MySwal.fire({
        title: "Success!",
        text: "Minimam Banking amount updated successfully",
        icon: "success",
        confirmButtonText: "OK"
      });
      
      setEditingBanking(false);
      setBankingValue("");
    } catch (error) {
      console.error("Error updating minimam banking:", error);
      const MySwal = withReactContent(Swal);
      MySwal.fire({
        title: "Error!",
        text: "Failed to update minimam banking amount",
        icon: "error",
        confirmButtonText: "OK"
      });
    }
  };

  const handleEditBankingCancel = () => {
    setEditingBanking(false);
    setBankingValue("");
  };

  const handleAddBankingClick = () => {
    setIsAddingBanking(true);
    setNewBankingValue("");
  };

  const handleNewBankingValueChange = (e) => {
    const value = e.target.value;
    // Allow empty value, single decimal point, or valid number
    if (value === "" || value === "." || /^\d*\.?\d*$/.test(value)) {
      setNewBankingValue(value);
    }
  };

  const handleSaveNewBanking = async () => {
    const validationError = validateBankingValue(newBankingValue);
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
      const response = await saveMinimamBanking(parseFloat(newBankingValue));
      
      if (response && !response.error) {
        // Refresh the minimam banking data
        const data = await fetchMinimamBanking();
        // Filter to get only active banking data
        const activeBanking = data.find(item => item.isActive === true);
        setMinimamBanking(activeBanking || null);
        
        setIsAddingBanking(false);
        setNewBankingValue("");
        
        const MySwal = withReactContent(Swal);
        MySwal.fire({
          title: "Success!",
          text: "Minimam Banking amount added successfully",
          icon: "success",
          confirmButtonText: "OK"
        });
      } else {
        throw new Error(response?.error || "Failed to save minimam banking amount");
      }
    } catch (error) {
      console.error("Error saving minimam banking:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to save minimam banking amount";
      const MySwal = withReactContent(Swal);
      MySwal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK"
      });
    }
  };

  const handleCancelAddBanking = () => {
    setIsAddingBanking(false);
    setNewBankingValue("");
  };

  return (
    <div className="page-wrapper">
      <style>{styles}</style>
      <div className="content">
        <div className="row">
          {/* Minimam Banking Card - Always visible without toggle */}
          <div className="col-12 mb-4">
            <div className="card banking">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="card-title mb-0">Minimam Banking</h5>
                    <p className="card-description">
                      Set minimum banking amount for transactions
                    </p>
                    <div className="discount-info">
                      {isAddingBanking ? (
                        <>
                          <input
                            type="text"
                            className="edit-discount-input"
                            value={newBankingValue}
                            onChange={handleNewBankingValueChange}
                            placeholder="Enter amount"
                          />
                          <div className="edit-actions">
                            <button className="save-btn" onClick={handleSaveNewBanking}>
                              Save
                            </button>
                            <button className="cancel-btn" onClick={handleCancelAddBanking}>
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : editingBanking ? (
                        <>
                          <input
                            type="text"
                            className="edit-discount-input"
                            value={bankingValue}
                            onChange={handleBankingValueChange}
                            placeholder="Enter amount"
                          />
                          <div className="edit-actions">
                            <button className="save-btn" onClick={handleEditBankingSave}>
                              Save
                            </button>
                            <button className="cancel-btn" onClick={handleEditBankingCancel}>
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : minimamBanking ? (
                        <>
                          <span className="discount-value">
                            {minimamBanking.amount} Amount
                          </span>
                          <button 
                            className="edit-discount-btn"
                            onClick={handleEditBankingClick}
                          >
                            Edit
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="discount-value">No amount defined</span>
                          <button 
                            className="edit-discount-btn"
                            onClick={handleAddBankingClick}
                          >
                            Add Amount
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Other Toggle Cards */}
          {toggles.length > 0 ? (
            toggles.map((toggle) => (
              <div key={toggle.id} className="col-12 mb-4">
                <div className={`card ${
                  toggle.action === "Age Validation" ? "age-validation" : 
                  toggle.action === "Add Customer" ? "customer" : 
                  toggle.action === "Non Scan Product" ? "non-scan" :
                  toggle.action === "Tax" ? "tax" : "discount"
                }`}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="card-title mb-0">{toggle.action}</h5>
                        <p className="card-description">
                          {toggle.action === "Age Validation" 
                            ? "Enable age verification for age-restricted products"
                            : toggle.action === "Employee Discount"
                            ? "Enable employee discount functionality"
                            : toggle.action === "Add Customer"
                            ? "Enable add customer button in POS"
                            : toggle.action === "Non Scan Product"
                            ? "Show non-scan products in POS"
                            : toggle.action === "Tax"
                            ? "Enable tax calculation in POS"
                            : "Enable manual discount functionality"}
                        </p>
                        {toggle.action === "Employee Discount" && toggle.isActive && (
                          <div className="discount-info">
                            {isAddingDiscount ? (
                              <>
                                <input
                                  type="text"
                                  className="edit-discount-input"
                                  value={newDiscountValue}
                                  onChange={handleNewDiscountChange}
                                  placeholder="Enter %"
                                />
                                <div className="edit-actions">
                                  <button className="save-btn" onClick={handleSaveNewDiscount}>
                                    Save
                                  </button>
                                  <button className="cancel-btn" onClick={handleCancelAddDiscount}>
                                    Cancel
                                  </button>
                                </div>
                              </>
                            ) : editingDiscount ? (
                              <>
                                <input
                                  type="text"
                                  className="edit-discount-input"
                                  value={editValue}
                                  onChange={handleEditChange}
                                  placeholder="Enter %"
                                />
                                <div className="edit-actions">
                                  <button className="save-btn" onClick={handleEditSave}>
                                    Save
                                  </button>
                                  <button className="cancel-btn" onClick={handleEditCancel}>
                                    Cancel
                                  </button>
                                </div>
                              </>
                            ) : employeeDiscounts.length > 0 ? (
                              <>
                                <span className="discount-value">
                                  {employeeDiscounts[0]?.discount}% Discount
                                </span>
                                <button 
                                  className="edit-discount-btn"
                                  onClick={() => handleEditClick(employeeDiscounts[0])}
                                >
                                  Edit
                                </button>
                              </>
                            ) : (
                              <>
                                <span className="discount-value">No discount defined</span>
                                <button 
                                  className="edit-discount-btn"
                                  onClick={handleAddDiscountClick}
                                >
                                  Add Discount
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
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
            ))
          ) : (
            <div className="col-12 mb-4">
              <div className="card">
                <div className="card-body">
                  <p className="text-center mb-0">No settings available.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <StockadjustmentModal />
      </div>
    </div>
  );
};

export default StockAdjustment;
