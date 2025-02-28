import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

const SupplierModal = ({ onSave, onUpdate, selectedSupplier }) => {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    emailAddress: "",
    mobileNumber: "",
    whatsappNumber: "",
    isActive: 1,
  });

  // Populate form data when selectedSupplier changes (for editing)
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
      setFormData({
        id: "",
        name: "",
        emailAddress: "",
        mobileNumber: "",
        whatsappNumber: "",
        isActive: 1,
      });
    }
  }, [selectedSupplier]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const supplierData = {
      ...formData,
      isActive: 1,
    };
    onSave(supplierData);
    setFormData({ name: "", emailAddress: "", mobileNumber: "", whatsappNumber: "" });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const supplierData = {
      id: formData.id,
      name: formData.name,
      emailAddress: formData.emailAddress,
      mobileNumber: formData.mobileNumber,
      whatsappNumber: formData.whatsappNumber,
      isActive: formData.isActive,
    };
    onUpdate(supplierData); // Call onUpdate with the updated supplier data
  };

  return (
    <div>
      {/* Add Supplier */}
      <div className="modal fade" id="add-units">
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
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
                <div className="modal-body custom-modal-body">
                  <form onSubmit={handleAddSubmit}>
                    <div className="row">
                      <div className="col-lg-12">
                        <div className="input-blocks">
                          <label>Supplier Name</label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="form-control"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="input-blocks">
                          <label>Email</label>
                          <input
                            type="email"
                            name="emailAddress"
                            value={formData.emailAddress}
                            onChange={handleChange}
                            className="form-control"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="input-blocks">
                          <label>Mobile Number</label>
                          <input
                            type="text"
                            name="mobileNumber"
                            value={formData.mobileNumber}
                            onChange={handleChange}
                            className="form-control"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="input-blocks">
                          <label>WhatsApp Number</label>
                          <input
                            type="text"
                            name="whatsappNumber"
                            value={formData.whatsappNumber}
                            onChange={handleChange}
                            className="form-control"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer-btn">
                      <button
                        type="button"
                        className="btn btn-cancel me-2"
                        data-bs-dismiss="modal"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-submit"
                        data-bs-dismiss="modal"
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
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
                <div className="modal-body custom-modal-body">
                  <form onSubmit={handleEditSubmit}>
                    <div className="row">
                      <div className="col-lg-12">
                        <div className="input-blocks">
                          <label>Supplier Name</label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="form-control"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="input-blocks">
                          <label>Email</label>
                          <input
                            type="email"
                            name="emailAddress"
                            value={formData.emailAddress}
                            onChange={handleChange}
                            className="form-control"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="input-blocks">
                          <label>Mobile Number</label>
                          <input
                            type="text"
                            name="mobileNumber"
                            value={formData.mobileNumber}
                            onChange={handleChange}
                            className="form-control"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="input-blocks">
                          <label>WhatsApp Number</label>
                          <input
                            type="text"
                            name="whatsappNumber"
                            value={formData.whatsappNumber}
                            onChange={handleChange}
                            className="form-control"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer-btn">
                      <button
                        type="button"
                        className="btn btn-cancel me-2"
                        data-bs-dismiss="modal"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-submit"
                        data-bs-dismiss="modal"
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

// Define prop types
SupplierModal.propTypes = {
  onSave: PropTypes.func.isRequired,
  onUpdate: PropTypes.func,
  selectedSupplier: PropTypes.object,
};

export default SupplierModal;