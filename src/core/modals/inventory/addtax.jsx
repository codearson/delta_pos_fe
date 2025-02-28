import React, { useState } from "react";
import { Link } from "react-router-dom";
import { all_routes } from "../../../Router/all_routes";
import { saveTax } from "../../../feature-module/Api/TaxApi";

const AddTax = () => {
    const route = all_routes;
    const [tax, setTax] = useState("");

    const handleSaveCategory = async () => {
        if (!tax) {
            alert("Please enter a tax.");
            return;
        }
        const taxValue = parseFloat(tax);
        if (isNaN(taxValue)) {
            alert("Please enter a valid number.");
            return;
        }
        const response = await saveTax(taxValue);
        if (response) {
            alert("Tax saved successfully!");
            setTax("");
        } else {
            alert("Failed to save tax.");
        }
    };

    return (
        <>
            {/* Add Tax */}
            <div className="modal fade" id="add-units-tax">
                <div className="modal-dialog modal-dialog-centered custom-modal-two">
                    <div className="modal-content">
                        <div className="page-wrapper-new p-0">
                            <div className="content">
                                <div className="modal-header border-0 custom-modal-header">
                                    <div className="page-title">
                                        <h4>Add New Tax</h4>
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
                                            value={tax}
                                            onChange={(e) => setTax(e.target.value)}
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
            {/* /Add Tax */}
        </>
    );
};

export default AddTax;
