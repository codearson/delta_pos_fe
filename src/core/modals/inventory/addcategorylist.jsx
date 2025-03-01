import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { saveProductCategory } from '../../../feature-module/Api/ProductCategoryApi'
import Swal from "sweetalert2";

const AddCategoryList = () => {
    const [categoryName, setCategoryName] = useState("");
    const [showError, setShowError] = useState(false);

    const handleSaveCategory = async () => {
        if (!categoryName) {
            setShowError(true);
            return;
        }

        try {
            const response = await saveProductCategory(categoryName);
            if (response) {
                Swal.fire("Success", "Category saved successfully!", "success");
                setCategoryName("");
                setShowError(false);
                document.getElementById("close-add-category").click();
            } else {
                Swal.fire("Error", "Failed to save category.", "error");
            }
        } catch (error) {
            Swal.fire("Error", "Something went wrong", "error");
        }
    };

    const handleCancel = () => {
        setCategoryName("");
        setShowError(false);
    };

    return (
        <div>
            {/* Add Category */}
            <div className="modal fade" id="add-category">
                <div className="modal-dialog modal-dialog-centered custom-modal-two">
                    <div className="modal-content">
                        <div className="page-wrapper-new p-0">
                            <div className="content">
                                <div className="modal-header border-0 custom-modal-header">
                                    <div className="page-title">
                                        <h4>Create Category</h4>
                                    </div>
                                    <button
                                        type="button"
                                        className="close"
                                        id="close-add-category"
                                        data-bs-dismiss="modal"
                                        aria-label="Close"
                                        onClick={handleCancel}
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
                                                className="form-control"
                                                value={categoryName}
                                                onChange={(e) => {
                                                    setCategoryName(e.target.value);
                                                    if (e.target.value) setShowError(false);
                                                }}
                                            />
                                            {showError && (
                                                <small className="text-danger">Category name is required</small>
                                            )}
                                        </div>
                                        {/* <div className="mb-3">
                                            <label className="form-label">Category Slug</label>
                                            <input type="text" className="form-control" />
                                        </div> */}
                                        {/* <div className="mb-0">
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
                                            <Link to="#" className="btn btn-submit" onClick={handleSaveCategory}>
                                                Create Category
                                            </Link>
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

export default AddCategoryList
