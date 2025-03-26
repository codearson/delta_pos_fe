// src/feature-module/components/Pos Components/Pos_CategoryGrid.jsx

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "../../../style/scss/components/Pos Components/Pos_CategoryGrid.scss";
import Pos_BarcodeCreation from "./Pos_BarcodeCreation";
import { savePurchase, fetchPurchases, deleteAllPurchases } from "../../Api/purchaseListApi";
import jsPDF from "jspdf"; // Correct import for jsPDF
import autoTable from "jspdf-autotable"; // Explicitly import autoTable
import { quickAccess, fetchCustomCategories } from "../../../core/json/Posdata";

const PAGE_SIZE = 15;

const Pos_CategoryGrid = ({ items = fetchCustomCategories, onCategorySelect }) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [showBarcodePopup, setShowBarcodePopup] = useState(false);
  const [showAddPurchasePopup, setShowAddPurchasePopup] = useState(false);
  const [showViewPurchasePopup, setShowViewPurchasePopup] = useState(false);
  const [categories, setCategories] = useState([]);
  // State for Add Purchase Popup
  const [barcode, setBarcode] = useState("");
  const [productStatus, setProductStatus] = useState("");
  const [error, setError] = useState("");
  // State for View Purchase Popup
  const [purchases, setPurchases] = useState([]);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  useEffect(() => {
    if (typeof items === "function") {
      items()
        .then((fetchedCategories) => {
          setCategories(fetchedCategories || []);
          setPageIndex(0);
        })
        .catch((err) => {
          console.error("Error fetching categories:", err);
          setCategories([]); // Fallback to empty array to prevent breaking other functionality
        });
    } else if (items instanceof Promise) {
      items
        .then((fetchedCategories) => {
          setCategories(fetchedCategories || []);
          setPageIndex(0);
        })
        .catch((err) => {
          console.error("Error fetching categories:", err);
          setCategories([]);
        });
    } else {
      setCategories(items || []);
      setPageIndex(0);
    }
  }, [items]);

  const start = pageIndex * PAGE_SIZE;
  const end = start + PAGE_SIZE;

  // Ensure filteredCategories is always an array
  let filteredCategories = items === fetchCustomCategories ? categories : items;
  if (filteredCategories instanceof Promise) {
    filteredCategories = categories; // Fallback to categories while Promise resolves
  } else if (!Array.isArray(filteredCategories)) {
    filteredCategories = [];
  }

  let paginatedItems = filteredCategories.slice(start, end);

  if (items === quickAccess) {
    paginatedItems = paginatedItems.map((item) =>
      item.name === "Label Print"
        ? { ...item, isLabelPrint: true }
        : item.name === "Add Purchase List"
        ? { ...item, isAddPurchase: true }
        : item.name === "View Purchase List"
        ? { ...item, isViewPurchase: true }
        : item
    );
  }

  if (pageIndex > 0 && items === fetchCustomCategories) {
    paginatedItems = [
      {
        id: "prev",
        name: "Prev",
        icon: "⬅️",
        isPrev: true,
      },
      ...paginatedItems.slice(1),
    ];
  }

  if (items === fetchCustomCategories && end < filteredCategories.length) {
    paginatedItems = [
      ...paginatedItems.slice(0, 14),
      {
        id: "more",
        name: "More",
        icon: "➡️",
        isMore: true,
      },
    ];
  }

  const renderCategoryButton = (item) => {
    const handleClick = () => {
      if (item.isPrev) {
        setPageIndex(pageIndex - 1);
      } else if (item.isMore) {
        setPageIndex(pageIndex + 1);
      } else if (item.isLabelPrint) {
        setShowBarcodePopup(true);
      } else if (item.isAddPurchase) {
        setShowAddPurchasePopup(true);
      } else if (item.isViewPurchase) {
        setShowViewPurchasePopup(true);
        const loadPurchases = async () => {
          try {
            const data = await fetchPurchases();
            setPurchases(data || []);
          } catch (err) {
            console.error("Failed to load purchases:", err.message);
            setError(err.message);
            setPurchases([]); // Fallback to empty array to prevent breaking other functionality
          }
        };
        loadPurchases();
      } else {
        onCategorySelect(item);
      }
    };

    // Apply .quick-access-btn class only for Quick Access items
    const buttonClass = items === quickAccess ? "quick-access-btn" : "category-btn";

    return (
      <button
        key={item.id}
        className={`group ${buttonClass}`}
        onClick={handleClick}
      >
        <div className="text-2xl mb-1 transition-transform group-hover:scale-110">
          {item.icon}
        </div>
        <div className="font-medium text-sm truncate px-1">{item.name}</div>
      </button>
    );
  };

  // Handlers for Add Purchase Popup
  const handleBarcodeChange = (e) => {
    const value = e.target.value.trim();
    setBarcode(value);
    setError("");
    if (value === "") {
      setProductStatus("");
      return;
    }
    const parsedValue = parseInt(value, 10);
    if (!isNaN(parsedValue)) {
      const foundProduct = categories.find((item) => item.id === parsedValue);
      setProductStatus(
        foundProduct ? `Product: ${foundProduct.name}` : "No product found"
      );
    } else {
      setProductStatus("No product found");
    }
  };

  const handleAddPurchase = async () => {
    if (!barcode.trim()) {
      setError("Barcode is required");
      return;
    }

    try {
      await savePurchase({ barcode });
      setShowAddPurchasePopup(false);
      setBarcode("");
      setProductStatus("");
      setError("");
    } catch (err) {
      console.error("Failed to add purchase:", err.message);
      setError(err.message || "Failed to add purchase");
    }
  };

  // Handlers for View Purchase Popup
  const handleRowClick = (purchase) => {
    setSelectedPurchase(purchase);
  };

  const handleClearTable = async () => {
    try {
      await deleteAllPurchases(); // Call the API to delete all purchases
      setPurchases([]);
      setSelectedPurchase(null);
      setError("");
    } catch (err) {
      console.error("Failed to clear purchases:", err.message);
      setError(err.message || "Failed to clear purchases");
    }
  };

  const handlePrintPurchase = () => {
    if (!selectedPurchase) return;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Set document properties
    doc.setProperties({
      title: `Purchase Details - ${selectedPurchase.barcode}`,
      author: "POS System",
      creator: "POS System",
    });

    // Add a header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text("Purchase Details", 105, 20, { align: "center" });

    // Add a subtitle with the date
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: "center" });

    // Add a horizontal line
    doc.setDrawColor(0, 102, 204);
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);

    // Prepare table data
    const tableData = [
      ["Barcode", selectedPurchase.barcode],
      // Add more fields if available, e.g.:
      // ["Product Name", selectedPurchase.productName || "N/A"],
      // ["Date", selectedPurchase.date || "N/A"],
    ];

    // Use the imported autoTable function
    autoTable(doc, {
      startY: 40,
      head: [["Field", "Value"]],
      body: tableData,
      theme: "striped",
      styles: {
        fontSize: 12,
        cellPadding: 3,
        textColor: [40, 40, 40],
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [0, 102, 204], // Blue header
        textColor: [255, 255, 255], // White text
        fontSize: 14,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240], // Light gray for alternate rows
      },
      margin: { left: 20, right: 20 },
    });

    // Add a footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${pageCount}`, 190, 287, { align: "right" });
    }

    // Save the PDF
    doc.save(`purchase_${selectedPurchase.barcode}.pdf`);
  };

  const handleCloseViewPurchasePopup = () => {
    setShowViewPurchasePopup(false);
    setSelectedPurchase(null);
    setPurchases([]);
    setError("");
  };

  return (
    <div className="size">
      <div className="grid grid-cols-5 gap-2">
        {paginatedItems.map(renderCategoryButton)}
      </div>
      {showBarcodePopup && (
        <Pos_BarcodeCreation onClose={() => setShowBarcodePopup(false)} />
      )}
      {showAddPurchasePopup && (
        <div className="purchase-popup-overlay">
          <div className="purchase-popup">
            <div className="purchase-popup-header">
              <h2 className="purchase-popup-title">Add Purchase List</h2>
              <button
                onClick={() => {
                  setShowAddPurchasePopup(false);
                  setBarcode("");
                  setProductStatus("");
                  setError("");
                }}
                className="purchase-popup-close"
              >
                ×
              </button>
            </div>
            <div className="purchase-popup-input-container">
              <input
                type="text"
                value={barcode}
                onChange={handleBarcodeChange}
                placeholder="Enter barcode number"
                className="purchase-popup-input"
              />
              <p className="purchase-popup-status">
                {productStatus || "Enter a barcode to check"}
              </p>
              {error && (
                <p className="purchase-popup-status" style={{ color: "red" }}>
                  {error}
                </p>
              )}
            </div>
            <div className="purchase-popup-actions">
              <button
                onClick={handleAddPurchase}
                className="purchase-popup-button add"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
      {showViewPurchasePopup && (
        <div className="purchase-popup-overlay">
          <div className="purchase-popup">
            <div className="purchase-popup-header">
              <h2 className="purchase-popup-title">View Purchase List</h2>
              <button
                onClick={handleCloseViewPurchasePopup}
                className="purchase-popup-close"
              >
                ×
              </button>
            </div>
            <div className="purchase-popup-table-container">
              <table className="purchase-popup-table">
                <thead>
                  <tr>
                    <th>Barcode</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.length > 0 ? (
                    purchases.map((purchase) => (
                      <tr
                        key={purchase.barcode}
                        className={selectedPurchase === purchase ? "selected" : ""}
                        onClick={() => handleRowClick(purchase)}
                      >
                        <td>{purchase.barcode}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="1" className="no-data">
                        {error || "No purchases found"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {selectedPurchase && (
              <div className="purchase-popup-details">
                <p><strong>Barcode:</strong> {selectedPurchase.barcode}</p>
              </div>
            )}
            <div className="purchase-popup-actions">
              <button
                onClick={handleClearTable}
                disabled={purchases.length === 0} // Enable only if data exists
                className="purchase-popup-button clear"
              >
                Clear
              </button>
              <button
                onClick={handlePrintPurchase}
                disabled={!selectedPurchase}
                className="purchase-popup-button print"
              >
                Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

Pos_CategoryGrid.propTypes = {
  items: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        name: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
      })
    ),
    PropTypes.func,
  ]),
  onCategorySelect: PropTypes.func.isRequired,
};

export default Pos_CategoryGrid;