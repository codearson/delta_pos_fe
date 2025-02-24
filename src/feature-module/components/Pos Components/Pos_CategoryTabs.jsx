import React from "react";
import clsx from "clsx";
import "../../../style/scss/components/Pos Components/Pos_CategoryTabs.scss";
import PropTypes from "prop-types";

const Pos_CategoryTabs = ({ activeTab, onTabChange, darkMode }) => {
  return (
    <div className="category-tabs-container" style={{ height: '50px' }}>
      <button
        className={clsx(
          "category-tab",
          activeTab === "category" ? "active-tab" : "inactive-tab",
          darkMode ? "dark-mode" : "light-mode"
        )}
        onClick={() => onTabChange("category")}
        style={{
          backgroundColor: activeTab === "category" ? "#4CAF50" : "", // Green background
          color: "white",
          borderRadius: "8px 0 0 0",
          flex: 1,
          height: '100%' // Full height of container
        }}
      >
        Category
      </button>
      <button
        className={clsx(
          "category-tab",
          activeTab === "quick" ? "active-tab" : "inactive-tab",
          darkMode ? "dark-mode" : "light-mode"
        )}
        style={{
          backgroundColor: activeTab === "quick" ? "#9C27B0" : "", // Purple background
          color: "white",
          borderRadius: "0 8px 0 0",
          flex: 1,
          height: '100%' // Full height of container
        }}
        onClick={() => onTabChange("quick")}
      >
        Quick Access
      </button>
    </div>
  );
};

Pos_CategoryTabs.propTypes = {
  activeTab: PropTypes.oneOf(["category", "quick"]).isRequired,
  onTabChange: PropTypes.func.isRequired,
  darkMode: PropTypes.bool.isRequired,
};

export default Pos_CategoryTabs;