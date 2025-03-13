import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom'
import { updateProductCategory } from '../../../feature-module/Api/ProductCategoryApi'
import Swal from "sweetalert2";
import PropTypes from "prop-types";

const EditCategoryList = ({ selectedCategory, onUpdate }) => {
    const [categoryName, setCategoryName] = useState("");
    const [isActive, setIsActive] = useState(1);
    const [validationError, setValidationError] = useState("");

    useEffect(() => {
        if (selectedCategory) {
            setCategoryName(selectedCategory.productCategoryName);
            setIsActive(selectedCategory.isActive);
            setValidationError("");
        }
    }, [selectedCategory]);

    const handleUpdate = async () => {
        if (!categoryName.trim()) {
            setValidationError("Category name is required");
            return;
        }
        
        if (!selectedCategory) return;
   
        const updatedData = { 
            productCategoryName: categoryName, 
            isActive 
        };
   
        try {
            const response = await updateProductCategory(selectedCategory.id, updatedData);
            if (response) {
                Swal.fire("Success", "Category updated successfully!", "success");
                onUpdate();
                document.getElementById('edit-category-close').click();
            } else {
                Swal.fire("Error", "Failed to update category", "error");
            }
        } catch (error) {
            Swal.fire("Error", "Something went wrong", "error");
        }
    };

    const handleCloseModal = () => {
        if (selectedCategory) {
            setCategoryName(selectedCategory.productCategoryName);
        }
        setValidationError("");
    };

    return (
        <div>
            {/* Edit Category */}
            <div className="modal fade" id="edit-category" aria-hidden="true" inert>
                <div className="modal-dialog modal-dialog-centered custom-modal-two">
                    <div className="modal-content">
                        <div className="page-wrapper-new p-0">
                            <div className="content">
                                <div className="modal-header border-0 custom-modal-header">
                                    <div className="page-title">
                                        <h4>Edit Category</h4>
                                    </div>
                                    <button
                                        id="edit-category-close"
                                        type="button"
                                        className="close"
                                        data-bs-dismiss="modal"
                                        aria-label="Close"
                                        onClick={handleCloseModal}
                                    >
                                        <span aria-hidden="true">×</span>
                                    </button>
                                </div>
                                <div className="modal-body custom-modal-body">
                                    <form>
                                        <div className="mb-3">
                                            <label className="form-label">Category</label>
                                            <input
                                                type="text"
                                                className={`form-control ${validationError ? 'is-invalid' : ''}`}
                                                value={categoryName}
                                                onChange={(e) => {
                                                    setCategoryName(e.target.value);
                                                    setValidationError("");
                                                }}
                                            />
                                            {validationError && (
                                                <div className="invalid-feedback">
                                                    {validationError}
                                                </div>
                                            )}
                                        </div>
                                        {/* <div className="mb-3">
                                            <label className="form-label">Category Slug</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                defaultValue="laptop"
                                            />
                                        </div> */}
                                        {/* <div className="mb-0">
                                            <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                                                <span className="status-label">Status</span>
                                                <input
                                                    type="checkbox"
                                                    id="status-toggle"
                                                    className="check"
                                                    checked={isActive === 1}
                                                    onChange={() => setIsActive(isActive === 1 ? 0 : 1)}
                                                />
                                                <label htmlFor="user3" className="checktoggle" onClick={handleDelete} />
                                            </div>
                                        </div> */}
                                        <div className="modal-footer-btn">
                                            <button
                                                type="button"
                                                className="btn btn-cancel me-2"
                                                data-bs-dismiss="modal"
                                                onClick={handleCloseModal}
                                            >
                                                Cancel
                                            </button>
                                            <Link to="#" className="btn btn-submit" onClick={handleUpdate}>
                                                Save Changes
                                            </Link>
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

EditCategoryList.propTypes = {
    selectedCategory: PropTypes.shape({
        id: PropTypes.number.isRequired,
        productCategoryName: PropTypes.string.isRequired,
        isActive: PropTypes.bool,
    }).isRequired,
    onUpdate: PropTypes.func.isRequired,
};

export default EditCategoryList
