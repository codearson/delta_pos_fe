import { DatePicker } from 'antd';
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';
import { saveHoliday } from '../../Api/HolidayApi';
import { fetchUsers } from '../../Api/UserApi';
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
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userLoadError, setUserLoadError] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoadingUsers(true);
      setUserLoadError(null);
      const userData = await fetchUsers();
      const userOptions = userData.payload.map(user => ({
        value: user.id,
        label: `${user.firstName} ${user.lastName}`
      }));
      setUsers(userOptions);
      
      const currentUserId = localStorage.getItem("userId");
      if (currentUserId) {
        const currentUser = userOptions.find(user => user.value === parseInt(currentUserId));
        if (currentUser) {
          setFormData(prev => ({
            ...prev,
            userDto: { id: currentUser.value }
          }));
        }
      }
    } catch (error) {
      setUserLoadError('Failed to load users');
      Swal.fire({
        title: "Error!",
        text: "Failed to load users: " + error.message,
        icon: "error",
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleDateChange = (date, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: date ? date.format('YYYY-MM-DD') : null
    }));
  };

  const handleUserChange = (selectedOption) => {
    setFormData(prev => ({
      ...prev,
      userDto: selectedOption ? { id: selectedOption.value } : null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.userDto) {
      Swal.fire({
        title: "Error!",
        text: "Please select a user",
        icon: "error",
      });
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      Swal.fire({
        title: "Error!",
        text: "Please select both start and end dates",
        icon: "error",
      });
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
          userDto: users.length > 0 ? { id: users[0].value } : null,
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
    }
  };

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: darkMode ? '#444' : '#fff',
      borderColor: darkMode ? '#666' : '#ddd',
      color: darkMode ? '#fff' : '#000',
      '&:hover': {
        borderColor: darkMode ? '#888' : '#bbb',
      },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: darkMode ? '#444' : '#fff',
      color: darkMode ? '#fff' : '#000',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected 
        ? darkMode ? '#666' : '#007bff' 
        : state.isFocused 
          ? darkMode ? '#555' : '#e9ecef' 
          : darkMode ? '#444' : '#fff',
      color: darkMode ? '#fff' : '#000',
      '&:active': {
        backgroundColor: darkMode ? '#777' : '#0056b3',
      },
    }),
    singleValue: (base) => ({
      ...base,
      color: darkMode ? '#fff' : '#000',
    }),
    placeholder: (base) => ({
      ...base,
      color: darkMode ? '#aaa' : '#888',
    }),
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
              />
            </div>
            <div className="form-group">
              <label>User</label>
              <Select
                options={users}
                value={formData.userDto ? users.find(user => user.value === formData.userDto.id) : null}
                onChange={handleUserChange}
                styles={customSelectStyles}
                className="w-100"
                isLoading={isLoadingUsers}
                placeholder={userLoadError || "Select a user"}
                isClearable
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-submit" disabled={isLoadingUsers}>
                Submit Request
              </button>
              <button type="button" className="btn btn-cancel" onClick={onClose}>
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