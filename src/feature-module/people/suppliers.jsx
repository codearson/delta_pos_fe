import React, { useState, useEffect } from "react";
import Breadcrumbs from "../../core/breadcrumbs";
import { Link } from "react-router-dom";
import { Sliders, Edit, Eye, Trash2 } from "react-feather";
import Select from "react-select";
import { Table } from "antd";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import SupplierModal from "../../core/modals/peoples/supplierModal";
import { format } from 'date-fns';
import { fetchSuppliers, saveSupplier, updateSupplier, updateSupplierStatus, getSuppliersByName } from '../Api/supplierApi';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSuppliers()
      .then((data) => setSuppliers(data));
  }, []);

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
    const result = await saveSupplier(supplierData);
    if (result) {
      const updatedSuppliers = await fetchSuppliers();
      setSuppliers(updatedSuppliers);
      MySwal.fire({
        title: "Success!",
        text: "Supplier has been added successfully.",
        icon: "success",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "btn btn-success",
        },
      });
    } else {
      MySwal.fire({
        title: "Error!",
        text: "Failed to add supplier.",
        icon: "error",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "btn btn-danger",
        },
      });
    }
  };

  const handleUpdateSupplier = async (supplierData) => {
    const result = await updateSupplier(supplierData);
    if (result) {
      const updatedSuppliers = await fetchSuppliers();
      setSuppliers(updatedSuppliers);
      MySwal.fire({
        title: "Success!",
        text: "Supplier has been updated successfully.",
        icon: "success",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "btn btn-success",
        },
      });
    } else {
      MySwal.fire({
        title: "Error!",
        text: "Failed to update supplier.",
        icon: "error",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "btn btn-danger",
        },
      });
    }
  };

  const handleUpdateStatus = async (supplierId) => {
    // Show confirmation alert before deleting
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
        deleteSupplier(supplierId); // Call delete supplier function if confirmed
      } else {
        MySwal.close();
      }
    });
  };

  const deleteSupplier = async (supplierId) => {
    const result = await updateSupplierStatus(supplierId, 0); // setting status to 0 (delete status)
    if (result) {
      const updatedSuppliers = await fetchSuppliers();
      setSuppliers(updatedSuppliers);
      MySwal.fire({
        title: "Deleted!",
        text: "Supplier has been deleted.",
        icon: "success",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "btn btn-success",
        },
      });
    } else {
      MySwal.fire({
        title: "Error!",
        text: "Failed to delete supplier.",
        icon: "error",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "btn btn-danger",
        },
      });
    }
  };

  const handleSearch = async (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.trim() !== "") {
      const searchResults = await getSuppliersByName(e.target.value);
      setSuppliers(searchResults);
    } else {
      // If search is cleared, fetch all suppliers
      fetchSuppliers()
        .then((data) => setSuppliers(data));
    }
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
      title: "Created Date",
      dataIndex: "createdDate",
      render: (text) => {
        const formattedDate = format(new Date(text), 'dd/MM/yyyy HH:mm:ss');
        return <span>{formattedDate}</span>;
      },
      sorter: (a, b) => new Date(a.createdDate) - new Date(b.createdDate),
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_, record) => (
        <td className="action-table-data">
          <div className="edit-delete-action">
            <Link className="me-2 p-2" to="#">
              <Eye className="feather-view" />
            </Link>
            <Link
              className="me-2 p-2"
              to="#"
              data-bs-toggle="modal"
              data-bs-target="#edit-units"
              onClick={() => setSelectedSupplier(record)}
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
          addButtonAttributes={{ "data-bs-toggle": "modal", "data-bs-target": "#add-units" }}
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
              <div className="form-sort stylewidth">
                <Sliders className="info-img" />
                <Select className="select" options={[]} placeholder="Sort by Date" />
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
