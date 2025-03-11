import React from "react";
import PropTypes from "prop-types";
import "../../../style/scss/components/Pos Components/Pos_Calculator.scss";

export const Pos_Calculator = ({ darkMode, selectedItems, currentItem, totalValue, inputScreenText }) => {
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

      <div className="input-screen-box">
        {inputScreenText || ""}
      </div>

      <div className="display-box">
        <div className="result-table">
          <div className="result-header">
            <span className="qty-column">Qty</span>
            <span className="item-column">Item</span>
            <span className="price-column">Price</span>
            <span className="total-column">Total</span>
          </div>
          {(selectedItems.length > 0 || currentItem) && (
            <>
              {selectedItems.map((item, index) => (
                <div key={index} className="result-row">
                  <span className="qty-column">{item.qty}</span>
                  <span className="item-column">{item.name}</span>
                  <span className="price-column">LKR {item.price.toFixed(2)}</span>
                  <span className="total-column">LKR {(item.qty * item.price).toFixed(2)}</span>
                </div>
              ))}
              {currentItem && (
                <div className="result-row in-progress">
                  <span className="qty-column">{currentItem.qty || ""}</span>
                  <span className="item-column">{currentItem.name || "Undefined Item"}</span>
                  <span className="price-column">{currentItem.price ? `LKR ${currentItem.price.toFixed(2)}` : ""}</span>
                  <span className="total-column">{currentItem.qty && currentItem.price ? `LKR ${(currentItem.qty * currentItem.price).toFixed(2)}` : ""}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="summary-box">
        <div className="summary-item">
          <span className="label">Total Qty</span>
          <span className="value">{selectedItems.reduce((sum, item) => sum + item.qty, 0)}</span>
        </div>
        <div className="summary-item">
          <span className="label">Sub Total</span>
          <span className="value">LKR {totalValue.toFixed(2)}</span>
        </div>
        <div className="summary-item">
          <span className="label">Cash Back</span>
          <span className="value">LKR 0.00</span>
        </div>
        <div className="summary-item">
          <span className="label">Discount</span>
          <span className="value">LKR 0.00</span>
        </div>
        <div className="summary-item">
          <span className="label">Balance</span>
          <span className="value">LKR 0.00</span>
        </div>
        <div className="divider" />
        <div className="total-summary">
          <span className="label">Grand Total</span>
          <span className="value">LKR {totalValue.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

Pos_Calculator.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  selectedItems: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      qty: PropTypes.number.isRequired,
      price: PropTypes.number.isRequired,
    })
  ).isRequired,
  currentItem: PropTypes.shape({
    name: PropTypes.string,
    qty: PropTypes.number,
    price: PropTypes.number,
  }),
  totalValue: PropTypes.number.isRequired,
  inputScreenText: PropTypes.string,
};

export default Pos_Calculator;