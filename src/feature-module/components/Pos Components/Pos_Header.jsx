import React from "react";
import { format } from "date-fns";
import "../../../style/scss/components/Pos Components/Pos_Header.scss";
import PropTypes from 'prop-types';

export const Pos_Header = ({ currentTime, darkMode, toggleDarkMode }) => {
  return (
    <header className={`pos-header ${darkMode ? "dark-header" : "light-header"}`}>
      <button onClick={toggleDarkMode} className="toggle-mode-btn">
        {darkMode ? "🌙" : "☀️"}
      </button>

      <div className="time-display">
        <div className="date">
          {format(currentTime, "EEEE, dd MMM yyyy")}
        </div>
        <div className="time">
          {format(currentTime, "HH:mm:ss")}
        </div>
      </div>
    </header>
  );
};

Pos_Header.propTypes = {
  currentTime: PropTypes.instanceOf(Date).isRequired,
  darkMode: PropTypes.bool.isRequired,
  toggleDarkMode: PropTypes.func.isRequired,
};

export default Pos_Header;