import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import Barcode from "react-barcode";
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import { categories } from "../../../core/json/Posdata";
import "../../../style/scss/components/Pos Components/Pos_BarcodeCreation.scss";

const Pos_BarcodeCreation = ({ onClose }) => {
  const [input, setInput] = useState("");
  const [barcodeValue, setBarcodeValue] = useState("");
  const [productStatus, setProductStatus] = useState("");
  const [isValidProduct, setIsValidProduct] = useState(false);
  const barcodeRef = useRef(null);

  // Check if the input matches an existing product as you type
  const handleInputChange = (e) => {
    const value = e.target.value.trim();
    setInput(value);
    if (value === "") {
      setProductStatus("");
      setIsValidProduct(false);
      return;
    }
    
    // Handle both numeric and string inputs for flexibility
    const parsedValue = parseInt(value, 10);
    if (!isNaN(parsedValue)) {
      const foundProduct = categories.find((item) => item.id === parsedValue);
      if (foundProduct) {
        setProductStatus(`Product: ${foundProduct.name}`);
        setIsValidProduct(true);
      } else {
        setProductStatus("Product not in list");
        setIsValidProduct(false);
      }
    } else {
      setProductStatus("Product not in list");
      setIsValidProduct(false);
    }
  };

  // Generate barcode
  const handleGenerateBarcode = () => {
    if (input.trim() !== "" && isValidProduct) {
      setBarcodeValue(input);
    }
  };

  // Go back (reset barcode and states)
  const handleBack = () => {
    setBarcodeValue("");
    setInput("");
    setProductStatus("");
    setIsValidProduct(false);
  };

  // Generate and download PDF
  const handlePrint = async () => {
    console.log("Print button clicked");
    if (!barcodeValue) {
      console.log("No barcode value found");
      return;
    }

    try {
      console.log("Capturing barcode element...");
      const barcodeElement = barcodeRef.current;
      if (!barcodeElement) {
        console.log("Barcode element not found");
        return;
      }

      const canvas = await html2canvas(barcodeElement);
      console.log("Barcode captured successfully");

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Get page width only since we don't need height
      const pageWidth = doc.internal.pageSize.getWidth();

      // Set image dimensions
      const imgWidth = 150;
      const imgHeight = 70;

      // Calculate center positions
      const imgX = (pageWidth - imgWidth) / 2;
      const imgY = 50;

      // Center align text
      doc.setFontSize(18);
      const text = `Barcode: ${barcodeValue}`;
      const textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
      const textX = (pageWidth - textWidth) / 2;
      doc.text(text, textX, 30);

      // Add centered image
      const imgData = canvas.toDataURL("image/png");
      doc.addImage(imgData, "PNG", imgX, imgY, imgWidth, imgHeight);

      doc.save(`barcode_${barcodeValue}.pdf`);
      console.log("PDF generated and download initiated");
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <div className="barcode-popup-overlay">
      <div className="barcode-popup">
        <div className="barcode-popup-content">
          <h2 className="barcode-popup-title">Create Barcode Label</h2>
          <div className="barcode-popup-input-container">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Enter product ID"
              className="barcode-popup-input"
            />
            <p className="barcode-popup-status">
              {productStatus || "Enter a product ID to check"}
            </p>
          </div>
          <button
            onClick={handleGenerateBarcode}
            className="barcode-popup-button generate"
            disabled={!isValidProduct}
          >
            Generate Barcode
          </button>
          {barcodeValue && (
            <div className="barcode-popup-barcode" ref={barcodeRef}>
              <Barcode 
                value={barcodeValue}
                width={2}
                height={100}
                displayValue={true}
                margin={10}
              />
            </div>
          )}
        </div>
        <div className="barcode-popup-actions">
          <button
            onClick={handleBack}
            className="barcode-popup-button back"
          >
            Back
          </button>
          <button
            onClick={handlePrint}
            disabled={!barcodeValue}
            className="barcode-popup-button print"
          >
            Print Barcode
          </button>
          <button
            onClick={onClose}
            className="barcode-popup-button close"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

Pos_BarcodeCreation.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default Pos_BarcodeCreation; 