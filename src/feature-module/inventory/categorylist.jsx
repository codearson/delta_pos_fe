import React, { useEffect, useState } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import ImageWithBasePath from '../../core/img/imagewithbasebath';
import { Link } from 'react-router-dom';
import { ChevronUp, PlusCircle, RotateCcw } from 'feather-icons-react/build/IconComponents';
import { useDispatch, useSelector } from 'react-redux';
import { setToogleHeader } from '../../core/redux/action';
import AddCategoryList from '../../core/modals/inventory/addcategorylist';
import EditCategoryList from '../../core/modals/inventory/editcategorylist';
import Swal from 'sweetalert2';
import Table from '../../core/pagination/datatable';
import {
    fetchProductCategories,
    updateProductCategoryStatus,
    saveProductCategory
} from '../Api/ProductCategoryApi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import "../../style/scss/pages/_categorylist.scss";

const CategoryList = () => {
    const dispatch = useDispatch();
    const data = useSelector((state) => state.toggle_header);
    const [categories, setCategories] = useState([]);
    const [allCategories, setAllCategories] = useState([]); // Store full category list
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showActive, setShowActive] = useState(true);
    const [togglingId, setTogglingId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (!isLoading) {
            loadCategories(false);
        }
    }, [showActive]);

    const loadInitialData = async () => {
        setIsLoading(true);
        await loadCategories(true);
        setIsLoading(false);
    };

    const loadCategories = async (isInitial = false) => {
        try {
            if (isInitial) {
                setIsLoading(true);
            }
            const fetchedCategories = await fetchProductCategories();
            let categoryArray = fetchedCategories;
            if (fetchedCategories?.responseDto) {
                categoryArray = fetchedCategories.responseDto;
            }
            if (Array.isArray(categoryArray)) {
                // Filter out 'Custom' category
                const filteredCategories = categoryArray.filter(category => 
                    category.productCategoryName?.toLowerCase() !== 'custom'
                );
                setAllCategories(filteredCategories); // Store filtered list
                const activeFilteredCategories = filteredCategories
                    .filter(category => category.isActive === showActive)
                    .reverse();
                setCategories(activeFilteredCategories);
            } else {
                setAllCategories([]);
                setCategories([]);
                Swal.fire({
                    title: "Warning!",
                    text: "No category data received from the server.",
                    icon: "warning",
                    confirmButtonText: "OK",
                });
            }
        } catch (error) {
            setAllCategories([]);
            setCategories([]);
            Swal.fire({
                title: "Error!",
                text: "Failed to fetch categories: " + error.message,
                icon: "error",
                confirmButtonText: "OK",
            });
        } finally {
            if (isInitial) {
                setIsLoading(false);
            }
        }
    };

    const handleEditClick = (category) => {
        setSelectedCategory(category);
    };

    const handleToggleStatus = async (categoryId, currentStatus) => {
        setTogglingId(categoryId);
        const newStatusText = currentStatus ? 'Inactive' : 'Active';

        Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to change this category to ${newStatusText}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, change it!',
            cancelButtonText: 'No, cancel'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const newStatus = currentStatus ? 0 : 1;
                    const response = await updateProductCategoryStatus(categoryId, newStatus);
                    if (response) {
                        loadCategories(false);
                    } else {
                        Swal.fire('Error', 'Failed to update category status', 'error');
                    }
                } catch (error) {
                    Swal.fire('Error', 'Something went wrong', 'error');
                }
            }
            setTogglingId(null);
        });
    };

    const handleAddCategory = async (newCategory) => {
        try {
            const response = await saveProductCategory(newCategory);
            if (response) {
                Swal.fire('Success', 'Category has been added!', 'success');
                await loadCategories(false);
                const modal = document.getElementById('add-category');
                const bootstrapModal = new window.bootstrap.Modal(modal);
                bootstrapModal.hide();
            } else {
                Swal.fire('Error', 'Failed to add category', 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'Something went wrong', 'error');
        }
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.trim() !== '') {
            const searchCategories = allCategories.filter(category =>
                category.productCategoryName.toLowerCase().includes(query.toLowerCase()) &&
                category.productCategoryName.toLowerCase() !== 'custom' // Ensure 'Custom' is excluded
            );
            setCategories(searchCategories.length > 0 ? searchCategories : []);
        } else {
            loadCategories(false);
        }
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text(`Category List (${showActive ? 'Active' : 'Inactive'})`, 20, 10);
        const tableData = categories.map(category => [category.productCategoryName || 'N/A']);
        autoTable(doc, {
            head: [['Category']],
            body: tableData,
            startY: 20,
        });
        doc.save(`category_list_${showActive ? 'active' : 'inactive'}.pdf`);
    };

    const exportToExcel = () => {
        const worksheetData = categories.map(category => ({
            Category: category.productCategoryName || 'N/A',
        }));
        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Categories');
        XLSX.writeFile(workbook, `category_list_${showActive ? 'active' : 'inactive'}.xlsx`);
    };

    const renderTooltip = (props) => (
        <Tooltip id="pdf-tooltip" {...props}>Pdf</Tooltip>
    );
    const renderExcelTooltip = (props) => (
        <Tooltip id="excel-tooltip" {...props}>Excel</Tooltip>
    );
    const renderRefreshTooltip = (props) => (
        <Tooltip id="refresh-tooltip" {...props}>Refresh</Tooltip>
    );
    const renderCollapseTooltip = (props) => (
        <Tooltip id="refresh-tooltip" {...props}>Collapse</Tooltip>
    );

    const columns = [
        {
            title: 'Category',
            dataIndex: 'productCategoryName',
            render: (text) => <Link to="#">{text}</Link>,
            sorter: (a, b) => (a.productCategoryName || '').length - (b.productCategoryName || '').length,
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
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
            dataIndex: 'actions',
            key: 'actions',
            render: (_, record) => (
                <td className="action-table-data">
                    <div className="edit-delete-action">
                        <Link
                            className="me-2 p-2"
                            to="#"
                            data-bs-toggle="modal"
                            data-bs-target="#edit-category"
                            onClick={() => handleEditClick(record)}
                        >
                            <i data-feather="edit" className="feather-edit"></i>
                        </Link>
                    </div>
                </td>
            ),
        },
    ];

    if (isLoading) {
        return (
            <div className="page-wrapper">
                {/* You can add a loading spinner or message here if desired */}
            </div>
        );
    }

    return (
        <div>
            <div className="page-wrapper">
                <div className="content">
                    <div className="page-header">
                        <div className="add-item d-flex flex-column">
                            <div className="page-title">
                                <h4>Category</h4>
                                <h6>Manage your categories</h6>
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
                                <OverlayTrigger placement="top" overlay={renderRefreshTooltip}>
                                    <Link onClick={() => loadCategories(false)}>
                                        <RotateCcw />
                                    </Link>
                                </OverlayTrigger>
                            </li>
                            <li>
                                <OverlayTrigger placement="top" overlay={renderCollapseTooltip}>
                                    <Link
                                        id="collapse-header"
                                        className={data ? 'active' : ''}
                                        onClick={() => dispatch(setToogleHeader(!data))}
                                    >
                                        <ChevronUp />
                                    </Link>
                                </OverlayTrigger>
                            </li>
                        </ul>
                        <div className="page-btn">
                            <Link
                                to="#"
                                className="btn btn-added"
                                data-bs-toggle="modal"
                                data-bs-target="#add-category"
                            >
                                <PlusCircle className="me-2" />
                                Add New Category
                            </Link>
                        </div>
                    </div>
                    <div className="card table-list-card">
                        <div className="card-body">
                            <div className="table-top">
                                <div className="search-set">
                                    <div className="search-input">
                                        <input
                                            type="text"
                                            placeholder="Search"
                                            className="form-control form-control-sm formsearch"
                                            value={searchQuery}
                                            onChange={handleSearchChange}
                                        />
                                        <Link to className="btn btn-searchset">
                                            <i data-feather="search" className="feather-search" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            <div className="table-responsive">
                                <Table
                                    className="table datanew"
                                    columns={columns}
                                    dataSource={categories}
                                    rowKey={(record) => record.id}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <AddCategoryList onAddCategory={handleAddCategory} onUpdate={loadCategories} />
            <EditCategoryList selectedCategory={selectedCategory} onUpdate={loadCategories} />
        </div>
    );
};

export default CategoryList;