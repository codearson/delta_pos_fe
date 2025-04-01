import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Edit } from "react-feather";
import Table from "../../../core/pagination/datatable";
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
  const [showActive, setShowActive] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const MySwal = withReactContent(Swal);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      filterData(branchData, searchTerm);
    }
  }, [showActive, branchData, searchTerm]);

  const loadInitialData = async () => {
    setIsLoading(true);
    await loadBranches(true);
    setIsLoading(false);
  };

  const loadBranches = async (isInitial = false) => {
    try {
      if (isInitial) {
        setIsLoading(true);
      }
      const branches = await fetchBranches();
      console.log("Raw API response:", branches); // Debug the API response

      if (Array.isArray(branches) && branches.length > 0) {
        const normalizedData = branches.map(branch => {
          console.log("Processing branch:", branch); // Debug each branch object
          return {
            branchCode: branch.branch_code || branch.branchCode || '',
            branchName: branch.branch_name || branch.branchName || '',
            address: branch.address || branch.Address || '',
            contactNumber: branch.contact_number || branch.contactNumber || '',
            emailAddress: branch.email_address || branch.emailAddress || '',
            countryId: branch.country_id || branch.countryId || '',
            shopDetailsId: branch.shop_details_id || branch.shopDetailsId || '',
            isActive: branch.is_active === 1 || branch.isActive === true || branch.is_active === true,
            id: branch.id || branch.ID || '', // Ensure the ID is included for rowKey
          };
        });
        console.log("Normalized data:", normalizedData); // Debug the normalized data
        setBranchData(normalizedData);
        filterData(normalizedData, searchTerm);
      } else {
        console.log("No branches found or invalid response:", branches);
        setBranchData([]);
        setFilteredBranches([]);
        Swal.fire({
          title: "Warning!",
          text: "No branch data received from the server.",
          icon: "warning",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to load branches: ' + error.message,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      if (isInitial) {
        setIsLoading(false);
      }
    }
  };

  const filterData = (branchesData, query) => {
    let filtered = [...branchesData];
    console.log("Filtering data with query:", query, "showActive:", showActive);

    if (query.trim() !== "") {
      filtered = filtered.filter(branch =>
        (branch.branchName && branch.branchName.toLowerCase().includes(query.toLowerCase())) ||
        (branch.branchCode && branch.branchCode.toLowerCase().includes(query.toLowerCase())) ||
        (branch.address && branch.address.toLowerCase().includes(query.toLowerCase())) ||
        (branch.contactNumber && branch.contactNumber.toLowerCase().includes(query.toLowerCase())) ||
        (branch.emailAddress && branch.emailAddress.toLowerCase().includes(query.toLowerCase()))
      );
    } else {
      filtered = filtered.filter(branch => branch.isActive === showActive);
    }

    console.log("Filtered data:", filtered);
    setFilteredBranches(filtered.reverse());
  };

  const handleToggleStatus = (branchId, currentStatus) => {
    setTogglingId(branchId);
    const newStatusText = currentStatus ? 'Inactive' : 'Active';

    MySwal.fire({
      title: 'Are you sure?',
      text: `Do you want to change this branch to ${newStatusText}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, change it!',
      cancelButtonText: 'No, cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const newStatus = currentStatus ? 0 : 1;
          const response = await updateBranchStatus(branchId, newStatus);
          if (response) {
            await loadBranches(false);
            MySwal.fire({
              title: "Success!",
              text: `Branch status changed to ${newStatusText}.`,
              icon: "success",
              confirmButtonText: "OK",
              customClass: { confirmButton: "btn btn-success" },
            });
          } else {
            throw new Error("Failed to update status");
          }
        } catch (error) {
          MySwal.fire({
            title: "Error!",
            text: error.response?.data?.errorDescription || "Failed to update branch status",
            icon: "error",
            confirmButtonText: "OK",
            customClass: { confirmButton: "btn btn-danger" },
          });
        }
      }
      setTogglingId(null);
    });
  };

  const columns = [
    {
      title: "Branch Code",
      dataIndex: "branchCode",
      sorter: (a, b) => (a.branchCode || '').length - (b.branchCode || '').length,
    },
    {
      title: "Address",
      dataIndex: "address",
      sorter: (a, b) => (a.address || '').length - (b.address || '').length,
    },
    {
      title: "Contact Number",
      dataIndex: "contactNumber",
      sorter: (a, b) => (a.contactNumber || '').length - (b.contactNumber || '').length,
    },
    {
      title: "Email Address",
      dataIndex: "emailAddress",
      sorter: (a, b) => (a.emailAddress || '').length - (b.emailAddress || '').length,
    },
    {
      title: "Country ID",
      dataIndex: "countryId",
      sorter: (a, b) => (a.countryId || 0) - (b.countryId || 0),
    },
    {
      title: "Shop Details ID",
      dataIndex: "shopDetailsId",
      sorter: (a, b) => (a.shopDetailsId || 0) - (b.shopDetailsId || 0),
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
        </div>
      ),
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
          </div>
        </td>
      ),
    },
  ];

  const handleDownloadPDF = () => {
    return filteredBranches.map(branch => ({
      'Branch Code': branch.branchCode || '',
      'Address': branch.address || '',
      'Contact Number': branch.contactNumber || '',
      'Email Address': branch.emailAddress || '',
      'Country ID': branch.countryId || '',
      'Shop Details ID': branch.shopDetailsId || '',
    }));
  };

  const handleDownloadExcel = () => {
    return filteredBranches.map(branch => ({
      'Branch Code': branch.branchCode || '',
      'Address': branch.address || '',
      'Contact Number': branch.contactNumber || '',
      'Email Address': branch.emailAddress || '',
      'Country ID': branch.countryId || '',
      'Shop Details ID': branch.shopDetailsId || '',
    }));
  };

  const handleRefresh = () => {
    loadBranches(false);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    filterData(branchData, value);
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

        <div className="page-header">
          <div className="add-item d-flex flex-column">
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
        </div>

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
        onSave={async (branchData) => {
          try {
            await saveBranch(branchData);
            await loadBranches(false);
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
        }}
        onUpdate={async (branchData) => {
          try {
            const updateData = {
              ...branchData,
              id: selectedBranch.id,
              is_active: selectedBranch.isActive, // Use snake_case for API
            };
            await updateBranch(updateData);
            await loadBranches(false);
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
        }}
        selectedBranch={selectedBranch}
      />
    </div>
  );
};

export default StoreList;