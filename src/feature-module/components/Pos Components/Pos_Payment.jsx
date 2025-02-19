import React, { useState } from "react";
import "../../../style/scss/components/Pos Components/Pos_Payment.scss";

const Pos_Payment = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errors, setErrors] = useState({});

  const validateInput = () => {
    let newErrors = {};

    if (!/^[A-Za-z]+$/.test(firstName)) {
      newErrors.firstName = "First name must contain only letters";
    }

    if (!/^[A-Za-z]+$/.test(lastName)) {
      newErrors.lastName = "Last name must contain only letters";
    }

    if (phoneNumber.length !== 10) {
      newErrors.phoneNumber = "Phone number must be exactly 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateInput()) {
      console.log("Customer saved!");
      setFirstName("");
      setLastName("");
      setPhoneNumber("");
      setErrors({});
      setShowPopup(false);
    }
  };

  return (
    <div className="col-span-3 grid grid-rows-2 gap-1">
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg text-base font-bold transition-colors shadow-md hover:shadow-lg"
        onClick={() => setShowPopup(true)}
      >
        Cash
      </button>
      <button className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg text-base font-bold transition-colors shadow-md hover:shadow-lg">
        Card
      </button>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h2 className="popup-title">Add Customer</h2>

            <label className="popup-label">First Name</label>
            <input
              type="text"
              placeholder="Enter first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="popup-input"
            />
            {errors.firstName && <p className="popup-error">{errors.firstName}</p>}

            <label className="popup-label">Last Name</label>
            <input
              type="text"
              placeholder="Enter last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="popup-input"
            />
            {errors.lastName && <p className="popup-error">{errors.lastName}</p>}

            <label className="popup-label">Phone Number</label>
            <input
              type="text"
              placeholder="Enter phone number"
              value={phoneNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setPhoneNumber(value.slice(0, 10));
              }}
              className="popup-input"
              maxLength={10}
            />
            {errors.phoneNumber && <p className="popup-error">{errors.phoneNumber}</p>}

            <div className="popup-buttons">
              <button className="popup-btn-save" onClick={handleSave}>
                Save
              </button>
              <button className="popup-btn-cancel" onClick={() => setShowPopup(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pos_Payment;
