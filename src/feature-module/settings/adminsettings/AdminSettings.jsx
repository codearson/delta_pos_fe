import React, { useEffect, useState } from 'react';
import { getAllPendingDevices, approveDevice, declineDevice, getAllDevices, blockDevice } from '../../Api/DeviceAuthApi';
import Table from "../../../core/pagination/datatable";
import { Edit, RotateCcw, ChevronUp } from "feather-icons-react/build/IconComponents";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { Link } from 'react-router-dom';
import ImageWithBasePath from '../../../core/img/imagewithbasebath';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import './AdminSetting.scss';

const AdminSettings = () => {
  const [pendingDevices, setPendingDevices] = useState([]);
  const [allDevices, setAllDevices] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [access, setAccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [showActive, setShowActive] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingDevicesError, setPendingDevicesError] = useState(false);
  const [allDevicesError, setAllDevicesError] = useState(false);
  const [isPendingEdit, setIsPendingEdit] = useState(false);

  useEffect(() => {
    fetchPendingDevices();
    fetchAllDevices();
  }, []);

  const fetchPendingDevices = async () => {
    try {
      const response = await getAllPendingDevices();
      setPendingDevicesError(false);
      if (response && response.status) {
        setPendingDevices(response.responseDto);
      }
    } catch (error) {
      setPendingDevicesError(true);
      setPendingDevices([]);
      console.error('Error fetching pending devices:', error);
    }
  };

  const fetchAllDevices = async () => {
    try {
      const response = await getAllDevices();
      setAllDevicesError(false);
      if (response && response.status) {
        setAllDevices(response.responseDto);
      }
    } catch (error) {
      setAllDevicesError(true);
      console.error('Error fetching all devices:', error);
    }
  };

  const handleEditClick = (device, fromPending = false) => {
    setSelectedDevice(device);
    setAccess('');
    setModalVisible(true);
    setIsPendingEdit(fromPending);
  };

  const handleAccessChange = (e) => {
    setAccess(e.target.value);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedDevice(null);
    setAccess('');
  };

  const handleSave = async () => {
    if (!selectedDevice || !access) return;
    setSaving(true);
    try {
      if (access === 'Approved') {
        await approveDevice(selectedDevice.id);
      } else if (access === 'Declined') {
        await declineDevice(selectedDevice.id);
      } else if (access === 'Block') {
        await blockDevice(selectedDevice.id);
      }
      await Promise.all([
        fetchPendingDevices(),
        fetchAllDevices()
      ]);
      handleModalClose();
    } catch (error) {
      console.error('Error updating device:', error);
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: 'Till Name',
      dataIndex: 'tillName',
      key: 'tillName',
      sorter: (a, b) => a.tillName.localeCompare(b.tillName),
    },
    {
      title: 'Approve Status',
      dataIndex: 'approveStatus',
      key: 'approveStatus',
      sorter: (a, b) => a.approveStatus.localeCompare(b.approveStatus),
      render: (status) => (
        <span className={`admin-status-badge ${
          status === 'Pending' ? 'pending' :
          status === 'Approved' ? 'approved' :
          status === 'Declined' ? 'declined' : ''
        }`}>
          {status}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <td className="action-table-data">
          <div className="edit-delete-action">
            <a className="me-2 p-2" href="#" onClick={() => handleEditClick(record, true)}>
              <Edit className="feather-edit" />
            </a>
          </div>
        </td>
      ),
    },
  ];

  const allDevicesColumns = [
    {
      title: 'Till Name',
      dataIndex: 'tillName',
      key: 'tillName',
      sorter: (a, b) => a.tillName.localeCompare(b.tillName),
    },
    {
      title: 'Approve Status',
      dataIndex: 'approveStatus',
      key: 'approveStatus',
      sorter: (a, b) => a.approveStatus.localeCompare(b.approveStatus),
      render: (status) => (
        <span className={`admin-status-badge ${
          status === 'Pending' ? 'pending' :
          status === 'Approved' ? 'approved' :
          status === 'Declined' ? 'declined' : ''
        }`}>
          {status}
        </span>
      ),
    },
    {
      title: 'Login Status',
      dataIndex: 'loginStatus',
      key: 'loginStatus',
      sorter: (a, b) => a.loginStatus.localeCompare(b.loginStatus),
      render: (status) => (
        <span className={`admin-status-badge ${status === 'True' ? 'approved' : 'declined'}`}>{status}</span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <td className="action-table-data">
          <div className="edit-delete-action">
            <a className="me-2 p-2" href="#" onClick={() => handleEditClick(record, false)}>
              <Edit className="feather-edit" />
            </a>
          </div>
        </td>
      ),
    },
  ];

  const filteredDevices = allDevices
    .filter(device =>
      showActive
        ? device.isActive === "1" || device.isActive === 1 || device.isActive === true
        : device.isActive === "0" || device.isActive === 0 || device.isActive === false
    )
    .reverse();

  const reversedPendingDevices = [...pendingDevices].reverse();

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Pending Till", 14, 15);

    // Pending Till Table
    if (pendingDevices && pendingDevices.length > 0) {
      autoTable(doc, {
        head: [["Till Name", "Approve Status"]],
        body: pendingDevices.map(d => [d.tillName, d.approveStatus]),
        startY: 20,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      });
    }

    // All Devices Table
    let y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 40;
    doc.text("All Devices", 14, y);
    if (allDevices && allDevices.length > 0) {
      autoTable(doc, {
        head: [["Till Name", "Approve Status", "Login Status"]],
        body: allDevices.map(d => [d.tillName, d.approveStatus, d.loginStatus]),
        startY: y + 5,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      });
    }

    doc.save("admin_settings.pdf");
  };

  const exportToExcel = () => {
    const ws_data = [];

    // Pending Till Section
    ws_data.push(["Pending Till"]);
    ws_data.push(["Till Name", "Approve Status"]);
    pendingDevices.forEach(d => {
      ws_data.push([d.tillName, d.approveStatus]);
    });

    // Blank row as separator
    ws_data.push([]);

    // All Devices Section
    ws_data.push(["All Devices"]);
    ws_data.push(["Till Name", "Approve Status", "Login Status"]);
    allDevices.forEach(d => {
      ws_data.push([d.tillName, d.approveStatus, d.loginStatus]);
    });

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Admin Settings");
    XLSX.writeFile(wb, "admin_settings.xlsx");
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchAllDevices(), fetchPendingDevices()]);
    setRefreshing(false);
  };

  const handleCollapse = () => {
    // TODO: Implement collapse logic if needed
    alert('Collapse not implemented yet.');
  };

  const renderTooltip = (msg) => (
    <Tooltip>{msg}</Tooltip>
  );

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="add-item d-flex flex-column">
            <div className="page-title">
              <h4>Admin Settings</h4>
              <h6>Manage your admin settings</h6>
            </div>
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
              <div className="status-toggle-btns">
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
              <div className="export-icons-row">
                <ul className="table-top-head d-flex gap-2 mb-0">
                  <li>
                    <OverlayTrigger placement="top" overlay={renderTooltip('Pdf')}>
                      <Link to="#" onClick={exportToPDF}>
                        <ImageWithBasePath src="assets/img/icons/pdf.svg" alt="img" />
                      </Link>
                    </OverlayTrigger>
                  </li>
                  <li>
                    <OverlayTrigger placement="top" overlay={renderTooltip('Excel')}>
                      <Link to="#" onClick={exportToExcel}>
                        <ImageWithBasePath src="assets/img/icons/excel.svg" alt="img" />
                      </Link>
                    </OverlayTrigger>
                  </li>
                  <li>
                    <OverlayTrigger placement="top" overlay={renderTooltip('Refresh')}>
                      <Link to="#" onClick={handleRefresh} disabled={refreshing}>
                        <RotateCcw className={refreshing ? "refresh-rotating" : ""} />
                      </Link>
                    </OverlayTrigger>
                  </li>
                  <li>
                    <OverlayTrigger placement="top" overlay={renderTooltip('Collapse')}>
                      <Link to="#" id="collapse-header" onClick={handleCollapse}>
                        <ChevronUp />
                      </Link>
                    </OverlayTrigger>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        {/* Pending Till Table - only show if there is data and no error */}
        {!pendingDevicesError && pendingDevices && pendingDevices.length > 0 && (
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="mb-3">Pending Till</h5>
              <div className="responsive-table-wrapper">
                <Table
                  columns={columns}
                  dataSource={reversedPendingDevices}
                  pagination={{ pageSize: 10 }}
                />
              </div>
            </div>
          </div>
        )}
        {/* All Devices Table - only show if there is data */}
        {!allDevicesError && filteredDevices && filteredDevices.length > 0 && (
          <div className="card">
            <div className="card-body">
              <h5 className="mb-3">All Devices</h5>
              <div className="responsive-table-wrapper">
                <Table
                  columns={allDevicesColumns}
                  dataSource={filteredDevices}
                  pagination={{ pageSize: 10 }}
                />
              </div>
            </div>
          </div>
        )}
        {modalVisible && (
          <div className="admin-settings-modal-root">
            <div className="custom-modal-overlay">
              <div className="custom-modal">
                <div className="custom-modal-header">
                  <h4>Edit Device Access</h4>
                  <button className="custom-modal-close" onClick={handleModalClose}>&times;</button>
                </div>
                <div className="custom-modal-body">
                  {selectedDevice && (
                    <>
                      <div className="mb-3">
                        <label>Till Name:</label>
                        <div>{selectedDevice.tillName}</div>
                      </div>
                      <div className="mb-3">
                        <label>Access:</label>
                        <select value={access} onChange={handleAccessChange} className="custom-select">
                          <option value="" disabled>Select Access</option>
                          <option value="Approved">Approved</option>
                          <option value="Declined">Declined</option>
                          {!isPendingEdit && <option value="Block">Block</option>}
                        </select>
                      </div>
                    </>
                  )}
                </div>
                <div className="custom-modal-footer">
                  <button className="custom-save-btn" onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button className="custom-cancel-btn" onClick={handleModalClose}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings; 