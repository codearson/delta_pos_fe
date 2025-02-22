import React from "react";
import clsx from "clsx";
import "../../../style/scss/components/Pos Components/Pos_CategoryTabs.scss";
import PropTypes from "prop-types";

const Pos_CategoryTabs = ({ activeTab, onTabChange, darkMode }) => {
  return (
    <div className="category-tabs-container">
      <button
        className={clsx(
          "category-tab",
          activeTab === "category"
            ? "active-tab category-tab-active"
            : "inactive-tab",
          darkMode ? "dark-mode" : "light-mode"
        )}
        onClick={() => onTabChange("category")}
      >
        Category
      </button>
      <button
        className={clsx(
          "category-tab",
          activeTab === "quick"
            ? "active-tab quick-access-tab"
            : "inactive-tab",
          darkMode ? "dark-mode" : "light-mode"
        )}
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