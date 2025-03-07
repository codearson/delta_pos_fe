import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Edit } from "feather-icons-react/build/IconComponents";
import { Table } from "antd";
import Swal from "sweetalert2";
import SupplierModal from "../../core/modals/peoples/supplierModal";
import { fetchSuppliers, saveSupplier, updateSupplier, updateSupplierStatus } from '../Api/supplierApi';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { setToogleHeader } from "../../core/redux/action";
import { ChevronUp, PlusCircle, RotateCcw } from "feather-icons-react/build/IconComponents";
import ImageWithBasePath from "../../core/img/imagewithbasebath";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import * as XLSX from "xlsx";
import "../../style/scss/pages/_categorylist.scss";

const Suppliers = () => {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.toggle_header);
  const [suppliers, setSuppliers] = useState([]);
  const [allSuppliers, setAllSuppliers] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showActive, setShowActive] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    fetchSuppliersData();
  }, [showActive]);

  const fetchSuppliersData = async () => {
    try {
      const data = await fetchSuppliers();
      console.log("Fetched suppliers:", data); // Debug API response
      if (Array.isArray(data)) {
        // Normalize isActive to boolean (handles 0/1 or true/false)
        const normalizedData = data.map(supplier => ({
          ...supplier,
          isActive: supplier.isActive === 1 || supplier.isActive === true
        }));
        setAllSuppliers(normalizedData);
        const filteredData = normalizedData.filter(supplier => supplier.isActive === showActive).reverse();
        setSuppliers(filteredData);
      } else {
        setAllSuppliers([]);
        setSuppliers([]);
        Swal.fire({
          title: "Warning!",
          text: "No supplier data received from the server.",
          icon: "warning",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to fetch suppliers: " + error.message,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = suppliers.map((supplier) => supplier.id);
      setSelectedRows(allIds);
    } else {
      setSelectedRows([]);
    }
  };

  const handleRowSelect = (id) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const handleSaveSupplier = async (supplierData) => {
    try {
      const supplierDataWithActive = { ...supplierData, isActive: 1 };
      const result = await saveSupplier(supplierDataWithActive);
      if (result) {
        await fetchSuppliersData();
        setSelectedSupplier(null);
        Swal.fire({
          title: "Success!",
          text: "Supplier has been added successfully.",
          icon: "success",
          confirmButtonText: "OK",
          customClass: { confirmButton: "btn btn-success" },
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Failed to add supplier: " + error.message,
        icon: "error",
        confirmButtonText: "OK",
        customClass: { confirmButton: "btn btn-danger" },
      });
    }
  };

  const handleUpdateSupplier = async (supplierData) => {
    try {
      const result = await updateSupplier(supplierData);
      if (result) {
        await fetchSuppliersData();
        setSelectedSupplier(null);
        Swal.fire({
          title: "Success!",
          text: "Supplier has been updated successfully.",
          icon: "success",
          confirmButtonText: "OK",
          customClass: { confirmButton: "btn btn-success" },
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Failed to update supplier: " + error.message,
        icon: "error",
        confirmButtonText: "OK",
        customClass: { confirmButton: "btn btn-danger" },
      });
    }
  };

  const handleToggleStatus = (supplierId, currentStatus) => {
    setTogglingId(supplierId);
    const newStatusText = currentStatus ? 'Inactive' : 'Active';

    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to change this supplier to ${newStatusText}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, change it!',
      cancelButtonText: 'No, cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const newStatus = currentStatus ? 0 : 1; // Send 0 for inactive, 1 for active
          console.log(`Toggling supplier ${supplierId} to status ${newStatus}`); // Debug
          const response = await updateSupplierStatus(supplierId, newStatus);
          console.log("Toggle response:", response); // Debug API response
          if (response && response.success !== false) { // Check for explicit failure
            await fetchSuppliersData();
            Swal.fire({
              title: "Success!",
              text: `Supplier status changed to ${newStatusText}.`,
              icon: "success",
              confirmButtonText: "OK",
              customClass: { confirmButton: "btn btn-success" },
            });
          } else {
            throw new Error(response?.message || "Failed to update status");
          }
        } catch (error) {
          console.error("Error updating supplier status:", error);
          Swal.fire({
            title: "Error!",
            text: "Failed to update supplier status: " + error.message,
            icon: "error",
            confirmButtonText: "OK",
            customClass: { confirmButton: "btn btn-danger" },
          });
        }
      }
      setTogglingId(null);
    });
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    
    if (value.trim() !== "") {
      const filteredSuppliers = allSuppliers.filter(supplier => 
        (supplier.name && supplier.name.toLowerCase().includes(value)) ||
        (supplier.emailAddress && supplier.emailAddress.toLowerCase().includes(value)) ||
        (supplier.mobileNumber && supplier.mobileNumber.toLowerCase().includes(value)) ||
        (supplier.whatsappNumber && supplier.whatsappNumber.toLowerCase().includes(value))
      );
      setSuppliers(filteredSuppliers.length > 0 ? filteredSuppliers : []);
    } else {
      setSuppliers(allSuppliers.filter(supplier => supplier.isActive === showActive).reverse());
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      doc.text(`Supplier List (${showActive ? 'Active' : 'Inactive'})`, 14, 15);
      
      const tableColumn = ["Supplier Name", "Email", "Mobile Number", "WhatsApp Number"];
      const tableRows = suppliers.map(supplier => [
        supplier.name || "",
        supplier.emailAddress || "",
        supplier.mobileNumber || "",
        supplier.whatsappNumber || ""
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      });

      doc.save(`supplier_list_${showActive ? 'active' : 'inactive'}.pdf`);
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
      if (!suppliers || suppliers.length === 0) {
        Swal.fire({
          title: "No Data",
          text: "There are no suppliers to export",
          icon: "warning",
          confirmButtonText: "OK",
        });
        return;
      }

      const worksheetData = suppliers.map(supplier => ({
        "Supplier Name": supplier.name || "",
        "Email": supplier.emailAddress || "",
        "Mobile Number": supplier.mobileNumber || "",
        "WhatsApp Number": supplier.whatsappNumber || ""
      }));

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Suppliers");
      
      worksheet["!cols"] = [{ wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 15 }];

      XLSX.writeFile(workbook, `supplier_list_${showActive ? 'active' : 'inactive'}.xlsx`);
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Failed to export to Excel: " + error.message,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleAddClick = () => {
    setSelectedSupplier(null);
  };

  const handleEditClick = (record) => {
    setSelectedSupplier(record);
  };

  const columns = [
    {
      title: (
        <label className="checkboxs">
          <input
            type="checkbox"
            checked={selectedRows.length === suppliers.length && suppliers.length > 0}
            onChange={handleSelectAll}
          />
          <span className="checkmarks" />
        </label>
      ),
      render: (record) => (
        <label className="checkboxs">
          <input
            type="checkbox"
            checked={selectedRows.includes(record.id)}
            onChange={() => handleRowSelect(record.id)}
          />
          <span className="checkmarks" />
        </label>
      ),
      width: 50,
    },
    {
      title: "Supplier Name",
      dataIndex: "name",
      render: (text) => <Link to="#">{text}</Link>,
      sorter: (a, b) => (a.name || '').length - (b.name || '').length,
    },
    {
      title: "Email",
      dataIndex: "emailAddress",
      sorter: (a, b) => (a.emailAddress || '').length - (b.emailAddress || '').length,
    },
    {
      title: "Mobile Number",
      dataIndex: "mobileNumber",
      sorter: (a, b) => (a.mobileNumber || '').length - (b.mobileNumber || '').length,
    },
    {
      title: "WhatsApp Number",
      dataIndex: "whatsappNumber",
      sorter: (a, b) => (a.whatsappNumber || '').length - (b.whatsappNumber || '').length,
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
          <label className="form-check-label">
            {isActive ? 'Active' : 'Inactive'}
          </label>
        </div>
      ),
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_, record) => (
        <td className="action-table-data">
          <div className="edit-delete-action">
            <Link
              className="me-2 p-2"
              to="#"
              data-bs-toggle="modal"
              data-bs-target="#edit-units"
              onClick={() => handleEditClick(record)}
            >
              <Edit className="feather-edit" />
            </Link>
          </div>
        </td>
      ),
    },
  ];

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

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="add-item d-flex flex-column">
            <div className="page-title">
              <h4>Supplier List</h4>
              <h6>Manage Your Suppliers</h6>
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
                <Link onClick={fetchSuppliersData}>
                  <RotateCcw />
                </Link>
              </OverlayTrigger>
            </li>
            <li>
              <OverlayTrigger placement="top" overlay={renderCollapseTooltip}>
                <Link
                  id="collapse-header"
                  className={data ? "active" : ""}
                  onClick={(e) => {
                    e.preventDefault();
                    dispatch(setToogleHeader(!data));
                  }}
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
              data-bs-target="#add-units"
              onClick={handleAddClick}
            >
              <PlusCircle className="me-2 iconsize" />
              Add New Supplier
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
                    placeholder="Search by Name, Email, Mobile, or WhatsApp"
                    className="form-control form-control-sm formsearch"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                  <Link to="#" className="btn btn-searchset">
                    <i data-feather="search" className="feather-search" />
                  </Link>
                </div>
              </div>
            </div>
            <div className="table-responsive">
              <Table
                className="table datanew"
                columns={columns}
                dataSource={suppliers}
                rowKey={(record) => record.id}
              />
            </div>
          </div>
        </div>
      </div>
      <SupplierModal
        onSave={handleSaveSupplier}
        onUpdate={handleUpdateSupplier}
        selectedSupplier={selectedSupplier}
      />
    </div>
  );
};

export default Suppliers;