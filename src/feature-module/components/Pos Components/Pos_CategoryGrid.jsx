import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "../../../style/scss/components/Pos Components/Pos_CategoryGrid.scss";
import { categories, quickAccess } from "../../../core/json/Posdata";
import Pos_BarcodeCreation from "./Pos_BarcodeCreation";

const PAGE_SIZE = 15; 

const Pos_CategoryGrid = ({ items = categories, onCategorySelect }) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [showBarcodePopup, setShowBarcodePopup] = useState(false);

  useEffect(() => {
    setPageIndex(0);
  }, [items]);

  const start = pageIndex * PAGE_SIZE;
  const end = start + PAGE_SIZE;

  const filteredCategories = items === categories
    ? categories.filter((item) => item.id !== 15) 
    : items;

  let paginatedItems = filteredCategories.slice(start, end);

  if (items === categories && end >= filteredCategories.length) {
    paginatedItems = [
      ...paginatedItems,
      { id: "label-print", name: "Label Print", icon: "🏷️", isLabelPrint: true },
    ];
  }

  if (items === quickAccess) {
    if (pageIndex === 0) {
      const modifiedItems = [...quickAccess];
      const quick14Index = modifiedItems.findIndex((item) => item.id === 14);
      if (quick14Index !== -1) {
        modifiedItems[quick14Index] = { id: "label-print", name: "Label Print", icon: "🏷️", isLabelPrint: true };
      }
      paginatedItems = modifiedItems.slice(start, end);
    } else if (pageIndex > 0 && end > quickAccess.length) {
      const quick14 = { id: 14, name: "Quick 14", icon: "🌟" };
      paginatedItems = [
        ...paginatedItems,
        quick14,
        { id: "label-print", name: "Label Print", icon: "🏷️", isLabelPrint: true },
      ];
    }
  }

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

  if (items === categories && end < filteredCategories.length) {
    paginatedItems = [
      ...paginatedItems.slice(0, 14), 
      {
        id: "more",
        name: "More",
        icon: "➡️",
        isMore: true,
      },
    ];
  }

  const renderCategoryButton = (item) => {
    const handleClick = () => {
      if (item.isPrev) {
        setPageIndex(pageIndex - 1);
      } else if (item.isMore) {
        setPageIndex(pageIndex + 1);
      } else if (item.isLabelPrint) {
        setShowBarcodePopup(true);
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
        <div className="text-2xl mb-1 transition-transform group-hover:scale-110">
          {item.icon}
        </div>
        <div className="font-medium text-sm truncate px-1">{item.name}</div>
      </button>
    );
  };

  return (
    <div className="size">
      <div className="grid grid-cols-5 gap-2">
        {paginatedItems.map(renderCategoryButton)}
      </div>
      {showBarcodePopup && (
        <Pos_BarcodeCreation onClose={() => setShowBarcodePopup(false)} />
      )}
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