import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "../../../style/scss/components/Pos Components/Pos_Payment.scss";
import { fetchCustomers, saveCustomer } from "../../Api/customerApi";

const Pos_Payment = ({ onCustomerAdded }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [errors, setErrors] = useState({ phoneNumber: "", customerName: "" });
  const [existingCustomer, setExistingCustomer] = useState(null);

  useEffect(() => {
    const checkCustomer = async () => {
      if (phoneNumber.length === 10) {
        try {
          const customers = await fetchCustomers();
          const customer = customers.find(
            (c) => c.mobileNumber === phoneNumber && c.isActive === true
          );
          if (customer) {
            setExistingCustomer(customer);
            setCustomerName(customer.name);
          } else {
            setExistingCustomer(null);
            setCustomerName("");
          }
        } catch (error) {
          setExistingCustomer(null);
          setCustomerName("");
        }
      } else {
        setExistingCustomer(null);
        setCustomerName("");
      }
    };

    checkCustomer();
  }, [phoneNumber]);

  const validateInput = () => {
    let newErrors = {};

    if (phoneNumber.length !== 10) {
      newErrors.phoneNumber = "Phone number must be exactly 10 digits";
    }

    if (!existingCustomer && !customerName.trim()) {
      newErrors.customerName = "Customer name is required";
    } else if (!existingCustomer && !/^[A-Za-z\s]+$/.test(customerName)) {
      newErrors.customerName = "Customer name must contain only letters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = async () => {
    if (validateInput()) {
      if (!existingCustomer) {
        const customerData = {
          name: customerName,
          mobileNumber: phoneNumber,
          isActive: 1,
        };
        try {
          await saveCustomer(customerData);
        } catch (error) {
          return;
        }
      }

      onCustomerAdded(customerName);
      setPhoneNumber("");
      setCustomerName("");
      setErrors({});
      setShowPopup(false);
    }
  };

  const handleCustomerNameChange = (e) => {
    if (!existingCustomer) {
      setCustomerName(e.target.value);
    }
  };

  return (
    <div className="col-span-3 grid grid-rows-2 gap-1">
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg text-base font-bold transition-colors shadow-md hover:shadow-lg border-0"
        onClick={() => setShowPopup(true)}
      >
        💵 Cash
      </button>
      <button className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg text-base font-bold transition-colors shadow-md hover:shadow-lg border-0">
        💳 Card
      </button>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h2 className="popup-title">Add Customer</h2>

            <label className="popup-label">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="**********"
              value={phoneNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setPhoneNumber(value.slice(0, 10));
              }}
              className="popup-input"
              maxLength={10}
              required
            />
            {errors.phoneNumber && <p className="popup-error">{errors.phoneNumber}</p>}

            <label className="popup-label">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={customerName}
              onChange={handleCustomerNameChange}
              className="popup-input"
              disabled={!!existingCustomer}
              required
            />
            {errors.customerName && <p className="popup-error">{errors.customerName}</p>}

            <div className="popup-buttons">
              <button className="popup-btn-cancel" onClick={() => setShowPopup(false)}>
                Cancel
              </button>
              <button className="popup-btn-save" onClick={handleAdd}>
                {existingCustomer ? "Continue" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

Pos_Payment.propTypes = {
  onCustomerAdded: PropTypes.func.isRequired,
};

export default Pos_Payment;