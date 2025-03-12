import React, { useState, useEffect } from "react";
import Breadcrumbs from "../../core/breadcrumbs";
import { Link } from "react-router-dom";
import { Eye } from "react-feather";
import { fetchTransactions } from "../Api/TransactionApi";
import { Modal, Button } from "react-bootstrap";
import Table from "../../core/pagination/datatable";
import "../../style/scss/pages/_invoicereport.scss";

const Invoicereport = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setIsLoading(true);
        const data = await fetchTransactions();
        console.log("Transactions set to state:", data);
        const reversedData = [...data].reverse();
        setTransactions(reversedData);
        setFilteredTransactions(reversedData);
      } catch (error) {
        console.error("Error in loadTransactions:", error);
        setTransactions([]);
        setFilteredTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, []);

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = transactions.filter((transaction) => {
      const branchName = transaction.branchDto?.branchName?.toLowerCase() || "";
      const shopName = transaction.shopDetailsDto?.name?.toLowerCase() || "";
      const userName = transaction.userDto?.firstName?.toLowerCase() || "";
      const customerName = transaction.customerDto?.name?.toLowerCase() || "";

      return (
        branchName.includes(value) ||
        shopName.includes(value) ||
        userName.includes(value) ||
        customerName.includes(value)
      );
    });

    setFilteredTransactions([...filtered].reverse());
  };

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTransaction(null);
  };

  const exportToPDFData = () => {
    if (isLoading) return [];
    return filteredTransactions.map((transaction) => ({
      "Branch Name": transaction.branchDto?.branchName || "N/A",
      "Shop Name": transaction.shopDetailsDto?.name || "N/A",
      "User Name": transaction.userDto?.firstName || "N/A",
      "Customer Name": transaction.customerDto?.name || "N/A",
      "Total Amount": `LKR ${parseFloat(transaction.totalAmount || 0).toFixed(2)}`,
      "Date Time": transaction.dateTime
        ? new Date(transaction.dateTime).toLocaleString()
        : "N/A",
    }));
  };

  const exportToExcelData = () => {
    if (isLoading) return [];
    return filteredTransactions.map((transaction) => ({
      "Branch Name": transaction.branchDto?.branchName || "N/A",
      "Shop Name": transaction.shopDetailsDto?.name || "N/A",
      "User Name": transaction.userDto?.firstName || "N/A",
      "Customer Name": transaction.customerDto?.name || "N/A",
      "Total Amount": `LKR ${parseFloat(transaction.totalAmount || 0).toFixed(2)}`,
      "Date Time": transaction.dateTime
        ? new Date(transaction.dateTime).toLocaleString()
        : "N/A",
    }));
  };

  const handleRefresh = async () => {
    try {
      setFilteredTransactions([]);
      setSearchTerm("");
      const data = await fetchTransactions();
      setTransactions(data);
      setFilteredTransactions([...data].reverse());
    } catch (error) {
      console.error("Error in handleRefresh:", error);
    }
  };

  const columns = [
    {
      title: "Branch Name",
      dataIndex: "branchDto",
      render: (branchDto) => branchDto?.branchName || "N/A",
      sorter: (a, b) =>
        (a.branchDto?.branchName || "").localeCompare(
          b.branchDto?.branchName || ""
        ),
    },
    {
      title: "Shop Name",
      dataIndex: "shopDetailsDto",
      render: (shopDetailsDto) => shopDetailsDto?.name || "N/A",
      sorter: (a, b) =>
        (a.shopDetailsDto?.name || "").localeCompare(
          b.shopDetailsDto?.name || ""
        ),
    },
    {
      title: "User Name",
      dataIndex: "userDto",
      render: (userDto) => userDto?.firstName || "N/A",
      sorter: (a, b) =>
        (a.userDto?.firstName || "").localeCompare(b.userDto?.firstName || ""),
    },
    {
      title: "Customer Name",
      dataIndex: "customerDto",
      render: (customerDto) => customerDto?.name || "N/A",
      sorter: (a, b) =>
        (a.customerDto?.name || "").localeCompare(b.customerDto?.name || ""),
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      render: (totalAmount) => `LKR ${parseFloat(totalAmount || 0).toFixed(2)}`,
      sorter: (a, b) => (a.totalAmount || 0) - (b.totalAmount || 0),
    },
    {
      title: "Date Time",
      dataIndex: "dateTime",
      render: (dateTime) =>
        dateTime ? new Date(dateTime).toLocaleString() : "N/A",
      sorter: (a, b) => new Date(a.dateTime) - new Date(b.dateTime),
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_, record) => (
        <td className="action-table-data text-center">
          <div className="edit-delete-action d-flex justify-content-center align-items-center">
            <Link
              className="p-2"
              to="#"
              onClick={() => handleViewDetails(record)}
            >
              <Eye className="action-eye" />
            </Link>
          </div>
        </td>
      ),
      sorter: false,
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
    <div className="page-wrapper">
      <div className="content">
        <Breadcrumbs
          maintitle="Transaction Report"
          subtitle="Manage Your Transaction Report"
          onDownloadPDF={exportToPDFData}
          onDownloadExcel={exportToExcelData}
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
                dataSource={filteredTransactions}
                rowKey={(record) => record.id || Math.random()}
                loading={filteredTransactions.length === 0}
                pagination={{ pageSize: 10 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Transaction Details */}
      <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Transaction Receipt</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTransaction ? (
            <div className="receipt">
              <div className="receipt-details">
                <div className="row">
                  <div className="col-md-6">
                    <p>
                      <strong>Date & Time:</strong>{" "}
                      {selectedTransaction.dateTime
                        ? new Date(selectedTransaction.dateTime).toLocaleString()
                        : "N/A"}
                    </p>
                    <p>
                      <strong>Total Amount:</strong> LKR{" "}
                      {parseFloat(selectedTransaction.totalAmount || 0).toFixed(2)}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span
                        className={`badge ${selectedTransaction.status?.toLowerCase() === "completed"
                            ? "badge-linesuccess"
                            : "badge-linedanger"
                          }`}
                      >
                        {selectedTransaction.status || "N/A"}
                      </span>
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p>
                      <strong>Branch Name:</strong>{" "}
                      {selectedTransaction.branchDto?.branchName || "N/A"}
                    </p>
                    <p>
                      <strong>Shop Name:</strong>{" "}
                      {selectedTransaction.shopDetailsDto?.name || "N/A"}
                    </p>
                  </div>
                </div>

                <hr />

                <div className="row">
                  <div className="col-md-6">
                    <h6>User Information</h6>
                    <p>
                      <strong>First Name:</strong>{" "}
                      {selectedTransaction.userDto?.firstName || "N/A"}
                    </p>
                    <p>
                      <strong>Last Name:</strong>{" "}
                      {selectedTransaction.userDto?.lastName || "N/A"}
                    </p>
                    <p>
                      <strong>Role:</strong>{" "}
                      {selectedTransaction.userDto?.userRoleDto?.userRole || "N/A"}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <h6>Customer Information</h6>
                    <p>
                      <strong>Name:</strong>{" "}
                      {selectedTransaction.customerDto?.name || "N/A"}
                    </p>
                    <p>
                      <strong>Mobile Number:</strong>{" "}
                      {selectedTransaction.customerDto?.mobileNumber || "N/A"}
                    </p>
                  </div>
                </div>

                <hr />

                <h6>Transaction Items</h6>
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>Barcode</th>
                        <th>Unit Price</th>
                        <th>Quantity</th>
                        <th>Discount</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTransaction.transactionDetailsList &&
                        selectedTransaction.transactionDetailsList.length > 0 ? (
                        selectedTransaction.transactionDetailsList.map(
                          (item, index) => (
                            <tr key={index}>
                              <td>{item.productDto?.name || "N/A"}</td>
                              <td>{item.productDto?.barcode || "N/A"}</td>
                              <td>
                                LKR {parseFloat(item.unitPrice || 0).toFixed(2)}
                              </td>
                              <td>{item.quantity || 0}</td>
                              <td>
                                LKR {parseFloat(item.discount || 0).toFixed(2)}
                              </td>
                              <td>
                                LKR{" "}
                                {parseFloat(
                                  (item.unitPrice * item.quantity) -
                                  item.discount || 0
                                ).toFixed(2)}
                              </td>
                            </tr>
                          )
                        )
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center">
                            No items found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <hr />

                <h6>Payment Methods</h6>
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Payment Type</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTransaction.transactionPaymentMethod &&
                        selectedTransaction.transactionPaymentMethod.length > 0 ? (
                        selectedTransaction.transactionPaymentMethod.map(
                          (payment, index) => (
                            <tr key={index}>
                              <td>{payment.paymentMethodDto?.type || "N/A"}</td>
                              <td>
                                LKR {parseFloat(payment.amount || 0).toFixed(2)}
                              </td>
                            </tr>
                          )
                        )
                      ) : (
                        <tr>
                          <td colSpan="2" className="text-center">
                            No payment methods found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <p>No transaction selected.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Invoicereport;