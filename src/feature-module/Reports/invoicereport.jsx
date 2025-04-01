import React, { useState, useEffect } from "react";
import Breadcrumbs from "../../core/breadcrumbs";
import { Link } from "react-router-dom";
import { Eye } from "react-feather";
import { fetchTransactions } from "../Api/TransactionApi";
import { fetchBranches } from "../Api/BranchApi";
import { fetchUsers } from "../Api/UserApi";
import { Modal, Button } from "react-bootstrap";
import Select from "react-select";
import "../../style/scss/pages/_invoicereport.scss";

const Invoicereport = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [branchOptions, setBranchOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load branches
        const branchesResponse = await fetchBranches();
        const branches = branchesResponse.map(branch => ({
          value: branch.branchName,
          label: branch.branchName
        }));
        setBranchOptions(branches);

        // Load users
        const usersResponse = await fetchUsers(1, 100); // Assuming we want to load all users
        const users = usersResponse.payload.map(user => ({
          value: user.firstName,
          label: `${user.firstName} ${user.lastName || ''}`
        }));
        setUserOptions(users);

      } catch (error) {
        console.error("Error loading dropdown data:", error);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setIsLoading(true);
        const response = await fetchTransactions(currentPage, 10);
        setTransactions(response.content);
        setFilteredTransactions(response.content);
        setTotalElements(response.totalElements);
      } catch (error) {
        console.error("Error in loadTransactions:", error);
        setTransactions([]);
        setFilteredTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, [currentPage]);

  useEffect(() => {
    handleFilter();
  }, [selectedBranch, selectedUser, searchTerm]);

  const formatTransactionId = (id) => {
    return id ? String(id).padStart(10, '0') : "N/A";
  };

  const handleFilter = () => {
    let filtered = [...transactions];

    if (selectedBranch) {
      filtered = filtered.filter(t => t.branchDto?.branchName === selectedBranch);
    }

    if (selectedUser) {
      filtered = filtered.filter(t => t.userDto?.firstName === selectedUser);
    }

    if (searchTerm) {
      const value = searchTerm.toLowerCase();
      filtered = filtered.filter((transaction) => {
        const branchName = transaction.branchDto?.branchName?.toLowerCase() || "";
        const shopName = transaction.shopDetailsDto?.name?.toLowerCase() || "";
        const userName = transaction.userDto?.firstName?.toLowerCase() || "";
        const customerName = transaction.customerDto?.name?.toLowerCase() || "";
        const transactionId = formatTransactionId(transaction.id).toLowerCase();

        return (
          branchName.includes(value) ||
          shopName.includes(value) ||
          userName.includes(value) ||
          customerName.includes(value) ||
          transactionId.includes(value)
        );
      });
    }

    setFilteredTransactions([...filtered].reverse());
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
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
      "Transaction ID": formatTransactionId(transaction.id),
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
      "Transaction ID": formatTransactionId(transaction.id),
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
      setSelectedBranch("");
      setSelectedUser("");
      setCurrentPage(1);
      const response = await fetchTransactions(1, 10);
      setTransactions(response.content);
      setFilteredTransactions(response.content);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error("Error in handleRefresh:", error);
    }
  };

  const handleNextPage = () => {
    if (currentPage < Math.ceil(totalElements / 10)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const totalPages = Math.ceil(totalElements / 10);

  const columns = [
    {
      title: "Transaction ID",
      dataIndex: "id",
      render: (id) => formatTransactionId(id),
    },
    {
      title: "Branch Name",
      dataIndex: "branchDto",
      render: (branchDto) => branchDto?.branchName || "N/A",
    },
    {
      title: "Shop Name",
      dataIndex: "shopDetailsDto",
      render: (shopDetailsDto) => shopDetailsDto?.name || "N/A",
    },
    {
      title: "User Name",
      dataIndex: "userDto",
      render: (userDto) => userDto?.firstName || "N/A",
    },
    {
      title: "Customer Name",
      dataIndex: "customerDto",
      render: (customerDto) => customerDto?.name || "N/A",
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      render: (totalAmount) => `LKR ${parseFloat(totalAmount || 0).toFixed(2)}`,
    },
    {
      title: "Date Time",
      dataIndex: "dateTime",
      render: (dateTime) => dateTime ? new Date(dateTime).toLocaleString() : "N/A",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <td className="action-table-data text-center">
          <div className="edit-delete-action d-flex justify-content-center align-items-center">
            <Link
              className="p-2"
              to="#"
              onClick={() => handleViewDetails(record)}
              style={{ textDecoration: 'none' }} // Inline style to remove underline
            >
              <Eye className="action-eye" />
            </Link>
          </div>
        </td>
      ),
    },
  ];

  // Add this custom style for the table
  const tableStyle = {
    table: {
      borderCollapse: 'collapse',
      width: '100%',
      background: '#fff',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    thead: {
      background: '#f8f9fa',
    },
    th: {
      padding: '8px 10px',
      textAlign: 'left',
      fontWeight: '600',
      fontSize: '14px',
      color: '#333',
      borderBottom: '2px solid #dee2e6'
    },
    td: {
      padding: '0px 10px',
      borderBottom: '1px solid #dee2e6'
    },
    tr: {
      '&:hover': {
        backgroundColor: '#f5f5f5'
      }
    }
  };

  // Add this new function to handle pagination display
  const renderPaginationButtons = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="d-flex justify-content-center align-items-center mt-3">
        <button
          className="btn btn-sm btn-secondary mx-1"
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
        >
          &lt;
        </button>

        <button
          className={`btn btn-sm mx-1 ${currentPage === 1 ? 'btn-primary' : 'btn-outline-secondary'}`}
          onClick={() => setCurrentPage(1)}
        >
          1
        </button>

        {currentPage !== 1 && currentPage !== totalPages && (
          <button
            className="btn btn-sm mx-1 btn-primary"
          >
            {currentPage}
          </button>
        )}

        {totalPages > 1 && (
          <button
            className={`btn btn-sm mx-1 ${currentPage === totalPages ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setCurrentPage(totalPages)}
          >
            {totalPages}
          </button>
        )}

        <button
          className="btn btn-sm btn-secondary mx-1"
          onClick={handleNextPage}
          disabled={currentPage >= totalPages}
        >
          &gt;
        </button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="page-wrapper">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="content invoice-report">
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
                      options={branchOptions}
                      placeholder="Select Branch"
                      value={selectedBranch ? { value: selectedBranch, label: selectedBranch } : null}
                      onChange={(selected) => setSelectedBranch(selected ? selected.value : "")}
                      isClearable
                    />
                  </div>
                  <div style={{ width: '200px' }}>
                    <Select
                      className="select"
                      options={userOptions}
                      placeholder="Select User"
                      value={selectedUser ? { value: selectedUser, label: selectedUser } : null}
                      onChange={(selected) => setSelectedUser(selected ? selected.value : "")}
                      isClearable
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table custom-table" style={tableStyle.table}>
                <thead style={tableStyle.thead}>
                  <tr>
                    {columns.map((column) => (
                      <th key={column.dataIndex || column.key} style={tableStyle.th}>
                        {column.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((record) => (
                    <tr key={record.id} style={tableStyle.tr}>
                      {columns.map((column) => (
                        <td key={column.dataIndex || column.key} style={tableStyle.td}>
                          {column.render
                            ? column.render(record[column.dataIndex], record)
                            : record[column.dataIndex]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {renderPaginationButtons()}
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
                      <strong>Transaction ID:</strong>{" "}
                      {formatTransactionId(selectedTransaction.id)}
                    </p>
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