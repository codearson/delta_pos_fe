import React from "react";
import PropTypes from "prop-types"; // Import PropTypes
import "../../../style/scss/components/Pos Components/Pos_Numpad.scss";

const Pos_Numpad = ({ darkMode }) => {
  return (
    <div className={`numpad-container ${darkMode ? "dark-mode" : "light-mode"}`}>
      <div className="numpad-grid">
        {[7, 8, 9, 4, 5, 6, 1, 2, 3, "00", 0, "."].map((num) => (
          <button
            key={num}
            className={`numpad-button ${darkMode ? "dark-button" : "light-button"}`}
          >
            {num}
          </button>
        ))}
        <button className="numpad-button clear-button">C</button>
        <button className="numpad-button multiply-button">×</button>
        <button className="numpad-button enter-button">Enter</button>
      </div>
    </div>
  );
};

// Add PropTypes validation
Pos_Numpad.propTypes = {
  darkMode: PropTypes.bool.isRequired, // Validate darkMode as a required boolean
};

export default Pos_Numpad;