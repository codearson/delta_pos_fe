import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
    document.body.classList.toggle("dark-mode", newMode);
  };

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
  };

  const handleCategorySelect = (category) => {
    if (activeTab === "category") {
      if (!category || !category.name) {
        return;
      }
      if (!currentItem && inputStage === "qty" && inputValue !== "0" && inputValue !== "") {
        const qty = parseFloat(inputValue) || 1;
        setCurrentItem({ name: category.name, qty, price: null, total: null });
        setHasCategory(true);
        setInputValue("0");
        setInputScreenText(`${qty}`);
      } else if (currentItem && inputStage === "qty") {
        setCurrentItem({ ...currentItem, name: category.name });
        setHasCategory(true);
        setInputScreenText(`${currentItem.qty}`);
      }
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
          setCurrentItem({ ...currentItem, name: "Undefined Item" });
          setHasCategory(false);
          setInputStage("qty");
          setInputValue("0");
          setInputScreenText(`${currentItem.qty}`);
        } else if (currentItem.qty !== null) {
          setCurrentItem(null);
          setInputStage("qty");
          setInputValue("0");
          setInputScreenText("");
        }
      } else if (selectedItems.length > 0) {
        const newItems = selectedItems.slice(0, -1);
        setSelectedItems(newItems);
        setTotalValue(newItems.reduce((sum, item) => sum + item.total, 0));
      } else {
        setInputValue("0");
        setTotalValue(0);
        setInputStage("qty");
        setInputScreenText("");
      }
    } else if (type === "number") {
      let newInput = inputValue === "0" && value !== "." ? value.toString() : inputValue + value.toString();
      const parts = newInput.split(".");
      const numPart = parts[0] || "0";
      const decPart = parts[1] || "";

      if (numPart.length <= 5 && (decPart.length <= 2 || !decPart)) {
        if (value === "." && decPart) return;
        if (inputStage === "qty") {
          const qty = parseFloat(newInput) || 1;
          setCurrentItem({ qty, name: currentItem?.name || "Undefined Item", price: currentItem?.price || null, total: null });
          setInputScreenText(`${newInput}`);
          setInputValue(newInput);
        } else if (inputStage === "price" && currentItem && hasCategory) {
          const price = parseFloat(newInput) || 0;
          setCurrentItem({ ...currentItem, price, total: null });
          setInputScreenText(`${currentItem.qty} × ${newInput}`);
          setInputValue(newInput);
        } else {
          return;
        }
      }
    } else if (type === "multiply") {
      if (currentItem && currentItem.qty !== null && inputStage === "qty" && hasCategory) {
        setInputStage("price");
        setInputValue("0");
        setInputScreenText(`${currentItem.qty} ×`);
      }
    } else if (type === "enter") {
      if (currentItem && inputStage === "price" && hasCategory && currentItem.name && currentItem.price !== null) {
        const price = parseFloat(inputValue) || 0;
        const total = currentItem.qty * price;
        const newItem = { name: currentItem.name, qty: currentItem.qty, price, total };
        const newItems = [...selectedItems, newItem];
        setSelectedItems(newItems);
        setTotalValue(newItems.reduce((sum, item) => sum + item.total, 0));
        setCurrentItem(null);
        setHasCategory(false);
        setInputStage("qty");
        setInputValue("0");
        setInputScreenText("");
      } else if (currentItem && inputStage === "qty" && hasCategory && currentItem.price !== null) {
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
      }
    }
  };

  const handleBarcodeSearch = async (barcode) => {
    if (barcode.length < 3) return;

    try {
      const product = await getProductByBarcode(barcode);

      if (product && product.responseDto && product.responseDto.length > 0) {
        const productData = product.responseDto[0];
        const { name, pricePerUnit } = productData;
        if (name && pricePerUnit !== undefined) {
          setCurrentItem({
            name,
            qty: null,
            price: pricePerUnit,
            total: null,
          });
          setHasCategory(true);
          setInputStage("qty");
          setInputValue("");
          setInputScreenText("");
          setBarcodeInput("");
        } else {
          setCurrentItem({ name: "Undefined Item", qty: 1, price: null, total: null });
          setHasCategory(false);
          setBarcodeInput("");
        }
      } else {
        setCurrentItem({ name: "Undefined Item", qty: 1, price: null, total: null });
        setHasCategory(false);
        setBarcodeInput("");
      }
    } catch (error) {
      setCurrentItem({ name: "Undefined Item", qty: 1, price: null, total: null });
      setHasCategory(false);
      setBarcodeInput("");
    }
  };

  const handleCustomerAdded = (name) => {
    setCustomerName(name);
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
              currentItem={currentItem}
              totalValue={totalValue}
              inputScreenText={inputScreenText}
              onBarcodeSearch={handleBarcodeSearch}
              barcodeInput={barcodeInput}
              setBarcodeInput={setBarcodeInput}
              customerName={customerName}
            />
            <div className="category-section">
              <CategoryTabs
                activeTab={activeTab}
                onTabChange={handleTabChange}
                darkMode={darkMode}
              />
              <CategoryGrid
                items={activeTab === "category" ? fetchCustomCategories : quickAccess}
                onCategorySelect={handleCategorySelect}
              />
              <div className="action-buttons">
                <Numpad darkMode={darkMode} onNumpadClick={handleNumpadClick} />
                <PaymentButtons />
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