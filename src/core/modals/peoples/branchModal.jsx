import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

const BranchModal = ({ onSave, onUpdate, selectedBranch }) => {
  const [formData, setFormData] = useState({
    branchName: '',
    branchCode: '',
    address: '',
    contactNumber: '',
    emailAddress: '',
    countryId: '',
    shopDetailsId: '',
  });

  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    if (selectedBranch) {
      setFormData({
        branchName: selectedBranch.branchName || '',
        branchCode: selectedBranch.branchCode || '',
        address: selectedBranch.address || '',
        contactNumber: selectedBranch.contactNumber || '',
        emailAddress: selectedBranch.emailAddress || '',
        countryId: selectedBranch.countryId || '',
        shopDetailsId: selectedBranch.shopDetailsId || '',
      });
    } else {
      setFormData({
        branchName: '',
        branchCode: '',
        address: '',
        contactNumber: '',
        emailAddress: '',
        countryId: '',
        shopDetailsId: '',
      });
    }
    setEmailError('');
  }, [selectedBranch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'contactNumber') {
      const onlyDigits = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({
        ...prev,
        [name]: onlyDigits
      }));
    } else if (name === 'emailAddress') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) {
        setEmailError('Please enter a valid email address');
      } else {
        setEmailError('');
      }
    } else if (name === 'countryId' || name === 'shopDetailsId') {
      // Ensure only numeric values for countryId and shopDetailsId
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate contact number
    if (!formData.contactNumber.match(/^\d{10}$/)) {
      return;
    }

    // Validate email
    if (emailError) {
      return;
    }

    // Validate countryId and shopDetailsId (ensure they are not empty)
    if (!formData.countryId || !formData.shopDetailsId) {
      alert('Country ID and Shop Details ID are required.');
      return;
    }

    // Prepare the data to match the API's expected snake_case keys
    const submitData = {
      branch_name: formData.branchName,
      branch_code: formData.branchCode,
      address: formData.address,
      contact_number: formData.contactNumber,
      email_address: formData.emailAddress,
      country_id: formData.countryId,
      shop_details_id: formData.shopDetailsId,
    };

    if (selectedBranch) {
      onUpdate(submitData);
    } else {
      onSave(submitData);
    }

    setFormData({
      branchName: '',
      branchCode: '',
      address: '',
      contactNumber: '',
      emailAddress: '',
      countryId: '',
      shopDetailsId: '',
    });
    setEmailError('');
  };

  return (
    <div>
      {/* Add Branch Modal */}
      <div className="modal fade" id="add-branch" data-bs-backdrop="static" data-bs-keyboard="false">
        <div className="modal-dialog modal-dialog-centered custom-modal-two">
          <div className="modal-content">
            <div className="modal-header border-0 custom-modal-header">
              <h4 className="page-title">Add Branch</h4>
              <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body custom-modal-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-lg-12">
                    <div className="input-blocks">
                      <label>Branch Name <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        name="branchName"
                        value={formData.branchName}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="Enter branch name"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="input-blocks">
                      <label>Branch Code <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        name="branchCode"
                        value={formData.branchCode}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="Enter branch code"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="input-blocks">
                      <label>Address <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="Enter address"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="input-blocks">
                      <label>Contact Number <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleInputChange}
                        className={`form-control ${!formData.contactNumber.match(/^\d{10}$/) ? 'is-invalid' : ''}`}
                        placeholder="Enter 10-digit contact number"
                        required
                      />
                      {!formData.contactNumber.match(/^\d{10}$/) && formData.contactNumber && (
                        <div className="invalid-feedback">Contact number must be exactly 10 digits</div>
                      )}
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="input-blocks">
                      <label>Email Address <span className="text-danger">*</span></label>
                      <input
                        type="email"
                        name="emailAddress"
                        value={formData.emailAddress}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="Enter email address"
                        required
                      />
                      {emailError && (
                        <div className="text-danger" style={{ fontSize: '0.875em', marginTop: '0.25rem' }}>
                          {emailError}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="input-blocks">
                      <label>Country ID <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        name="countryId"
                        value={formData.countryId}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="Enter country ID"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="input-blocks">
                      <label>Shop Details ID <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        name="shopDetailsId"
                        value={formData.shopDetailsId}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="Enter shop details ID"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer-btn">
                  <button type="button" className="btn btn-cancel me-2" data-bs-dismiss="modal">Cancel</button>
                  <button type="submit" className="btn btn-submit">Submit</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Branch Modal */}
      <div className="modal fade" id="edit-branch" data-bs-backdrop="static" data-bs-keyboard="false">
        <div className="modal-dialog modal-dialog-centered custom-modal-two">
          <div className="modal-content">
            <div className="modal-header border-0 custom-modal-header">
              <h4 className="page-title">Edit Branch</h4>
              <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body custom-modal-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-lg-12">
                    <div className="input-blocks">
                      <label>Branch Name <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        name="branchName"
                        value={formData.branchName}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="Enter branch name"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="input-blocks">
                      <label>Branch Code <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        name="branchCode"
                        value={formData.branchCode}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="Enter branch code"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="input-blocks">
                      <label>Address <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="Enter address"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="input-blocks">
                      <label>Contact Number <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleInputChange}
                        className={`form-control ${!formData.contactNumber.match(/^\d{10}$/) ? 'is-invalid' : ''}`}
                        placeholder="Enter 10-digit contact number"
                        required
                      />
                      {!formData.contactNumber.match(/^\d{10}$/) && formData.contactNumber && (
                        <div className="invalid-feedback">Contact number must be exactly 10 digits</div>
                      )}
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="input-blocks">
                      <label>Email Address <span className="text-danger">*</span></label>
                      <input
                        type="email"
                        name="emailAddress"
                        value={formData.emailAddress}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="Enter email address"
                        required
                      />
                      {emailError && (
                        <div className="text-danger" style={{ fontSize: '0.875em', marginTop: '0.25rem' }}>
                          {emailError}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="input-blocks">
                      <label>Country ID <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        name="countryId"
                        value={formData.countryId}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="Enter country ID"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="input-blocks">
                      <label>Shop Details ID <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        name="shopDetailsId"
                        value={formData.shopDetailsId}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="Enter shop details ID"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer-btn">
                  <button type="button" className="btn btn-cancel me-2" data-bs-dismiss="modal">Cancel</button>
                  <button type="submit" className="btn btn-submit">Submit</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

BranchModal.propTypes = {
  onSave: PropTypes.func.isRequired,
  onUpdate: PropTypes.func,
  selectedBranch: PropTypes.object,
};

export default BranchModal;