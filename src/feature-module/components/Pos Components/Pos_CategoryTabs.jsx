import React from "react";
import clsx from "clsx";
import "../../../style/scss/components/Pos Components/Pos_CategoryTabs.scss";
import PropTypes from "prop-types";

const Pos_CategoryTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex rounded-lg overflow-hidden shadow-lg">
      <button
        className={clsx(
          "flex-1 py-3 text-lg font-bold transition-colors",
          activeTab === "category"
            ? "bg-pos-green text-white category-tab-active"
            : "bg-gray-700 text-gray-300 hover:bg-gray-500"
        )}
        onClick={() => onTabChange("category")}
      >
        Category
      </button>
      <button
        className={clsx(
          "flex-1 py-3 text-lg font-bold transition-colors",
          activeTab === "quick"
            ? "bg-pos-purple text-white category-tab-active"
            : "bg-gray-700 text-gray-300"
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
};

export default Pos_CategoryTabs;
