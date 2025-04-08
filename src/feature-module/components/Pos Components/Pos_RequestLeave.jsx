import { DatePicker } from 'antd';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { saveHoliday } from '../../Api/HolidayApi';
import Swal from 'sweetalert2';
import moment from 'moment';
import "../../../style/scss/components/Pos Components/Pos_RequestLeave.scss";

const Pos_RequestLeave = ({ onClose, darkMode }) => {
  const [formData, setFormData] = useState({
    description: '',
    startDate: null,
    endDate: null,
    status: 'Pending',
    userDto: null,
    isActive: 1,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initializeUser = () => {
      const currentUserId = localStorage.getItem("userId");
      if (currentUserId) {
        setFormData(prev => ({
          ...prev,
          userDto: { id: parseInt(currentUserId) }
        }));
      } else {
        Swal.fire({
          title: "Error!",
          text: "User information not found. Please sign in again.",
          icon: "error",
        });
        onClose();
      }
    };

    initializeUser();
  }, [onClose]);

  const handleDateChange = (date, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: date ? date.format('YYYY-MM-DD') : null
    }));
  };

  const validateDates = () => {
    if (!formData.startDate || !formData.endDate) {
      return false;
    }

    const start = moment(formData.startDate, 'YYYY-MM-DD');
    const end = moment(formData.endDate, 'YYYY-MM-DD');

    if (!start.isValid() || !end.isValid()) {
      return false;
    }

    return start.isBefore(end);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.userDto) {
      Swal.fire({
        title: "Error!",
        text: "User information not available. Please sign in again.",
        icon: "error",
      });
      setIsLoading(false);
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      Swal.fire({
        title: "Error!",
        text: "Please select both start and end dates",
        icon: "error",
      });
      setIsLoading(false);
      return;
    }

    if (!validateDates()) {
      Swal.fire({
        title: "Error!",
        text: "Start date must be before end date",
        icon: "error",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await saveHoliday(formData);
      if (response) {
        Swal.fire({
          title: "Success!",
          text: "Leave request has been submitted successfully.",
          icon: "success",
        });
        setFormData({
          description: '',
          startDate: null,
          endDate: null,
          status: 'Pending',
          userDto: { id: parseInt(localStorage.getItem("userId")) },
          isActive: 1,
        });
        onClose();
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Failed to submit leave request: " + error.message,
        icon: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="request-leave-popup-overlay">
      <div className={`request-leave-popup ${darkMode ? 'dark-mode' : ''}`}>
        <div className="request-leave-header">
          <h2>Request Leave</h2>
        </div>
        <div className="request-leave-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                className="form-control"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter leave reason"
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label>Start Date</label>
              <DatePicker
                value={formData.startDate ? moment(formData.startDate, 'YYYY-MM-DD') : null}
                onChange={(date) => handleDateChange(date, 'startDate')}
                format="DD-MM-YYYY"
                className="form-control custom-date-picker"
                placeholder="Select start date"
                disabled={isLoading}
                disabledDate={(current) => {
                  if (formData.endDate) {
                    return current && current > moment(formData.endDate, 'YYYY-MM-DD');
                  }
                  return false;
                }}
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <DatePicker
                value={formData.endDate ? moment(formData.endDate, 'YYYY-MM-DD') : null}
                onChange={(date) => handleDateChange(date, 'endDate')}
                format="DD-MM-YYYY"
                className="form-control custom-date-picker"
                placeholder="Select end date"
                disabled={isLoading}
                disabledDate={(current) => {
                  if (formData.startDate) {
                    return current && current < moment(formData.startDate, 'YYYY-MM-DD');
                  }
                  return false;
                }}
              />
            </div>
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-submit" 
                disabled={isLoading}
              >
                {isLoading ? "Submitting..." : "Submit Request"}
              </button>
              <button 
                type="button" 
                className="btn btn-cancel" 
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

Pos_RequestLeave.propTypes = {
  onClose: PropTypes.func.isRequired,
  darkMode: PropTypes.bool,
};

export default Pos_RequestLeave;