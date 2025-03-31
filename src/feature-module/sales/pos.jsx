import React, { useEffect, useState, useRef } from "react";
import { fetchCustomCategories, quickAccess } from "../../core/json/Posdata";
import Header from "../components/Pos Components/Pos_Header";
import Sidebar from "../components/Pos Components/Pos_Sidebar";
import Pos_Calculator from "../components/Pos Components/Pos_Calculator";
import CategoryTabs from "../components/Pos Components/Pos_CategoryTabs";
import CategoryGrid from "../components/Pos Components/Pos_CategoryGrid";
import Numpad from "../components/Pos Components/Pos_Numpad";
import PaymentButtons from "../components/Pos Components/Pos_Payment";
import FunctionButtons from "../components/Pos Components/Pos_Function";
import PriceCheckPopup from "../components/Pos Components/PriceCheckPopup";
import NotificationPopup from "../components/Pos Components/NotificationPopup";
import { getProductByBarcode } from "../Api/productApi";
import { saveTransaction } from "../Api/TransactionApi";
import { fetchCustomers } from "../Api/customerApi";
import { fetchBranches } from "../Api/StockApi";
import { fetchUsers } from "../Api/UserApi";
import Barcode from "react-barcode";
import html2canvas from "html2canvas";

const Pos = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("category");
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [inputValue, setInputValue] = useState("0");
  const [inputStage, setInputStage] = useState("qty");
  const [totalValue, setTotalValue] = useState(0);
  const [inputScreenText, setInputScreenText] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [pendingQty, setPendingQty] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [balance, setBalance] = useState(0);
  const [isPaymentStarted, setIsPaymentStarted] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [showBillPopup, setShowBillPopup] = useState(false);
  const [transactionDate, setTransactionDate] = useState(null);
  const [userDetails, setUserDetails] = useState({ firstName: "", lastName: "" });
  const [branchDetails, setBranchDetails] = useState({
    branchName: "",
    branchCode: "",
    address: "",
    shopName: "",
    contactNumber: "",
  });
  const [showPriceCheckPopup, setShowPriceCheckPopup] = useState(false);
  const [notification, setNotification] = useState(null);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [showSuspendedTransactions, setShowSuspendedTransactions] = useState(false);
  const [suspendedTransactions, setSuspendedTransactions] = useState(() => {
    const saved = localStorage.getItem("suspendedTransactions");
    return saved ? JSON.parse(saved) : [];
  });
  const [expandedTransactionId, setExpandedTransactionId] = useState(null); // New state for expanded transaction
  const barcodeInputRef = useRef(null);
  const barcodeRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (isPaymentStarted) {
      const totalPaid = paymentMethods.reduce((sum, method) => sum + method.amount, 0);
      const currentTotal = selectedItems.reduce((sum, item) => sum + item.total, 0);
      const newBalance = totalPaid - currentTotal;
      setBalance(newBalance);
    } else {
      setBalance(0);
    }
  }, [selectedItems, paymentMethods, isPaymentStarted]);

  useEffect(() => {
    let timer;
    if (showBillPopup) {
      timer = setTimeout(() => {
        handleClosePopup();
      }, 10000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showBillPopup]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  const handleTabChange = (newTab) => setActiveTab(newTab);

  const showNotification = (message) => {
    setNotification(message);
  };

  const closeNotification = () => {
    setNotification(null);
  };

  const handleCategorySelect = (category) => {
    if (isPaymentStarted) {
      showNotification("Cannot add items after payment has started. Please complete or reset the transaction.");
      return;
    }
    if (activeTab === "category" && category?.name) {
      const qty = pendingQty || 1;
      const price = inputStage === "price" && inputValue !== "0" ? parseFloat(inputValue) : null;
      if (price) {
        const total = qty * price;
        const newItem = { id: category.id, name: category.name, qty, price, total };

        const existingItemIndex = selectedItems.findIndex(
          (item) => item.name === newItem.name && item.price === newItem.price
        );

        let newItems;
        if (existingItemIndex !== -1) {
          newItems = [...selectedItems];
          newItems[existingItemIndex].qty += qty;
          newItems[existingItemIndex].total = newItems[existingItemIndex].qty * newItems[existingItemIndex].price;
        } else {
          newItems = [...selectedItems, newItem];
        }

        setSelectedItems(newItems);
        setTotalValue(newItems.reduce((sum, item) => sum + item.total, 0));
        resetInput();
      } else {
        setCurrentItem({ id: category.id, name: category.name, qty, price: null, total: null });
        setInputStage("price");
        setInputValue("0");
        setInputScreenText(`${qty} ×`);
      }
    }
  };

  const handleNumpadClick = (action) => {
    const { type, value } = action;
    if (type === "clear") {
      setInputScreenText("");
      setInputValue("0");
      setInputStage("qty");
      setCurrentItem(null);
      setPendingQty(null);
      setBarcodeInput("");
      setSelectedRowIndex(null);
      barcodeInputRef.current?.focus();
    } else if (type === "number") {
      let newInput = inputValue === "0" && value !== "." ? value.toString() : inputValue + value.toString();
      const parts = newInput.split(".");
      const decPart = parts[1] || "";
      if (decPart.length <= 2 || !decPart) {
        if (value === "." && inputValue.includes(".")) return;
        if (inputStage === "qty") {
          setInputScreenText(newInput);
          setInputValue(newInput);
        } else if (inputStage === "price") {
          setInputScreenText(`${pendingQty || 1} × ${newInput}`);
          setInputValue(newInput);
        }
      }
    } else if (type === "multiply") {
      if (inputValue !== "0" && inputStage === "qty") {
        const qty = parseFloat(inputValue) || 1;
        setPendingQty(qty);
        setInputStage("price");
        setInputValue("0");
        setInputScreenText(`${qty} × `);
      }
    } else if (type === "enter") {
      if (currentItem && currentItem.name && currentItem.price !== null) {
        const total = currentItem.qty * currentItem.price;
        const newItem = { ...currentItem, total };

        const existingItemIndex = selectedItems.findIndex(
          (item) => item.name === newItem.name && item.price === newItem.price
        );

        let newItems;
        if (existingItemIndex !== -1) {
          newItems = [...selectedItems];
          newItems[existingItemIndex].qty += newItem.qty;
          newItems[existingItemIndex].total = newItems[existingItemIndex].qty * newItems[existingItemIndex].price;
        } else {
          newItems = [...selectedItems, newItem];
        }

        setSelectedItems(newItems);
        setTotalValue(newItems.reduce((sum, item) => sum + item.total, 0));
        resetInput();
      }
      if (isPaymentStarted && selectedItems.length > 0) {
        if (balance < 0) {
          showNotification("Balance is less than 0. Please add sufficient payment.");
          return;
        }
        handleSaveTransaction();
      }
    }
  };

  const handleBarcodeSearch = async (barcode) => {
    if (isPaymentStarted) {
      showNotification("Cannot add items after payment has started. Please complete or reset the transaction.");
      return;
    }
    if (barcode.length < 3) return;

    try {
      const product = await getProductByBarcode(barcode);
      if (!product || !product.responseDto || product.responseDto.length === 0) {
        resetInput();
        return;
      }

      const productData = product.responseDto[0];
      const { id, name, pricePerUnit, quantity } = productData;
      if (!name || pricePerUnit === undefined || quantity === undefined) {
        resetInput();
        return;
      }

      const qty = inputStage === "price" && pendingQty ? pendingQty : 1;
      if (inputStage === "price" && inputValue !== "0") {
        showNotification("Invalid Qty: Cannot set custom price for barcoded items");
        resetInput();
        return;
      }

      const total = qty * pricePerUnit;
      const newItem = { id, name, qty, price: pricePerUnit, total };

      const existingItemIndex = selectedItems.findIndex(
        (item) => item.name === newItem.name && item.price === newItem.price
      );

      let newItems;
      if (existingItemIndex !== -1) {
        newItems = [...selectedItems];
        newItems[existingItemIndex].qty += qty;
        newItems[existingItemIndex].total = newItems[existingItemIndex].qty * newItems[existingItemIndex].price;
      } else {
        newItems = [...selectedItems, newItem];
      }

      setSelectedItems(newItems);
      setTotalValue(newItems.reduce((sum, item) => sum + item.total, 0));
      resetInput();
    } catch (error) {
      resetInput();
    }
  };

  const resetInput = () => {
    setCurrentItem(null);
    setInputStage("qty");
    setInputValue("0");
    setInputScreenText("");
    setBarcodeInput("");
    setPendingQty(null);
    barcodeInputRef.current?.focus();
  };

  const handleRowSelect = (index) => {
    if (selectedRowIndex === index) {
      setSelectedRowIndex(null);
    } else {
      setSelectedRowIndex(index);
    }
  };

  const handleVoidLine = () => {
    if (selectedRowIndex === null) {
      showNotification("Please select a row to void.");
      return;
    }
    if (isPaymentStarted) {
      const selectedItem = selectedItems.concat(paymentMethods)[selectedRowIndex];
      if (selectedItem.amount) {
        if (selectedItem.type === "Card") {
          showNotification("Card payments cannot be voided.");
          return;
        }
        const paymentIndex = selectedRowIndex - selectedItems.length;
        const newPaymentMethods = paymentMethods.filter((_, index) => index !== paymentIndex);
        setPaymentMethods(newPaymentMethods);
        setSelectedRowIndex(null);
        if (newPaymentMethods.length === 0) {
          setIsPaymentStarted(false);
        }
      } else {
        showNotification("Cannot void items after payment has started.");
      }
    } else {
      const newItems = selectedItems.filter((_, index) => index !== selectedRowIndex);
      setSelectedItems(newItems);
      setTotalValue(newItems.reduce((sum, item) => sum + item.total, 0));
      setSelectedRowIndex(null);
    }
  };

  const handleVoidAll = () => {
    if (isPaymentStarted) {
      showNotification("Cannot void all items after payment has started.");
      return;
    }
    setSelectedItems([]);
    setTotalValue(0);
    setSelectedRowIndex(null);
  };

  const handleCustomerAdded = (name) => setCustomerName(name);

  const handleSaveTransaction = async () => {
    const userIdRaw = localStorage.getItem("userId");
    const branchIdRaw = localStorage.getItem("branchId");
  
    const userId = !isNaN(parseInt(userIdRaw)) ? parseInt(userIdRaw) : 1;
    const branchId = !isNaN(parseInt(branchIdRaw)) ? parseInt(branchIdRaw) : 3;
  
    let shopDetailsId = 1;
  
    try {
      const branches = await fetchBranches();
      const branch = branches.find((b) => b.id === branchId);
      if (branch) {
        setBranchDetails({
          branchName: branch.branchName || "Unknown Branch",
          branchCode: branch.branchCode || "N/A",
          address: branch.address || "N/A",
          shopName: branch.shopDetailsDto?.name || "Unknown Shop",
          contactNumber: branch.contactNumber || "N/A"  // Add this line
        });
        shopDetailsId = branch.shopDetailsId || 1;
      } else {
        setBranchDetails({
          branchName: "Unknown Branch",
          branchCode: "N/A",
          address: "N/A",
          shopName: "Unknown Shop",
          contactNumber: "N/A"  // Add this line
        });
      }
  
      const usersResponse = await fetchUsers();
      const user = usersResponse.payload.find((u) => u.id === userId);
      if (user) {
        setUserDetails({
          firstName: user.firstName || "Unknown",
          lastName: user.lastName || "",
        });
      } else {
        setUserDetails({
          firstName: "Unknown",
          lastName: "",
        });
      }
    } catch (error) {
      setBranchDetails({
        branchName: "Unknown Branch",
        branchCode: "N/A",
        address: "N/A",
        shopName: "Unknown Shop",
        contactNumber: "N/A"  // Add this line
      });
      setUserDetails({
        firstName: "Unknown",
        lastName: "",
      });
    }
  
    // Rest of the function remains unchanged...
    setTransactionDate(new Date());
  
    let customerId = 1;
    if (customerName) {
      const customers = await fetchCustomers();
      const customer = customers.find((c) => c.name === customerName && c.isActive === true);
      if (customer) {
        customerId = customer.id;
      }
    }
  
    const combinedPaymentMethods = [];
    const cashPayments = paymentMethods.filter((m) => m.type === "Cash").reduce((sum, m) => sum + m.amount, 0);
    const cardPayments = paymentMethods.filter((m) => m.type === "Card").reduce((sum, m) => sum + m.amount, 0);
  
    if (cashPayments > 0) {
      combinedPaymentMethods.push({ type: "Cash", amount: cashPayments });
    }
    if (cardPayments > 0) {
      combinedPaymentMethods.push({ type: "Card", amount: cardPayments });
    }
  
    const transactionData = {
      status: "Completed",
      isActive: 1,
      totalAmount: totalValue,
      branchDto: { id: branchId },
      shopDetailsDto: { id: shopDetailsId },
      customerDto: { id: customerId },
      userDto: { id: userId },
      transactionDetailsList: selectedItems.map((item) => ({
        productDto: { id: item.id },
        quantity: item.qty,
        unitPrice: item.price,
        discount: 0.0,
      })),
      transactionPaymentMethod: combinedPaymentMethods.map((method) => ({
        paymentMethodDto: { id: method.type === "Cash" ? 1 : 2 },
        amount: method.amount,
        isActive: 1,
      })),
    };
  
    const result = await saveTransaction(transactionData);
    if (result.success) {
      let transactionId;
      if (result.data?.id) {
        transactionId = result.data.id;
      } else if (result.data?.responseDto?.id) {
        transactionId = result.data.responseDto.id;
      } else if (result.payload?.id) {
        transactionId = result.payload.id;
      } else {
        transactionId = 0;
        showNotification("Warning: Transaction ID not found in API response. Please check the backend response.");
      }
  
      setLastTransaction({
        id: transactionId,
        transactionDetailsList: selectedItems.map((item) => ({
          productDto: { id: item.id, name: item.name },
          quantity: item.qty,
          unitPrice: item.price,
          discount: 0.0,
        })),
        totalAmount: totalValue,
        transactionPaymentMethod: combinedPaymentMethods.map((method) => ({
          paymentMethodDto: { id: method.type === "Cash" ? 1 : 2 },
          amount: method.amount,
        })),
        branchDto: { id: branchId },
        userDto: { id: userId },
        customerDto: { name: customerName || "Local Customer" },
        transactionDate: new Date(),
      });
      setShowBillPopup(true);
    } else {
      showNotification("Failed to save transaction: " + result.error);
    }
  };

  const handlePrintBill = async () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      showNotification("Failed to open print window. Please allow popups for this site and try again.");
      return;
    }
  
    const formattedDate = transactionDate && !isNaN(new Date(transactionDate).getTime())
      ? new Date(transactionDate).toLocaleString()
      : currentTime.toLocaleString();
  
    const transactionId = lastTransaction?.id || 0;
    const formattedTransactionId = transactionId.toString().padStart(10, "0");
  
    let barcodeDataUrl = "";
    try {
      if (barcodeRef.current) {
        const canvas = await html2canvas(barcodeRef.current, { scale: 2 });
        barcodeDataUrl = canvas.toDataURL("image/png");
      }
    } catch (error) {
      console.error("Failed to generate barcode image:", error);
      showNotification("Failed to generate barcode image.");
    }
  
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt</title>
          <style>
            @media print {
              @page { size: 72mm auto; margin: 0; }
              body { margin: 0 auto; padding: 0 5px; font-family: 'Courier New', Courier, monospace; width: 72mm; min-height: 100%; box-sizing: border-box; font-weight: bold; color: #000; }
              header, footer, nav, .print-header, .print-footer { display: none !important; }
              html, body { width: 72mm; height: auto; margin: 0 auto; overflow: hidden; }
            }
            body { font-family: 'Courier New', Courier, monospace; width: 72mm; margin: 0 auto; padding: 0 5px; font-size: 12px; line-height: 1.2; box-sizing: border-box; text-align: center; }
            .receipt-header { text-align: center; margin-bottom: 5px; }
            .receipt-header h2 { margin: 0; font-size: 14px; font-weight: bold; }
            .receipt-details { margin-bottom: 5px; text-align: left; }
            .receipt-details p { margin: 2px 0; }
            .receipt-items { width: 100%; border-collapse: collapse; margin-bottom: 5px; margin-left: auto; margin-right: auto; }
            .receipt-items th, .receipt-items td { padding: 2px 0; font-weight: bold; text-align: left; font-size: 12px; }
            .receipt-items th { border-bottom: 1px dashed #000; }
            .receipt-items .total-column { text-align: right; }
            .receipt-footer { text-align: center; margin-top: 5px; }
            .receipt-footer p { margin: 2px 0; }
            .divider { border-top: 1px dashed #000; margin: 5px 0; }
            .barcode-container { text-align: center; margin: 5px 0; }
            .barcode-container img { width: 100%; height: 30px; }
            .spacing { height: 10px; }
          </style>
        </head>
        <body>
          <div class="receipt-header">
            <h2>${branchDetails.shopName}</h2>
            <p>${branchDetails.branchName}</p>
            <p>Branch Code: ${branchDetails.branchCode}</p>
            <p>Address: ${branchDetails.address}</p>
            <p>Contact: ${branchDetails.contactNumber || 'N/A'}</p>
          </div>
          <div class="receipt-details">
            <p>Date: ${formattedDate}</p>
            <p>Cashier: ${userDetails.firstName} ${userDetails.lastName || ""}</p>
            ${customerName ? `<p>Customer: ${customerName}</p>` : "<p>Customer: Local Customer</p>"}
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
              ${selectedItems.length > 0
        ? selectedItems
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
          .join("")
        : "<tr><td colspan='4'>No items</td></tr>"}
            </tbody>
          </table>
          <div class="divider"></div>
          <div class="receipt-details">
            <p>Total: ${totalValue.toFixed(2)}</p>
            ${paymentMethods.length > 0
        ? paymentMethods
          .map(
            (method) => `
                  <p>${method.type}: ${method.amount.toFixed(2)}</p>
                `
          )
          .join("")
        : "<p>No payments recorded</p>"}
            <p>Balance: ${balance.toFixed(2)}</p>
          </div>
          <div class="divider"></div>
          <div class="barcode-container">
            ${barcodeDataUrl ? `<img src="${barcodeDataUrl}" alt="Barcode" />` : "<p>Barcode failed to render</p>"}
          </div>
          <div class="divider"></div>
          <div class="receipt-footer">
            <p>Thank You for Shopping with Us!</p>
            <div class="spacing"></div>
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

  const handlePrintLastBill = async () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      showNotification("Failed to open print window. Please allow popups for this site and try again.");
      return;
    }
  
    if (!lastTransaction) {
      printWindow.document.write("<p>No previous transaction found.</p>");
      showNotification("No previous transaction found.");
      printWindow.document.close();
      printWindow.close();
      return;
    }
  
    try {
      const items = lastTransaction.transactionDetailsList.map((detail) => ({
        qty: detail.quantity,
        name: detail.productDto.name || "Unknown Item",
        price: detail.unitPrice,
        total: detail.quantity * detail.unitPrice,
      }));
  
      const totalAmount = lastTransaction.totalAmount;
      const paymentMethods = lastTransaction.transactionPaymentMethod.map((method) => ({
        type: method.paymentMethodDto.id === 1 ? "Cash" : "Card",
        amount: method.amount,
      }));
  
      const totalPaid = paymentMethods.reduce((sum, method) => sum + method.amount, 0);
      const calculatedBalance = totalPaid - totalAmount;
  
      const branchId = lastTransaction.branchDto.id;
      const userId = lastTransaction.userDto.id;
      let branchName = branchDetails.branchName;
      let branchCode = branchDetails.branchCode;
      let shopName = branchDetails.shopName;
      let address = branchDetails.address;
      let contactNumber = branchDetails.contactNumber;
      let firstName = userDetails.firstName;
      let lastName = userDetails.lastName;
  
      if (!branchName || !branchCode || !shopName || !address || !contactNumber) {
        const branches = await fetchBranches(); // Added await
        const branch = branches.find((b) => b.id === branchId);
        if (branch) {
          branchName = branch.branchName || "Unknown Branch";
          branchCode = branch.branchCode || "N/A";
          shopName = branch.shopDetailsDto?.name || "Unknown Shop";
          address = branch.address || "N/A";
          contactNumber = branch.contactNumber || "N/A";
        } else {
          branchName = "Unknown Branch";
          branchCode = "N/A";
          shopName = "Unknown Shop";
          address = "N/A";
          contactNumber = "N/A";
        }
      }
  
      if (!firstName || !lastName) {
        const usersResponse = await fetchUsers();
        const user = usersResponse.payload.find((u) => u.id === userId);
        if (user) {
          firstName = user.firstName || "Unknown";
          lastName = user.lastName || "";
        } else {
          firstName = "Unknown";
          lastName = "";
        }
      }
  
      const customer = lastTransaction.customerDto.name || "";
      const transactionDate = lastTransaction.transactionDate
        ? new Date(lastTransaction.transactionDate)
        : new Date();
      const formattedDate = isNaN(transactionDate.getTime())
        ? currentTime.toLocaleString()
        : transactionDate.toLocaleString();
  
      const transactionId = lastTransaction.id || 0;
      const formattedTransactionId = transactionId.toString().padStart(10, "0");
  
      let barcodeDataUrl = "";
      try {
        if (barcodeRef.current) {
          const canvas = await html2canvas(barcodeRef.current, { scale: 2 });
          barcodeDataUrl = canvas.toDataURL("image/png");
        }
      } catch (error) {
        console.error("Failed to generate barcode image:", error);
        showNotification("Failed to generate barcode image.");
      }
  
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt</title>
            <style>
              @media print {
                @page { size: 72mm auto; margin: 0; }
                body { margin: 0 auto; padding: 0 5px; font-family: 'Courier New', Courier, monospace; width: 72mm; min-height: 100%; box-sizing: border-box; font-weight: bold; color: #000; }
                header, footer, nav, .print-header, .print-footer { display: none !important; }
                html, body { width: 72mm; height: auto; margin: 0 auto; overflow: hidden; }
              }
              body { font-family: 'Courier New', Courier, monospace; width: 72mm; margin: 0 auto; padding: 0 5px; font-size: 12px; line-height: 1.2; box-sizing: border-box; text-align: center; }
              .receipt-header { text-align: center; margin-bottom: 5px; }
              .receipt-header h2 { margin: 0; font-size: 14px; font-weight: bold; }
              .receipt-details { margin-bottom: 5px; text-align: left; }
              .receipt-details p { margin: 2px 0; }
              .receipt-items { width: 100%; border-collapse: collapse; margin-bottom: 5px; margin-left: auto; margin-right: auto; }
              .receipt-items th, .receipt-items td { padding: 2px 0; font-weight: bold; text-align: left; font-size: 12px; }
              .receipt-items th { border-bottom: 1px dashed #000; }
              .receipt-items .total-column { text-align: right; }
              .receipt-footer { text-align: center; margin-top: 5px; }
              .receipt-footer p { margin: 2px 0; }
              .divider { border-top: 1px dashed #000; margin: 5px 0; }
              .barcode-container { text-align: center; margin: 5px 0; }
              .barcode-container img { width: 100%; height: 30px; }
              .spacing { height: 10px; }
            </style>
          </head>
          <body>
            <div class="receipt-header">
              <h2>${shopName}</h2>
              <p>${branchName}</p>
              <p>Branch Code: ${branchCode}</p>
              <p>Address: ${address}</p>
              <p>Contact: ${contactNumber}</p>
            </div>
            <div class="receipt-details">
              <p>Date: ${formattedDate}</p>
              <p>Cashier: ${firstName} ${lastName}</p>
              ${customer ? `<p>Customer: ${customer}</p>` : ""}
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
              <p>Balance: ${calculatedBalance.toFixed(2)}</p>
            </div>
            <div class="divider"></div>
            <div class="barcode-container">
              ${barcodeDataUrl ? `<img src="${barcodeDataUrl}" alt="Barcode" />` : "<p>Barcode failed to render</p>"}
            </div>
            <div class="divider"></div>
            <div class="receipt-footer">
              <p>Thank You for Shopping with Us!</p>
              <div class="spacing"></div>
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
    } catch (error) {
      printWindow.document.write(`<p>Failed to load receipt: ${error.message}</p>`);
      printWindow.document.close();
      showNotification("Failed to print the last transaction: " + error.message);
    }
  };

  const handleClosePopup = () => {
    setShowBillPopup(false);
    setSelectedItems([]);
    setTotalValue(0);
    setPaymentMethods([]);
    setBalance(0);
    setIsPaymentStarted(false);
    setSelectedRowIndex(null);
    setCustomerName("");
    resetInput();
  };

  const handlePriceCheck = () => {
    setShowPriceCheckPopup(true);
  };

  const handleClosePriceCheckPopup = () => {
    setShowPriceCheckPopup(false);
    resetInput();
  };

  const handleSuspendTransaction = () => {
    if (selectedItems.length === 0 && paymentMethods.length === 0) {
      showNotification("No transaction to suspend.");
      return;
    }

    const suspendedTransaction = {
      id: Date.now(), // Unique ID based on timestamp
      items: selectedItems,
      totalValue,
      paymentMethods,
      balance,
      isPaymentStarted,
      customerName,
      timestamp: new Date().toLocaleString(),
    };

    const updatedSuspendedTransactions = [...suspendedTransactions, suspendedTransaction];
    setSuspendedTransactions(updatedSuspendedTransactions);
    localStorage.setItem("suspendedTransactions", JSON.stringify(updatedSuspendedTransactions));
    showNotification("Transaction suspended successfully.");

    // Reset current transaction
    setSelectedItems([]);
    setTotalValue(0);
    setPaymentMethods([]);
    setBalance(0);
    setIsPaymentStarted(false);
    setCustomerName("");
    resetInput();
  };

  const handleRecallTransaction = () => {
    if (suspendedTransactions.length === 0) {
      showNotification("No suspended transactions available.");
      return;
    }
    setShowSuspendedTransactions(true);
  };

  const handleCloseSuspendedPopup = () => {
    setShowSuspendedTransactions(false);
    setExpandedTransactionId(null); // Reset expanded state when closing
  };

  const handleRecallSelectedTransaction = (transaction) => {
    setSelectedItems(transaction.items);
    setTotalValue(transaction.totalValue);
    setPaymentMethods(transaction.paymentMethods);
    setBalance(transaction.balance);
    setIsPaymentStarted(transaction.isPaymentStarted);
    setCustomerName(transaction.customerName);
    resetInput();

    const updatedSuspendedTransactions = suspendedTransactions.filter((t) => t.id !== transaction.id);
    setSuspendedTransactions(updatedSuspendedTransactions);
    localStorage.setItem("suspendedTransactions", JSON.stringify(updatedSuspendedTransactions));
    setShowSuspendedTransactions(false);
    setExpandedTransactionId(null); // Reset expanded state
    showNotification("Transaction recalled successfully.");
  };

  const toggleTransactionDetails = (id) => {
    setExpandedTransactionId(expandedTransactionId === id ? null : id);
  };

  return (
    <div className={`pos-container ${darkMode ? "dark-mode" : "light-mode"}`}>
      <Sidebar darkMode={darkMode} />
      <div className="main-content">
        <Header
          currentTime={currentTime}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          onCustomerAdded={handleCustomerAdded}
        />
        <div className="content">
          <div className="grid-container">
            <Pos_Calculator
              darkMode={darkMode}
              selectedItems={selectedItems}
              totalValue={totalValue}
              inputScreenText={inputScreenText}
              onBarcodeSearch={handleBarcodeSearch}
              barcodeInput={barcodeInput}
              setBarcodeInput={setBarcodeInput}
              customerName={customerName}
              barcodeInputRef={barcodeInputRef}
              paymentMethods={paymentMethods}
              balance={balance}
              selectedRowIndex={selectedRowIndex}
              onRowSelect={handleRowSelect}
              isPaymentStarted={isPaymentStarted}
              showNotification={showNotification}
            />
            <div className="category-section">
              <CategoryTabs activeTab={activeTab} onTabChange={handleTabChange} darkMode={darkMode} />
              <CategoryGrid
                items={activeTab === "category" ? fetchCustomCategories : quickAccess}
                onCategorySelect={handleCategorySelect}
              />
              <div className="action-buttons">
                <Numpad darkMode={darkMode} onNumpadClick={handleNumpadClick} />
                <PaymentButtons
                  inputValue={inputValue}
                  resetInput={resetInput}
                  setPaymentMethods={setPaymentMethods}
                  totalValue={totalValue}
                  setBalance={setBalance}
                  setIsPaymentStarted={setIsPaymentStarted}
                  paymentMethods={paymentMethods}
                  showNotification={showNotification}
                />
                <FunctionButtons
                  onVoidLine={handleVoidLine}
                  onVoidAll={handleVoidAll}
                  onPrintLastBill={handlePrintLastBill}
                  onPriceCheck={handlePriceCheck}
                  onSuspendTransaction={handleSuspendTransaction}
                  onRecallTransaction={handleRecallTransaction}
                />
              </div>
            </div>
          </div>
        </div>

        {showBillPopup && (
          <div className="bill-popup-overlay">
            <div className="bill-popup">
              <div className="bill-content">
                <h2>Transaction Receipt</h2>
                <p>
                  Date: {transactionDate ? transactionDate.toLocaleString() : currentTime.toLocaleString()}
                </p>
                {customerName && <p>Customer: {customerName}</p>}
                <div className="bill-summary centered">
                  <p>Grand Total: {totalValue.toFixed(2)}</p>
                  {paymentMethods.map((method, index) => (
                    <p key={index}>
                      {method.type}: {method.amount.toFixed(2)}
                    </p>
                  ))}
                  <p>
                    <span className="balance-label">Balance:</span>{" "}
                    <span className="balance-value">{balance.toFixed(2)}</span>
                  </p>
                </div>
              </div>
              <div className="bill-actions">
                <button onClick={handlePrintBill} className="print-btn">
                  Print Bill
                </button>
                <button onClick={handleClosePopup} className="close-btn">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {showPriceCheckPopup && (
          <div className="price-check-popup-overlay">
            <div className="price-check-popup">
              <h2>Price Check</h2>
              <PriceCheckPopup onClose={handleClosePriceCheckPopup} darkMode={darkMode} />
            </div>
          </div>
        )}

        {showSuspendedTransactions && (
          <div className="suspended-transactions-overlay">
            <div className={`suspended-transactions-popup ${darkMode ? "dark-mode" : ""}`}>
              <h2>Suspended Transactions</h2>
              <div className="suspended-list">
                {suspendedTransactions.length > 0 ? (
                  suspendedTransactions.map((transaction) => (
                    <div key={transaction.id} className="suspended-item">
                      <div className="suspended-info">
                        <p>Timestamp: {transaction.timestamp}</p>
                        <p>Total: {transaction.totalValue.toFixed(2)}</p>
                        <p>Items: {transaction.items.length}</p>
                        {transaction.customerName && <p>Customer: {transaction.customerName}</p>}
                      </div>
                      <div className="suspended-actions">
                        <button
                          className="details-btn"
                          onClick={() => toggleTransactionDetails(transaction.id)}
                        >
                          <i className="feather-eye" />
                        </button>
                        <button
                          className="recall-btn"
                          onClick={() => handleRecallSelectedTransaction(transaction)}
                        >
                          Recall
                        </button>
                      </div>
                      {expandedTransactionId === transaction.id && (
                        <div className="details-container">
                          <div className="transaction-details">
                            <h3>Details</h3>
                            <table className="details-table">
                              <thead>
                                <tr>
                                  <th>Qty</th>
                                  <th>Item</th>
                                  <th>Price</th>
                                  <th>Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {transaction.items.map((item, index) => (
                                  <tr key={index}>
                                    <td>{item.qty}</td>
                                    <td>{item.name}</td>
                                    <td>{item.price.toFixed(2)}</td>
                                    <td>{item.total.toFixed(2)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            <p>Total: {transaction.totalValue.toFixed(2)}</p>
                            <p>
                              Payments:{" "}
                              {transaction.paymentMethods.length > 0
                                ? transaction.paymentMethods
                                  .map((p) => `${p.type}: ${p.amount.toFixed(2)}`)
                                  .join(", ")
                                : "None"}
                            </p>
                            <p>Balance: {transaction.balance.toFixed(2)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p>No suspended transactions.</p>
                )}
              </div>
              <button className="close-btn" onClick={handleCloseSuspendedPopup}>
                Close
              </button>
            </div>
          </div>
        )}

        {notification && <NotificationPopup message={notification} onClose={closeNotification} />}

        <div style={{ position: "absolute", left: "-9999px" }}>
          <div ref={barcodeRef}>
            <Barcode
              value={(lastTransaction?.id || 0).toString().padStart(10, "0")}
              format="CODE128"
              width={1}
              height={30}
              displayValue={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pos;