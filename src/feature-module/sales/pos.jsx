import React, { useEffect, useState } from "react";
import { categories, quickAccess } from "../../core/json/Posdata"; // Assuming this path is correct
import Header from "../components/Pos Components/Pos_Header";
import Sidebar from "../components/Pos Components/Pos_Sidebar";
import Pos_Calculator from "../components/Pos Components/Pos_Calculator";
import CategoryTabs from "../components/Pos Components/Pos_CategoryTabs";;
import CategoryGrid from "../components/Pos Components/Pos_CategoryGrid";;
import Numpad from "../components/Pos Components/Pos_Numpad";;
import PaymentButtons from "../components/Pos Components/Pos_Payment";;
import FunctionButtons from "../components/Pos Components/Pos_Function";;

const Pos = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("category");
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");
  const [selectedItems, setSelectedItems] = useState([]); // Array for completed bill items
  const [currentItem, setCurrentItem] = useState(null); // Track in-progress undefined item
  const [inputValue, setInputValue] = useState("0"); // Initialize with "0", max 5 digits before decimal, 2 after
  const [inputStage, setInputStage] = useState("qty"); // Track input stage: "qty" then "price" (after multiply)
  const [hasCategory, setHasCategory] = useState(false); // Track if category is selected
  const [totalValue, setTotalValue] = useState(0); // Total bill value
  const [inputScreenText, setInputScreenText] = useState(""); // Text for input-screen-box

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
      if (!hasCategory && inputStage === "qty" && inputValue !== "0" && inputValue !== "") {
        if (!category || !category.name) {
          console.warn("Cannot select an item without a valid category/name.");
          return;
        }
        const qty = parseFloat(inputValue) || 1;
        setCurrentItem({ name: category.name, qty, price: null, total: null });
        setHasCategory(true);
        setInputValue("0"); // Reset for price input
        setInputScreenText(`${qty}`); // Show only qty in input-screen-box
      } else if (hasCategory && inputStage === "qty" && inputValue === "0") {
        if (!category || !category.name) {
          console.warn("Cannot update with an invalid category/name.");
          return;
        }
        if (currentItem && currentItem.qty) {
          setCurrentItem({ ...currentItem, name: category.name });
          setInputScreenText(`${currentItem.qty}`); // Update input-screen-box with locked qty
        }
      } else {
        console.warn("Please enter a quantity first, or wait until after multiply to proceed.");
      }
    }
  };

  const handleNumpadClick = (action) => {
    const { type, value } = action;

    if (type === "clear") {
      if (currentItem) {
        // Undo the most recent step in currentItem
        if (currentItem.price !== null) {
          // If price is set, remove it and go back to price input stage
          setCurrentItem({ ...currentItem, price: null, total: null });
          setInputStage("price");
          setInputValue("0");
          setInputScreenText(`${currentItem.qty} ×`);
        } else if (inputStage === "price" && hasCategory) {
          // If in price stage but no price yet, go back to qty stage
          setInputStage("qty");
          setInputValue(currentItem.qty.toString()); // Restore qty as editable
          setInputScreenText(`${currentItem.qty}`);
        } else if (hasCategory) {
          // If category is set but no price stage yet, remove category
          setHasCategory(false);
          setCurrentItem({ ...currentItem, name: "Undefined Item" });
          setInputScreenText(`${currentItem.qty}`);
        } else if (currentItem.qty !== null) {
          // If only qty is set, clear currentItem entirely
          setCurrentItem(null);
          setInputStage("qty");
          setInputValue("0");
          setInputScreenText("");
        }
      } else if (selectedItems.length > 0) {
        // Only remove the last completed item if no currentItem is in progress
        const newItems = selectedItems.slice(0, -1);
        setSelectedItems(newItems);
        setTotalValue(newItems.reduce((sum, item) => sum + item.total, 0));
      } else {
        // Reset everything if nothing to undo
        setInputValue("0");
        setTotalValue(0);
        setInputStage("qty");
        setInputScreenText("");
      }
    } else if (type === "number") {
      // Validate input: max 5 digits before decimal, 2 after decimal, handle decimal
      let newInput = inputValue === "0" && value !== "." ? value.toString() : inputValue + value.toString();
      const parts = newInput.split(".");
      const numPart = parts[0] || "0"; // Digits before decimal
      const decPart = parts[1] || ""; // Digits after decimal

      if (numPart.length <= 5 && (decPart.length <= 2 || !decPart)) {
        if (value === "." && decPart) {
          // Prevent multiple decimal points
          return;
        }
        if (inputStage === "qty" && !hasCategory) {
          setCurrentItem({ qty: parseFloat(newInput) || 1, name: "Undefined Item", price: null, total: null });
          setInputScreenText(`${parseFloat(newInput) || 1}`);
        } else if (inputStage === "price" && currentItem && hasCategory && inputValue !== null) {
          const price = parseFloat(newInput) || 0;
          setCurrentItem({ ...currentItem, price, total: null }); // Update price as typed, no total yet
          setInputScreenText(`${currentItem.qty} × ${newInput}`); // Show raw input in input-screen-box
        } else {
          console.warn("Please click the '×' button before entering the price, or wait until after clearing the category to change quantity.");
          return;
        }
        setInputValue(newInput);
      }
    } else if (type === "multiply") {
      if (currentItem && currentItem.qty !== null && inputStage === "qty" && hasCategory) {
        setInputStage("price");
        setInputValue("0");
        setInputScreenText(`${currentItem.qty} ×`);
      } else {
        console.warn("Please enter quantity and select a category before multiplying.");
      }
    } else if (type === "enter") {
      if (currentItem && inputStage === "price" && hasCategory && currentItem.name && currentItem.price !== null) {
        const price = parseFloat(inputValue) || 0;
        const total = currentItem.qty * price;
        const newItem = {
          name: currentItem.name,
          qty: currentItem.qty,
          price,
          total,
        };
        const newItems = [...selectedItems, newItem];
        setSelectedItems(newItems);
        setTotalValue(newItems.reduce((sum, item) => sum + item.total, 0));
        setCurrentItem(null);
        setHasCategory(false);
        setInputStage("qty");
        setInputValue("0");
        setInputScreenText("");
      } else {
        console.warn("Cannot add item: Missing category, price, quantity, or incorrect order.");
      }
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
        />
        <div className="content">
          <div className="grid-container">
            <Pos_Calculator
              darkMode={darkMode}
              selectedItems={selectedItems}
              currentItem={currentItem}
              totalValue={totalValue}
              inputScreenText={inputScreenText}
            />
            <div className="category-section">
              <CategoryTabs
                activeTab={activeTab}
                onTabChange={handleTabChange}
                darkMode={darkMode}
              />
              <CategoryGrid
                items={activeTab === "category" ? categories : quickAccess}
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