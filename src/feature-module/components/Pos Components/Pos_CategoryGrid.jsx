import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "../../../style/scss/components/Pos Components/Pos_CategoryGrid.scss";
import { fetchCustomCategories, quickAccess } from "../../../core/json/Posdata";
import Pos_BarcodeCreation from "./Pos_BarcodeCreation";

const PAGE_SIZE = 15;

const Pos_CategoryGrid = ({ items = fetchCustomCategories, onCategorySelect }) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [showBarcodePopup, setShowBarcodePopup] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (typeof items === "function") {
      items().then((fetchedCategories) => {
        setCategories(fetchedCategories);
        setPageIndex(0);
      });
    } else {
      setCategories(items);
      setPageIndex(0);
    }
  }, [items]);

  const start = pageIndex * PAGE_SIZE;
  const end = start + PAGE_SIZE;

  const filteredCategories = items === fetchCustomCategories ? categories : items;

  let paginatedItems = filteredCategories.slice(start, end);

  if (items === quickAccess) {
    paginatedItems = paginatedItems.map((item) =>
      item.name === "Label Print" ? { ...item, isLabelPrint: true } : item
    );
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

  if (items === fetchCustomCategories && end < filteredCategories.length) {
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
  items: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        name: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
      })
    ),
    PropTypes.func,
  ]),
  onCategorySelect: PropTypes.func.isRequired,
};

export default Pos_CategoryGrid;