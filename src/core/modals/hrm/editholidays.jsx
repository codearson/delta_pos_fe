import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';
import { updateHoliday } from '../../../feature-module/Api/HolidayApi';
import { fetchUsers } from '../../../feature-module/Api/UserApi';
import Swal from 'sweetalert2';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import "../../../style/scss/components/Pos Components/Pos_RequestLeave.scss";

const EditHolidays = ({ selectedHoliday, onUpdate }) => {
  const [formData, setFormData] = useState({
    id: '',
    createdOn: '',
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Declined', label: 'Declined' },
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedHoliday) {
      setFormData({
        id: selectedHoliday.id || '',
        createdOn: selectedHoliday.createdOn || '',
        description: selectedHoliday.description || '',
        startDate: selectedHoliday.startDate || null,
        endDate: selectedHoliday.endDate || null,
        status: selectedHoliday.status || 'Pending',
        userDto: selectedHoliday.userDto || null,
        isActive: selectedHoliday.isActive ? 1 : 0,
      });
    }
  }, [selectedHoliday]);

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
      [field]: date ? date.toISOString().split('T')[0] : null
    }));
  };

  const handleUserChange = (selectedOption) => {
    setFormData(prev => ({
      ...prev,
      userDto: selectedOption ? { id: selectedOption.value } : null
    }));
  };

  const validateDates = () => {
    if (!formData.startDate || !formData.endDate) {
      return false;
    }
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    return start < end;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.userDto) {
      Swal.fire({
        title: "Error!",
        text: "Please select a user",
        icon: "error",
      });
      setIsSubmitting(false);
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      Swal.fire({
        title: "Error!",
        text: "Please select both start and end dates",
        icon: "error",
      });
      setIsSubmitting(false);
      return;
    }

    if (!validateDates()) {
      Swal.fire({
        title: "Error!",
        text: "Start date must be before end date",
        icon: "error",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await updateHoliday(formData.id, formData);
      if (response) {
        onUpdate();
        Swal.fire({
          title: "Success!",
          text: "Staff Leave has been updated successfully.",
          icon: "success",
        });
        document.querySelector("#edit-department .close").click();
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Failed to update Staff Leave: " + error.message,
        icon: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal fade" id="edit-department">
      <div className="modal-dialog modal-dialog-centered custom-modal-two">
        <div className="modal-content">
          <div className="page-wrapper-new p-0">
            <div className="content">
              <div className="modal-header border-0 custom-modal-header">
                <div className="page-title">
                  <h4>Edit Staff Leave</h4>
                </div>
                <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <div className="modal-body custom-modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-lg-12">
                      <div className="input-blocks mb-3">
                        <label>Description</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          disabled={isSubmitting || isLoadingUsers}
                        />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="input-blocks mb-3">
                        <label>Start Date</label>
                        <DatePicker
                          selected={formData.startDate ? new Date(formData.startDate) : null}
                          onChange={(date) => handleDateChange(date, 'startDate')}
                          dateFormat="dd-MM-yyyy"
                          className="form-control custom-date-picker"
                          placeholderText="Select start date"
                          disabled={isSubmitting || isLoadingUsers}
                          minDate={new Date()}
                          maxDate={formData.endDate ? new Date(formData.endDate) : null}
                          popperPlacement="bottom-start"
                          weekStartsOn={1}
                        />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="input-blocks mb-3">
                        <label>End Date</label>
                        <DatePicker
                          selected={formData.endDate ? new Date(formData.endDate) : null}
                          onChange={(date) => handleDateChange(date, 'endDate')}
                          dateFormat="dd-MM-yyyy"
                          className="form-control custom-date-picker"
                          placeholderText="Select end date"
                          disabled={isSubmitting || isLoadingUsers}
                          minDate={formData.startDate ? new Date(formData.startDate) : new Date()}
                          popperPlacement="bottom-start"
                          weekStartsOn={1}
                        />
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <div className="input-blocks mb-3">
                        <label>User</label>
                        <Select
                          options={users}
                          value={formData.userDto ? users.find(user => user.value === formData.userDto.id) : null}
                          onChange={handleUserChange}
                          className="w-100"
                          isLoading={isLoadingUsers}
                          placeholder={userLoadError || "Select a user"}
                          isClearable
                          isDisabled={isSubmitting}
                        />
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <div className="input-blocks mb-3">
                        <label>Status</label>
                        <Select
                          options={statusOptions}
                          value={statusOptions.find(opt => opt.value === formData.status)}
                          onChange={(selected) => setFormData({ ...formData, status: selected.value })}
                          className="w-100"
                          isDisabled={isSubmitting || isLoadingUsers}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer-btn">
                    <button type="button" className="btn btn-cancel me-2" data-bs-dismiss="modal" disabled={isSubmitting}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-submit" disabled={isSubmitting || isLoadingUsers}>
                      {isSubmitting ? "Submitting..." : "Submit"}
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

EditHolidays.propTypes = {
  selectedHoliday: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    createdOn: PropTypes.string,
    description: PropTypes.string,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    status: PropTypes.string,
    userDto: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    }),
    isActive: PropTypes.oneOfType([PropTypes.bool, PropTypes.number])
  }),
  onUpdate: PropTypes.func.isRequired
};

export default EditHolidays;