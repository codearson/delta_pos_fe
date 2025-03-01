import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
//import { Link } from 'react-router-dom';
import { updateTax } from '../Api/TaxApi';
import Swal from 'sweetalert2';
//import Select from 'react-select';

const EditSubcategories = ({ selectedTax, onTaxUpdated }) => {
    const [taxPercentage, setTaxPercentage] = useState('');

    useEffect(() => {
        if (selectedTax?.taxPercentage) {
            setTaxPercentage(selectedTax.taxPercentage);
        }
    }, [selectedTax]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedTax?.id) {
            console.error('No tax selected for update');
            return;
        }

        // Add validation
        const percentage = parseFloat(taxPercentage);
        if (isNaN(percentage) || percentage < 0 || percentage > 100) {
            Swal.fire('Error', 'Tax percentage must be between 0 and 100', 'error');
            return;
        }

        try {
            const updatedData = {
                taxPercentage: Number(taxPercentage),
                isActive: true
            };

            const response = await updateTax(selectedTax.id, updatedData);
            
            if (response) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Tax has been updated successfully',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
                
                if (onTaxUpdated) {
                    onTaxUpdated();
                }
                
                // Close modal
                document.querySelector('[data-bs-dismiss="modal"]').click();
            } else {
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to update tax',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        } catch (error) {
            console.error('Error updating tax:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Something went wrong while updating tax',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    return (
        <div>
            {/* Edit Category */}
            <div className="modal fade" id="edit-tax">
                <div className="modal-dialog modal-dialog-centered custom-modal-two">
                    <div className="modal-content">
                        <div className="page-wrapper-new p-0">
                            <div className="content">
                                <div className="modal-header border-0 custom-modal-header">
                                    <div className="page-title">
                                        <h4>Edit Tax</h4>
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
                                                    }
                                                }}
                                                min="0"
                                                max="100"
                                            />
                                        </div>
                                        {/* <div className="mb-3">
                                            <label className="form-label">Category Code</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                defaultValue="CT001"
                                            />
                                        </div>
                                        <div className="mb-3 input-blocks">
                                            <label className="form-label">Description</label>
                                            <textarea
                                                className="form-control"
                                                defaultValue={"Type Description"}
                                            />
                                        </div>
                                        <div className="mb-0">
                                            <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                                                <span className="status-label">Status</span>
                                                <input
                                                    type="checkbox"
                                                    id="user3"
                                                    className="check"
                                                    defaultChecked="true"
                                                />
                                                <label htmlFor="user3" className="checktoggle" />
                                            </div>
                                        </div> */}
                                        <div className="modal-footer-btn">
                                            <button
                                                type="button"
                                                className="btn btn-cancel me-2"
                                                data-bs-dismiss="modal"
                                            >
                                                Cancel
                                            </button>
                                            <button type="submit" className="btn btn-submit">
                                                Save Changes
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* /Edit Category */}
        </div>
    )
}

EditSubcategories.propTypes = {
    selectedTax: PropTypes.shape({
        id: PropTypes.number,
        taxPercentage: PropTypes.number,
    }),
    onTaxUpdated: PropTypes.func
};

EditSubcategories.defaultProps = {
    selectedTax: null,
    onTaxUpdated: () => {}
};

export default EditSubcategories