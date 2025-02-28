import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "../../../style/scss/components/Pos Components/Pos_CategoryGrid.scss";
import { categories } from "../../../core/json/Posdata";

const PAGE_SIZE = 14;

const Pos_CategoryGrid = ({ items = categories, onCategorySelect }) => {
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
    const handleClick = () => {
      if (item.isPrev) {
        setPageIndex(pageIndex - 1);
      } else {
        onCategorySelect(item);
      }
    };

    return (
      <button
        key={item.id}
        className="category-btn group"
        onClick={handleClick}
      >
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
  onCategorySelect: PropTypes.func.isRequired,
};

export default Pos_CategoryGrid;