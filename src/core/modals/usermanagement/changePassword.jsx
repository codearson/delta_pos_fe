import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import { updateUser } from '../../../feature-module/Api/UserApi';
import { fetchUserRoles } from '../../../feature-module/Api/UserRoleApi';
import Select from 'react-select';

const ChangePassword = ({ user, onUpdate }) => {
    const MySwal = withReactContent(Swal);
    
    const [formData, setFormData] = useState({
        id: '',
        firstName: '',
        lastName: '',
        mobileNumber: '',
        emailAddress: '',
        address: '',
        password: '',
        confirmPassword: '',
        createdDate: null,
        isActive: true,
        userRoleDto: { userRole: '' }
    });

    const [passwordError, setPasswordError] = useState('');
    const [showPassword, setShowPassword] = useState({
        password: false,
        confirmPassword: false
    });

    const [roleOptions, setRoleOptions] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);

    const togglePasswordVisibility = (field) => {
        setShowPassword(prevShowPassword => ({
            ...prevShowPassword,
            [field]: !prevShowPassword[field]
        }));
    };

    useEffect(() => {
        if (user) {
            setFormData({
                id: user.id,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                mobileNumber: user.mobileNumber || '',
                emailAddress: user.emailAddress || '',
                address: user.address || '',
                password: '',
                confirmPassword: '',
                createdDate: user.createdDate,
                isActive: user.isActive || true,
                userRoleDto: user.userRoleDto || { userRole: '' }
            });
            setPasswordError('');
        }
    }, [user]);

    useEffect(() => {
        loadUserRoles();
    }, []);

    const loadUserRoles = async () => {
        try {
            const roles = await fetchUserRoles();
            const formattedRoles = roles.map(role => ({
                value: role.id,
                label: role.userRole
            }));
            setRoleOptions(formattedRoles);
        } catch (error) {
            console.error('Error loading user roles:', error);
        }
    };

    const handleRoleChange = (selectedOption) => {
        setSelectedRole(selectedOption);
        setFormData(prev => ({
            ...prev,
            userRoleDto: {
                id: selectedOption.value,
                userRole: selectedOption.label
            }
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'password' || name === 'confirmPassword') {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
            
            setPasswordError('');
        }
    };

    const validatePasswords = () => {
        if (!formData.password) {
            setPasswordError('Password is required');
            return false;
        }
        if (formData.password.length < 6) {
            setPasswordError('Password must be at least 6 characters long');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setPasswordError('Passwords do not match');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validatePasswords()) {
            MySwal.fire({
                title: 'Error!',
                text: passwordError,
                icon: 'error',
                confirmButtonText: 'OK',
            });
            return;
        }

        try {
            MySwal.fire({
                title: 'Are you sure?',
                text: "You want to update this user's password?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, update it!',
                cancelButtonText: 'No, cancel!',
                confirmButtonColor: '#00ff00',
                cancelButtonColor: '#ff0000',
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        const dataToSend = { ...formData };
                        const response = await updateUser(dataToSend);
                        
                        if (response && response.status === true) {
                            document.querySelector('#change-password button[data-bs-dismiss="modal"]').click();

                            MySwal.fire({
                                title: 'Updated!',
                                text: 'Password has been updated successfully.',
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
                                text: response.errorDescription || 'Failed to update password',
                                icon: 'error',
                                confirmButtonText: 'OK',
                            });
                        }
                    } catch (error) {
                        console.error('Error updating password:', error);
                        MySwal.fire({
                            title: 'Error!',
                            text: 'Failed to update password. Please check the console for details.',
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
        <div className="modal fade" id="change-password">
            <div className="modal-dialog modal-dialog-centered custom-modal-two">
                <div className="modal-content">
                    <div className="page-wrapper-new p-0">
                        <div className="content">
                            <div className="modal-header border-0 custom-modal-header">
                                <div className="page-title">
                                    <h4>Change Password</h4>
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
                                        <div className="col-lg-12">
                                            <div className="input-blocks">
                                                <label>User Role</label>
                                                <Select
                                                    className="select"
                                                    options={roleOptions}
                                                    value={selectedRole}
                                                    onChange={handleRoleChange}
                                                    placeholder="Choose Role"
                                                    isSearchable={true}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-lg-12">
                                            <div className="input-blocks">
                                                <label>New Password</label>
                                                <div className="input-group">
                                                    <input
                                                        type={showPassword.password ? "text" : "password"}
                                                        name="password"
                                                        value={formData.password}
                                                        onChange={handleInputChange}
                                                        required
                                                        className="form-control"
                                                        placeholder="Enter new password"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-secondary"
                                                        onClick={() => togglePasswordVisibility('password')}
                                                    >
                                                        <i className={`fa ${showPassword.password ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-12">
                                            <div className="input-blocks">
                                                <label>Confirm Password</label>
                                                <div className="input-group">
                                                    <input
                                                        type={showPassword.confirmPassword ? "text" : "password"}
                                                        name="confirmPassword"
                                                        value={formData.confirmPassword}
                                                        onChange={handleInputChange}
                                                        required
                                                        className="form-control"
                                                        placeholder="Confirm new password"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-secondary"
                                                        onClick={() => togglePasswordVisibility('confirmPassword')}
                                                    >
                                                        <i className={`fa ${showPassword.confirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        {passwordError && (
                                            <div className="col-lg-12">
                                                <div className="alert alert-danger">
                                                    {passwordError}
                                                </div>
                                            </div>
                                        )}
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
                                            Update Password
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

ChangePassword.propTypes = {
    user: PropTypes.shape({
        id: PropTypes.number,
        firstName: PropTypes.string,
        lastName: PropTypes.string,
        mobileNumber: PropTypes.string,
        emailAddress: PropTypes.string,
        address: PropTypes.string,
        createdDate: PropTypes.string,
        isActive: PropTypes.bool,
        userRoleDto: PropTypes.shape({
            userRole: PropTypes.string,
            id: PropTypes.number,
            isActive: PropTypes.bool
        })
    }),
    onUpdate: PropTypes.func.isRequired
};

ChangePassword.defaultProps = {
    user: null
};

export default ChangePassword;
