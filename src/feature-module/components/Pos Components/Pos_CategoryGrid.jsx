import React, { useState, useEffect } from "react";
import "../../../style/scss/components/Pos Components/Pos_CategoryGrid.scss";
import PropTypes from "prop-types";
import { categories } from "../../../core/json/Posdata";

const PAGE_SIZE = 14;

const Pos_CategoryGrid = ({ items = categories }) => {
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    setPageIndex(0);
  }, [items]);

  const start = pageIndex * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  let paginatedItems = items.slice(start, end);

  if (pageIndex > 0) {
    paginatedItems = [
      {
        id: "prev",
        name: "Prev",
        icon: "⬅️",
        isPrev: true,
      },
      ...paginatedItems.slice(1),
    ];
  }

  const renderCategoryButton = (item) => {
    if (item.isPrev) {
      return (
        <button
          key="prev"
          className="category-btn group"
          onClick={() => setPageIndex(pageIndex - 1)}
        >
          <div className="text-2xl mb-1 transition-transform">{item.icon}</div>
          <div className="font-medium text-sm truncate px-1">{item.name}</div>
        </button>
      );
    }

    return (
      <button key={item.id} className="category-btn group">
        <div className="text-2xl mb-1 transition-transform">{item.icon}</div>
        <div className="font-medium text-sm truncate px-1">{item.name}</div>
      </button>
    );
  };

  return (
    <div className="size">
      <div className="grid grid-cols-5 gap-2">
        {paginatedItems.map(renderCategoryButton)}

        {end < items.length && (
          <button
            className="category-btn group"
            onClick={() => setPageIndex(pageIndex + 1)}
          >
            <div className="text-2xl mb-1 transition-transform">➡️</div>
            <div className="font-medium text-sm truncate px-1">More</div>
          </button>
        )}
      </div>
    </div>
  );
};

Pos_CategoryGrid.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      name: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
    })
  ),
};

export default Pos_CategoryGrid;
