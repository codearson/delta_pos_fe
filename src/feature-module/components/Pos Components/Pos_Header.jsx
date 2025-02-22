import React from "react";
import { format } from "date-fns";
import "../../../style/scss/components/Pos Components/Pos_Header.scss";
import PropTypes from 'prop-types';

export const Pos_Header = ({ currentTime, darkMode, toggleDarkMode  }) => {
  return (
    <header className={`flex justify-end items-center h-16 px-4 border-b border-gray-700 bg-gray-900 ${darkMode ? "dark-header" : "light-header"}`}>
    <button onClick={toggleDarkMode} className="toggle-mode-btn">
      {darkMode ? "🌙" : "☀️"}
    </button>
     
      <div className="flex items-center gap-4 text-right">
        <div className="text-base font-semibold text-gray-300">
          {format(currentTime, "EEEE, dd MMM yyyy")}
        </div>


        <div className="text-2xl font-bold text-pos-blue">
          {format(currentTime, "HH:mm:ss")}
        </div>
      </div>
    </header>
  );
};

Pos_Header.propTypes = {
  currentTime: PropTypes.string.isRequired,
  darkMode: PropTypes.bool.isRequired,
  toggleDarkMode: PropTypes.func.isRequired,
};

export default Pos_Header;
