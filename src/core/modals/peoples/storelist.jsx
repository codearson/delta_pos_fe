import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Edit, Trash2 } from "react-feather";
import { Table } from "antd";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Breadcrumbs from "../../breadcrumbs";
import BranchModal from "./branchModal";
import { fetchBranches } from "../../../feature-module/Api/StockApi";
import { saveBranch, updateBranch, updateBranchStatus } from "../../../feature-module/Api/BranchApi";

const StoreList = () => {
  const [branchData, setBranchData] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBranches, setFilteredBranches] = useState([]);
  
  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      const branches = await fetchBranches();
      setBranchData([...branches].reverse());
      setFilteredBranches(branches);
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to load branches',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const columns = [
    {
      title: "Branch Name",
      dataIndex: "branchName",
      sorter: (a, b) => a.branchName.length - b.branchName.length,
    },
    {
      title: "Branch Code",
      dataIndex: "branchCode",
      sorter: (a, b) => a.branchCode.length - b.branchCode.length,
    },
    {
      title: "Address",
      dataIndex: "address",
      sorter: (a, b) => a.address.length - b.address.length,
    },
    {
      title: "Contact Number",
      dataIndex: "contactNumber",
      sorter: (a, b) => a.contactNumber.length - b.contactNumber.length,
    },
    {
      title: "Email Address",
      dataIndex: "emailAddress",
      sorter: (a, b) => a.emailAddress.length - b.emailAddress.length,
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_, record) => (
        <td className="action-table-data">
          <div className="edit-delete-action">
            <div className="input-block add-lists"></div>
            <Link
              className="me-2 p-2"
              to="#"
              data-bs-toggle="modal"
              data-bs-target="#edit-branch"
              onClick={() => setSelectedBranch(record)}
            >
              <Edit className="feather-edit" />
            </Link>
            <Link
              className="confirm-text p-2"
              to="#"
              onClick={() => showConfirmationAlert(record.id)}
            >
              <Trash2 className="feather-trash-2" />
            </Link>
          </div>
        </td>
      ),
    },
  ];

  const MySwal = withReactContent(Swal);

  const showConfirmationAlert = (branchId) => {
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
          await updateBranchStatus(branchId, 0);
          await loadBranches();
          
          MySwal.fire({
            title: "Deleted!",
            text: "Branch has been deleted successfully.",
            icon: "success",
            confirmButtonText: "OK",
          });
        } catch (error) {
          MySwal.fire({
            title: "Error!",
            text: error.response?.data?.errorDescription || "Failed to delete branch",
            icon: "error",
            confirmButtonText: "OK",
          });
        }
      }
    });
  };

  const handleSaveBranch = async (branchData) => {
    try {
      const saveData = {
        ...branchData,
        isActive: 1
      };
      
      await saveBranch(saveData);
      await loadBranches();
      
      Swal.fire({
        title: 'Success',
        text: 'Branch saved successfully',
        icon: 'success',
        confirmButtonText: 'OK'
      });
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || "Failed to save branch",
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleUpdateBranch = async (branchData) => {
    try {
      const updateData = {
        ...branchData,
        id: selectedBranch.id,
        isActive: 1
      };
      
      await updateBranch(updateData);
      await loadBranches();
      setSelectedBranch(null);
      
      Swal.fire({
        title: 'Success',
        text: 'Branch updated successfully',
        icon: 'success',
        confirmButtonText: 'OK'
      });
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || "Failed to update branch",
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleDownloadPDF = () => {
    return branchData.map(branch => ({
      'Branch Name': branch.branchName,
      'Branch Code': branch.branchCode,
      'Address': branch.address,
      'Contact Number': branch.contactNumber,
      'Email Address': branch.emailAddress
    }));
  };

  const handleDownloadExcel = () => {
    return branchData.map(branch => ({
      'Branch Name': branch.branchName,
      'Branch Code': branch.branchCode,
      'Address': branch.address,
      'Contact Number': branch.contactNumber,
      'Email Address': branch.emailAddress
    }));
  };

  const handleRefresh = () => {
    loadBranches();
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    const filtered = branchData.filter(branch =>
      branch.branchName.toLowerCase().includes(value.toLowerCase()) ||
      branch.branchCode.toLowerCase().includes(value.toLowerCase()) ||
      branch.address.toLowerCase().includes(value.toLowerCase()) ||
      branch.contactNumber.toLowerCase().includes(value.toLowerCase()) ||
      branch.emailAddress.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredBranches(filtered);
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <Breadcrumbs
          maintitle="Branch List"
          subtitle="Manage Your Branch"
          addButton="Add Branch"
          buttonDataToggle="modal"
          buttonDataTarget="#add-branch"
          onDownloadPDF={handleDownloadPDF}
          onDownloadExcel={handleDownloadExcel}
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
                    onChange={(e) => handleSearch(e.target.value)}
                    value={searchTerm}
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
                dataSource={filteredBranches}
                rowKey={(record) => record.id}
              />
            </div>
          </div>
        </div>
      </div>
      <BranchModal 
        onSave={handleSaveBranch}
        onUpdate={handleUpdateBranch}
        selectedBranch={selectedBranch}
      />
    </div>
  );
};

export default StoreList;
