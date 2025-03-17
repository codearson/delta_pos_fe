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
import { getProductByBarcode } from "../Api/productApi";

const Pos = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("category");
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [inputValue, setInputValue] = useState("0");
  const [inputStage, setInputStage] = useState("qty");
  const [hasCategory, setHasCategory] = useState(false);
  const [totalValue, setTotalValue] = useState(0);
  const [inputScreenText, setInputScreenText] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [pendingQty, setPendingQty] = useState(null);
  const barcodeInputRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  const handleTabChange = (newTab) => setActiveTab(newTab);

  const handleCategorySelect = (category) => {
    if (activeTab === "category" && category?.name) {
      const qty = pendingQty && inputStage === "price" ? pendingQty : 1;
      setCurrentItem({ name: category.name, qty, price: null, total: null });
      setHasCategory(true);
      setInputStage("price");
      setInputValue("0");
      setInputScreenText(`${qty} ×`);
      setPendingQty(null);
    }
  };

  const handleNumpadClick = (action) => {
    const { type, value } = action;

    if (type === "clear") {
      if (currentItem) {
        if (currentItem.price !== null) {
          setCurrentItem({ ...currentItem, price: null, total: null });
          setInputStage("price");
          setInputValue("0");
          setInputScreenText(`${currentItem.qty} ×`);
        } else if (inputStage === "price" && hasCategory) {
          setInputStage("qty");
          setInputValue("0");
          setInputScreenText(`${currentItem.qty}`);
        } else if (hasCategory) {
          setCurrentItem({ ...currentItem, name: null });
          setHasCategory(false);
          setInputStage("qty");
          setInputValue("0");
          setInputScreenText(`${currentItem.qty}`);
        } else if (currentItem?.qty !== null) {
          setCurrentItem(null);
          setInputStage("qty");
          setInputValue("0");
          setInputScreenText("");
          setPendingQty(null);
        }
      } else if (selectedItems.length > 0) {
        const newItems = selectedItems.slice(0, -1);
        setSelectedItems(newItems);
        setTotalValue(newItems.reduce((sum, item) => sum + item.total, 0));
        setPendingQty(null);
      } else {
        setInputValue("0");
        setTotalValue(0);
        setInputStage("qty");
        setInputScreenText("");
        setPendingQty(null);
      }
      barcodeInputRef.current?.focus();
    } else if (type === "number") {
      let newInput = inputValue === "0" && value !== "." ? value.toString() : inputValue + value.toString();
      const parts = newInput.split(".");
      const numPart = parts[0] || "0";
      const decPart = parts[1] || "";

      if (numPart.length <= 5 && (decPart.length <= 2 || !decPart)) {
        if (value === "." && decPart) return;
        if (inputStage === "qty") {
          const qty = parseFloat(newInput) || 1;
          if (!currentItem || !currentItem.name) {
            setCurrentItem({ qty, name: null, price: null, total: null });
          }
          setInputScreenText(newInput);
          setInputValue(newInput);
        } else if (inputStage === "price" && currentItem && hasCategory) {
          const price = parseFloat(newInput) || 0;
          const total = currentItem.qty * price;
          setCurrentItem({ ...currentItem, price, total });
          setInputScreenText(`${currentItem.qty} × ${newInput}`);
          setInputValue(newInput);
        }
      }
    } else if (type === "multiply") {
      if (inputValue !== "0" && inputStage === "qty") {
        const qty = parseFloat(inputValue) || 1;
        setPendingQty(qty);
        setInputStage("price");
        setInputValue("0");
        setInputScreenText(`${qty} ×`);
      }
    } else if (type === "enter") {
      if (currentItem && currentItem.name && currentItem.price !== null) {
        const total = currentItem.qty * currentItem.price;
        const newItem = { name: currentItem.name, qty: currentItem.qty, price: currentItem.price, total };
        const newItems = [...selectedItems, newItem];
        setSelectedItems(newItems);
        setTotalValue(newItems.reduce((sum, item) => sum + item.total, 0));
        setCurrentItem(null);
        setHasCategory(false);
        setInputStage("qty");
        setInputValue("0");
        setInputScreenText("");
        setPendingQty(null);
        barcodeInputRef.current?.focus();
      }
    }
  };

  const handleBarcodeSearch = async (barcode) => {
    console.log("handleBarcodeSearch called", { barcode, inputStage, inputValue, pendingQty, currentItem });

    if (barcode.length < 3) {
      console.log("Barcode too short, skipping");
      return;
    }

    try {
      const product = await getProductByBarcode(barcode);
      console.log("API response:", product);
      if (!product || !product.responseDto || product.responseDto.length === 0) {
        console.log("No product found");
        setCurrentItem({ name: "Undefined Item", qty: 1, price: null, total: null });
        setInputScreenText("");
        setBarcodeInput("");
        setInputValue("0");
        barcodeInputRef.current?.focus();
        return;
      }

      const productData = product.responseDto[0];
      const { name, pricePerUnit } = productData;
      if (!name || pricePerUnit === undefined) {
        console.log("Invalid product data");
        setCurrentItem({ name: "Undefined Item", qty: 1, price: null, total: null });
        setInputScreenText("");
        setBarcodeInput("");
        setInputValue("0");
        barcodeInputRef.current?.focus();
        return;
      }

      if (inputStage === "price" && pendingQty) {
        // Number + "×" + Scan: Add to selectedItems with pendingQty
        const qty = pendingQty;
        const total = qty * pricePerUnit;
        const newItem = { name, qty, price: pricePerUnit, total };
        const newItems = [...selectedItems, newItem];
        setSelectedItems(newItems);
        setTotalValue(newItems.reduce((sum, item) => sum + item.total, 0));
        setInputStage("qty");
        setInputValue("0");
        setInputScreenText("");
        setBarcodeInput("");
        setPendingQty(null);
        barcodeInputRef.current?.focus();
        console.log("Added to selectedItems with pendingQty:", newItem);
      } else if (inputStage === "qty") {
        // Plain Scan: Add to selectedItems with qty 1, update total, no Enter needed
        const qty = 1;
        const total = qty * pricePerUnit;
        const newItem = { name, qty, price: pricePerUnit, total };
        const newItems = [...selectedItems, newItem];
        setSelectedItems(newItems);
        setTotalValue(newItems.reduce((sum, item) => sum + item.total, 0));
        setCurrentItem(null); // Clear currentItem since it's added
        setInputScreenText("1"); // Briefly show qty
        setBarcodeInput(""); // Clear barcode input
        setInputValue("0");
        setTimeout(() => {
          setInputScreenText(""); // Clear screen after a short delay
          console.log("inputScreenText cleared");
        }, 500);
        barcodeInputRef.current?.focus();
        console.log("Added to selectedItems with qty 1:", newItem);
      }
    } catch (error) {
      console.error("Barcode fetch error:", error);
      setCurrentItem({ name: "Undefined Item", qty: 1, price: null, total: null });
      setInputScreenText("");
      setBarcodeInput("");
      setInputValue("0");
      barcodeInputRef.current?.focus();
    }
  };

  const handleCustomerAdded = (name) => setCustomerName(name);

  return (
    <div className={`pos-container ${darkMode ? "dark-mode" : "light-mode"}`}>
      <Sidebar darkMode={darkMode} />
      <div className="main-content">
        <Header currentTime={currentTime} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <div className="content">
          <div className="grid-container">
            <Pos_Calculator
              darkMode={darkMode}
              selectedItems={selectedItems}
              currentItem={currentItem}
              totalValue={totalValue}
              inputScreenText={inputScreenText}
              onBarcodeSearch={handleBarcodeSearch}
              barcodeInput={barcodeInput}
              setBarcodeInput={setBarcodeInput}
              customerName={customerName}
              barcodeInputRef={barcodeInputRef}
            />
            <div className="category-section">
              <CategoryTabs activeTab={activeTab} onTabChange={handleTabChange} darkMode={darkMode} />
              <CategoryGrid
                items={activeTab === "category" ? fetchCustomCategories : quickAccess}
                onCategorySelect={handleCategorySelect}
              />
              <div className="action-buttons">
                <Numpad darkMode={darkMode} onNumpadClick={handleNumpadClick} />
                <PaymentButtons onCustomerAdded={handleCustomerAdded} />
                <FunctionButtons activeTab={activeTab} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pos;