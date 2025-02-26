import React from "react";
import PropTypes from "prop-types"; // Import PropTypes
import { Link } from "react-router-dom";
import ImageWithBasePath from "../../../core/img/imagewithbasebath";
import "../../../style/scss/components/Pos Components/Pos_Sidebar.scss";

const Pos_Sidebar = ({ darkMode }) => {
  return (
    <aside className={`sidebar-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="logo-section">
        <div className="logo-text">
          <span className="delta">Delta</span>
          <span className="pos">POS</span>
        </div>
      </div>

      <nav className="nav-section">
        <Link to="/signin" className="nav-item active">
          <div className="nav-icon home-icon">🏠</div>
        </Link>
      </nav>

      <div className="user-section">
        <div className="user-avatar">
          <div className="avatar-circle">A</div>
          <span className="user-role">Admin</span>
        </div>
        <Link
          className="dropdown-item logout pb-0"
          to="/signIn"
          onClick={() => {
            localStorage.removeItem("accessToken"); // Remove the access token
            localStorage.removeItem("userRole"); // Optionally remove the user role
            console.log("User logged out. Access token removed.");
          }}
        >
          <ImageWithBasePath
            src="assets/img/icons/log-out.svg"
            alt="img"
            className="me-2"
          />
          Logout
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