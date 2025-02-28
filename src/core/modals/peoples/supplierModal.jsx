import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

const SupplierModal = ({ onSave, onUpdate, selectedSupplier }) => {
  const initialFormState = {
    id: "",
    name: "",
    emailAddress: "",
    mobileNumber: "",
    whatsappNumber: "",
    isActive: 1,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (selectedSupplier) {
      setFormData({
        id: selectedSupplier.id || "",
        name: selectedSupplier.name || "",
        emailAddress: selectedSupplier.emailAddress || "",
        mobileNumber: selectedSupplier.mobileNumber || "",
        whatsappNumber: selectedSupplier.whatsappNumber || "",
        isActive: selectedSupplier.isActive || 1,
      });
    } else {
      setFormData(initialFormState);
      setErrors({});
    }
  }, [selectedSupplier]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Supplier name is required";
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.emailAddress || !emailRegex.test(formData.emailAddress)) {
      newErrors.emailAddress = "Please enter a valid email address";
    }

    const phoneRegex = /^\d{10}$/;
    if (!formData.mobileNumber || !phoneRegex.test(formData.mobileNumber)) {
      newErrors.mobileNumber = "Please enter a valid 10-digit mobile number";
    }
    
    if (!formData.whatsappNumber || !phoneRegex.test(formData.whatsappNumber)) {
      newErrors.whatsappNumber = "Please enter a valid 10-digit WhatsApp number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "mobileNumber" || name === "whatsappNumber") {
      if (/^\d{0,10}$/.test(value)) {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const supplierData = { ...formData, isActive: 1 };
      onSave(supplierData);
      setFormData(initialFormState);
      setErrors({});
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const supplierData = { ...formData };
      onUpdate(supplierData);
      setFormData(initialFormState);
      setErrors({});
    }
  };

  const handleModalOpen = () => {
    if (!selectedSupplier) {
      setFormData(initialFormState);
      setErrors({});
    }
  };

  return (
    <div>
      {/* Add Supplier */}
      <div className="modal fade" id="add-units" onClick={handleModalOpen}>
        <div className="modal-dialog modal-dialog-centered custom-modal-two">
          <div className="modal-content">
            <div className="page-wrapper-new p-0">
              <div className="content">
                <div className="modal-header border-0 custom-modal-header">
                  <div className="page-title">
                    <h4>Add Supplier</h4>
                  </div>
                  <button
                    type="button"
                    className="close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                    onClick={() => setFormData(initialFormState)}
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
                <div className="modal-body custom-modal-body">
                  <form onSubmit={handleAddSubmit}>
                    <div className="row">
                      <div className="col-lg-12">
                        <div className="input-blocks">
                          <label>Supplier Name <span className="text-danger">*</span></label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="form-control"
                            required
                          />
                          {errors.name && <span className="text-danger">{errors.name}</span>}
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="input-blocks">
                          <label>Email <span className="text-danger">*</span></label>
                          <input
                            type="email"
                            name="emailAddress"
                            value={formData.emailAddress}
                            onChange={handleChange}
                            className="form-control"
                            required
                          />
                          {errors.emailAddress && <span className="text-danger">{errors.emailAddress}</span>}
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="input-blocks">
                          <label>Mobile Number <span className="text-danger">*</span></label>
                          <input
                            type="text"
                            name="mobileNumber"
                            value={formData.mobileNumber}
                            onChange={handleChange}
                            className="form-control"
                            maxLength={10}
                            required
                          />
                          {errors.mobileNumber && <span className="text-danger">{errors.mobileNumber}</span>}
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="input-blocks">
                          <label>WhatsApp Number <span className="text-danger">*</span></label>
                          <input
                            type="text"
                            name="whatsappNumber"
                            value={formData.whatsappNumber}
                            onChange={handleChange}
                            className="form-control"
                            maxLength={10}
                            required
                          />
                          {errors.whatsappNumber && <span className="text-danger">{errors.whatsappNumber}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer-btn">
                      <button
                        type="button"
                        className="btn btn-cancel me-2"
                        data-bs-dismiss="modal"
                        onClick={() => {
                          setFormData(initialFormState);
                          setErrors({});
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-submit"
                      >
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
      {/* Edit Supplier */}
      <div className="modal fade" id="edit-units">
        <div className="modal-dialog modal-dialog-centered custom-modal-two">
          <div className="modal-content">
            <div className="page-wrapper-new p-0">
              <div className="content">
                <div className="modal-header border-0 custom-modal-header">
                  <div className="page-title">
                    <h4>Edit Supplier</h4>
                  </div>
                  <button
                    type="button"
                    className="close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                    onClick={() => setFormData(initialFormState)}
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
                <div className="modal-body custom-modal-body">
                  <form onSubmit={handleEditSubmit}>
                    <div className="row">
                      <div className="col-lg-12">
                        <div className="input-blocks">
                          <label>Supplier Name <span className="text-danger">*</span></label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="form-control"
                            required
                          />
                          {errors.name && <span className="text-danger">{errors.name}</span>}
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="input-blocks">
                          <label>Email <span className="text-danger">*</span></label>
                          <input
                            type="email"
                            name="emailAddress"
                            value={formData.emailAddress}
                            onChange={handleChange}
                            className="form-control"
                            required
                          />
                          {errors.emailAddress && <span className="text-danger">{errors.emailAddress}</span>}
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="input-blocks">
                          <label>Mobile Number <span className="text-danger">*</span></label>
                          <input
                            type="text"
                            name="mobileNumber"
                            value={formData.mobileNumber}
                            onChange={handleChange}
                            className="form-control"
                            maxLength={10}
                            required
                          />
                          {errors.mobileNumber && <span className="text-danger">{errors.mobileNumber}</span>}
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="input-blocks">
                          <label>WhatsApp Number <span className="text-danger">*</span></label>
                          <input
                            type="text"
                            name="whatsappNumber"
                            value={formData.whatsappNumber}
                            onChange={handleChange}
                            className="form-control"
                            maxLength={10}
                            required
                          />
                          {errors.whatsappNumber && <span className="text-danger">{errors.whatsappNumber}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer-btn">
                      <button
                        type="button"
                        className="btn btn-cancel me-2"
                        data-bs-dismiss="modal"
                        onClick={() => {
                          setFormData(initialFormState);
                          setErrors({});
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-submit"
                      >
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
    </div>
  );
};

SupplierModal.propTypes = {
  onSave: PropTypes.func.isRequired,
  onUpdate: PropTypes.func,
  selectedSupplier: PropTypes.object,
};

export default SupplierModal;