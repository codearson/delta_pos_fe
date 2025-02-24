import React, { useState } from "react";
import "../../../style/scss/components/Pos Components/Pos_Payment.scss";

const Pos_Payment = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [errors, setErrors] = useState({ phoneNumber: "", customerName: "" });

  const validateInput = () => {
    let newErrors = {};

    if (phoneNumber.length !== 10) {
      newErrors.phoneNumber = "Phone number must be exactly 10 digits";
    }

    if (!customerName.trim()) {
      newErrors.customerName = "Customer name is required";
    } else if (!/^[A-Za-z\s]+$/.test(customerName)) {
      newErrors.customerName = "Customer name must contain only letters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = () => {
    if (validateInput()) {
      console.log("Customer added!");
      setPhoneNumber("");
      setCustomerName("");
      setErrors({});
      setShowPopup(false);
    }
  };

  return (
    <div className="col-span-3 grid grid-rows-2 gap-1">
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg text-base font-bold transition-colors shadow-md hover:shadow-lg border-0"
        onClick={() => setShowPopup(true)}
      >
        Cash
      </button>
      <button className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg text-base font-bold transition-colors shadow-md hover:shadow-lg border-0">
        Card
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
              onChange={(e) => setCustomerName(e.target.value)}
              className="popup-input"
              required
            />
            {errors.customerName && <p className="popup-error">{errors.customerName}</p>}

            <div className="popup-buttons">
              <button className="popup-btn-cancel" onClick={() => setShowPopup(false)}>
                Cancel
              </button>
              <button className="popup-btn-save" onClick={handleAdd}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pos_Payment;
