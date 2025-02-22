import React from "react";
import "../../../style/scss/components/Pos Components/Pos_CategoryGrid.scss";
import { categories } from "../../../core/json/Posdata";
import PropTypes from "prop-types";

const renderCategoryButton = (item) => (
  <button
    key={item.id}
    className="category-btn group"
  >
    <div className="text-2xl mb-1 transition-transform">
      {item.icon}
    </div>
    <div className="font-medium text-sm truncate px-1">{item.name}</div>
  </button>
);

const Pos_CategoryGrid = ({ items }) => {
  return (
    <div className="grid grid-cols-5 gap-2">
      {items.map((item) => renderCategoryButton(item))}
      {items === categories && (
        <div
          className="category-btn group"
          onClick={() => console.log("More categories clicked")}
        >
          <div className="text-2xl mb-1 transition-transform">
            ➡️
          </div>
          <div className="font-medium text-sm truncate px-1">More</div>
        </div>
      )}
    </div>
  );
};

Pos_CategoryGrid.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
      price: PropTypes.number,
      description: PropTypes.string
    })
  ).isRequired,
};

export default Pos_CategoryGrid;
