import React, { useState } from "react";

const AddProduct = () => {
  const [formData, setFormData] = useState({
    tax: ''
  });

  const handleTaxChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,2}$/.test(value)) {
      setFormData(prev => ({ ...prev, tax: value }));
    }
  };

  return (
    <div className="add-product-form">
      <div className="form-group">
        <label htmlFor="tax">Tax Percentage</label>
        <input
          type="text"
          id="tax"
          className="form-control"
          value={formData.tax}
          onChange={handleTaxChange}
          maxLength="2"
          placeholder="Enter tax percentage"
        />
      </div>
    </div>
  );
};

export default AddProduct; 