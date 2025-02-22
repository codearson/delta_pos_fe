import React from "react";
import PropTypes from "prop-types"; // Import PropTypes
import { Link } from "react-router-dom";
import ImageWithBasePath from "../../../core/img/imagewithbasebath";
import "../../../style/scss/components/Pos Components/Pos_Sidebar.scss";

const Pos_Sidebar = ({ darkMode }) => {
  return (
    <aside className={`sidebar-container ${darkMode ? "dark-mode" : "light-mode"}`}>
      <div className="logo-container">
        <h1 className="logo-text">Delta POS</h1>
      </div>
      <div className="sidebar-footer">
        <div className="profile-circle">
          A
        </div>
        <Link to="/signIn" className="logout-button">
          <ImageWithBasePath
            src="assets/img/icons/log-out.svg"
            alt="Logout"
            className="logout-icon"
          />
        </Link>
      </div>
    </aside>
  );
};

// Add PropTypes validation
Pos_Sidebar.propTypes = {
  darkMode: PropTypes.bool.isRequired, // Validate darkMode as a required boolean
};

export default Pos_Sidebar;