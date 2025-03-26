import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import "../../../style/scss/components/Pos Components/Pos_CategoryGrid.scss";
import Pos_BarcodeCreation from "./Pos_BarcodeCreation";
import { savePurchase, fetchPurchases } from "../../Api/purchaseListApi";
import { getProductByBarcode } from "../../Api/productApi";
import { fetchTransactions } from "../../Api/TransactionApi";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { quickAccess, fetchCustomCategories } from "../../../core/json/Posdata";
import Barcode from "react-barcode";
import html2canvas from "html2canvas";

const PAGE_SIZE = 15;
const SALES_PAGE_SIZE = 10;

const Pos_CategoryGrid = ({ items = fetchCustomCategories, onCategorySelect }) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [showBarcodePopup, setShowBarcodePopup] = useState(false);
  const [showAddPurchasePopup, setShowAddPurchasePopup] = useState(false);
  const [showViewPurchasePopup, setShowViewPurchasePopup] = useState(false);
  const [showSalesListPopup, setShowSalesListPopup] = useState(false);
  const [categories, setCategories] = useState([]);
  const [barcode, setBarcode] = useState("");
  const [productStatus, setProductStatus] = useState("");
  const [error, setError] = useState("");
  const [purchases, setPurchases] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [expandedTransactionId, setExpandedTransactionId] = useState(null);
  const [salesPageIndex, setSalesPageIndex] = useState(0);
  const [currentTransactionId, setCurrentTransactionId] = useState("0000000000"); // State to hold the current transaction ID for barcode
  const barcodeRef = useRef(null);

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

  useEffect(() => {
    if (showSalesListPopup) {
      const loadTransactions = async () => {
        try {
          const data = await fetchTransactions();
          const last50Transactions = [...data].reverse().slice(0, 50);
          setTransactions(last50Transactions);
        } catch (error) {
          console.error("Error fetching transactions:", error);
          setTransactions([]);
        }
      };
      loadTransactions();
    }
  }, [showSalesListPopup]);

  const start = pageIndex * PAGE_SIZE;
  const end = start + PAGE_SIZE;

  let filteredCategories = items === fetchCustomCategories ? categories : items;
  if (filteredCategories instanceof Promise) {
    filteredCategories = categories;
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
        : item.name === "Sales List"
        ? { ...item, isSalesList: true }
        : item
    );
  }

  if (pageIndex > 0 && items === fetchCustomCategories) {
    paginatedItems = [
      { id: "prev", name: "Prev", icon: "⬅️", isPrev: true },
      ...paginatedItems.slice(1),
    ];
  }

  if (items === fetchCustomCategories && end < filteredCategories.length) {
    paginatedItems = [
      ...paginatedItems.slice(0, 14),
      { id: "more", name: "More", icon: "➡️", isMore: true },
    ];
  }

  const renderCategoryButton = (item) => {
    const handleClick = () => {
      if (item.isPrev) setPageIndex(pageIndex - 1);
      else if (item.isMore) setPageIndex(pageIndex + 1);
      else if (item.isLabelPrint) setShowBarcodePopup(true);
      else if (item.isAddPurchase) setShowAddPurchasePopup(true);
      else if (item.isViewPurchase) setShowViewPurchasePopup(true);
      else if (item.isSalesList) setShowSalesListPopup(true);
      else onCategorySelect(item);
    };

    const buttonClass = items === quickAccess ? "quick-access-btn" : "category-btn";

    return (
      <button key={item.id} className={`group ${buttonClass}`} onClick={handleClick}>
        <div className="text-2xl mb-1 transition-transform group-hover:scale-110">
          {item.icon}
        </div>
        <div className="font-medium text-sm truncate px-1">{item.name}</div>
      </button>
    );
  };

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

    doc.setFillColor(0, 0, 255);
    doc.rect(10, 10, 190, 20, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text("Purchase List", 20, 22);

    autoTable(doc, {
      startY: 30,
      head: [["Barcode", "Product Name"]],
      body: purchases.map((purchase) => [
        purchase.barcode,
        purchase.productName || "Unknown Product",
      ]),
      headStyles: { fillColor: [0, 0, 255], textColor: [255, 255, 255], fontSize: 12 },
      bodyStyles: { textColor: [0, 0, 0], fontSize: 10 },
      theme: "plain",
      styles: { cellPadding: 5, font: "helvetica", lineWidth: 0.1, lineColor: [0, 0, 0] },
      margin: { top: 30 },
    });

    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, doc.lastAutoTable.finalY + 10);
    doc.text("Thank you!", 180, doc.lastAutoTable.finalY + 10, { align: "right" });

    doc.save("purchase_list.pdf");
  };

  const toggleDropdown = (transactionId) => {
    setExpandedTransactionId(expandedTransactionId === transactionId ? null : transactionId);
  };

  const handlePrintBill = async (transaction) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Failed to open print window. Please allow popups for this site and try again.");
      return;
    }

    const formattedDate = transaction.dateTime
      ? new Date(transaction.dateTime).toLocaleString()
      : new Date().toLocaleString();

    const transactionId = transaction.id || 0;
    const formattedTransactionId = transactionId.toString().padStart(10, "0");

    const items = transaction.transactionDetailsList.map((detail) => ({
      qty: detail.quantity,
      name: detail.productDto?.name || "Unknown Item",
      price: detail.unitPrice,
      total: detail.quantity * detail.unitPrice,
    }));

    const totalAmount = transaction.totalAmount;
    const paymentMethods = transaction.transactionPaymentMethod.map((method) => ({
      type: method.paymentMethodDto?.type || "Unknown",
      amount: method.amount,
    }));

    const totalPaid = paymentMethods.reduce((sum, method) => sum + method.amount, 0);
    const balance = totalPaid - totalAmount;

    // Update the current transaction ID for the barcode
    setCurrentTransactionId(formattedTransactionId);

    // Wait for the DOM to update with the new barcode value
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Generate barcode image
    let barcodeDataUrl = "";
    try {
      if (barcodeRef.current) {
        const canvas = await html2canvas(barcodeRef.current, { scale: 2 });
        barcodeDataUrl = canvas.toDataURL("image/png");
      }
    } catch (error) {
      console.error("Failed to generate barcode image:", error);
      barcodeDataUrl = "";
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt</title>
          <style>
            @media print {
              @page {
                size: 72mm auto;
                margin: 0;
              }
              body {
                margin: 0 auto;
                padding: 0 5px;
                font-family: 'Courier New', Courier, monospace;
                width: 72mm;
                min-height: 100%;
                box-sizing: border-box;
                font-weight: normal;
                color: #000;
              }
              header, footer, nav, .print-header, .print-footer {
                display: none !important;
              }
              html, body {
                width: 72mm;
                height: auto;
                margin: 0 auto;
                overflow: hidden;
              }
            }
            body {
              font-family: 'Courier New', Courier, monospace;
              width: 72mm;
              margin: 0 auto;
              padding: 0 5px;
              font-size: 12px;
              line-height: 1.2;
              box-sizing: border-box;
              text-align: center;
            }
            .receipt-header {
              text-align: center;
              margin-bottom: 5px;
            }
            .receipt-header h2 {
              margin: 0;
              font-size: 14px;
              font-weight: bold;
            }
            .receipt-details {
              margin-bottom: 5px;
              text-align: left;
            }
            .receipt-details p {
              margin: 2px 0;
            }
            .receipt-items {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 5px;
              margin-left: auto;
              margin-right: auto;
            }
            .receipt-items th, .receipt-items td {
              padding: 2px 0;
              text-align: left;
              font-size: 12px;
            }
            .receipt-items th {
              border-bottom: 1px dashed #000;
            }
            .receipt-items .total-column {
              text-align: right;
            }
            .receipt-footer {
              text-align: center;
              margin-top: 5px;
            }
            .receipt-footer p {
              margin: 2px 0;
            }
            .divider {
              border-top: 1px dashed #000;
              margin: 5px 0;
            }
            .barcode-container {
              text-align: center;
              margin: 5px 0;
            }
            .barcode-container img {
              width: 100%;
              height: 30px;
            }
          </style>
        </head>
        <body>
          <div class="receipt-header">
            <h2>${transaction.shopDetailsDto?.name || "Unknown Shop"}</h2>
            <p>${transaction.branchDto?.branchName || "Unknown Branch"}</p>
            <p>Branch Code: ${transaction.branchDto?.branchCode || "N/A"}</p>
          </div>
          <div class="receipt-details">
            <p>Date: ${formattedDate}</p>
            <p>Cashier: ${transaction.userDto?.firstName || "Unknown"} ${transaction.userDto?.lastName || ""}</p>
            <p>Customer: ${transaction.customerDto?.name || "Local Customer"}</p>
            <p>Transaction ID: ${formattedTransactionId}</p>
          </div>
          <div class="divider"></div>
          <table class="receipt-items">
            <thead>
              <tr>
                <th>Qty</th>
                <th>Item</th>
                <th>Price</th>
                <th class="total-column">Total</th>
              </tr>
            </thead>
            <tbody>
              ${items
                .map(
                  (item) => `
                    <tr>
                      <td>${item.qty}</td>
                      <td>${item.name}</td>
                      <td>${item.price.toFixed(2)}</td>
                      <td class="total-column">${item.total.toFixed(2)}</td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
          <div class="divider"></div>
          <div class="receipt-details">
            <p>Total: ${totalAmount.toFixed(2)}</p>
            ${paymentMethods
              .map(
                (method) => `
                  <p>${method.type}: ${method.amount.toFixed(2)}</p>
                `
              )
              .join("")}
            <p>Balance: ${balance.toFixed(2)}</p>
          </div>
          <div class="divider"></div>
          <div class="barcode-container">
            ${barcodeDataUrl ? `<img src="${barcodeDataUrl}" alt="Barcode" />` : "<p>Barcode failed to render</p>"}
          </div>
          <div class="divider"></div>
          <div class="receipt-footer">
            <p>Thank You for Shopping with Us!</p>
            <p>Powered by Delta POS</p>
            <p>(deltapos.codearson@gmail.com)</p>
            <p>(0094762963979)</p>
            <p>================================================</p>
          </div>
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 500);
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
  };

  const salesStart = salesPageIndex * SALES_PAGE_SIZE;
  const salesEnd = salesStart + SALES_PAGE_SIZE;
  const paginatedTransactions = transactions.slice(salesStart, salesEnd);
  const totalSalesPages = Math.ceil(transactions.length / SALES_PAGE_SIZE);

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
      {showSalesListPopup && (
        <div className="sales-popup-overlay">
          <div className="sales-popup">
            <h2 className="sales-popup-title">Sales List</h2>
            {transactions.length > 0 ? (
              <>
                <div className="sales-table-container">
                  <table className="sales-table">
                    <thead>
                      <tr>
                        <th>Transaction ID</th>
                        <th>Branch Name</th>
                        <th>Shop Name</th>
                        <th>User Name</th>
                        <th>Customer Name</th>
                        <th>Total Amount</th>
                        <th>Date Time</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedTransactions.map((transaction, index) => (
                        <React.Fragment key={transaction.id}>
                          <tr className={index % 2 === 0 ? "even-row" : "odd-row"}>
                            <td>{String(transaction.id).padStart(10, "0")}</td>
                            <td>{transaction.branchDto?.branchName || "N/A"}</td>
                            <td>{transaction.shopDetailsDto?.name || "N/A"}</td>
                            <td>{transaction.userDto?.firstName || "N/A"}</td>
                            <td>{transaction.customerDto?.name || "N/A"}</td>
                            <td>{`LKR ${parseFloat(transaction.totalAmount || 0).toFixed(2)}`}</td>
                            <td>
                              {transaction.dateTime
                                ? new Date(transaction.dateTime).toLocaleString()
                                : "N/A"}
                            </td>
                            <td>
                              <div className="action-buttons">
                                <button
                                  onClick={() => handlePrintBill(transaction)}
                                  className="action-btn print-btn"
                                  title="Print Receipt"
                                >
                                  <svg
                                    className="action-icon"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    viewBox="0 0 16 16"
                                  >
                                    <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
                                    <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z"/>
                                  </svg>
                                </button>
                                <button
                                  onClick={() => toggleDropdown(transaction.id)}
                                  className="action-btn view-btn"
                                  title="View Details"
                                >
                                  <svg
                                    className="action-icon"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    viewBox="0 0 16 16"
                                  >
                                    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                                    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                          {expandedTransactionId === transaction.id && (
                            <tr>
                              <td colSpan="8">
                                <div className="dropdown-details">
                                  <div className="details-section">
                                    <h6>Transaction Items</h6>
                                    <table className="details-table items-table">
                                      <thead>
                                        <tr>
                                          <th>Product Name</th>
                                          <th>Barcode</th>
                                          <th>Unit Price</th>
                                          <th>Quantity</th>
                                          <th>Discount</th>
                                          <th>Total</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {transaction.transactionDetailsList &&
                                        transaction.transactionDetailsList.length > 0 ? (
                                          transaction.transactionDetailsList.map((item, index) => (
                                            <tr key={index}>
                                              <td>{item.productDto?.name || "N/A"}</td>
                                              <td>{item.productDto?.barcode || "N/A"}</td>
                                              <td>{`LKR ${parseFloat(item.unitPrice || 0).toFixed(2)}`}</td>
                                              <td>{item.quantity || 0}</td>
                                              <td>{`LKR ${parseFloat(item.discount || 0).toFixed(2)}`}</td>
                                              <td>{`LKR ${parseFloat(
                                                (item.unitPrice * item.quantity) - (item.discount || 0)
                                              ).toFixed(2)}`}</td>
                                            </tr>
                                          ))
                                        ) : (
                                          <tr>
                                            <td colSpan="6" className="no-data">
                                              No items found
                                            </td>
                                          </tr>
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                  <div className="details-section">
                                    <h6>Payment Methods</h6>
                                    <table className="details-table payment-table">
                                      <thead>
                                        <tr>
                                          <th>Payment Type</th>
                                          <th>Amount</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {transaction.transactionPaymentMethod &&
                                        transaction.transactionPaymentMethod.length > 0 ? (
                                          transaction.transactionPaymentMethod.map((payment, index) => (
                                            <tr key={index}>
                                              <td>{payment.paymentMethodDto?.type || "N/A"}</td>
                                              <td>{`LKR ${parseFloat(payment.amount || 0).toFixed(2)}`}</td>
                                            </tr>
                                          ))
                                        ) : (
                                          <tr>
                                            <td colSpan="2" className="no-data">
                                              No payment methods found
                                            </td>
                                          </tr>
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="sales-footer">
                  <div className="sales-pagination">
                    <div className="pagination-center">
                      <button
                        onClick={() => setSalesPageIndex(salesPageIndex - 1)}
                        disabled={salesPageIndex === 0}
                        className="pagination-btn"
                      >
                        Previous
                      </button>
                      <span>
                        Page {salesPageIndex + 1} of {totalSalesPages}
                      </span>
                      <button
                        onClick={() => setSalesPageIndex(salesPageIndex + 1)}
                        disabled={salesPageIndex === totalSalesPages - 1}
                        className="pagination-btn"
                      >
                        Next
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        setShowSalesListPopup(false);
                        setTransactions([]);
                        setExpandedTransactionId(null);
                        setSalesPageIndex(0);
                      }}
                      className="pagination-btn close-btn"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <p className="sales-popup-message">No transactions found</p>
            )}
          </div>
        </div>
      )}
      {/* Hidden div to render the barcode */}
      <div style={{ position: "absolute", left: "-9999px" }}>
        <div ref={barcodeRef}>
          <Barcode
            value={currentTransactionId}
            format="CODE128"
            width={1}
            height={30}
            displayValue={false}
          />
        </div>
      </div>
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