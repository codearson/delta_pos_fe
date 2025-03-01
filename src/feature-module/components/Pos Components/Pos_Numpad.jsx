import React from "react";
import PropTypes from "prop-types";
import "../../../style/scss/components/Pos Components/Pos_Numpad.scss";

const Pos_Numpad = ({ darkMode, onNumpadClick }) => {
  const handleButtonClick = (type, value) => {
    if (onNumpadClick) {
      onNumpadClick({ type, value });
    }
  };

  return (
    <div className={`numpad-container ${darkMode ? "dark-mode" : "light-mode"}`}>
      <div className="numpad-grid">
        {[7, 8, 9, 4, 5, 6, 1, 2, 3, "00", 0, "."].map((num) => (
          <button
            key={num}
            className={`numpad-button ${darkMode ? "dark-button" : "light-button"}`}
            onClick={() => handleButtonClick("number", num)}
          >
            {num}
          </button>
        ))}
        <button
          className="numpad-button clear-button"
          onClick={() => handleButtonClick("clear", null)}
        >
          C
        </button>
        <button
          className="numpad-button multiply-button"
          onClick={() => handleButtonClick("multiply", null)}
        >
          ×
        </button>
        <button
          className="numpad-button enter-button"
          onClick={() => handleButtonClick("enter", null)}
        >
          Enter
        </button>
      </div>
    </div>
  );
};

Pos_Numpad.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  onNumpadClick: PropTypes.func.isRequired,
};

export default Pos_Numpad;