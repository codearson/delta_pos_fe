import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
//import Select from 'react-select'
import { updateUser } from '../../../feature-module/Api/UserApi';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';

const EditUser = ({ user, onUpdate }) => {
    const MySwal = withReactContent(Swal);
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        mobileNumber: '',
        emailAddress: '',
        address: '',
        userRoleDto: { userRole: '' },
        password: '',
        createdDate: null,
        isActive: true
    });

    useEffect(() => {
        if (user) {
            console.log('Received user data:', user);
            setFormData({
                id: user.id,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                mobileNumber: user.mobileNumber || '',
                emailAddress: user.emailAddress || '',
                address: user.address || '',
                userRoleDto: user.userRoleDto || { userRole: '' },
                password: user.password || '',
                createdDate: user.createdDate,
                isActive: user.isActive || true
            });
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            MySwal.fire({
                title: 'Are you sure?',
                text: "You want to update this user?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, update it!',
                cancelButtonText: 'No, cancel!',
                confirmButtonColor: '#00ff00',
                cancelButtonColor: '#ff0000',
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        console.log('Sending update data:', formData);
                        
                        const response = await updateUser(formData);
                        console.log('Update response:', response);
                        
                        if (response && response.status === true) {
                            document.querySelector('#edit-units button[data-bs-dismiss="modal"]').click();
                            MySwal.fire({
                                title: 'Updated!',
                                text: 'User has been updated successfully.',
                                icon: 'success',
                                confirmButtonText: 'OK',
                                customClass: {
                                    confirmButton: 'btn btn-success',
                                },
                            });
                            onUpdate();
                        } else {
                            MySwal.fire({
                                title: 'Update Failed',
                                text: response.errorDescription || 'Failed to update user',
                                icon: 'error',
                                confirmButtonText: 'OK',
                            });
                        }
                    } catch (error) {
                        console.error('Error updating user:', error);
                        MySwal.fire({
                            title: 'Error!',
                            text: 'Failed to update user. Please check the console for details.',
                            icon: 'error',
                            confirmButtonText: 'OK',
                        });
                    }
                }
            });
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            MySwal.fire({
                title: 'Error!',
                text: 'Something went wrong.',
                icon: 'error',
                confirmButtonText: 'OK',
            });
        }
    };

    return (
        <div>
            <div className="modal fade" id="edit-units">
                <div className="modal-dialog modal-dialog-centered custom-modal-two">
                    <div className="modal-content">
                        <div className="page-wrapper-new p-0">
                            <div className="content">
                                <div className="modal-header border-0 custom-modal-header">
                                    <div className="page-title">
                                        <h4>Edit User</h4>
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
                                        <div className="row">
                                            <div className="col-lg-6">
                                                <div className="input-blocks">
                                                    <label>First Name</label>
                                                    <input 
                                                        type="text" 
                                                        name="firstName"
                                                        value={formData.firstName}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-lg-6">
                                                <div className="input-blocks">
                                                    <label>Last Name</label>
                                                    <input 
                                                        type="text" 
                                                        name="lastName"
                                                        value={formData.lastName}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-lg-6">
                                                <div className="input-blocks">
                                                    <label>Phone</label>
                                                    <input 
                                                        type="text" 
                                                        name="mobileNumber"
                                                        value={formData.mobileNumber}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-lg-6">
                                                <div className="input-blocks">
                                                    <label>Email</label>
                                                    <input 
                                                        type="email" 
                                                        name="emailAddress"
                                                        value={formData.emailAddress}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-lg-12">
                                                <div className="input-blocks">
                                                    <label>Address</label>
                                                    <input
                                                        type="text" 
                                                        name="address"
                                                        value={formData.address}
                                                        onChange={handleInputChange}
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
                                            <button type="submit" className="btn btn-submit">
                                                Update
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
    )
}

EditUser.propTypes = {
    user: PropTypes.shape({
        id: PropTypes.number,
        firstName: PropTypes.string,
        lastName: PropTypes.string,
        mobileNumber: PropTypes.string,
        emailAddress: PropTypes.string,
        address: PropTypes.string,
        password: PropTypes.string,
        createdDate: PropTypes.string,
        isActive: PropTypes.bool,
        userRoleDto: PropTypes.shape({
            id: PropTypes.number,
            userRole: PropTypes.string,
            isActive: PropTypes.bool
        })
    }),
    onUpdate: PropTypes.func.isRequired
};

EditUser.defaultProps = {
    user: null
};

export default EditUser
