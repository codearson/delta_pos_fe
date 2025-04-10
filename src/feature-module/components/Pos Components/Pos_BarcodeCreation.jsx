import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import Barcode from "react-barcode";
import { getProductByBarcode } from "../../Api/productApi";
import "../../../style/scss/components/Pos Components/Pos_BarcodeCreation.scss";

const Pos_BarcodeCreation = ({ onClose }) => {
  const [input, setInput] = useState("");
  const [barcodeValue, setBarcodeValue] = useState("");
  const [productStatus, setProductStatus] = useState("");
  const barcodeRef = useRef(null);

  const handleInputChange = async (e) => {
    const value = e.target.value.trim();
    setInput(value);
    
    if (value === "") {
      setProductStatus("");
      setBarcodeValue("");
      return;
    }

    try {
      const productData = await getProductByBarcode(value);
      if (productData && productData.responseDto && productData.responseDto.length > 0) {
        const productItem = productData.responseDto[0];
        setProductStatus(`Product: ${productItem.name}`);
        setBarcodeValue(value);
      } else {
        setProductStatus("Product not found with this barcode");
        setBarcodeValue("");
      }
    } catch (error) {
      setProductStatus("Error checking barcode");
      setBarcodeValue("");
    }
  };

  const handlePrint = () => {
    if (!barcodeValue) {
      return;
    }

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Barcode</title>
          <style>
            body {
              margin: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
            }
            .barcode-container {
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="barcode-container">
            <img id="barcodeImage" />
          </div>
          <script>
            // Wait for the image to load before printing
            const img = document.getElementById('barcodeImage');
            img.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);

    // Get the barcode SVG from the component
    const barcodeElement = barcodeRef.current;
    const svg = barcodeElement.querySelector('svg');
    
    if (svg) {
      // Convert SVG to data URL
      const svgData = new XMLSerializer().serializeToString(svg);
      const img = printWindow.document.getElementById('barcodeImage');
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }

    printWindow.document.close();
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
              placeholder="Enter barcode"
              className="barcode-popup-input"
            />
            <p className="barcode-popup-status">
              {productStatus || "Enter a barcode to check"}
            </p>
          </div>
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