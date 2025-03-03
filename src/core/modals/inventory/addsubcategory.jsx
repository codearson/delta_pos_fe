import React, { useState } from 'react';
//import { Link } from 'react-router-dom';
import { saveTax } from '../../../feature-module/Api/TaxApi';
import Swal from 'sweetalert2';
import PropTypes from 'prop-types';
//import Select from 'react-select';

const AddSubcategory = ({ onTaxCreated }) => {
    const [taxPercentage, setTaxPercentage] = useState('');
    const [showError, setShowError] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!taxPercentage) {
            setShowError(true);
            return;
        }
        
        const percentage = parseFloat(taxPercentage);
        if (isNaN(percentage) || percentage < 0 || percentage > 100) {
            Swal.fire('Error', 'Tax percentage must be between 0 and 100', 'error');
            return;
        }

        try {
            const response = await saveTax(taxPercentage);
            if (response) {
                Swal.fire('Success', 'Tax created successfully', 'success');
                setTaxPercentage('');
                document.querySelector('[data-bs-dismiss="modal"]').click();
                if (onTaxCreated) onTaxCreated();
            } else {
                Swal.fire('Error', 'Failed to create tax', 'error');
            }
        } catch (error) {
            //console.error('Error creating tax:', error);
            Swal.fire('Error', 'Something went wrong', 'error');
        }
    };

    const handleCancel = () => {
        setShowError(false);
        setTaxPercentage('');
    };

    return (
        <div>
            {/* Add Category */}
            <div className="modal fade" id="add-tax">
                <div className="modal-dialog modal-dialog-centered custom-modal-two">
                    <div className="modal-content">
                        <div className="page-wrapper-new p-0">
                            <div className="content">
                                <div className="modal-header border-0 custom-modal-header">
                                    <div className="page-title">
                                        <h4>Create Tax</h4>
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
                                    <form onSubmit={handleSubmit}>
                                        {/* <div className="mb-3">
                                            <label className="form-label">Parent Category</label>
                                            <Select
                                                className="select"
                                                options={categories}
                                                placeholder="Newest"
                                            />
                                        </div> */}
                                        <div className="mb-3">
                                            <label className="form-label">Tax Percentage</label>
                                            <input 
                                                type="number" 
                                                className="form-control" 
                                                value={taxPercentage}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 100)) {
                                                        setTaxPercentage(value);
                                                        setShowError(false);
                                                    }
                                                }}
                                                min="0"
                                                max="100"
                                            />
                                            {showError && (
                                                <small className="text-danger">Tax percentage is required</small>
                                            )}
                                        </div>
                                        {/* <div className="mb-3">
                                            <label className="form-label">Category Code</label>
                                            <input type="text" className="form-control" />
                                        </div>
                                        <div className="mb-3 input-blocks">
                                            <label className="form-label">Description</label>
                                            <textarea className="form-control" defaultValue={""} />
                                        </div>
                                        <div className="mb-0">
                                            <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                                                <span className="status-label">Status</span>
                                                <input
                                                    type="checkbox"
                                                    id="user2"
                                                    className="check"
                                                    defaultChecked="true"
                                                />
                                                <label htmlFor="user2" className="checktoggle" />
                                            </div>
                                        </div> */}
                                        <div className="modal-footer-btn">
                                            <button
                                                type="button"
                                                className="btn btn-cancel me-2"
                                                data-bs-dismiss="modal"
                                                onClick={handleCancel}
                                            >
                                                Cancel
                                            </button>
                                            <button type="submit" className="btn btn-submit">
                                                Create Tax
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* /Add Category */}
        </div>
    )
}

AddSubcategory.propTypes = {
    onTaxCreated: PropTypes.func
};

export default AddSubcategory
