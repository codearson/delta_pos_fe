import React, { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { 
    getPayoutCategoryByName,
    updatePayoutCategory 
} from '../../../feature-module/Api/PayoutCategoryApi'
import PropTypes from 'prop-types'

const EditBrand = ({ selectedCategory, refreshCategories }) => {
    const [categoryName, setCategoryName] = useState("")
    const [isActive, setIsActive] = useState(true)
    const [error, setError] = useState("")
    const MySwal = withReactContent(Swal)

    useEffect(() => {
        if (selectedCategory) {
            setCategoryName(selectedCategory.payoutCategory)
            setIsActive(selectedCategory.isActive)
        }
    }, [selectedCategory])

    const handleCategoryChange = (e) => {
        setCategoryName(e.target.value)
        setError("")
    }

    const validateInput = () => {
        if (!categoryName.trim()) {
            setError("Please enter a category name")
            return false
        }
        return true
    }

    const handleUpdateCategory = async () => {
        if (!validateInput()) return

        try {
            // Check for duplicate name excluding current category
            const existingCategory = await getPayoutCategoryByName(categoryName.trim())
            if (existingCategory?.responseDto && existingCategory.responseDto.id !== selectedCategory.id) {
                MySwal.fire({
                    title: "Error!",
                    text: "A category with this name already exists",
                    icon: "error",
                    confirmButtonText: "OK",
                })
                return
            }

            const updateData = {
                id: selectedCategory.id,
                payoutCategory: categoryName.trim(),
                isActive: isActive
            }

            const response = await updatePayoutCategory(updateData)
            
            if (response?.responseDto) {
                MySwal.fire({
                    title: "Success!",
                    text: "Category updated successfully!",
                    icon: "success",
                    confirmButtonText: "OK",
                })
                
                if (refreshCategories) {
                    refreshCategories()
                }
                
                // Close modal
                document.getElementById('edit-brand').classList.remove('show')
                document.querySelectorAll('.modal-backdrop').forEach(el => el.remove())
                document.body.classList.remove('modal-open')
            }
        } catch (error) {
            MySwal.fire({
                title: "Error!",
                text: error.message || "Failed to update category",
                icon: "error",
                confirmButtonText: "OK",
            })
        }
    }

    return (
        <div className="modal fade" id="edit-brand">
            <div className="modal-dialog modal-dialog-centered custom-modal-two">
                <div className="modal-content">
                    <div className="page-wrapper-new p-0">
                        <div className="content">
                            <div className="modal-header border-0 custom-modal-header">
                                <div className="page-title">
                                    <h4>Edit Payout Category</h4>
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
                                <div className="mb-3">
                                    <label className="form-label">Category Name</label>
                                    <input
                                        type="text"
                                        className={`form-control ${error ? 'is-invalid' : ''}`}
                                        value={categoryName}
                                        onChange={handleCategoryChange}
                                        placeholder="Enter category name"
                                    />
                                    {error && <div className="invalid-feedback">{error}</div>}
                                </div>
                                <div className="mb-3">
                                    <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                                        <span className="status-label">Status</span>
                                        <input
                                            type="checkbox"
                                            id="categoryStatus"
                                            className="check"
                                            checked={isActive}
                                            onChange={(e) => setIsActive(e.target.checked)}
                                        />
                                        <label htmlFor="categoryStatus" className="checktoggle" />
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
                                        type="button" 
                                        className="btn btn-submit"
                                        onClick={handleUpdateCategory}
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

EditBrand.propTypes = {
    selectedCategory: PropTypes.object,
    refreshCategories: PropTypes.func
}

export default EditBrand
