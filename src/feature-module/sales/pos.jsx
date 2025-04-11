import React, { useEffect, useState, useRef } from "react";
import { fetchCustomCategories, quickAccess, fetchNonScanProducts } from "../../core/json/Posdata";
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
import { getProductByBarcode, getProductByName, saveProduct } from "../Api/productApi";
import { saveTransaction } from "../Api/TransactionApi";
import { fetchCustomers } from "../Api/customerApi";
import { fetchBranches } from "../Api/BranchApi";
import { fetchUsers } from "../Api/UserApi";
import Barcode from "react-barcode";
import html2canvas from "html2canvas";
import { fetchProductCategories } from "../Api/ProductCategoryApi";
import { fetchTaxes } from "../Api/TaxApi";
import Select from "react-select";

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
  const [expandedTransactionId, setExpandedTransactionId] = useState(null);
  const barcodeInputRef = useRef(null);
  const barcodeRef = useRef(null);
  const [manualDiscount, setManualDiscount] = useState(0);
  const [manualDiscounts, setManualDiscounts] = useState([]);
  const [showAddProductPrompt, setShowAddProductPrompt] = useState(false);
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState("");
  const [userRole] = useState(localStorage.getItem("userRole") || "USER");
  const [productName, setProductName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [category, setCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [quantity, setQuantity] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [taxType, setTaxType] = useState(null);
  const [taxes, setTaxes] = useState([]);
  const [lowStock, setLowStock] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [employeeDiscount, setEmployeeDiscount] = useState(0);
  const [employeeDiscountPercentage, setEmployeeDiscountPercentage] = useState(0);
  const [employeeId, setEmployeeId] = useState(null);
  const [employeeName, setEmployeeName] = useState("");

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
      const currentTotal = totalValue - manualDiscount - employeeDiscount;
      const newBalance = Math.abs(currentTotal - totalPaid);
      setBalance(newBalance);
    } else {
      setBalance(0);
    }
  }, [selectedItems, paymentMethods, isPaymentStarted, manualDiscount, employeeDiscount, totalValue]);

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

  useEffect(() => {
    if (showAddProductForm) {
      loadCategoriesData();
      loadTaxesData();
      setBarcode(scannedBarcode);
    }
  }, [showAddProductForm, scannedBarcode]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    
    // Refresh non-scan data from localStorage when non-scan tab is clicked
    if (newTab === "nonscan") {
      // Clear the cache timestamp to force a refresh
      localStorage.removeItem('nonScanProductsCacheTimestamp');
    }
  };

  const showNotification = (message, type = "error") => {
    setNotification({ message, type });
  };

  const closeNotification = () => {
    setNotification(null);
  };

  const playErrorSound = () => {
    const audio = new Audio("/error-sound.wav");
    audio
      .play()
      .catch((error) => {
        console.error("Error playing sound:", error);
        showNotification("Failed to play error sound. Check console for details.", "error");
      });
  };

  const handleCategorySelect = (category) => {
    
    if (category.name === "clear") {
      setSelectedItems([]);
      setTotalValue(0);
      setInputScreenText("");
      setInputValue("0");
      setInputStage("qty");
      setCurrentItem(null);
      setPendingQty(null);
      return;
    }

    if (activeTab === "category" && category?.name) {
      
      if (category.name === "Shopping Bags") {
        // Try both formats to determine which one exists
        Promise.all([
          getProductByName("Shopping Bags-👜"),
          getProductByName("Shopping Bags-?")
        ]).then(([response1, response2]) => {
          
          // Determine which product exists
          let shoppingBagsProduct = null;
          
          if (response1?.responseDto?.length > 0) {
            shoppingBagsProduct = response1.responseDto[0];
          } else if (response2?.responseDto?.length > 0) {
            shoppingBagsProduct = response2.responseDto[0];
          }
          
          const inputQty = parseFloat(inputValue);
          const qty = inputQty > 0 ? inputQty : 1;
          const price = category.price || 0;
          const total = qty * price;
          const newItem = { 
            id: shoppingBagsProduct ? shoppingBagsProduct.id : category.id, 
            name: category.name, 
            qty, 
            price, 
            total 
          };
          
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
          setInputScreenText("");
          resetInput();
        }).catch(error => {
          console.error("Error fetching Shopping Bags product:", error);
          // Fallback to the original behavior if there's an error
          const inputQty = parseFloat(inputValue);
          const qty = inputQty > 0 ? inputQty : 1;
          const price = category.price || 0;
          const total = qty * price;
          const newItem = { 
            id: category.id, 
            name: category.name, 
            qty, 
            price, 
            total 
          };
          
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
          setInputScreenText("");
          resetInput();
        });
        return;
      }
      
      const parsedInput = parseFloat(inputValue);
      if (parsedInput > 0) {
        if (inputStage === "qty") {
          const qty = 1;
          const price = parsedInput;
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
        } else if (inputStage === "price" && pendingQty !== null) {
          const qty = pendingQty;
          const price = parsedInput;
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
        }
      } else {
        setCurrentItem({ id: category.id, name: category.name, qty: 1, price: null, total: null });
        setInputStage("price");
        setPendingQty(1);
        setInputValue("0");
        setInputScreenText("1 × ");
      }
    } else if (activeTab === "nonscan" && category?.name) {
      const price = category.price || 0;
      
      if (inputStage === "qty" && parseFloat(inputValue) > 0) {
        const qty = parseFloat(inputValue);
        const total = qty * price;
        const newItem = { id: category.id, name: category.nonScanProduct || category.name, qty, price, total };
        
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
        setInputScreenText("");
        resetInput();
      } else {
        const qty = 1;
        const total = qty * price;
        const newItem = { id: category.id, name: category.nonScanProduct || category.name, qty, price, total };
        
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
        setInputScreenText("");
        resetInput();
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
      let newInput = inputValue === "0" ? value.toString() : inputValue + value.toString();
      if (value === "." && inputValue.includes(".")) return;
      const parts = newInput.split(".");
      const decPart = parts[1] || "";
      if (decPart.length <= 2) {
        setInputValue(newInput);
        if (inputStage === "qty" && !currentItem) {
          setInputScreenText(newInput);
        } else if (inputStage === "price") {
          setInputScreenText(`${pendingQty} × ${newInput}`);
        }
      }
    } else if (type === "multiply") {
      if (inputValue !== "0" && inputStage === "qty") {
        setPendingQty(parseFloat(inputValue));
        setInputStage("price");
        setInputValue("0");
        setInputScreenText(`${parseFloat(inputValue)} × `);
      }
    } else if (type === "enter") {
      if (currentItem && inputStage === "price" && parseFloat(inputValue) > 0) {
        const total = currentItem.qty * parseFloat(inputValue);
        const newItem = { ...currentItem, price: parseFloat(inputValue), total };
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
      
      // Check if we should save the transaction
      if (isPaymentStarted && selectedItems.length > 0) {
        const totalPaid = paymentMethods.reduce((sum, method) => sum + method.amount, 0);
        const currentTotal = totalValue - manualDiscount - employeeDiscount;
        const remainingBalance = currentTotal - totalPaid;
        
        if (remainingBalance <= 0) {
          handleSaveTransaction();
        } else {
          showNotification(`Please pay the remaining balance: ${remainingBalance.toFixed(2)}`, "warning");
        }
      }
    }
  };

  const handleBarcodeSearch = async (barcode) => {
    if (barcode.length < 3) return;

    try {
      const product = await getProductByBarcode(barcode);
      if (!product || !product.responseDto || product.responseDto.length === 0) {
        playErrorSound();
        showNotification("Barcode not found in the database.", "error");
        if (["ADMIN", "MANAGER"].includes(userRole)) {
          setScannedBarcode(barcode);
          setShowAddProductPrompt(true);
        }
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
        showNotification("Invalid Qty: Cannot set custom price for barcoded items", "error");
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
      showNotification("Error searching barcode: " + error.message, "error");
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
      showNotification("Please select a row to void.", "error");
      return;
    }

    const cashTotal = paymentMethods
      .filter((method) => method.type === "Cash")
      .reduce((sum, method) => sum + method.amount, 0);
    const cardPayments = paymentMethods.filter((method) => method.type === "Card");

    const displayItems = isPaymentStarted
      ? [
          ...selectedItems,
          ...(manualDiscounts.length > 0
            ? manualDiscounts.map((discount, index) => ({
                id: `manual-discount-${index}`,
                name: "Manual Discount",
                qty: 1,
                price: -discount,
                total: -discount,
                type: "Discount",
              }))
            : []),
          ...(employeeDiscount > 0
            ? [{
                id: 'employee-discount',
                name: `Employee Discount (${employeeDiscountPercentage.toFixed(1)}%)`,
                qty: 1,
                price: -employeeDiscount,
                total: -employeeDiscount,
                type: "EmployeeDiscount",
              }]
            : []),
          ...(cashTotal > 0
            ? [
                {
                  id: `payment-cash`,
                  name: `Cash Payment`,
                  qty: 1,
                  price: cashTotal,
                  total: cashTotal,
                  type: "Cash",
                },
              ]
            : []),
          ...(cardPayments.length > 0
            ? cardPayments.map((method, index) => ({
                id: `payment-card-${index}`,
                name: `${method.type} Payment`,
                qty: 1,
                price: method.amount,
                total: method.amount,
                type: "Card",
              }))
            : []),
        ]
      : [
          ...selectedItems,
          ...(manualDiscounts.length > 0
            ? manualDiscounts.map((discount, index) => ({
                id: `manual-discount-${index}`,
                name: "Manual Discount",
                qty: 1,
                price: -discount,
                total: -discount,
                type: "Discount",
              }))
            : []),
          ...(employeeDiscount > 0
            ? [{
                id: 'employee-discount',
                name: `Employee Discount (${employeeDiscountPercentage.toFixed(1)}%)`,
                qty: 1,
                price: -employeeDiscount,
                total: -employeeDiscount,
                type: "EmployeeDiscount",
              }]
            : []),
        ];

    const selectedItem = displayItems[selectedRowIndex];

    if (!selectedItem) {
      showNotification("Invalid selection.", "error");
      return;
    }

    if (selectedItem.type === "Discount") {
      const discountIndex = parseInt(selectedItem.id.split("-").pop());
      if (!isNaN(discountIndex) && discountIndex >= 0 && discountIndex < manualDiscounts.length) {
        const newManualDiscounts = [...manualDiscounts];
        const removedDiscount = newManualDiscounts.splice(discountIndex, 1)[0];
        setManualDiscounts(newManualDiscounts);
        setManualDiscount((prevDiscount) => prevDiscount - removedDiscount);
        setSelectedRowIndex(null);
        showNotification("Manual discount voided.", "success");
        return;
      }
    }

    if (selectedItem.type === "EmployeeDiscount") {
      setEmployeeDiscount(0);
      setEmployeeId(null);
      setEmployeeDiscountPercentage(0);
      setSelectedRowIndex(null);
      showNotification("Employee discount voided.", "success");
      return;
    }

    if (isPaymentStarted && selectedItem.type) {
      if (selectedItem.type === "Card") {
        showNotification("Card payments cannot be voided with Void Line.", "error");
        return;
      }
      if (selectedItem.type === "Cash") {
        const newPaymentMethods = paymentMethods.filter((method) => method.type !== "Cash");
        setPaymentMethods(newPaymentMethods);
        setSelectedRowIndex(null);
        if (newPaymentMethods.length === 0) {
          setIsPaymentStarted(false);
        }
        showNotification("Cash payment voided.", "success");
        return;
      }
    }

    const newItems = selectedItems.filter((_, index) => index !== selectedRowIndex);
    setSelectedItems(newItems);
    setTotalValue(newItems.reduce((sum, item) => sum + item.total, 0));
    setSelectedRowIndex(null);
    showNotification("Item voided.", "success");
  };

  const handleVoidAll = () => {
    setSelectedItems([]);
    setTotalValue(0);
    setPaymentMethods([]);
    setBalance(0);
    setIsPaymentStarted(false);
    setSelectedRowIndex(null);
    setManualDiscount(0);
    setManualDiscounts([]);
    setEmployeeDiscount(0);
    setEmployeeId(null);
    setEmployeeDiscountPercentage(0);
    showNotification("All items and payments voided.", "success");
  };

  const handleCustomerAdded = (name) => setCustomerName(name);

  const handleManualDiscount = () => {
    if (inputValue === "0") {
      showNotification("Please enter a discount amount first", "error");
      return;
    }
    if (selectedItems.length === 0) {
      showNotification("Please add items to the transaction before applying a discount", "error");
      return;
    }
    const discount = parseFloat(inputValue);
    const currentTotal = selectedItems.reduce((sum, item) => sum + item.total, 0);
    const totalDiscount = manualDiscount + discount;

    if (totalDiscount > currentTotal) {
      showNotification("Manual discount cannot exceed the total value of items", "error");
      return;
    }

    setManualDiscount((prevDiscount) => prevDiscount + discount);
    setManualDiscounts((prevDiscounts) => [...prevDiscounts, discount]);
    resetInput();
    showNotification("Manual discount applied.", "success");
  };

  const handleEmployeeDiscount = (discountAmount, empId, discountPercentage) => {
    setEmployeeDiscount(discountAmount);
    setEmployeeId(empId);
    setEmployeeDiscountPercentage(discountPercentage);
    
    const fetchEmployeeName = async () => {
      try {
        const usersResponse = await fetchUsers();
        const employee = usersResponse.payload.find(u => u.id === empId);
        if (employee) {
          setEmployeeName(employee.firstName);
        }
      } catch (error) {
        console.error("Error fetching employee name:", error);
      }
    };
    
    fetchEmployeeName();
  };

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
          contactNumber: branch.contactNumber || "N/A",
        });
        shopDetailsId = branch.shopDetailsId || 1;
      } else {
        setBranchDetails({
          branchName: "Unknown Branch",
          branchCode: "N/A",
          address: "N/A",
          shopName: "Unknown Shop",
          contactNumber: "N/A",
        });
      }

      const usersResponse = await fetchUsers();
      const user = usersResponse.payload.find((u) => u.id === userId);
      if (user) {
        setUserDetails({
          firstName: user.firstName || "Unknown",
          lastName: user.lastName || "",
        });
      }

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
        totalAmount: totalValue - manualDiscount - employeeDiscount,
        manualDiscount: manualDiscount,
        employeeDiscount: employeeDiscount,
        employeeDiscountPercentage: employeeDiscountPercentage,
        employeeDto: employeeId ? { id: employeeId } : null,
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
        transactionEmployee: employeeId ? [{ userDto: { id: employeeId } }] : [],
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
          showNotification("Warning: Transaction ID not found in API response. Please check the backend response.", "error");
        }

        setLastTransaction({
          id: transactionId,
          transactionDetailsList: selectedItems.map((item) => ({
            productDto: { id: item.id, name: item.name },
            quantity: item.qty,
            unitPrice: item.price,
            discount: 0.0,
          })),
          totalAmount: totalValue - manualDiscount - employeeDiscount,
          manualDiscount: manualDiscount,
          employeeDiscount: employeeDiscount,
          employeeDiscountPercentage: employeeDiscountPercentage,
          employeeName: employeeName,
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
        showNotification("Transaction saved successfully!", "success");
      } else {
        showNotification("Failed to save transaction: " + result.error, "error");
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      showNotification("Error saving transaction: " + error.message, "error");
    }
  };

  const handlePrintBill = async () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      showNotification("Failed to open print window. Please allow popups for this site and try again.", "error");
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
      showNotification("Failed to generate barcode image.", "error");
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
            ${manualDiscount > 0 ? `<p>Manual Discount: ${manualDiscount.toFixed(2)}</p>` : ''}
            ${employeeDiscount > 0 ? `<p>Employee Discount (${employeeDiscountPercentage.toFixed(1)}%)${employeeName ? ` (${employeeName})` : ""}: ${employeeDiscount.toFixed(2)}</p>` : ''}
            ${paymentMethods.map(method => `
              <p>${method.type}: ${method.amount.toFixed(2)}</p>
            `).join('')}
            <p>Balance: ${Math.abs(balance).toFixed(2)}</p>
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
            <p>=====================================</p>
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
      showNotification("Failed to open print window. Please allow popups for this site and try again.", "error");
      return;
    }

    if (!lastTransaction) {
      printWindow.document.write("<p>No previous transaction found.</p>");
      showNotification("No previous transaction found.", "error");
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
      const manualDiscount = lastTransaction.manualDiscount || 0;
      const paymentMethods = lastTransaction.transactionPaymentMethod.map((method) => ({
        type: method.paymentMethodDto.id === 1 ? "Cash" : "Card",
        amount: method.amount,
      }));

      const totalPaid = paymentMethods.reduce((sum, method) => sum + method.amount, 0);
      const calculatedBalance = Math.abs(totalAmount - totalPaid);

      let branchName = branchDetails.branchName;
      let branchCode = branchDetails.branchCode;
      let shopName = branchDetails.shopName;
      let address = branchDetails.address;
      let contactNumber = branchDetails.contactNumber;
      let firstName = userDetails.firstName;
      let lastName = userDetails.lastName;

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

      const formattedDate = lastTransaction.dateTime && !isNaN(new Date(lastTransaction.dateTime).getTime())
        ? new Date(lastTransaction.dateTime).toLocaleString()
        : new Date().toLocaleString();

      const transactionId = lastTransaction.id || 0;
      const formattedTransactionId = transactionId.toString().padStart(10, "0");

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
              ${lastTransaction.customerDto?.name ? `<p>Customer: ${lastTransaction.customerDto.name}</p>` : ""}
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
              ${manualDiscount > 0 ? `<p>Manual Discount: ${manualDiscount.toFixed(2)}</p>` : ''}
              ${lastTransaction.employeeDiscount > 0 ? `<p>Employee Discount (${lastTransaction.employeeDiscountPercentage.toFixed(1)}%)${lastTransaction.employeeName ? ` (${lastTransaction.employeeName})` : ""}: ${lastTransaction.employeeDiscount.toFixed(2)}</p>` : ''}
              ${paymentMethods.map((method) => `
                <p>${method.type}: ${method.amount.toFixed(2)}</p>
              `).join('')}
              <p>Balance: ${Math.abs(calculatedBalance).toFixed(2)}</p>
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
      showNotification("Failed to print the last transaction: " + error.message, "error");
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
    setManualDiscount(0);
    setManualDiscounts([]);
    setEmployeeDiscount(0);
    setEmployeeId(null);
    setEmployeeDiscountPercentage(0);
    setEmployeeName("");
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
      showNotification("No transaction to suspend.", "error");
      return;
    }

    const suspendedTransaction = {
      id: Date.now(),
      items: selectedItems,
      totalValue,
      paymentMethods,
      balance,
      isPaymentStarted,
      customerName,
      manualDiscount,
      manualDiscounts,
      employeeDiscount,
      employeeId,
      employeeDiscountPercentage,
      timestamp: new Date().toLocaleString(),
    };

    const updatedSuspendedTransactions = [...suspendedTransactions, suspendedTransaction];
    setSuspendedTransactions(updatedSuspendedTransactions);
    localStorage.setItem("suspendedTransactions", JSON.stringify(updatedSuspendedTransactions));
    showNotification("Transaction suspended successfully.", "success");

    setSelectedItems([]);
    setTotalValue(0);
    setPaymentMethods([]);
    setBalance(0);
    setIsPaymentStarted(false);
    setCustomerName("");
    setManualDiscount(0);
    setManualDiscounts([]);
    setEmployeeDiscount(0);
    setEmployeeId(null);
    setEmployeeDiscountPercentage(0);
    resetInput();
  };

  const handleRecallTransaction = () => {
    if (selectedItems.length > 0) {
      showNotification("Cannot recall a transaction while items are added. Please complete or void the current transaction.", "error");
      return;
    }
    if (suspendedTransactions.length === 0) {
      showNotification("No suspended transactions available.", "error");
      return;
    }
    setShowSuspendedTransactions(true);
  };

  const handleCloseSuspendedPopup = () => {
    setShowSuspendedTransactions(false);
    setExpandedTransactionId(null);
  };

  const handleRecallSelectedTransaction = (transaction) => {
    setSelectedItems(transaction.items);
    setTotalValue(transaction.totalValue);
    setPaymentMethods(transaction.paymentMethods);
    setBalance(transaction.balance);
    setIsPaymentStarted(transaction.isPaymentStarted);
    setCustomerName(transaction.customerName);
    setManualDiscount(transaction.manualDiscount || 0);
    setManualDiscounts(transaction.manualDiscounts || []);
    setEmployeeDiscount(transaction.employeeDiscount || 0);
    setEmployeeId(transaction.employeeId || null);
    setEmployeeDiscountPercentage(transaction.employeeDiscountPercentage || 0);
    resetInput();

    const updatedSuspendedTransactions = suspendedTransactions.filter((t) => t.id !== transaction.id);
    setSuspendedTransactions(updatedSuspendedTransactions);
    localStorage.setItem("suspendedTransactions", JSON.stringify(updatedSuspendedTransactions));
    setShowSuspendedTransactions(false);
    setExpandedTransactionId(null);
    showNotification("Transaction recalled successfully.", "success");
  };

  const handleDeleteSuspendedTransaction = (id) => {
    const updatedSuspendedTransactions = suspendedTransactions.filter((t) => t.id !== id);
    setSuspendedTransactions(updatedSuspendedTransactions);
    localStorage.setItem("suspendedTransactions", JSON.stringify(updatedSuspendedTransactions));
    showNotification("Suspended transaction deleted successfully.", "success");
    if (updatedSuspendedTransactions.length === 0) {
      setShowSuspendedTransactions(false);
    }
  };

  const toggleTransactionDetails = (id) => {
    setExpandedTransactionId(expandedTransactionId === id ? null : id);
  };

  const handleAddProductPromptClose = () => {
    setShowAddProductPrompt(false);
    setScannedBarcode("");
  };

  const handleAddProductClick = () => {
    setShowAddProductPrompt(false);
    setShowAddProductForm(true);
  };

  const handleAddProductFormClose = () => {
    setShowAddProductForm(false);
    setScannedBarcode("");
    resetProductForm();
  };

  const resetProductForm = () => {
    setProductName("");
    setBarcode(scannedBarcode);
    setCategory(null);
    setQuantity("");
    setPurchasePrice("");
    setPricePerUnit("");
    setTaxType(null);
    setLowStock("");
    setFormErrors({});
  };

  const loadCategoriesData = async () => {
    try {
      const data = await fetchProductCategories();
      setCategories(
        data
          .filter((cat) => cat.isActive && cat.productCategoryName.toLowerCase() !== "custom")
          .map((cat) => ({ value: cat.id, label: cat.productCategoryName }))
      );
    } catch (error) {
      setCategories([]);
      showNotification("Failed to load categories.", "error");
    }
  };

  const loadTaxesData = async () => {
    try {
      const data = await fetchTaxes();
      setTaxes(
        data
          .filter((tax) => tax.isActive)
          .map((tax) => ({ value: tax.id, label: `${tax.taxPercentage}%` }))
      );
    } catch (error) {
      setTaxes([]);
      showNotification("Failed to load taxes.", "error");
    }
  };

  const validateProductForm = () => {
    const errors = {};
    if (!productName.trim()) errors.productName = "Product name is required";
    if (!barcode.trim()) errors.barcode = "Barcode is required";
    if (!category) errors.category = "Category is required";
    if (!quantity || isNaN(quantity) || parseInt(quantity) < 0) errors.quantity = "Valid quantity is required";
    if (!purchasePrice || isNaN(purchasePrice) || parseFloat(purchasePrice) < 0)
      errors.purchasePrice = "Valid purchase price is required";
    if (!pricePerUnit || isNaN(pricePerUnit) || parseFloat(pricePerUnit) < 0)
      errors.pricePerUnit = "Valid price per unit is required";
    if (!taxType) errors.taxType = "Tax type is required";
    if (!lowStock || isNaN(lowStock) || parseInt(lowStock) < 0) errors.lowStock = "Valid low stock is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProduct = async () => {
    if (!validateProductForm()) {
      showNotification("Please fix the errors in the form.", "error");
      return;
    }

    const productData = {
      name: productName,
      barcode: barcode,
      pricePerUnit: parseFloat(pricePerUnit),
      taxDto: { id: parseInt(taxType.value) },
      isActive: true,
      productCategoryDto: { id: parseInt(category.value) },
      expiryDate: "2025-12-31T23:59:59",
      createdDate: new Date().toISOString(),
      lowStock: parseInt(lowStock),
      purchasePrice: parseFloat(purchasePrice),
      quantity: parseInt(quantity),
    };

    try {
      const response = await saveProduct(productData);
      if (response) {
        showNotification("Product added successfully!", "success");
        handleAddProductFormClose();
      } else {
        showNotification("Failed to save product.", "error");
      }
    } catch (error) {
      showNotification("Error saving product: " + error.message, "error");
    }
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
              manualDiscount={manualDiscount}
              manualDiscounts={manualDiscounts}
              employeeDiscount={employeeDiscount}
              employeeDiscountPercentage={employeeDiscountPercentage}
              employeeName={employeeName}
            />
            <div className="category-section">
              <CategoryTabs activeTab={activeTab} onTabChange={handleTabChange} darkMode={darkMode} />
              <CategoryGrid
                items={
                  activeTab === "category"
                    ? fetchCustomCategories
                    : activeTab === "nonscan"
                    ? fetchNonScanProducts
                    : quickAccess
                }
                onCategorySelect={handleCategorySelect}
                onManualDiscount={handleManualDiscount}
                showNotification={showNotification}
                inputValue={inputValue}
                onEmployeeDiscount={handleEmployeeDiscount}
                selectedItems={selectedItems}
                manualDiscount={manualDiscount}
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
                  manualDiscount={manualDiscount}
                  employeeDiscount={employeeDiscount}
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
            <div className={`bill-popup ${darkMode ? "dark-mode" : ""}`}>
              <div className="bill-content">
                <h2>Transaction Receipt</h2>
                <p>
                  Date: {transactionDate ? transactionDate.toLocaleString() : currentTime.toLocaleString()}
                </p>
                {customerName && <p>Customer: {customerName}</p>}
                <div className="bill-summary centered">
                  <p>Total: {totalValue.toFixed(2)}</p>
                  {manualDiscount > 0 && <p>Manual Discount: {manualDiscount.toFixed(2)}</p>}
                  {employeeDiscount > 0 && (
                    <p>
                      Employee Discount ({employeeDiscountPercentage.toFixed(1)}%)
                      {employeeName ? ` (${employeeName})` : ""}: {employeeDiscount.toFixed(2)}
                    </p>
                  )}
                  <p>Grand Total: {(totalValue - manualDiscount - employeeDiscount).toFixed(2)}</p>
                  {paymentMethods.map((method) => (
                    <p key={method.type}>
                      {method.type}: {method.amount.toFixed(2)}
                    </p>
                  ))}
                  <p>
                    <span className="balance-label">Balance:</span>{" "}
                    <span className="balance-value">{Math.abs(balance).toFixed(2)}</span>
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
            <div className={`price-check-popup ${darkMode ? "dark-mode" : ""}`}>
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
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteSuspendedTransaction(transaction.id)}
                        >
                          <i className="feather-trash-2" />
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
                            {transaction.manualDiscount > 0 && (
                              <p>Manual Discount: {transaction.manualDiscount.toFixed(2)}</p>
                            )}
                            {transaction.employeeDiscount > 0 && (
                              <p>Employee Discount: {transaction.employeeDiscount.toFixed(2)}</p>
                            )}
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

        {showAddProductPrompt && (
          <div className="add-product-prompt-overlay">
            <div className={`add-product-prompt ${darkMode ? "dark-mode" : ""}`}>
              <h3>Barcode Not Found</h3>
              <p>Barcode {scannedBarcode} was not found in the database.</p>
              <div className="prompt-actions">
                <button onClick={handleAddProductClick} className="btn btn-primary">
                  Add Product
                </button>
                <button onClick={handleAddProductPromptClose} className="btn btn-secondary">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {showAddProductForm && (
          <div className="add-product-form-overlay">
            <div className={`add-product-form ${darkMode ? "dark-mode" : ""}`}>
              <h2>Add New Product</h2>
              <div className="form-content">
                <div className="form-group">
                  <label>Product Name</label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className={formErrors.productName ? "is-invalid" : ""}
                  />
                  {formErrors.productName && (
                    <div className="invalid-feedback">{formErrors.productName}</div>
                  )}
                </div>
                <div className="form-group">
                  <label>Barcode</label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className={formErrors.barcode ? "is-invalid" : ""}
                  />
                  {formErrors.barcode && (
                    <div className="invalid-feedback">{formErrors.barcode}</div>
                  )}
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <Select
                    options={categories}
                    value={category}
                    onChange={setCategory}
                    placeholder="Select Category"
                    className={formErrors.category ? "is-invalid" : ""}
                    styles={{
                      control: (base) => ({
                        ...base,
                        backgroundColor: darkMode ? "#444" : "#fff",
                        borderColor: darkMode ? "#666" : "#ccc",
                        color: darkMode ? "#fff" : "#000",
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: darkMode ? "#fff" : "#000",
                      }),
                      placeholder: (base) => ({
                        ...base,
                        color: darkMode ? "#ccc" : "#999",
                      }),
                      menu: (base) => ({
                        ...base,
                        backgroundColor: darkMode ? "#444" : "#fff",
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected
                          ? darkMode
                            ? "#666"
                            : "#e0e0e0"
                          : state.isFocused
                          ? darkMode
                            ? "#555"
                            : "#f0f0f0"
                          : darkMode
                            ? "#444"
                            : "#fff",
                        color: darkMode ? "#fff" : "#000",
                      }),
                      input: (base) => ({
                        ...base,
                        color: darkMode ? "#fff" : "#000",
                      }),
                    }}
                  />
                  {formErrors.category && (
                    <div className="text-danger">{formErrors.category}</div>
                  )}
                </div>
                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className={formErrors.quantity ? "is-invalid" : ""}
                  />
                  {formErrors.quantity && (
                    <div className="invalid-feedback">{formErrors.quantity}</div>
                  )}
                </div>
                <div className="form-group">
                  <label>Purchase Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    className={formErrors.purchasePrice ? "is-invalid" : ""}
                  />
                  {formErrors.purchasePrice && (
                    <div className="invalid-feedback">{formErrors.purchasePrice}</div>
                  )}
                </div>
                <div className="form-group">
                  <label>Price Per Unit</label>
                  <input
                    type="number"
                    step="0.01"
                    value={pricePerUnit}
                    onChange={(e) => setPricePerUnit(e.target.value)}
                    className={formErrors.pricePerUnit ? "is-invalid" : ""}
                  />
                  {formErrors.pricePerUnit && (
                    <div className="invalid-feedback">{formErrors.pricePerUnit}</div>
                  )}
                </div>
                <div className="form-group">
                  <label>Tax Percentage</label>
                  <Select
                    options={taxes}
                    value={taxType}
                    onChange={setTaxType}
                    placeholder="Select Tax"
                    className={formErrors.taxType ? "is-invalid" : ""}
                    styles={{
                      control: (base) => ({
                        ...base,
                        backgroundColor: darkMode ? "#444" : "#fff",
                        borderColor: darkMode ? "#666" : "#ccc",
                        color: darkMode ? "#fff" : "#000",
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: darkMode ? "#fff" : "#000",
                      }),
                      placeholder: (base) => ({
                        ...base,
                        color: darkMode ? "#ccc" : "#999",
                      }),
                      menu: (base) => ({
                        ...base,
                        backgroundColor: darkMode ? "#444" : "#fff",
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected
                          ? darkMode
                            ? "#666"
                            : "#e0e0e0"
                          : state.isFocused
                          ? darkMode
                            ? "#555"
                            : "#f0f0f0"
                          : darkMode
                            ? "#444"
                            : "#fff",
                        color: darkMode ? "#fff" : "#000",
                      }),
                      input: (base) => ({
                        ...base,
                        color: darkMode ? "#fff" : "#000",
                      }),
                    }}
                  />
                  {formErrors.taxType && (
                    <div className="text-danger">{formErrors.taxType}</div>
                  )}
                </div>
                <div className="form-group">
                  <label>Low Stock</label>
                  <input
                    type="number"
                    value={lowStock}
                    onChange={(e) => setLowStock(e.target.value)}
                    className={formErrors.lowStock ? "is-invalid" : ""}
                  />
                  {formErrors.lowStock && (
                    <div className="invalid-feedback">{formErrors.lowStock}</div>
                  )}
                </div>
              </div>
              <div className="form-actions">
                <button onClick={handleSaveProduct} className="btn btn-primary">
                  Save Product
                </button>
                <button onClick={handleAddProductFormClose} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {notification && (
          <NotificationPopup
            message={notification.message}
            type={notification.type}
            onClose={closeNotification}
          />
        )}

        <audio preload="auto" style={{ display: "none" }}>
          <source src="/error-sound.wav" type="audio/wav" />
        </audio>

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