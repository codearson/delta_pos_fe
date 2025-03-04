import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "../../../style/scss/components/Pos Components/Pos_CategoryGrid.scss";
import { categories, quickAccess } from "../../../core/json/Posdata";
import Pos_BarcodeCreation from "./Pos_BarcodeCreation";

const PAGE_SIZE = 15; // Keep 15 items per page

const Pos_CategoryGrid = ({ items = categories, onCategorySelect }) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [showBarcodePopup, setShowBarcodePopup] = useState(false);

  useEffect(() => {
    setPageIndex(0);
  }, [items]);

  const start = pageIndex * PAGE_SIZE;
  const end = start + PAGE_SIZE;

  // Filter out duplicate "Home Essentials" (keep ID 2, remove ID 15)
  const filteredCategories = items === categories
    ? categories.filter((item) => item.id !== 15) // Remove the second Home Essentials (ID 15)
    : items;

  let paginatedItems = filteredCategories.slice(start, end);

  // Add Label Print to the category page's next page (after More)
  if (items === categories && end >= filteredCategories.length) {
    paginatedItems = [
      ...paginatedItems,
      { id: "label-print", name: "Label Print", icon: "🏷️", isLabelPrint: true },
    ];
  }

  // Handle Quick Access: Replace "Quick 14" with "Label Print" on the first page, move "Quick 14" to the next page
  if (items === quickAccess) {
    if (pageIndex === 0) {
      // First page: Replace Quick 14 with Label Print
      const modifiedItems = [...quickAccess];
      const quick14Index = modifiedItems.findIndex((item) => item.id === 14);
      if (quick14Index !== -1) {
        modifiedItems[quick14Index] = { id: "label-print", name: "Label Print", icon: "🏷️", isLabelPrint: true };
      }
      paginatedItems = modifiedItems.slice(start, end);
    } else if (pageIndex > 0 && end > quickAccess.length) {
      // Next page: Add Quick 14 if it was replaced
      const quick14 = { id: 14, name: "Quick 14", icon: "🌟" };
      paginatedItems = [
        ...paginatedItems,
        quick14,
        { id: "label-print", name: "Label Print", icon: "🏷️", isLabelPrint: true },
      ];
    }
  }

  // Add navigation buttons (Prev/More) if applicable
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

  // Ensure "More" button is in the 15th tile for category page
  if (items === categories && end < filteredCategories.length) {
    paginatedItems = [
      ...paginatedItems.slice(0, 14), // First 14 items
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