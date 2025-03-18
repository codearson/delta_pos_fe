import React, { useEffect } from "react";
import PropTypes from "prop-types";
import "../../../style/scss/components/Pos Components/Pos_Calculator.scss";

export const Pos_Calculator = ({
  darkMode,
  selectedItems,
  currentItem,
  totalValue,
  inputScreenText,
  onBarcodeSearch,
  barcodeInput,
  setBarcodeInput,
  customerName,
  barcodeInputRef,
}) => {
  const handleBarcodeChange = (e) => {
    const value = e.target.value.trim();
    console.log("handleBarcodeChange triggered", { value, previousBarcodeInput: barcodeInput });
    setBarcodeInput(value);
    if (value) {
      onBarcodeSearch(value);
      setBarcodeInput(""); // Clear immediately after search
      console.log("Barcode input cleared after search");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && barcodeInput) {
      console.log("Enter pressed with barcode:", barcodeInput);
      onBarcodeSearch(barcodeInput);
      setBarcodeInput("");
      console.log("Barcode input cleared after Enter");
    }
  };

  useEffect(() => {
    barcodeInputRef.current?.focus();
    console.log("Pos_Calculator mounted or barcodeInputRef changed, focusing input");
  }, [barcodeInputRef]);

  return (
    <div className={`calculator-container ${darkMode ? "dark-mode" : "light-mode"}`}>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Scan barcode"
          className="search-input"
          value={barcodeInput}
          onChange={handleBarcodeChange}
          onKeyPress={handleKeyPress}
          ref={barcodeInputRef}
        />
        <span className="search-icon">
          <i className="feather-search" />
        </span>
      </div>

      <div className="input-screen-box">
        <div className="input-screen-text">{inputScreenText || ""}</div>
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
                  <span className="price-column">{item.price.toFixed(2)}</span>
                  <span className="total-column">{item.total.toFixed(2)}</span>
                </div>
              ))}
              {currentItem && (
                <div className="result-row in-progress">
                  <span className="qty-column">{currentItem.qty || ""}</span>
                  <span className="item-column">{currentItem.name || "Undefined Item"}</span>
                  <span className="price-column">{currentItem.price ? currentItem.price.toFixed(2) : ""}</span>
                  <span className="total-column">{currentItem.total ? currentItem.total.toFixed(2) : ""}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="summary-box">
        {customerName && (
          <div className="summary-item customer-name-box">
            <span className="label">Customer Name</span>
            <span className="value">{customerName}</span>
          </div>
        )}
        <div className="summary-item">
          <span className="label">Total Qty</span>
          <span className="value">{selectedItems.reduce((sum, item) => sum + item.qty, 0)}</span>
        </div>
        <div className="summary-item">
          <span className="label">Cash Back</span>
          <span className="value">0.00</span>
        </div>
        <div className="summary-item">
          <span className="label">Discount</span>
          <span className="value">0.00</span>
        </div>
        <div className="summary-item">
          <span className="label">Balance</span>
          <span className="value">0.00</span>
        </div>
        <div className="divider" />
        <div className="total-summary">
          <span className="label">Grand Total</span>
          <span className="value">{totalValue.toFixed(2)}</span>
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
      total: PropTypes.number.isRequired,
    })
  ).isRequired,
  currentItem: PropTypes.shape({
    name: PropTypes.string,
    qty: PropTypes.number,
    price: PropTypes.number,
    total: PropTypes.number,
  }),
  totalValue: PropTypes.number.isRequired,
  inputScreenText: PropTypes.string,
  onBarcodeSearch: PropTypes.func.isRequired,
  barcodeInput: PropTypes.string.isRequired,
  setBarcodeInput: PropTypes.func.isRequired,
  customerName: PropTypes.string,
  barcodeInputRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
};

export default Pos_Calculator;