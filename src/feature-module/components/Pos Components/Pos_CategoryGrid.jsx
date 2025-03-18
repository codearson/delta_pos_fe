import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "../../../style/scss/components/Pos Components/Pos_CategoryGrid.scss";
import Pos_BarcodeCreation from "./Pos_BarcodeCreation";
import { savePurchase, fetchPurchases } from "../../Api/purchaseListApi";
import { getProductByBarcode } from "../../Api/productApi";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; // Import jspdf-autotable
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

  useEffect(() => {
    if (typeof items === "function") {
      items().then((fetchedCategories) => {
        setCategories(fetchedCategories || []);
        setPageIndex(0);
      });
    } else if (items instanceof Promise) {
      items.then((fetchedCategories) => {
        setCategories(fetchedCategories || []);
        setPageIndex(0);
      });
    } else {
      setCategories(items || []);
      setPageIndex(0);
    }
  }, [items]);

  useEffect(() => {
    if (showViewPurchasePopup) {
      const loadPurchasesAndProducts = async () => {
        const data = await fetchPurchases();
        const purchasesWithProducts = await Promise.all(
          data.map(async (purchase) => {
            try {
              const productData = await getProductByBarcode(purchase.barcode);
              return {
                ...purchase,
                productName: productData?.responseDto?.[0]?.name || "Unknown Product",
              };
            } catch (err) {
              return { ...purchase, productName: "Unknown Product" };
            }
          })
        );
        setPurchases(purchasesWithProducts);
      };
      loadPurchasesAndProducts();
    }
  }, [showViewPurchasePopup]);

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
  const handleBarcodeChange = async (e) => {
    const value = e.target.value.trim();
    setBarcode(value);
    setError("");

    if (!value) {
      setProductStatus("Please enter a barcode");
      return;
    }

    try {
      const productData = await getProductByBarcode(value);
      if (productData && productData.responseDto && productData.responseDto.length > 0) {
        const product = productData.responseDto[0];
        setProductStatus(`Product: ${product.name}`);
      } else {
        setProductStatus("No product found for this barcode");
      }
    } catch (err) {
      setProductStatus("Error fetching product");
      setError("Failed to fetch product details");
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
      setError(err.message || "Failed to save purchase");
    }
  };

  const handlePrintPurchase = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Simple PDF design
    doc.setFillColor(0, 0, 255); // Solid blue header
    doc.rect(10, 10, 190, 20, 'F'); // Header rectangle
    doc.setTextColor(255, 255, 255); // White text
    doc.setFontSize(20);
    doc.text("Purchase List", 20, 22);

    // Simple table in PDF using autoTable
    autoTable(doc, {
      startY: 30,
      head: [['Barcode', 'Product Name']],
      body: purchases.map(purchase => [purchase.barcode, purchase.productName || "Unknown Product"]),
      headStyles: { fillColor: [0, 0, 255], textColor: [255, 255, 255], fontSize: 12 },
      bodyStyles: { textColor: [0, 0, 0], fontSize: 10 },
      theme: 'plain', // Simple theme
      styles: { cellPadding: 5, font: 'helvetica', lineWidth: 0.1, lineColor: [0, 0, 0] },
      margin: { top: 30 },
    });

    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, doc.lastAutoTable.finalY + 10);
    doc.text("Thank you!", 180, doc.lastAutoTable.finalY + 10, { align: "right" });

    doc.save("purchase_list.pdf");
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
          <div className="purchase-popup simple-popup">
            <h2 className="purchase-popup-title">Add Purchase List</h2>
            <div className="purchase-popup-input-container">
              <input
                type="text"
                value={barcode}
                onChange={handleBarcodeChange}
                placeholder="Enter barcode number *"
                className="purchase-popup-input"
                required
                autoFocus
              />
              <p className="purchase-popup-status">
                {productStatus || "Enter a barcode to check product"}
              </p>
              {error && (
                <p className="purchase-popup-status" style={{ color: "red" }}>
                  {error}
                </p>
              )}
            </div>
            <div className="purchase-popup-actions">
              <button
                onClick={() => {
                  setShowAddPurchasePopup(false);
                  setBarcode("");
                  setProductStatus("");
                  setError("");
                }}
                className="purchase-popup-button cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPurchase}
                className="purchase-popup-button add"
                disabled={!barcode.trim()}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
      {showViewPurchasePopup && (
        <div className="purchase-popup-overlay">
          <div className="purchase-popup simple-popup">
            <h2 className="purchase-popup-title">View Purchase List</h2>
            {purchases.length > 0 ? (
              <table className="purchase-table simple-table">
                <thead>
                  <tr>
                    <th>Barcode</th>
                    <th>Product Name</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((purchase) => (
                    <tr key={purchase.barcode}>
                      <td style={{ color: "#000000" }}>{purchase.barcode}</td>
                      <td style={{ color: "#000000" }}>{purchase.productName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="purchase-popup-status">No purchases found</p>
            )}
            <div className="purchase-popup-actions">
              <button
                onClick={() => {
                  setShowViewPurchasePopup(false);
                  setPurchases([]);
                }}
                className="purchase-popup-button cancel"
              >
                Cancel
              </button>
              <button
                onClick={handlePrintPurchase}
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