import React from "react";
import PropTypes from "prop-types";
import "../../../style/scss/components/Pos Components/Pos_Calculator.scss";

export const Pos_Calculator = ({ darkMode, selectedItems, currentItem, totalValue }) => {
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

      <div className="display-box" style={{ maxHeight: "250px", overflowY: "auto", padding: "15px", scrollbarWidth: "thin", scrollbarColor: "#888 #f1f1f1" }}>
        <div style={{ marginLeft: "15px", marginRight: "15px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr 1fr 1fr", // Adjusted for balanced spacing
              fontWeight: "bold",
              borderBottom: "2px solid #ccc",
              paddingBottom: "8px",
              marginBottom: "8px",
              fontSize: "14px",
              color: "#333",
              position: "sticky",
              top: "0", // Fixed at the very top of the display box
              background: "#fff",
              zIndex: "1",
            }}
          >
            <span style={{ paddingRight: "10px" }}>Qty</span>
            <span style={{ paddingRight: "20px" }}>Item</span>
            <span style={{ textAlign: "right", paddingRight: "10px" }}>Price</span>
            <span style={{ textAlign: "right" }}>Total</span>
          </div>
          {(selectedItems.length > 0 || currentItem) && (
            <>
              {selectedItems.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 2fr 1fr 1fr",
                    padding: "8px 0",
                    borderBottom: "1px dashed #eee",
                    fontSize: "13px",
                    color: "#555",
                    lineHeight: "1.5",
                  }}
                >
                  <span style={{ paddingRight: "10px" }}>{item.qty}</span>
                  <span style={{ paddingRight: "20px" }}>{item.name}</span>
                  <span style={{ textAlign: "right", paddingRight: "10px" }}>${item.price.toFixed(2)}</span>
                  <span style={{ textAlign: "right" }}>${(item.qty * item.price).toFixed(2)}</span>
                </div>
              ))}
              {currentItem && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 2fr 1fr 1fr",
                    padding: "8px 0",
                    borderBottom: "1px dashed #eee",
                    fontSize: "13px",
                    color: "#777",
                    lineHeight: "1.5",
                    background: "#f9f9f9", // Light gray background for in-progress item
                  }}
                >
                  <span style={{ paddingRight: "10px" }}>{currentItem.qty || ""}</span>
                  <span style={{ paddingRight: "20px" }}>{currentItem.name || "Undefined Item"}</span>
                  <span style={{ textAlign: "right", paddingRight: "10px" }}>{currentItem.price ? `$${currentItem.price.toFixed(2)}` : ""}</span>
                  <span style={{ textAlign: "right" }}>{currentItem.qty && currentItem.price ? `$${(currentItem.qty * currentItem.price).toFixed(2)}` : ""}</span>
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
          <span className="value">${totalValue.toFixed(2)}</span>
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
          <span className="label">Grand Total</span>
          <span className="value">${totalValue.toFixed(2)}</span>
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
};

export default Pos_Calculator;