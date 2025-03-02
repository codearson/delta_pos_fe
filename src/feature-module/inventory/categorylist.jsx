import React, { useEffect, useState } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import ImageWithBasePath from '../../core/img/imagewithbasebath';
import { Link } from 'react-router-dom';
import { ChevronUp, PlusCircle, RotateCcw } from 'feather-icons-react/build/IconComponents';
import { useDispatch, useSelector } from 'react-redux';
import { setToogleHeader } from '../../core/redux/action';
//import Select from 'react-select';
//import { DatePicker } from 'antd';
import AddCategoryList from '../../core/modals/inventory/addcategorylist';
import EditCategoryList from '../../core/modals/inventory/editcategorylist';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import Table from '../../core/pagination/datatable'
import { 
    fetchProductCategories, 
    updateProductCategoryStatus, 
    saveProductCategory, 
    getProductCategoryByName
 } from '../Api/ProductCategoryApi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';


const CategoryList = () => {
    const dispatch = useDispatch();
    const data = useSelector((state) => state.toggle_header);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const MySwal = withReactContent(Swal);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const fetchedCategories = await fetchProductCategories();
            console.log('Fetched Categories:', fetchedCategories);
            let categoryArray = fetchedCategories;
            if (fetchedCategories?.responseDto) {
                categoryArray = fetchedCategories.responseDto;
            }
            const reversedCategories = Array.isArray(categoryArray) ? categoryArray.reverse() : [];
            console.log('Processed Categories:', reversedCategories);
            setCategories(reversedCategories);
        } catch (error) {
            console.error('Error fetching Categories:', error);
            setCategories([]);
        }
    };

    const handleEditClick = (category) => {
        setSelectedCategory(category);
    };

    const handleDelete = async (categoryId) => {
        MySwal.fire({
            title: 'Are you sure?',
            text: 'This category will be deactivated.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await updateProductCategoryStatus(categoryId, 0);
                    if (response) {
                        Swal.fire('Deleted!', 'Category has been deactivated.', 'success');
                        loadCategories();
                    } else {
                        Swal.fire('Error', 'Failed to delete category', 'error');
                    }
                } catch (error) {
                    Swal.fire('Error', 'Something went wrong', 'error');
                }
            }
        });
    };

    const handleAddCategory = async (newCategory) => {
        try {
            const response = await saveProductCategory(newCategory);
            if (response) {
                Swal.fire('Success', 'Category has been added!', 'success');
                await loadCategories();
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

    const handleSearchChange = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        try {
            if (query.trim() !== '') {
                const searchResponse = await getProductCategoryByName(query);
                console.log('Search Response:', searchResponse);
                const searchCategories = searchResponse?.responseDto || [];
                setCategories(Array.isArray(searchCategories) ? searchCategories : []);
            } else {
                loadCategories();
            }
        } catch (error) {
            console.error('Error searching categories:', error);
            setCategories([]);
        }
    };

    const exportToPDF = () => {
        console.log('Exporting to PDF...');
        try {
            const doc = new jsPDF();
            doc.text('Category List', 20, 10);
            const tableData = categories.map(category => [category.productCategoryName || 'N/A']);
            autoTable(doc, {
                head: [['Category']],
                body: tableData,
                startY: 20,
            });
            doc.save('category_list.pdf');
            console.log('PDF generated successfully');
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };

    const exportToExcel = () => {
        const worksheetData = categories.map(category => ({
            Category: category.productCategoryName || 'N/A',
        }));
        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Categories');
        XLSX.writeFile(workbook, 'category_list.xlsx');
    };

    // const [isFilterVisible, setIsFilterVisible] = useState(false);
    // const toggleFilterVisibility = () => {
    //     setIsFilterVisible((prevVisibility) => !prevVisibility);
    // };
    // const [selectedDate, setSelectedDate] = useState(new Date());
    // const handleDateChange = (date) => {
    //     setSelectedDate(date);
    // };

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
    // const renderPrinterTooltip = (props) => (
    //     <Tooltip id="printer-tooltip" {...props}>
    //         Printer
    //     </Tooltip>
    // );
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

    const columns = [
        {
            title: 'Category',
            dataIndex: 'productCategoryName',
            render: (text) => <Link to="#">{text}</Link>,
            sorter: (a, b) => (a.productCategoryName || '').length - (b.productCategoryName || '').length,
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
                        <Link
                            className="confirm-text p-2"
                            to="#"
                            onClick={() => handleDelete(record.id)}
                        >
                            <i data-feather="trash-2" className="feather-trash-2"></i>
                        </Link>
                    </div>
                </td>
            ),
        },
    ];

    // const showConfirmationAlert = () => {
    //     MySwal.fire({
    //         title: 'Are you sure?',
    //         text: 'You won\'t be able to revert this!',
    //         showCancelButton: true,
    //         confirmButtonColor: '#00ff00',
    //         confirmButtonText: 'Yes, delete it!',
    //         cancelButtonColor: '#ff0000',
    //         cancelButtonText: 'Cancel',
    //     }).then((result) => {
    //         if (result.isConfirmed) {

    //             MySwal.fire({
    //                 title: 'Deleted!',
    //                 text: 'Your file has been deleted.',
    //                 className: "btn btn-success",
    //                 confirmButtonText: 'OK',
    //                 customClass: {
    //                     confirmButton: 'btn btn-success',
    //                 },
    //             });
    //         } else {
    //             MySwal.close();
    //         }

    //     });
    // };

    return (
        <div>
            <div className="page-wrapper">
                <div className="content">
                    <div className="page-header">
                        <div className="add-item d-flex">
                            <div className="page-title">
                                <h4>Category</h4>
                                <h6>Manage your categories</h6>
                            </div>
                        </div>
                        <ul className="table-top-head">
                            <li>
                                <OverlayTrigger placement="top" overlay={renderTooltip}>
                                    <Link
                                        onClick={exportToPDF}>
                                        <ImageWithBasePath src="assets/img/icons/pdf.svg" alt="img" />
                                    </Link>
                                </OverlayTrigger>
                            </li>
                            <li>
                                <OverlayTrigger placement="top" overlay={renderExcelTooltip}>
                                    <Link
                                        data-bs-toggle="tooltip"
                                        data-bs-placement="top"
                                        onClick={exportToExcel}>
                                        <ImageWithBasePath src="assets/img/icons/excel.svg" alt="img" />
                                    </Link>
                                </OverlayTrigger>
                            </li>
                            {/* <li>
                                <OverlayTrigger placement="top" overlay={renderPrinterTooltip}>

                                    <Link data-bs-toggle="tooltip" data-bs-placement="top">
                                        <i data-feather="printer" className="feather-printer" />
                                    </Link>
                                </OverlayTrigger>
                            </li> */}
                            <li>
                                <OverlayTrigger placement="top" overlay={renderRefreshTooltip}>
                                    <Link
                                        data-bs-toggle="tooltip"
                                        data-bs-placement="top"
                                        onClick={loadCategories}
                                    >
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
                                            value={searchQuery}
                                            onChange={handleSearchChange}
                                        />
                                        <Link to className="btn btn-searchset">
                                            <i data-feather="search" className="feather-search" />
                                        </Link>
                                    </div>
                                </div>
                                {/* <div className="search-path">
                                    <Link className={`btn btn-filter ${isFilterVisible ? "setclose" : ""}`} id="filter_search">
                                        <Filter
                                            className="filter-icon"
                                            onClick={toggleFilterVisibility}
                                        />
                                        <span onClick={toggleFilterVisibility}>
                                            <ImageWithBasePath src="assets/img/icons/closes.svg" alt="img" />
                                        </span>
                                    </Link>
                                </div> */}
                                {/* <div className="form-sort">
                                    <Sliders className="info-img" />
                                    <Select
                                        className="select"
                                        options={oldandlatestvalue}
                                        placeholder="Newest"
                                    />
                                </div> */}
                            </div>
                            {/* /Filter */}
                            {/* <div
                                className={`card${isFilterVisible ? " visible" : ""}`}
                                id="filter_inputs"
                                style={{ display: isFilterVisible ? "block" : "none" }}
                            >
                                <div className="card-body pb-0">
                                    <div className="row">
                                        <div className="col-lg-3 col-sm-6 col-12">
                                            <div className="input-blocks">

                                                <Zap className="info-img" />
                                                <Select
                                                    options={category}
                                                    className="select"
                                                    placeholder="Choose Category"
                                                />

                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-sm-6 col-12">
                                            <div className="input-blocks">
                                                <i data-feather="calendar" className="info-img" />
                                                <div className="input-groupicon">
                                                    <DatePicker
                                                        selected={selectedDate}
                                                        onChange={handleDateChange}
                                                        type="date"
                                                        className="filterdatepicker"
                                                        dateFormat="dd-MM-yyyy"
                                                        placeholder='Choose Date'
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-sm-6 col-12">
                                            <div className="input-blocks">
                                                <StopCircle className="info-img" />

                                                <Select options={status} className="select" placeholder="Choose Status" />

                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-sm-6 col-12 ms-auto">
                                            <div className="input-blocks">
                                                <Link className="btn btn-filters ms-auto">
                                                    {" "}
                                                    <i data-feather="search" className="feather-search" />{" "}
                                                    Search{" "}
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div> */}
                            {/* /Filter */}
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
                    {/* /product list */}
                </div>
            </div>
            <AddCategoryList onAddCategory={handleAddCategory} onUpdate={loadCategories} />
            <EditCategoryList selectedCategory={selectedCategory} onUpdate={loadCategories} />
        </div>
    )
}

export default CategoryList
