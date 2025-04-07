import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Table from "../../core/pagination/datatable";
import { fetchAdmins } from "../Api/UserApi";
import Swal from "sweetalert2";
import { decodeJwt } from "../Api/UserApi";

const RolesPermissions = () => {
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMailPopup, setShowMailPopup] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [mailContent, setMailContent] = useState({
    subject: '',
    message: '',
    from: ''
  });
  const [errors, setErrors] = useState({
    subject: '',
    message: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      const decodedToken = decodeJwt(accessToken);
      setMailContent(prev => ({
        ...prev,
        from: decodedToken?.sub || ''
      }));
    }
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetchAdmins(pagination.current, pagination.pageSize);
      const userData = response.payload || [];
      const adminUsers = userData.filter(user =>
        user.userRoleDto?.userRole === "ADMIN"
      );

      const transformedData = adminUsers.map(user => ({
        id: user.id,
        username: `${user.firstName} ${user.lastName}`,
        email: user.emailAddress,
        status: user.isActive ? 'Active' : 'Inactive',
        userRoleDto: {
          userRole: user.userRoleDto?.userRole || ''
        },
        branch: user.branchDto?.branchName || '',
        mobileNumber: user.mobileNumber,
        createdDate: user.createdDate
      }));

      console.log('Transformed Data:', transformedData);

      setUsersData(transformedData);
      setPagination(prev => ({
        ...prev,
        total: transformedData.length
      }));
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [pagination.current, pagination.pageSize]);

  const handleMailClick = (user) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      const decodedToken = decodeJwt(accessToken);
      setMailContent({
        subject: '',
        message: '',
        from: decodedToken?.sub || ''
      });
    }
    setSelectedUser(user);
    setShowMailPopup(true);
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      subject: '',
      message: ''
    };

    if (!mailContent.subject.trim()) {
      newErrors.subject = 'Subject is required';
      isValid = false;
    }

    if (!mailContent.message.trim()) {
      newErrors.message = 'Message is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSendMail = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // First close the email popup
      handleClosePopup();
      
      // Then show success popup
      Swal.fire({
        title: 'Success!',
        text: 'Email has been sent successfully',
        icon: 'success',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'btn btn-success'
        }
      });
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to send email. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'btn btn-danger'
        }
      });
    }
  };

  const handleClosePopup = () => {
    setShowMailPopup(false);
    setSelectedUser(null);
    setMailContent({ subject: '', message: '', from: '' });
    setErrors({ subject: '', message: '' });
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "username",
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: "Email",
      dataIndex: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: "Mobile",
      dataIndex: "mobileNumber",
      sorter: (a, b) => a.mobileNumber.localeCompare(b.mobileNumber),
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (_, record) => (
        <td className="action-table-data">
          <div className="edit-delete-action">
            <Link className="me-2 p-2" to="#" onClick={() => handleMailClick(record)}>
              <i data-feather="mail" className="feather-mail"></i>
            </Link>
          </div>
        </td>
      ),
    },
  ];

  return (
    <div>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4>Admin Details</h4>
                <h6>Contact Admin Details</h6>
              </div>
            </div>
          </div>
          {/* /product list */}
          <div className="card table-list-card">
            <div className="card-body">
              <div className="table-responsive">
                <Table
                  className="table datanew dataTable no-footer"
                  columns={columns}
                  dataSource={usersData}
                  loading={loading}
                  pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    onChange: (page, pageSize) => {
                      setPagination({
                        current: page,
                        pageSize: pageSize,
                        total: pagination.total
                      });
                    }
                  }}
                  rowKey={(record) => record.id}
                />
              </div>
            </div>
          </div>
          {/* /product list */}
        </div>
      </div>

      {/* Mail Popup */}
      {showMailPopup && (
        <div className="admin-mail-popup-overlay">
          <div className="admin-mail-popup">
            <div className="admin-mail-popup-header">
              <h3>Send Email</h3>
              <button className="admin-close-button" onClick={handleClosePopup}>&times;</button>
            </div>
            <div className="admin-mail-popup-content">
              <div className="admin-mail-field">
                <label>From:</label>
                <input type="text" value={mailContent.from} readOnly />
              </div>
              <div className="admin-mail-field">
                <label>To:</label>
                <input type="text" value={selectedUser?.email} readOnly />
              </div>
              <div className="admin-mail-field">
                <label>Subject: <span className="text-danger">*</span></label>
                <input
                  type="text"
                  value={mailContent.subject}
                  onChange={(e) => setMailContent({ ...mailContent, subject: e.target.value })}
                  placeholder="Enter subject"
                  className={errors.subject ? 'is-invalid' : ''}
                />
                {errors.subject && <div className="invalid-feedback">{errors.subject}</div>}
              </div>
              <div className="admin-mail-field">
                <label>Message: <span className="text-danger">*</span></label>
                <textarea
                  value={mailContent.message}
                  onChange={(e) => setMailContent({ ...mailContent, message: e.target.value })}
                  placeholder="Enter your message"
                  rows={6}
                  className={errors.message ? 'is-invalid' : ''}
                />
                {errors.message && <div className="invalid-feedback">{errors.message}</div>}
              </div>
            </div>
            <div className="admin-mail-popup-footer">
              <button className="admin-cancel-button" onClick={handleClosePopup}>Cancel</button>
              <button className="admin-send-button" onClick={handleSendMail}>Send</button>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          .admin-mail-popup-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
          }

          .admin-mail-popup {
            background: white;
            border-radius: 8px;
            width: 500px;
            max-width: 90%;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            position: relative;
          }

          .admin-mail-popup-header {
            padding: 15px 20px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .admin-mail-popup-header h3 {
            margin: 0;
            font-size: 18px;
            color: #333;
          }

          .admin-close-button {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #666;
            padding: 0;
            line-height: 1;
          }

          .admin-mail-popup-content {
            padding: 20px;
          }

          .admin-mail-field {
            margin-bottom: 15px;
          }

          .admin-mail-field label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
            color: #333;
          }

          .admin-mail-field input,
          .admin-mail-field textarea {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            background-color: #fff;
          }

          .admin-mail-field textarea {
            resize: vertical;
          }

          .admin-mail-popup-footer {
            padding: 15px 20px;
            border-top: 1px solid #eee;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
          }

          .admin-cancel-button,
          .admin-send-button {
            padding: 8px 16px;
            border-radius: 4px;
            border: none;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.3s ease;
          }

          .admin-cancel-button {
            background-color: #f0f0f0;
            color: #333;
          }

          .admin-cancel-button:hover {
            background-color: #e0e0e0;
          }

          .admin-send-button {
            background-color: #007bff;
            color: white;
          }

          .admin-send-button:hover {
            background-color: #0056b3;
          }
        `}
      </style>
    </div>
  );
};

export default RolesPermissions;
