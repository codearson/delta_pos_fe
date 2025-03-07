import React, { useState, useEffect } from "react";
import Breadcrumbs from "../../core/breadcrumbs";
import { Link } from "react-router-dom";
import { Edit, Trash2 } from "react-feather";
import { Table } from "antd";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import SupplierModal from "../../core/modals/peoples/supplierModal";
import { fetchSuppliers, saveSupplier, updateSupplier, updateSupplierStatus } from '../Api/supplierApi';
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import * as XLSX from "xlsx";

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [allSuppliers, setAllSuppliers] = useState([]); // Store all suppliers for filtering
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSuppliersData();
  }, []);

  const fetchSuppliersData = async () => {
    try {
      const data = await fetchSuppliers();
      const reversedData = data.reverse();
      setSuppliers(reversedData);
      setAllSuppliers(reversedData); // Store all suppliers
    } catch (error) {
      MySwal.fire({
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
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const handleSaveSupplier = async (supplierData) => {
    try {
      const result = await saveSupplier(supplierData);
      if (result) {
        await fetchSuppliersData();
        setSelectedSupplier(null);
        MySwal.fire({
          title: "Success!",
          text: "Supplier has been added successfully.",
          icon: "success",
          confirmButtonText: "OK",
          customClass: { confirmButton: "btn btn-success" },
        });
      }
    } catch (error) {
      MySwal.fire({
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
        MySwal.fire({
          title: "Success!",
          text: "Supplier has been updated successfully.",
          icon: "success",
          confirmButtonText: "OK",
          customClass: { confirmButton: "btn btn-success" },
        });
      }
    } catch (error) {
      MySwal.fire({
        title: "Error!",
        text: "Failed to update supplier: " + error.message,
        icon: "error",
        confirmButtonText: "OK",
        customClass: { confirmButton: "btn btn-danger" },
      });
    }
  };

  const handleUpdateStatus = async (supplierId) => {
    showConfirmationAlert(supplierId);
  };

  const showConfirmationAlert = (supplierId) => {
    MySwal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      showCancelButton: true,
      confirmButtonColor: "#00ff00",
      confirmButtonText: "Yes, delete it!",
      cancelButtonColor: "#ff0000",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteSupplier(supplierId);
      } else {
        MySwal.close();
      }
    });
  };

  const deleteSupplier = async (supplierId) => {
    try {
      const result = await updateSupplierStatus(supplierId, 0);
      if (result) {
        await fetchSuppliersData();
        MySwal.fire({
          title: "Deleted!",
          text: "Supplier has been deleted.",
          icon: "success",
          confirmButtonText: "OK",
          customClass: { confirmButton: "btn btn-success" },
        });
      }
    } catch (error) {
      MySwal.fire({
        title: "Error!",
        text: "Failed to delete supplier: " + error.message,
        icon: "error",
        confirmButtonText: "OK",
        customClass: { confirmButton: "btn btn-danger" },
      });
    }
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
      setSuppliers(filteredSuppliers.reverse());
    } else {
      setSuppliers([...allSuppliers].reverse());
    }
  };

  const downloadPDF = () => {
    try {
      if (!suppliers || suppliers.length === 0) {
        MySwal.fire({
          title: "No Data",
          text: "There are no suppliers to export",
          icon: "warning",
          confirmButtonText: "OK",
        });
        return;
      }
      const doc = new jsPDF();
      doc.text("Supplier List", 14, 15);
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
      doc.save("supplier_list.pdf");
    } catch (error) {
      MySwal.fire({
        title: "Error!",
        text: "Failed to generate PDF: " + error.message,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const downloadExcel = () => {
    try {
      if (!suppliers || suppliers.length === 0) {
        MySwal.fire({
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
      XLSX.writeFile(workbook, "supplier_list.xlsx");
    } catch (error) {
      MySwal.fire({
        title: "Error!",
        text: "Failed to generate Excel: " + error.message,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleRefresh = () => {
    setSearchTerm("");
    setSuppliers([...allSuppliers].reverse());
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
      sorter: (a, b) => a.name.length - b.name.length,
    },
    {
      title: "Email",
      dataIndex: "emailAddress",
      sorter: (a, b) => a.emailAddress.length - b.emailAddress.length,
    },
    {
      title: "Mobile Number",
      dataIndex: "mobileNumber",
      sorter: (a, b) => a.mobileNumber.length - b.mobileNumber.length,
    },
    {
      title: "WhatsApp Number",
      dataIndex: "whatsappNumber",
      sorter: (a, b) => a.whatsappNumber.length - b.whatsappNumber.length,
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
            <Link
              className="confirm-text p-2"
              to="#"
              onClick={() => handleUpdateStatus(record.id)}
            >
              <Trash2 className="feather-trash-2" />
            </Link>
          </div>
        </td>
      ),
    },
  ];

  const MySwal = withReactContent(Swal);

  return (
    <div className="page-wrapper">
      <div className="content">
        <Breadcrumbs
          maintitle="Supplier List"
          subtitle="Manage Your Suppliers"
          addButton="Add New Supplier"
          addButtonAttributes={{
            "data-bs-toggle": "modal",
            "data-bs-target": "#add-units",
            onClick: handleAddClick,
          }}
          onDownloadPDF={downloadPDF}
          onDownloadExcel={downloadExcel}
          onRefresh={handleRefresh}
        />
        <div className="card table-list-card">
          <div className="card-body">
            <div className="table-top">
              <div className="search-set">
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