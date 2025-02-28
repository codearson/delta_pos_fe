import React from "react";
import PropTypes from "prop-types";
import PropTypes from "prop-types";
import "../../../style/scss/components/Pos Components/Pos_Numpad.scss";

const Pos_Numpad = ({ darkMode, onNumpadClick }) => {
  return (
    <div className={`numpad-container ${darkMode ? "dark-mode" : "light-mode"}`}>
      <div className="numpad-grid">
        {[7, 8, 9, 4, 5, 6, 1, 2, 3, "00", 0, "."].map((num) => (
          <button
            key={num}
            className={`numpad-button ${darkMode ? "dark-button" : "light-button"}`}
            onClick={() => onNumpadClick({ type: "number", value: num })}
            onKeyUp={(e) => e.key === num.toString() && onNumpadClick({ type: "number", value: num })}
          >
            {num}
          </button>
        ))}
        <button
          className="numpad-button clear-button"
          onClick={() => onNumpadClick({ type: "clear" })}
          onKeyUp={(e) => e.key === "C" && onNumpadClick({ type: "clear" })}
        >
          C
        </button>
        <button
          className="numpad-button multiply-button"
          onClick={() => onNumpadClick({ type: "multiply" })}
          onKeyUp={(e) => e.key === "×" && onNumpadClick({ type: "multiply" })}
        >
          ×
        </button>
        <button
          className="numpad-button enter-button"
          onClick={() => onNumpadClick({ type: "enter" })}
          onKeyUp={(e) => e.key === "Enter" && onNumpadClick({ type: "enter" })}
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
  darkMode: PropTypes.bool.isRequired,
};

export default Pos_Numpad;