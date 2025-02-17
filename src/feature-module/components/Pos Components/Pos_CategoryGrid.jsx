import React from "react";
import { Button } from "react-bootstrap";
import "../../../style/scss/components/Pos Components/Pos_CategoryGrid.scss";
import { categories } from "../../../core/json/Posdata";
import PropTypes from "prop-types";

// Declare the component first
const Pos_CategoryGrid = ({ items }) => {
  return (
    <div className="grid grid-cols-5 gap-2">
      {items.map((item) => (
        
          <button key={item.id} className="bg-pos-blue hover:bg-blue-500 p-2 rounded-lg text-center transition-colors shadow-lg group">
            <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">{item.icon}</div>
            <div className="font-medium text-sm truncate px-1">{item.name}</div>
          </button>
        
      ))}
      {items === categories && (
          <Button
            className="bg-pos-blue hover:bg-blue-500 p-2 rounded-lg text-center transition-colors shadow-lg group"
            onClick={() => console.log("More categories clicked")}
          >
            <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">➡️</div>
            <div className="font-medium text-sm truncate px-1">More</div>
          </Button>
      )}
    </div>
  );
};

// Define PropTypes after the component declaration
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
