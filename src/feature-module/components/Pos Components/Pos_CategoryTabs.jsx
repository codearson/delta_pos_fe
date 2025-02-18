import React from "react";
import clsx from "clsx";
import "../../../style/scss/components/Pos Components/Pos_CategoryTabs.scss";
import PropTypes from "prop-types";

// Define PropTypes before the component function
const Pos_CategoryTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex rounded-lg overflow-hidden shadow-lg">
      <button
        className={clsx(
          "flex-1 py-2 text-lg font-bold transition-colors",
          activeTab === "category" ? "bg-pos-green text-white"
            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
        )}
        onClick={() => onTabChange("category")}
      >
        Category
      </button>
      <button
        className={clsx(
          "flex-1 py-2 text-lg font-bold transition-colors",
          activeTab === "quick" ? "bg-pos-purple text-white"
            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
        )}
        onClick={() => onTabChange("quick")}
      >
        Quick Access
      </button>
    </div>
  );
};

// Now, define PropTypes after the component
Pos_CategoryTabs.propTypes = {
  activeTab: PropTypes.oneOf(["category", "quick"]).isRequired,
  onTabChange: PropTypes.func.isRequired,
};

export default Pos_CategoryTabs;
