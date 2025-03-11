import React, { useState, useEffect } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ImageWithBasePath from '../../core/img/imagewithbasebath';
import { ChevronUp, RotateCcw } from 'feather-icons-react/build/IconComponents';
import { setToogleHeader } from '../../core/redux/action';
import { useDispatch, useSelector } from 'react-redux';
import { Filter, PlusCircle, StopCircle, User, Zap, Edit, Trash2, Lock } from 'react-feather';
import Select from 'react-select';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import Table from '../../core/pagination/datatable';
import AddUsers from '../../core/modals/usermanagement/addusers';
import EditUser from '../../core/modals/usermanagement/edituser';
import { fetchUsers, updateUserStatus } from '../Api/UserApi';
import ChangePassword from '../../core/modals/usermanagement/changePassword';

const Users = () => {
    const [userData, setUserData] = useState({ payload: [], totalRecords: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedUserForPassword, setSelectedUserForPassword] = useState(null);
    const [reversedUsers, setReversedUsers] = useState([]);
    
    const dispatch = useDispatch();
    const data = useSelector((state) => state.toggle_header);

    useEffect(() => {
        const loadUsers = async () => {
            try {
                setIsLoading(true);
                const result = await fetchUsers(currentPage, pageSize);
                setUserData(result);
                setReversedUsers([...result.payload].reverse());
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadUsers();
    }, [currentPage, pageSize]);

    const users = [
        { value: 'Choose Name', label: 'Choose Name' },
        { value: 'Lilly', label: 'Lilly' },
        { value: 'Benjamin', label: 'Benjamin' },
    ];

    const status = [
        { value: 'Choose Name', label: 'Choose Status' },
        { value: 'Active', label: 'Active' },
        { value: 'InActive', label: 'InActive' },
    ];

    const role = [
        { value: 'Choose Role', label: 'Choose Role' },
        { value: 'Store Keeper', label: 'Store Keeper' },
        { value: 'Salesman', label: 'Salesman' },
    ];

    const toggleFilterVisibility = () => {
        setIsFilterVisible(!isFilterVisible);
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
        // {
        //     title: "Status",
        //     dataIndex: "isActive",
        //     render: (isActive) => (
        //         <div>
        //             {isActive ? (
        //                 <span className="badge badge-linesuccess">Active</span>
        //             ) : (
        //                 <span className="badge badge-linedanger">Inactive</span>
        //             )}
        //         </div>
        //     ),
        //     sorter: (a, b) => (a.isActive === b.isActive ? 0 : a.isActive ? 1 : -1),
        // },
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
                            onClick={() => {
                                console.log('Setting selected user:', record); // Debug log
                                setSelectedUser(record);
                            }}
                        >
                            <Edit className="feather-edit" />
                        </Link>
                        <Link 
                            className="confirm-text p-2" 
                            to="#" 
                            onClick={() => showConfirmationAlert(record.id)}
                        >
                            <Trash2 className="feather-trash-2" />
                        </Link>
                    </div>
                </td>
            )
        },
    ];

    const MySwal = withReactContent(Swal);

    const showConfirmationAlert = (userId) => {
        MySwal.fire({
            title: 'Are you sure?',
            text: 'You won\'t be able to revert this!',
            showCancelButton: true,
            confirmButtonColor: '#00ff00',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonColor: '#ff0000',
            cancelButtonText: 'Cancel',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await updateUserStatus(userId, false);
                    if (response) {
                        MySwal.fire({
                            title: 'Success!',
                            text: 'User has been deactivated.',
                            icon: 'success',
                            confirmButtonText: 'OK',
                            customClass: {
                                confirmButton: 'btn btn-success',
                            },
                        });
                        const result = await fetchUsers(currentPage, pageSize);
                        setUserData(result);
                        setReversedUsers([...result.payload].reverse());
                    }
                } catch (error) {
                    console.error('Error deactivating user:', error);
                    MySwal.fire({
                        title: 'Error!',
                        text: 'Failed to deactivate user.',
                        icon: 'error',
                        confirmButtonText: 'OK',
                    });
                }
            }
        });
    };

    const handlePageChange = (page, pageSize) => {
        setCurrentPage(page);
        setPageSize(pageSize);
    };

    const loadUsers = () => {
        console.log('Loading users...');
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    const renderTooltip = (props) => (
        <Tooltip id="pdf-tooltip" {...props}>
            Pdf
        </Tooltip>
    );
    const renderExcelTooltip = (props) => (
        <Tooltip id="excel-tooltip" {...props}>
            Excel
        </Tooltip>
    );
    const renderPrinterTooltip = (props) => (
        <Tooltip id="printer-tooltip" {...props}>
            Printer
        </Tooltip>
    );
    const renderRefreshTooltip = (props) => (
        <Tooltip id="refresh-tooltip" {...props}>
            Refresh
        </Tooltip>
    );
    const renderCollapseTooltip = (props) => (
        <Tooltip id="refresh-tooltip" {...props}>
            Collapse
        </Tooltip>
    )

    return (
        <div>
            <div className="page-wrapper">
                <div className="content">
                    <div className="page-header">
                        <div className="add-item d-flex">
                            <div className="page-title">
                                <h4>User List</h4>
                                <h6>Manage Your Users</h6>
                            </div>
                        </div>
                        <ul className="table-top-head">
                            <li>
                                <OverlayTrigger placement="top" overlay={renderTooltip}>
                                    <Link>
                                        <ImageWithBasePath src="assets/img/icons/pdf.svg" alt="img" />
                                    </Link>
                                </OverlayTrigger>
                            </li>
                            <li>
                                <OverlayTrigger placement="top" overlay={renderExcelTooltip}>
                                    <Link data-bs-toggle="tooltip" data-bs-placement="top">
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

                                    <Link data-bs-toggle="tooltip" data-bs-placement="top">
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
                    {/* /product list */}
                    <div className="card table-list-card">
                        <div className="card-body">
                            <div className="table-top">
                                <div className="search-set">
                                    <div className="search-input">
                                        <input
                                            type="text"
                                            placeholder="Search"
                                            className="form-control form-control-sm formsearch"
                                        />
                                        <Link to className="btn btn-searchset">
                                            <i data-feather="search" className="feather-search" />
                                        </Link>
                                    </div>
                                </div>
                                <div className="search-path">
                                    <Link className={`btn btn-filter ${isFilterVisible ? "setclose" : ""}`} id="filter_search">
                                        <Filter
                                            className="filter-icon"
                                            onClick={toggleFilterVisibility}
                                        />
                                        <span onClick={toggleFilterVisibility}>
                                            <ImageWithBasePath src="assets/img/icons/closes.svg" alt="img" />
                                        </span>
                                    </Link>
                                </div>
                            </div>
                            {/* /Filter */}
                            <div
                                className={`card${isFilterVisible ? ' visible' : ''}`}
                                id="filter_inputs"
                                style={{ display: isFilterVisible ? 'block' : 'none' }}
                            >
                                <div className="card-body pb-0">
                                    <div className="row">
                                        <div className="col-lg-3 col-sm-6 col-12">
                                            <div className="input-blocks">
                                                <User className="info-img" />

                                                <Select
                                                    className="select"
                                                    options={users}
                                                    placeholder="Newest"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-sm-6 col-12">
                                            <div className="input-blocks">
                                                <StopCircle className="info-img" />

                                                <Select
                                                    className="select"
                                                    options={status}
                                                    placeholder="Choose Status"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-sm-6 col-12">
                                            <div className="input-blocks">
                                                <Zap className="info-img" />

                                                <Select
                                                    className="select"
                                                    options={role}
                                                    placeholder="Choose Role"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-sm-6 col-12">
                                            <div className="input-blocks">
                                                <a className="btn btn-filters ms-auto">
                                                    {" "}
                                                    <i data-feather="search" className="feather-search" />{" "}
                                                    Search{" "}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* /Filter */}
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
                    {/* /product list */}
                </div>
            </div>
            <AddUsers/>
            <EditUser user={selectedUser} onUpdate={() => {
                setSelectedUser(null);
                fetchUsers(currentPage, pageSize).then(result => setUserData(result));
            }}/>
            <ChangePassword user={selectedUserForPassword} onUpdate={() => {
                setSelectedUserForPassword(null);
                fetchUsers(currentPage, pageSize).then(result => setUserData(result));
            }}/>
            <button onClick={loadUsers} className="refresh-icon">
                <i className="fa fa-refresh" aria-hidden="true"></i>
            </button>
        </div>
    )
}

export default Users
