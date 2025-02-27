import React, { useEffect, useState } from "react";
import { categories, quickAccess } from "../../core/json/Posdata";
import Header from "../components/Pos Components/Pos_Header";
import Sidebar from "../components/Pos Components/Pos_Sidebar";
import Pos_Calculator from "../components/Pos Components/Pos_Calculator";
import CategoryTabs from "../components/Pos Components/Pos_CategoryTabs";
import CategoryGrid from "../components/Pos Components/Pos_CategoryGrid";
import Numpad from "../components/Pos Components/Pos_Numpad";
import PaymentButtons from "../components/Pos Components/Pos_Payment";
import FunctionButtons from "../components/Pos Components/Pos_Function";

const Pos = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("category");
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");
  const [selectedItems, setSelectedItems] = useState([]); // Array for completed bill items
  const [currentItem, setCurrentItem] = useState(null); // Track in-progress undefined item
  const [inputValue, setInputValue] = useState(""); // Numpad input (max 3 digits)
  const [inputStage, setInputStage] = useState("price"); // Track input stage: "price" or "qty"
  const [hasCategory, setHasCategory] = useState(false); // Track if category is selected
  const [totalValue, setTotalValue] = useState(0); // Total bill value

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
      if (!hasCategory) {
        // If no category yet, set it and continue with current input stage
        setCurrentItem({ name: category.name, qty: null, price: null });
        setHasCategory(true);
        if (inputStage === "qty" && inputValue) {
          setCurrentItem({ ...currentItem, qty: parseFloat(inputValue) || 1 });
          setInputValue(""); // Reset for price
        } else if (inputStage === "price" && inputValue) {
          setCurrentItem({ ...currentItem, price: parseFloat(inputValue) || 0 });
          setInputStage("qty"); // Move to qty stage
          setInputValue(""); // Reset for qty
        }
      } else {
        // If category already selected, update it
        setCurrentItem({ ...currentItem, name: category.name });
      }
    }
  };

  const handleNumpadClick = (action) => {
    const { type, value } = action;

    if (type === "clear") {
      if (selectedItems.length > 0) {
        // Remove the most recent completed item
        const newItems = selectedItems.slice(0, -1);
        setSelectedItems(newItems);
        setTotalValue(newItems.reduce((sum, item) => sum + item.qty * item.price, 0));
      } else if (currentItem) {
        // Reverse in-progress item steps
        if (currentItem.qty !== null && currentItem.price !== null) {
          setCurrentItem({ ...currentItem, qty: null });
          setInputStage("price"); // Back to price stage
          setInputValue("");
        } else if (currentItem.price !== null) {
          setCurrentItem({ ...currentItem, price: null });
          setInputStage("price"); // Back to price stage
          setInputValue("");
        } else {
          setCurrentItem(null);
          setHasCategory(false);
          setInputStage("price");
          setInputValue("");
        }
      } else {
        setInputValue("");
        setTotalValue(0);
        setCurrentItem(null);
        setHasCategory(false);
        setInputStage("price");
      }
    } else if (type === "number") {
      // Validate input: max 3 digits, handle decimal
      const newInput = inputValue + value;
      const numPart = newInput.split(".")[0];
      if (numPart.length <= 3) {
        setInputValue(newInput);
        if (currentItem) {
          if (inputStage === "price") {
            setCurrentItem({ ...currentItem, price: parseFloat(newInput) || 0 });
          } else if (inputStage === "qty") {
            setCurrentItem({ ...currentItem, qty: parseFloat(newInput) || 1 });
          }
        }
      }
    } else if (type === "multiply") {
      if (currentItem && currentItem.price !== null && inputStage === "price") {
        setInputStage("qty"); // Move to quantity input stage
        setInputValue(""); // Reset input for qty
      }
    } else if (type === "enter") {
      if (currentItem && currentItem.price !== null && currentItem.qty !== null && hasCategory) {
        // Complete the undefined item and add to selectedItems
        const newItem = {
          name: currentItem.name,
          qty: currentItem.qty,
          price: currentItem.price,
        };
        const newItems = [...selectedItems, newItem];
        setSelectedItems(newItems);
        setTotalValue(newItems.reduce((sum, item) => sum + item.qty * item.price, 0));
        setCurrentItem(null); // Clear in-progress item
        setHasCategory(false); // Reset category flag
        setInputStage("price"); // Reset to price stage
        setInputValue(""); // Reset input
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