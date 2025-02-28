import React, { useState } from "react";
import { Link } from "react-router-dom";
import { all_routes } from "../../../Router/all_routes";
import { saveProductCategory } from "../../../feature-module/Api/ProductCategoryApi";

const AddCategory = () => {
  const route = all_routes;
  const [categoryName, setCategoryName] = useState("");

  const handleSaveCategory = async () => {
    if (!categoryName) {
      console.error("Please enter a category name.");
      return;
    }

    const response = await saveProductCategory(categoryName);
    if (response) {
      console.error("Category saved successfully!");
      setCategoryName("");
    } else {
      console.error("Failed to save category.");
    }
  };

  return (
    <>
      {/* Add Category */}
      <div className="modal fade" id="add-units-category">
        <div className="modal-dialog modal-dialog-centered custom-modal-two">
          <div className="modal-content">
            <div className="page-wrapper-new p-0">
              <div className="content">
                <div className="modal-header border-0 custom-modal-header">
                  <div className="page-title">
                    <h4>Add New Category</h4>
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
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                    />
                  </div>
                  <div className="modal-footer-btn">
                    <Link
                      to="#"
                      className="btn btn-cancel me-2"
                      data-bs-dismiss="modal"
                    >
                      Cancel
                    </Link>
                    <Link to={route.addproduct} className="btn btn-submit" onClick={handleSaveCategory}>
                      Submit
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Add Category */}
    </>
  );
};

export default AddCategory;
