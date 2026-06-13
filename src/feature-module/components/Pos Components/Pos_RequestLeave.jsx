import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { saveHoliday } from '../../Api/HolidayApi';
import Swal from 'sweetalert2';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import "../../../style/scss/components/Pos Components/Pos_RequestLeave.scss";

const ROWS = [
  ['q','w','e','r','t','y','u','i','o','p'],
  ['a','s','d','f','g','h','j','k','l'],
  ['z','x','c','v','b','n','m'],
];

// capsMode: 'off' | 'once' | 'lock'
const TouchKeyboard = ({ onKey, onDelete, onSpace, capsMode }) => {
  const isUpper = capsMode !== 'off';
  const specialLabel = capsMode === 'lock' ? 'ABC' : capsMode === 'once' ? 'Abc' : 'abc';
  const specialClass = `kb-key kb-special${capsMode === 'lock' ? ' kb-lock' : capsMode === 'once' ? ' kb-once' : ''}`;
  return (
    <div className="touch-keyboard">
      {ROWS.map((row, ri) => (
        <div className="kb-row" key={ri}>
          {ri === 2 && (
            <button type="button" className={specialClass} onMouseDown={e => { e.preventDefault(); onKey('CAPS'); }}>
              {specialLabel}
            </button>
          )}
          {row.map(k => (
            <button
              type="button"
              className="kb-key"
              key={k}
              onMouseDown={e => { e.preventDefault(); onKey(isUpper ? k.toUpperCase() : k); }}
            >
              {isUpper ? k.toUpperCase() : k}
            </button>
          ))}
          {ri === 0 && (
            <button type="button" className="kb-key kb-delete" onMouseDown={e => { e.preventDefault(); onDelete(); }}>
              ⌫
            </button>
          )}
        </div>
      ))}
      <div className="kb-row">
        <button type="button" className="kb-key kb-space" onMouseDown={e => { e.preventDefault(); onSpace(); }}>
          Space
        </button>
      </div>
    </div>
  );
};

TouchKeyboard.propTypes = {
  onKey: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onSpace: PropTypes.func.isRequired,
  capsMode: PropTypes.string.isRequired,
};

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
  const [capsMode, setCapsMode] = useState('once'); // 'off' | 'once' | 'lock'
  const descriptionInputRef = useRef(null);

  // Auto-focus description input on open
  useEffect(() => {
    setTimeout(() => descriptionInputRef.current?.focus(), 50);
  }, []);

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
      [field]: date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : null
    }));
  };

  const validateDates = () => {
    if (!formData.startDate || !formData.endDate) return false;
    return new Date(formData.startDate) <= new Date(formData.endDate);
  };

  const handleKeyPress = (key) => {
    if (key === 'CAPS') {
      setCapsMode(m => m === 'off' ? 'once' : m === 'once' ? 'lock' : 'off');
      return;
    }
    setFormData(prev => ({ ...prev, description: prev.description + key }));
    // After typing one letter in one-shot mode, revert to lowercase
    if (capsMode === 'once') setCapsMode('off');
  };

  const handleDelete = () => {
    setFormData(prev => ({ ...prev, description: prev.description.slice(0, -1) }));
  };

  const handleSpace = () => {
    setFormData(prev => ({ ...prev, description: prev.description + ' ' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.userDto) {
      Swal.fire({ title: "Error!", text: "User information not available. Please sign in again.", icon: "error" });
      setIsLoading(false);
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      Swal.fire({ title: "Error!", text: "Please select both start and end dates", icon: "error" });
      setIsLoading(false);
      return;
    }

    if (!validateDates()) {
      Swal.fire({ title: "Error!", text: "End date must be on or after start date", icon: "error" });
      setIsLoading(false);
      return;
    }

    try {
      const response = await saveHoliday(formData);
      if (response) {
        Swal.fire({ title: "Success!", text: "Leave request has been submitted successfully.", icon: "success" });
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
      Swal.fire({ title: "Error!", text: "Failed to submit leave request: " + error.message, icon: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return ReactDOM.createPortal(
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
                ref={descriptionInputRef}
                type="text"
                className="form-control"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter leave reason"
                disabled={isLoading}
                inputMode="none"
              />
            </div>

            <TouchKeyboard
              onKey={handleKeyPress}
              onDelete={handleDelete}
              onSpace={handleSpace}
              capsMode={capsMode}
            />

            <div className="form-group date-group">
              <div className="date-field">
                <label>Start Date</label>
                <DatePicker
                  selected={formData.startDate ? new Date(formData.startDate) : null}
                  onChange={(date) => handleDateChange(date, 'startDate')}
                  dateFormat="dd-MM-yyyy"
                  className="form-control custom-date-picker"
                  placeholderText="Select start date"
                  disabled={isLoading}
                  minDate={new Date()}
                  popperPlacement="bottom-start"
                  weekStartsOn={1}
                />
              </div>
              <div className="date-field">
                <label>End Date</label>
                <DatePicker
                  selected={formData.endDate ? new Date(formData.endDate) : null}
                  onChange={(date) => handleDateChange(date, 'endDate')}
                  dateFormat="dd-MM-yyyy"
                  className="form-control custom-date-picker"
                  placeholderText="Select end date"
                  disabled={isLoading}
                  minDate={formData.startDate ? new Date(formData.startDate) : new Date()}
                  popperPlacement="bottom-start"
                  weekStartsOn={1}
                />
              </div>
              <div className="date-field total-days">
                <label>Total Days</label>
                <div className="total-days-value">
                  {formData.startDate && formData.endDate
                    ? Math.floor((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24)) + 1
                    : 0}
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-submit" disabled={isLoading}>
                {isLoading ? "Submitting..." : "Submit Request"}
              </button>
              <button type="button" className="btn btn-cancel" onClick={onClose} disabled={isLoading}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};

Pos_RequestLeave.propTypes = {
  onClose: PropTypes.func.isRequired,
  darkMode: PropTypes.bool,
};

export default Pos_RequestLeave;
