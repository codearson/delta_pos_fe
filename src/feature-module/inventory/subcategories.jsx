import React, { useEffect, useState } from 'react';
import ImageWithBasePath from '../../core/img/imagewithbasebath'
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ChevronUp, PlusCircle, RotateCcw } from 'feather-icons-react/build/IconComponents';
import { useDispatch, useSelector } from 'react-redux';
import { setToogleHeader } from '../../core/redux/action';
//import Select from 'react-select';
import AddSubcategory from '../../core/modals/inventory/addsubcategory';
import EditSubcategories from './editsubcategories';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import Table from '../../core/pagination/datatable'
import { fetchTaxes, updateTaxStatus } from '../Api/TaxApi'
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const SubCategories = () => {
    const dispatch = useDispatch();
    const data = useSelector((state) => state.toggle_header);
    const [taxes, setTaxes] = useState([]);
    const MySwal = withReactContent(Swal);
    const [selectedTax, setSelectedTax] = useState(null);

    // const oldandlatestvalue = [
    //     { value: 'date', label: 'Sort by Date' },
    //     { value: 'newest', label: 'Newest' },
    //     { value: 'oldest', label: 'Oldest' },
    // ];
    // const fruits = [
    //     { value: 'Choose SubCategory', label: 'Choose SubCategory' },
    //     { value: 'Fruits', label: 'Fruits' },
    // ];
    // const category = [
    //     { value: 'chooseCategory', label: 'Choose Category' },
    //     { value: 'laptop', label: 'Laptop' },
    //     { value: 'electronics', label: 'Electronics' },
    //     { value: 'shoe', label: 'Shoe' },
    // ];
    // const categorycode = [
    //     { value: 'Category Code', label: 'Category Code' },
    //     { value: 'CT001', label: 'CT001' },
    //     { value: 'CT002', label: 'CT002' },
    // ];
    // const [isFilterVisible, setIsFilterVisible] = useState(false);
    // const toggleFilterVisibility = () => {
    //     setIsFilterVisible((prevVisibility) => !prevVisibility);
    // };

    useEffect(() => {
        loadTaxes();
    }, []);

    const loadTaxes = async () => {
        try {
            const fetchedTaxes = await fetchTaxes();
            console.log('Fetched Taxes:', fetchedTaxes);
            const reversedTaxes = Array.isArray(fetchedTaxes) ? fetchedTaxes.reverse() : [];
            setTaxes(reversedTaxes);
        } catch (error) {
            console.error('Error fetching taxes:', error);
            setTaxes([]);
        }
    };

    const handleDelete = async (taxId) => {
        MySwal.fire({
            title: 'Are you sure?',
            text: 'This tax will be deactivated.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await updateTaxStatus(taxId, 0);
                    if (response) {
                        Swal.fire('Deleted!', 'Tax has been deactivated.', 'success');
                        loadTaxes();
                    } else {
                        Swal.fire('Error', 'Failed to delete tax', 'error');
                    }
                } catch (error) {
                    Swal.fire('Error', 'Something went wrong', 'error');
                    console.error('Error deactivating tax:', error);
                }
            }
        });
    };

    // Export to PDF
    const exportToPDF = () => {
        try {
            const doc = new jsPDF();
            doc.text('Tax List', 20, 10);
            const tableData = taxes.map(tax => [tax.taxPercentage || 'N/A']);
            autoTable(doc, {
                head: [['Tax Percentage']],
                body: tableData,
                startY: 20,
            });
            doc.save('tax_list.pdf');
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };

    // Export to Excel
    const exportToExcel = () => {
        const worksheetData = taxes.map(tax => ({
            'Tax Percentage': tax.taxPercentage || 'N/A',
        }));
        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Taxes');
        XLSX.writeFile(workbook, 'tax_list.xlsx');
    };

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
    );

    const handleEdit = (tax) => {
        setSelectedTax(tax);
    };

    const columns = [
        // {
        //     title: "Image",
        //     dataIndex: "logo",
        //     render: (text, record) => (
        //         <span className="productimgname">
        //             <Link to="#" className="product-img stock-img">
        //                 <ImageWithBasePath alt="" src={record.img} />
        //             </Link>

        //         </span>
        //     ),
        //     sorter: (a, b) => a.category.length - b.category.length,

        // },
        {
            title: 'Tax Percentage',
            dataIndex: 'taxPercentage',
            render: (text) => <Link to="#">{text}</Link>,
            sorter: (a, b) => (a.taxPercentage || 0) - (b.taxPercentage || 0),
        },
        // {
        //     title: "Parent Category",
        //     dataIndex: "parentcategory",
        //     sorter: (a, b) => a.parentcategory.length - b.parentcategory.length,
        // },
        // {
        //     title: "categorycode",
        //     dataIndex: "categorycode",
        //     sorter: (a, b) => a.categorycode.length - b.categorycode.length,
        // },
        // {
        //     title: "Description",
        //     dataIndex: "description",
        //     sorter: (a, b) => a.description.length - b.description.length,
        // },
        // {
        //     title: "Created By",
        //     dataIndex: "createdby",
        //     sorter: (a, b) => a.createdby.length - b.createdby.length,
        // },
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
                            data-bs-target="#edit-tax"
                            onClick={() => handleEdit(record)}
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

    const handleTaxCreated = () => {
        loadTaxes(); // Refresh the tax list after creating a new tax
    };

    return (
        <div>
            <div className="page-wrapper">
                <div className="content">
                    <div className="page-header">
                        <div className="add-item d-flex">
                            <div className="page-title">
                                <h4>Tax list</h4>
                                <h6>Manage your tax percentage</h6>
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
                                        onClick={exportToExcel}
                                        data-bs-toggle="tooltip"
                                        data-bs-placement="top">
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
                                        onClick={loadTaxes}>
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
                                data-bs-target="#add-tax"
                            >
                                <PlusCircle className="me-2" />
                                Add Tax
                            </Link>
                        </div>
                    </div>
                    {/* /product list */}
                    <div className="card table-list-card">
                        <div className="card-body">
                            {/* <div className="table-top">
                                <div className="search-set">
                                    <div className="search-input">
                                        <input
                                            type="text"
                                            placeholder="Search"
                                            className="form-control form-control-sm formsearch"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
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
                                <div className="form-sort">
                                    <Sliders className="info-img" />
                                    <Select
                                        className="select"
                                        options={oldandlatestvalue}
                                        placeholder="Newest"
                                    />
                                </div>
                            </div> */}
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
                                                <i data-feather="zap" className="info-img" />
                                                <Select options={category} className="select" placeholder="Choose Category" />

                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-sm-6 col-12">
                                            <div className="input-blocks">
                                                <i data-feather="zap" className="info-img" />
                                                <Zap className="info-img" />

                                                <Select
                                                    className="select"
                                                    options={fruits}
                                                    placeholder="Newest"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-sm-6 col-12">
                                            <div className="input-blocks">
                                                <i data-feather="stop-circle" className="info-img" />
                                                <StopCircle className="info-img" />

                                                <Select
                                                    className="select"
                                                    options={categorycode}
                                                    placeholder="Newest"
                                                />
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
                                <Table className="table datanew"
                                    columns={columns}
                                    dataSource={taxes}
                                    rowKey={(record) => record.id} />
                            </div>
                        </div>
                    </div>
                    {/* /product list */}
                </div>
            </div>
            <AddSubcategory onTaxCreated={handleTaxCreated} />
            <EditSubcategories 
                selectedTax={selectedTax} 
                onTaxUpdated={loadTaxes} 
            />
        </div>
    )
}

export default SubCategories
