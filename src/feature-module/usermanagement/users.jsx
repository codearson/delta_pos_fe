import React, { useState, useEffect } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ImageWithBasePath from '../../core/img/imagewithbasebath';
import { ChevronUp, RotateCcw } from 'feather-icons-react/build/IconComponents';
import { setToogleHeader } from '../../core/redux/action';
import { useDispatch, useSelector } from 'react-redux';
import { PlusCircle, Edit, Lock } from 'react-feather';
import Select from 'react-select';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import Table from '../../core/pagination/datatable';
import AddUsers from '../../core/modals/usermanagement/addusers';
import EditUser from '../../core/modals/usermanagement/edituser';
import { fetchUsers, updateUserStatus } from '../Api/UserApi';
import { fetchUserRoles } from '../Api/UserRoleApi';
import ChangePassword from '../../core/modals/usermanagement/changePassword';
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import * as XLSX from "xlsx";
import "../../style/scss/pages/_categorylist.scss";

const Users = () => {
    const [userData, setUserData] = useState({ payload: [], totalRecords: 0 });
    const [allUsers, setAllUsers] = useState([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedUserForPassword, setSelectedUserForPassword] = useState(null);
    const [reversedUsers, setReversedUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showActive, setShowActive] = useState(true);
    const [togglingId, setTogglingId] = useState(null);
    const [selectedRole, setSelectedRole] = useState(null);
    const [roleOptions, setRoleOptions] = useState([]);
    
    const dispatch = useDispatch();
    const data = useSelector((state) => state.toggle_header);
    const MySwal = withReactContent(Swal);

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (!initialLoading) {
            loadUsers(false);
        }
    }, [currentPage, pageSize, showActive, selectedRole]);

    const loadInitialData = async () => {
        setInitialLoading(true);
        try {
            await Promise.all([loadUsers(true), loadUserRoles()]);
        } catch (error) {
            console.error('Error loading initial data:', error);
        } finally {
            setInitialLoading(false);
        }
    };

    const loadUserRoles = async () => {
        try {
            const roles = await fetchUserRoles();
            const formattedRoles = [
                ...roles.map(role => ({
                    value: role.userRole,
                    label: role.userRole
                }))
            ];
            setRoleOptions(formattedRoles);
        } catch (error) {
            console.error('Error loading user roles:', error);
            setRoleOptions([{ value: 'all', label: 'All Roles' }]);
        }
    };

    const loadUsers = async (isInitial = false) => {
        try {
            if (isInitial) {
                setInitialLoading(true);
            }
            const result = await fetchUsers(currentPage, pageSize);
            const normalizedData = result.payload.map(user => ({
                ...user,
                isActive: user.isActive === true || user.isActive === 1
            }));
            setUserData(result);
            setAllUsers(normalizedData);
            filterData(normalizedData, searchTerm, selectedRole);
        } catch (error) {
            console.error('Error fetching users:', error);
            Swal.fire({
                title: "Error!",
                text: "Failed to fetch users: " + error.message,
                icon: "error",
                confirmButtonText: "OK",
            });
        } finally {
            if (isInitial) {
                setInitialLoading(false);
            }
        }
    };

    const filterData = (usersData, query, roleFilter) => {
        let filteredData = usersData.filter(user => user.isActive === showActive);

        // Apply text search
        if (query.trim() !== "") {
            filteredData = filteredData.filter(user =>
                (user.firstName && `${user.firstName} ${user.lastName}`.toLowerCase().includes(query.toLowerCase())) ||
                (user.emailAddress && user.emailAddress.toLowerCase().includes(query.toLowerCase())) ||
                (user.mobileNumber && user.mobileNumber.toLowerCase().includes(query.toLowerCase()))
            );
        }

        // Apply role filter
        if (roleFilter && roleFilter.value !== 'all') {
            filteredData = filteredData.filter(user => 
                user.userRoleDto?.userRole === roleFilter.value
            );
        }

        setReversedUsers(filteredData.reverse());
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        filterData(allUsers, value, selectedRole);
    };

    const handleRoleChange = (selected) => {
        setSelectedRole(selected);
        filterData(allUsers, searchTerm, selected);
    };

    const exportToPDF = () => {
        try {
            const doc = new jsPDF();
            doc.text(`User List (${showActive ? 'Active' : 'Inactive'})`, 14, 15);

            const tableColumn = ["Name", "Phone", "Email", "Address", "Role"];
            const tableRows = reversedUsers.map(user => [
                `${user.firstName} ${user.lastName}` || "",
                user.mobileNumber || "",
                user.emailAddress || "",
                user.address || "",
                user.userRoleDto?.userRole || ""
            ]);

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 20,
                theme: 'grid',
                styles: { fontSize: 10 },
                headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            });

            doc.save(`user_list_${showActive ? 'active' : 'inactive'}.pdf`);
        } catch (error) {
            Swal.fire({
                title: "Error!",
                text: "Failed to generate PDF: " + error.message,
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    };

    const exportToExcel = () => {
        try {
            if (!reversedUsers || reversedUsers.length === 0) {
                Swal.fire({
                    title: "No Data",
                    text: "There are no users to export",
                    icon: "warning",
                    confirmButtonText: "OK",
                });
                return;
            }

            const worksheetData = reversedUsers.map(user => ({
                "Name": `${user.firstName} ${user.lastName}` || "",
                "Phone": user.mobileNumber || "",
                "Email": user.emailAddress || "",
                "Address": user.address || "",
                "Role": user.userRoleDto?.userRole || ""
            }));

            const worksheet = XLSX.utils.json_to_sheet(worksheetData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

            worksheet["!cols"] = [{ wch: 20 }, { wch: 15 }, { wch: 30 }, { wch: 25 }, { wch: 15 }];

            XLSX.writeFile(workbook, `user_list_${showActive ? 'active' : 'inactive'}.xlsx`);
        } catch (error) {
            Swal.fire({
                title: "Error!",
                text: "Failed to export to Excel: " + error.message,
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    };

    const handleToggleStatus = (userId, currentStatus) => {
        setTogglingId(userId);
        const newStatusText = currentStatus ? 'Inactive' : 'Active';

        MySwal.fire({
            title: 'Are you sure?',
            text: `Do you want to change this user to ${newStatusText}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, change it!',
            cancelButtonText: 'No, cancel'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const newStatus = !currentStatus;
                    const response = await updateUserStatus(userId, newStatus);
                    if (response) {
                        await loadUsers(false);
                        MySwal.fire({
                            title: "Success!",
                            text: `User status changed to ${newStatusText}.`,
                            icon: "success",
                            confirmButtonText: "OK",
                            customClass: { confirmButton: "btn btn-success" },
                        });
                    } else {
                        throw new Error("Failed to update status");
                    }
                } catch (error) {
                    MySwal.fire({
                        title: "Error!",
                        text: "Failed to update user status: " + error.message,
                        icon: "error",
                        confirmButtonText: "OK",
                        customClass: { confirmButton: "btn btn-danger" },
                    });
                }
            }
            setTogglingId(null);
        });
    };

    const columns = [
        {
            title: "Name",
            render: (text, record) => (
                <span className="userimgname">
                    <Link to="#" className="userslist-img bg-img">
                        <ImageWithBasePath alt="" src={record.img} />
                    </Link>
                    <div>
                        <Link to="#">{`${record.firstName} ${record.lastName}`}</Link>
                    </div>
                </span>
            ),
            sorter: (a, b) => (a.firstName + a.lastName).length - (b.firstName + b.lastName).length,
        },
        {
            title: "Phone",
            dataIndex: "mobileNumber",
            sorter: (a, b) => a.mobileNumber.length - b.mobileNumber.length,
        },
        {
            title: "Email",
            dataIndex: "emailAddress",
            sorter: (a, b) => a.emailAddress.length - b.emailAddress.length,
        },
        {
            title: "Address",
            dataIndex: "address",
            sorter: (a, b) => a.address.length - b.address.length,
        },
        {
            title: "Role",
            dataIndex: ["userRoleDto", "userRole"],
            render: (text) => (
                <span className="badge badge-primary">
                    {text}
                </span>
            ),
            sorter: (a, b) => a.userRoleDto.userRole.length - b.userRoleDto.userRole.length,
        },
        {
            title: "Status",
            dataIndex: "isActive",
            render: (isActive, record) => (
                <div className={`form-check form-switch ${togglingId === record.id ? 'toggling' : ''}`}>
                    <input
                        className="form-check-input"
                        type="checkbox"
                        checked={isActive}
                        onChange={() => handleToggleStatus(record.id, isActive)}
                        disabled={togglingId === record.id}
                    />
                </div>
            ),
        },
        {
            title: 'Actions',
            render: (_, record) => (
                <td className="action-table-data">
                    <div className="edit-delete-action">
                        <Link 
                            className="me-2 p-2" 
                            to="#"
                            data-bs-toggle="modal"
                            data-bs-target="#change-password"
                            onClick={() => setSelectedUserForPassword(record)}
                        >
                            <Lock className="feather feather-lock action-lock" />
                        </Link>
                        <Link 
                            className="me-2 p-2" 
                            to="#" 
                            data-bs-toggle="modal" 
                            data-bs-target="#edit-units"
                            onClick={() => setSelectedUser(record)}
                        >
                            <Edit className="feather-edit" />
                        </Link>
                    </div>
                </td>
            )
        },
    ];

    const handlePageChange = (page, pageSize) => {
        setCurrentPage(page);
        setPageSize(pageSize);
    };

    const renderTooltip = (props) => (
        <Tooltip id="pdf-tooltip" {...props}>Pdf</Tooltip>
    );
    const renderExcelTooltip = (props) => (
        <Tooltip id="excel-tooltip" {...props}>Excel</Tooltip>
    );
    const renderPrinterTooltip = (props) => (
        <Tooltip id="printer-tooltip" {...props}>Printer</Tooltip>
    );
    const renderRefreshTooltip = (props) => (
        <Tooltip id="refresh-tooltip" {...props}>Refresh</Tooltip>
    );
    const renderCollapseTooltip = (props) => (
        <Tooltip id="collapse-tooltip" {...props}>Collapse</Tooltip>
    );

    if (initialLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <div className="page-wrapper">
                <div className="content">
                    <div className="page-header">
                        <div className="add-item d-flex flex-column">
                            <div className="page-title">
                                <h4>User List</h4>
                                <h6>Manage Your Users</h6>
                            </div>
                            <div className="status-toggle-btns mt-2">
                                <div className="btn-group" role="group">
                                    <button
                                        type="button"
                                        className={`btn ${showActive ? 'btn-primary active' : 'btn-outline-primary'}`}
                                        onClick={() => setShowActive(true)}
                                    >
                                        Active
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn ${!showActive ? 'btn-primary active' : 'btn-outline-primary'}`}
                                        onClick={() => setShowActive(false)}
                                    >
                                        Inactive
                                    </button>
                                </div>
                            </div>
                        </div>
                        <ul className="table-top-head">
                            <li>
                                <OverlayTrigger placement="top" overlay={renderTooltip}>
                                    <Link onClick={exportToPDF}>
                                        <ImageWithBasePath src="assets/img/icons/pdf.svg" alt="img" />
                                    </Link>
                                </OverlayTrigger>
                            </li>
                            <li>
                                <OverlayTrigger placement="top" overlay={renderExcelTooltip}>
                                    <Link onClick={exportToExcel}>
                                        <ImageWithBasePath src="assets/img/icons/excel.svg" alt="img" />
                                    </Link>
                                </OverlayTrigger>
                            </li>
                            <li>
                                <OverlayTrigger placement="top" overlay={renderPrinterTooltip}>
                                    <Link data-bs-toggle="tooltip" data-bs-placement="top">
                                        <i data-feather="printer" className="feather-printer" />
                                    </Link>
                                </OverlayTrigger>
                            </li>
                            <li>
                                <OverlayTrigger placement="top" overlay={renderRefreshTooltip}>
                                    <Link onClick={() => loadUsers(false)}>
                                        <RotateCcw />
                                    </Link>
                                </OverlayTrigger>
                            </li>
                            <li>
                                <OverlayTrigger placement="top" overlay={renderCollapseTooltip}>
                                    <Link
                                        data-bs-toggle="tooltip"
                                        data-bs-placement="top"
                                        id="collapse-header"
                                        className={data ? "active" : ""}
                                        onClick={() => { dispatch(setToogleHeader(!data)) }}
                                    >
                                        <ChevronUp />
                                    </Link>
                                </OverlayTrigger>
                            </li>
                        </ul>
                        <div className="page-btn">
                            <a
                                to="#"
                                className="btn btn-added"
                                data-bs-toggle="modal"
                                data-bs-target="#add-units"
                            >
                                <PlusCircle className="me-2" />
                                Add New User
                            </a>
                        </div>
                    </div>
                    <div className="card table-list-card">
                        <div className="card-body">
                            <div className="table-top">
                                <div className="search-set">
                                    <div className="search-path d-flex align-items-center gap-2" style={{ width: '100%' }}>
                                        <div className="search-input">
                                            <input
                                                type="text"
                                                placeholder="Search"
                                                className="form-control form-control-sm formsearch"
                                                value={searchTerm}
                                                onChange={handleSearch}
                                            />
                                            <Link to="#" className="btn btn-searchset">
                                                <i data-feather="search" className="feather-search" />
                                            </Link>
                                        </div>
                                        <div style={{ width: '200px' }}>
                                            <Select
                                                className="select"
                                                options={roleOptions}
                                                placeholder="Select Role"
                                                value={selectedRole}
                                                onChange={handleRoleChange}
                                                isClearable
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="table-responsive">
                                <Table 
                                    columns={columns} 
                                    dataSource={reversedUsers} 
                                    pagination={{
                                        current: currentPage,
                                        pageSize: pageSize,
                                        onChange: handlePageChange,
                                        total: userData.totalRecords
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <AddUsers/>
            <EditUser user={selectedUser} onUpdate={() => {
                setSelectedUser(null);
                loadUsers(false);
            }}/>
            <ChangePassword user={selectedUserForPassword} onUpdate={() => {
                setSelectedUserForPassword(null);
                loadUsers(false);
            }}/>
        </div>
    );
};

export default Users;