import React, { useEffect, useState } from "react";
import { categories, quickAccess } from "../../core/json/Posdata";
import Header from "../components/Pos Components/Pos_Header";
import Sidebar from "../components/Pos Components/Pos_Sidebar";
import Calculator from "../components/Pos Components/Pos_Calculator";
import CategoryTabs from "../components/Pos Components/Pos_CategoryTabs"
import CategoryGrid from "../components/Pos Components/Pos_CategoryGrid"
import Numpad from "../components/Pos Components/Pos_Numpad"
import PaymentButtons from "../components/Pos Components/Pos_Payment"
import FunctionButtons from "../components/Pos Components/Pos_Function"

const Pos = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("category");
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");
  const [pageIndex, setPageIndex] = useState(0);

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
    setPageIndex(0);
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
            <Calculator darkMode={darkMode} />
            <div className="category-section">
              <CategoryTabs
                activeTab={activeTab}
                onTabChange={handleTabChange}
                darkMode={darkMode}
              />
              <CategoryGrid
                items={activeTab === "category" ? categories : quickAccess}
                darkMode={darkMode}
                pageIndex={pageIndex}
                onPageChange={setPageIndex}
              />
              <div className="action-buttons">
                <Numpad darkMode={darkMode} />
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