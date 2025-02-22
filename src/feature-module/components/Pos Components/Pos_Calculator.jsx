import React from "react";
import PropTypes from "prop-types"; // Import PropTypes
import "../../../style/scss/components/Pos Components/Pos_Calculator.scss";

export const Pos_Calculator = ({ darkMode }) => {
  return (
    <div className={`calculator-container ${darkMode ? "dark-mode" : "light-mode"}`}>
      <div className="search-bar">
        <input
          type="search"
          placeholder="Search"
          className="search-input"
        />
        <span className="search-icon">
          <i className="feather-search" />
        </span>
      </div>

      <div className="display-box">
        {/* Placeholder for display content */}
      </div>

      <div className="summary-box">
        <div className="summary-item">
          <span className="label">QTY</span>
          <span className="value">N/A</span>
        </div>
        <div className="summary-item">
          <span className="label">Sub Total</span>
          <span className="value">$0.00</span>
        </div>
        <div className="summary-item">
          <span className="label">Cash Back</span>
          <span className="value">$0.00</span>
        </div>
        <div className="summary-item">
          <span className="label">Discount</span>
          <span className="value">$0.00</span>
        </div>
        <div className="summary-item">
          <span className="label">Balance</span>
          <span className="value">$0.00</span>
        </div>
        <div className="divider" />
        <div className="total-summary">
          <span className="label">Total</span>
          <span className="value">$0.00</span>
        </div>
      </div>
    </div>
  );
};

// Add PropTypes validation
Pos_Calculator.propTypes = {
  darkMode: PropTypes.bool.isRequired, // Validate darkMode as a required boolean
};

export default Pos_Calculator;