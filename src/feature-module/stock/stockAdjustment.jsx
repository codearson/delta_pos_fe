import React, { useState, useEffect } from "react";
//import Breadcrumbs from "../../core/breadcrumbs";
import ImageWithBasePath from "../../core/img/imagewithbasebath";
import { Link } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import { Edit, Trash2 } from "react-feather";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Table from "../../core/pagination/datatable";
import StockadjustmentModal from "../../core/modals/stocks/stockadjustmentModal";
import { useSelector } from "react-redux";

const styles = `
  .nav-tabs-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .nav-tabs-container {
    display: flex;
    align-items: center;
  }

  .toggle-switch {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 20px;
    margin-left: 20px;
  }

  .toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ff4444;
    transition: .4s;
    border-radius: 20px;
  }

  .toggle-slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
  }

  input:checked + .toggle-slider {
    background-color: #00C851;
  }

  input:checked + .toggle-slider:before {
    transform: translateX(20px);
  }

  .toggle-label {
    margin-right: 10px;
    line-height: 20px;
    color: #333;
    font-weight: 500;
    font-size: 14px;
  }

  .toggle-wrapper {
    display: flex;
    align-items: center;
  }
`;

const StockAdjustment = () => {
  const data = useSelector((state) => state.managestockdata);
  const [manualDiscountEnabled, setManualDiscountEnabled] = useState(() => {
    const saved = localStorage.getItem('manualDiscountEnabled');
    return saved ? JSON.parse(saved) : true;
  });
  const [employeeDiscountEnabled, setEmployeeDiscountEnabled] = useState(() => {
    const saved = localStorage.getItem('employeeDiscountEnabled');
    return saved ? JSON.parse(saved) : true;
  });

  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    localStorage.setItem('manualDiscountEnabled', JSON.stringify(manualDiscountEnabled));
  }, [manualDiscountEnabled]);

  useEffect(() => {
    localStorage.setItem('employeeDiscountEnabled', JSON.stringify(employeeDiscountEnabled));
  }, [employeeDiscountEnabled]);

  const manualDiscountColumns = [
    {
      title: "Transaction ID",
      dataIndex: "transactionId",
      sorter: (a, b) => a.transactionId.length - b.transactionId.length,
    },
    {
      title: "Date and Time",
      dataIndex: "dateTime",
      sorter: (a, b) => new Date(a.dateTime) - new Date(b.dateTime),
    },
    {
      title: "Discount",
      dataIndex: "discount",
      render: (text) => (
        <span className="discount-amount">
          {text}%
        </span>
      ),
      sorter: (a, b) => a.discount - b.discount,
    },
    {
      title: "Action",
      dataIndex: "action",
      render: () => (
        <td className="action-table-data">
          <div className="edit-delete-action">
            <div className="input-block add-lists"></div>
            <Link
              className="me-2 p-2"
              to="#"
              data-bs-toggle="modal"
              data-bs-target="#edit-units"
            >
              <Edit className="feather-edit" />
            </Link>
            <Link
              className="confirm-text p-2"
              to="#"
              onClick={showConfirmationAlert}
            >
              <Trash2 className="feather-trash-2" />
            </Link>
          </div>
        </td>
      ),
    },
  ];

  const employeeDiscountColumns = [
    {
      title: "Employee Name",
      dataIndex: "employeeName",
      render: (text, record) => (
        <span className="userimgname">
          <Link to="#" className="product-img">
            <ImageWithBasePath alt="img" src={record.employeeImage} />
          </Link>
          <Link to="#">{text}</Link>
        </span>
      ),
      sorter: (a, b) => a.employeeName.length - b.employeeName.length,
    },
    {
      title: "Discount",
      dataIndex: "discount",
      render: (text) => (
        <span className="discount-amount">
          {text}%
        </span>
      ),
      sorter: (a, b) => a.discount - b.discount,
    },
    {
      title: "Action",
      dataIndex: "action",
      render: () => (
        <td className="action-table-data">
          <div className="edit-delete-action">
            <div className="input-block add-lists"></div>
            <Link
              className="me-2 p-2"
              to="#"
              data-bs-toggle="modal"
              data-bs-target="#edit-units"
            >
              <Edit className="feather-edit" />
            </Link>
            <Link
              className="confirm-text p-2"
              to="#"
              onClick={showConfirmationAlert}
            >
              <Trash2 className="feather-trash-2" />
            </Link>
          </div>
        </td>
      ),
    },
  ];

  const MySwal = withReactContent(Swal);

  const showConfirmationAlert = () => {
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
        MySwal.fire({
          title: "Deleted!",
          text: "Your file has been deleted.",
          className: "btn btn-success",
          confirmButtonText: "OK",
          customClass: {
            confirmButton: "btn btn-success",
          },
        });
      } else {
        MySwal.close();
      }
    });
  };

  return (
    <div className="page-wrapper">
      <style>{styles}</style>
      <div className="content">   
        {/* Manual Discount Section */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="card-title">Manual Discount</h4>
              {(userRole === 'MANAGER' || userRole === 'ADMIN') && (
                <div className="toggle-wrapper">
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={manualDiscountEnabled}
                      onChange={() => setManualDiscountEnabled(!manualDiscountEnabled)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              )}
            </div>
            <div className="table-responsive">
              <Table
                className="table datanew"
                columns={manualDiscountColumns}
                dataSource={manualDiscountEnabled ? data.filter(item => item.type === 'manual') : []}
              />
            </div>
          </div>
        </div>

        {/* Employee Discount Section */}
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="card-title">Employee Discount</h4>
              {(userRole === 'MANAGER' || userRole === 'ADMIN') && (
                <div className="toggle-wrapper">
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={employeeDiscountEnabled}
                      onChange={() => setEmployeeDiscountEnabled(!employeeDiscountEnabled)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              )}
            </div>
            <div className="table-responsive">
              <Table
                className="table datanew"
                columns={employeeDiscountColumns}
                dataSource={employeeDiscountEnabled ? data.filter(item => item.type === 'employee') : []}
              />
            </div>
          </div>
        </div>
      </div>
      <StockadjustmentModal />
    </div>
  );
};

export default StockAdjustment;
