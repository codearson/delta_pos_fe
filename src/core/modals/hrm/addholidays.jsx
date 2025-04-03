import { DatePicker } from 'antd';
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';
import { saveHoliday } from '../../../feature-module/Api/HolidayApi';
import { fetchUsers } from '../../../feature-module/Api/UserApi';
import Swal from 'sweetalert2';
import moment from 'moment';

const AddHolidays = ({ onSave }) => {
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

  const statusOptions = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Declined', label: 'Declined' },
  ];

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
      
      if (!formData.userDto && userOptions.length > 0) {
        setFormData(prev => ({
          ...prev,
          userDto: { id: userOptions[0].value }
        }));
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
    try {
      const response = await saveHoliday(formData);
      if (response) {
        onSave();
        Swal.fire({
          title: "Success!",
          text: "Holiday has been added successfully.",
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
        document.querySelector("#add-department .close").click();
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Failed to add holiday: " + error.message,
        icon: "error",
      });
    }
  };

  return (
    <div className="modal fade" id="add-department">
      <div className="modal-dialog modal-dialog-centered custom-modal-two">
        <div className="modal-content">
          <div className="page-wrapper-new p-0">
            <div className="content">
              <div className="modal-header border-0 custom-modal-header">
                <div className="page-title">
                  <h4>Create Staff Leave</h4>
                </div>
                <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <div className="modal-body custom-modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-lg-12">
                      <div className="mb-3">
                        <label>Description</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="input-blocks">
                        <label>Start Date</label>
                        <DatePicker
                          value={formData.startDate ? moment(formData.startDate, 'YYYY-MM-DD') : null}
                          onChange={(date) => handleDateChange(date, 'startDate')}
                          format="DD-MM-YYYY"
                          className="form-control custom-date-picker"
                          placeholder="Select start date"
                        />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="input-blocks">
                        <label>End Date</label>
                        <DatePicker
                          value={formData.endDate ? moment(formData.endDate, 'YYYY-MM-DD') : null}
                          onChange={(date) => handleDateChange(date, 'endDate')}
                          format="DD-MM-YYYY"
                          className="form-control custom-date-picker"
                          placeholder="Select end date"
                        />
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <div className="input-blocks">
                        <label>User</label>
                        <Select
                          options={users}
                          value={formData.userDto ? users.find(user => user.value === formData.userDto.id) : null}
                          onChange={handleUserChange}
                          className="w-100"
                          isLoading={isLoadingUsers}
                          placeholder={userLoadError || "Select a user"}
                          isClearable
                        />
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <div className="input-blocks">
                        <label>Status</label>
                        <Select
                          options={statusOptions}
                          value={statusOptions.find(opt => opt.value === formData.status)}
                          onChange={(selected) => setFormData({ ...formData, status: selected.value })}
                          className="w-100"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer-btn">
                    <button type="button" className="btn btn-cancel me-2" data-bs-dismiss="modal">
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-submit" disabled={isLoadingUsers}>
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

AddHolidays.propTypes = {
  onSave: PropTypes.func.isRequired,
};

export default AddHolidays;