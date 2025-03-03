import React, { useState, useEffect } from "react";
import Breadcrumbs from "../../core/breadcrumbs";
import { Link } from "react-router-dom";
import { Edit, Trash2 } from "react-feather"; // Added Trash2
import { Table } from "antd";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import CustomerModal from "../../core/modals/peoples/customerModal";
import { saveCustomer, fetchCustomers, updateCustomer, getCustomersByName, getCustomersByMobileNumber, updateCustomerStatus } from "../Api/customerApi"; // Added updateCustomerStatus
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCustomersData();
  }, []);

  const fetchCustomersData = async () => {
      const data = await fetchCustomers();
      const reversedData = data.reverse();
      setCustomers(reversedData);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = customers.map((customer) => customer.id);
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

  const handleSaveCustomer = async (customerData) => {
    try {
      const customerDataWithActive = { ...customerData, isActive: 1 };
      const result = await saveCustomer(customerDataWithActive);
      if (result) {
        await fetchCustomersData();
        setSelectedCustomer(null);
        MySwal.fire({
          title: "Success!",
          text: "Customer has been added successfully.",
          icon: "success",
          confirmButtonText: "OK",
          customClass: { confirmButton: "btn btn-success" },
        });
      }
    } catch (error) {
      MySwal.fire({
        title: "Error!",
        text: "Failed to add customer: " + error.message,
        icon: "error",
        confirmButtonText: "OK",
        customClass: { confirmButton: "btn btn-danger" },
      });
    }
  };

  const handleUpdateCustomer = async (customerData) => {
    try {
      const result = await updateCustomer(customerData);
      if (result) {
        await fetchCustomersData();
        setSelectedCustomer(null);
        MySwal.fire({
          title: "Success!",
          text: "Customer has been updated successfully.",
          icon: "success",
          confirmButtonText: "OK",
          customClass: { confirmButton: "btn btn-success" },
        });
      }
    } catch (error) {
      MySwal.fire({
        title: "Error!",
        text: "Failed to update customer: " + error.message,
        icon: "error",
        confirmButtonText: "OK",
        customClass: { confirmButton: "btn btn-danger" },
      });
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    MySwal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      showCancelButton: true,
      confirmButtonColor: "#00ff00",
      confirmButtonText: "Yes, delete it!",
      cancelButtonColor: "#ff0000",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await updateCustomerStatus(customerId, 0);
          if (response) {
            await fetchCustomersData();
            MySwal.fire({
              title: "Deleted!",
              text: "Customer has been deleted.",
              icon: "success",
              confirmButtonText: "OK",
              customClass: { confirmButton: "btn btn-success" },
            });
          }
        } catch (error) {
          MySwal.fire({
            title: "Error!",
            text: "Failed to delete customer: " + error.message,
            icon: "error",
            confirmButtonText: "OK",
            customClass: { confirmButton: "btn btn-danger" },
          });
        }
      }
    });
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    try {
      if (value.trim() !== "") {
        const [nameResults, mobileResults] = await Promise.all([
          getCustomersByName(value),
          getCustomersByMobileNumber(value),
        ]);

        const combinedResults = [
          ...nameResults,
          ...mobileResults.filter(mobileCustomer => 
            !nameResults.some(nameCustomer => nameCustomer.id === mobileCustomer.id)
          ),
        ];

        setCustomers(combinedResults.reverse());
      } else {
        fetchCustomersData();
      }
    } catch (error) {
      MySwal.fire({
        title: "Error!",
        text: "Failed to search customers: " + error.message,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const downloadPDF = () => {
    try {
      if (!customers || customers.length === 0) {
        MySwal.fire({
          title: "No Data",
          text: "There are no customers to export",
          icon: "warning",
          confirmButtonText: "OK",
        });
        return;
      }
      const doc = new jsPDF();
      doc.text("Customer List", 14, 15);
      const tableColumn = ["Customer Name", "Mobile Number"];
      const tableRows = customers.map((customer) => [
        customer.name || "",
        customer.mobileNumber || "",
      ]);
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        theme: "grid",
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      });
      doc.save("customer_list.pdf");
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
      if (!customers || customers.length === 0) {
        MySwal.fire({
          title: "No Data",
          text: "There are no customers to export",
          icon: "warning",
          confirmButtonText: "OK",
        });
        return;
      }
      const worksheetData = customers.map((customer) => ({
        "Customer Name": customer.name || "",
        "Mobile Number": customer.mobileNumber || "",
      }));
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
      worksheet["!cols"] = [{ wch: 20 }, { wch: 15 }];
      XLSX.writeFile(workbook, "customer_list.xlsx");
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
    fetchCustomersData();
  };

  const handleAddClick = () => {
    setSelectedCustomer(null);
  };

  const handleEditClick = (record) => {
    setSelectedCustomer(record);
  };

  const columns = [
    {
      title: (
        <label className="checkboxs">
          <input
            type="checkbox"
            checked={selectedRows.length === customers.length && customers.length > 0}
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
      title: "Customer Name",
      dataIndex: "name",
      render: (text) => <Link to="#">{text}</Link>,
      sorter: (a, b) => a.name.length - b.name.length,
    },
    {
      title: "Mobile Number",
      dataIndex: "mobileNumber",
      sorter: (a, b) => a.mobileNumber.length - b.mobileNumber.length,
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
              onClick={() => handleDeleteCustomer(record.id)}
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
          maintitle="Customer List"
          subtitle="Manage Your Customers"
          addButton="Add New Customer"
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
                    placeholder="Search by Name or Mobile Number"
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
                dataSource={customers}
                rowKey={(record) => record.id}
              />
            </div>
          </div>
        </div>
      </div>
      <CustomerModal
        onSave={handleSaveCustomer}
        onUpdate={handleUpdateCustomer}
        selectedCustomer={selectedCustomer}
      />
    </div>
  );
};

export default Customers;