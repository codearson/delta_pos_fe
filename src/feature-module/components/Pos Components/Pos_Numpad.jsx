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
        <button
          className={`numpad-button ${darkMode ? "dark-button" : "light-button"}`}
          onClick={() => handleButtonClick("number", 7)}
        >
          7
        </button>
        <button
          className={`numpad-button ${darkMode ? "dark-button" : "light-button"}`}
          onClick={() => handleButtonClick("number", 8)}
        >
          8
        </button>
        <button
          className={`numpad-button ${darkMode ? "dark-button" : "light-button"}`}
          onClick={() => handleButtonClick("number", 9)}
        >
          9
        </button>
        <button
          className={`numpad-button ${darkMode ? "dark-button" : "light-button"}`}
          onClick={() => handleButtonClick("number", 4)}
        >
          4
        </button>
        <button
          className={`numpad-button ${darkMode ? "dark-button" : "light-button"}`}
          onClick={() => handleButtonClick("number", 5)}
        >
          5
        </button>
        <button
          className={`numpad-button ${darkMode ? "dark-button" : "light-button"}`}
          onClick={() => handleButtonClick("number", 6)}
        >
          6
        </button>
        <button
          className={`numpad-button ${darkMode ? "dark-button" : "light-button"}`}
          onClick={() => handleButtonClick("number", 1)}
        >
          1
        </button>
        <button
          className={`numpad-button ${darkMode ? "dark-button" : "light-button"}`}
          onClick={() => handleButtonClick("number", 2)}
        >
          2
        </button>
        <button
          className={`numpad-button ${darkMode ? "dark-button" : "light-button"}`}
          onClick={() => handleButtonClick("number", 3)}
        >
          3
        </button>
        <button
          className={`numpad-button ${darkMode ? "dark-button" : "light-button"}`}
          onClick={() => handleButtonClick("number", ".")}
        >
          .
        </button>
        <button
          className={`numpad-button ${darkMode ? "dark-button" : "light-button"}`}
          onClick={() => handleButtonClick("number", 0)}
        >
          0
        </button>
        <button
          className="numpad-button enter-button double-height"
          onClick={() => handleButtonClick("enter", null)}
        >
          Enter
        </button>
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
      </div>
    </div>
  );
};

Pos_Numpad.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  onNumpadClick: PropTypes.func.isRequired,
};

export default Pos_Numpad;