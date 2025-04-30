import React, { useEffect, useState } from 'react';
import { saveShift, updateShift, getShiftsByDateRange } from '../Api/ShiftApi';
import { fetchUsers } from '../Api/UserApi';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
import { Modal, Button, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { PlusCircle } from 'feather-icons-react/build/IconComponents';
import { Link } from 'react-router-dom';
import ImageWithBasePath from '../../core/img/imagewithbasebath';
import { ChevronUp, RotateCcw } from 'feather-icons-react/build/IconComponents';
import { useDispatch, useSelector } from 'react-redux';
import { setToogleHeader } from '../../core/redux/action';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { sendEmail, fetchHolidays } from '../Api/HolidayApi';
import '../../style/scss/pages/_shifts.scss';

function getCalendarGrid(year, month) {
  const firstDayOfMonth = dayjs(`${year}-${month}-01`);
  const startOfGrid = firstDayOfMonth.startOf('week');
  const endOfGrid = firstDayOfMonth.endOf('month').endOf('week');
  const days = [];
  let day = startOfGrid;
  while (day.isBefore(endOfGrid) || day.isSame(endOfGrid, 'day')) {
    days.push(day);
    day = day.add(1, 'day');
  }
  return days;
}

const Shift = () => {
  const [currentMonth, setCurrentMonth] = useState(dayjs('2025-04-01').startOf('month'));
  const [shifts, setShifts] = useState([]);
  const [users, setUsers] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [modal, setModal] = useState({ show: false, date: null, mode: 'add', shift: null });
  const [form, setForm] = useState({ startTime: '', endTime: '', userId: '', status: 'Active' });
  const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const data = useSelector((state) => state.toggle_header);

  useEffect(() => {
    fetchUsers(1, 100, true).then(res => setUsers(res.payload || []));
    fetchHolidays(1, 1000, true).then(res => setHolidays(res.payload || []));
  }, []);

  const year = currentMonth.year();
  const month = currentMonth.format('MM');
  const days = getCalendarGrid(year, month);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const thisMonth = currentMonth.format('YYYY-MM');

  useEffect(() => {
    fetchShiftsData();
  }, [currentMonth, modal.show === false]);

  const fetchShiftsData = async () => {
    setLoading(true);
    if (days.length > 0) {
      const startDate = days[0].format('YYYY-MM-DD');
      const endDate = days[days.length - 1].format('YYYY-MM-DD');
      const result = await getShiftsByDateRange(startDate, endDate);
      setShifts(result || []);
    } else {
      setShifts([]);
    }
    setLoading(false);
  };

  const shiftsByDate = shifts.reduce((acc, shift) => {
    const date = shift.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(shift);
    return acc;
  }, {});

  const prevMonth = () => setCurrentMonth(currentMonth.subtract(1, 'month'));
  const nextMonth = () => setCurrentMonth(currentMonth.add(1, 'month'));

  const openAddModal = (date) => {
    setForm({ startTime: '', endTime: '', userId: '', status: 'Active' });
    setModal({ show: true, date, mode: 'add', shift: null });
  };
  const openEditModal = (shift) => {
    setForm({ startTime: shift.startTime, endTime: shift.endTime, userId: shift.userDto?.id, status: shift.status });
    setModal({ show: true, date: shift.date, mode: 'edit', shift });
  };
  const closeModal = () => setModal({ show: false, date: null, mode: 'add', shift: null });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  function formatTime12(timeStr) {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    let hour = parseInt(h, 10);
    const min = m || '00';
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour.toString().padStart(2, '0')}:${min} ${ampm}`;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const managerId = localStorage.getItem('userId');
    if (modal.mode === 'add' && dayjs(modal.date).isBefore(dayjs(), 'day')) {
      alert('Cannot add shift for past days.');
      setLoading(false);
      return;
    }
    if (modal.mode === 'edit' && dayjs(modal.date).isBefore(dayjs(), 'day')) {
      alert('Cannot update past shifts.');
      setLoading(false);
      return;
    }
    const payload = {
      date: modal.date,
      startTime: form.startTime,
      endTime: form.endTime,
      status: modal.mode === 'edit' ? form.status : 'Active',
      userDto: { id: Number(form.userId) },
      managerDto: { id: Number(managerId) },
      isActive: 1,
    };
    try {
      if (modal.mode === 'add') {
        await saveShift(payload);
        const user = users.find(u => u.id === Number(form.userId));
        if (user && user.emailAddress) {
          const to = user.emailAddress;
          const subject = 'New Shift Assigned';
          const today = dayjs().format('YYYY-MM-DD');
          const userFutureShifts = [
            ...shifts.filter(s => s.userDto?.id === user.id && s.date >= today),
            {
              date: modal.date,
              startTime: form.startTime,
              endTime: form.endTime,
              status: 'Active',
            },
          ];
          const uniqueShifts = userFutureShifts.filter((shift, idx, arr) =>
            idx === arr.findIndex(s => s.date === shift.date && s.startTime === shift.startTime && s.endTime === shift.endTime)
          );
          const newShiftDetails =
            `Date:        ${modal.date}\n` +
            `Start Time:  ${formatTime12(form.startTime)}\n` +
            `End Time:    ${formatTime12(form.endTime)}\n`;
          const header = 'Date        Start Time   End Time';
          const divider = '--------------------------------------------';
          const tableRows = uniqueShifts
            .sort((a, b) => a.date.localeCompare(b.date))
            .map(_shift =>
              `${_shift.date.padEnd(11)}  ${formatTime12(_shift.startTime).padEnd(10)}  ${formatTime12(_shift.endTime).padEnd(10)}`
            ).join('\n');
          let managerName = '';
          if (payload.managerDto && users.length > 0) {
            const manager = users.find(u => u.id === payload.managerDto.id);
            if (manager) managerName = manager.firstName;
          }
          const shopName = localStorage.getItem('shopName') || '';
          const body =
            `Dear ${user.firstName},\n\n` +
            `You have been assigned a new shift.\n\n` +
            newShiftDetails +
            `\nHere are your upcoming shifts:\n\n` +
            `${header}\n${divider}\n${tableRows}\n\n` +
            `If you require any further assistance or would like to discuss any details regarding your shift, please feel free to contact ${managerName ? managerName : 'your manager'} directly.\n\n` +
            `Warm regards,\n${shopName}`;
          try {
            await sendEmail(to, subject, body);
          } catch (err) {
            // Optionally alert or log email error
          }
        }
      } else if (modal.mode === 'edit') {
        await updateShift({ ...payload, id: modal.shift.id });
        // Send email to user if any detail changed
        const user = users.find(u => u.id === Number(form.userId));
        if (user && user.emailAddress) {
          let subject = 'Shift Updated';
          const oldShift = modal.shift;
          const changes = [];
          if (oldShift.startTime !== form.startTime) {
            changes.push(`Start Time: ${formatTime12(oldShift.startTime)} → ${formatTime12(form.startTime)}`);
          }
          if (oldShift.endTime !== form.endTime) {
            changes.push(`End Time: ${formatTime12(oldShift.endTime)} → ${formatTime12(form.endTime)}`);
          }
          if (oldShift.status !== form.status) {
            changes.push(`Status: ${oldShift.status} → ${form.status}`);
          }
          let managerName = '';
          if (payload.managerDto && users.length > 0) {
            const manager = users.find(u => u.id === payload.managerDto.id);
            if (manager) managerName = manager.firstName;
          }
          const shopName = localStorage.getItem('shopName') || '';
          let body = '';
          if (oldShift.status !== form.status && form.status === 'Cancelled') {
            subject = 'Shift Cancelled';
            body =
              `Dear ${user.firstName},\n\n` +
              `Your shift scheduled for:\n\n` +
              `Date:        ${modal.date}\n` +
              `Start Time:  ${formatTime12(form.startTime)}\n` +
              `End Time:    ${formatTime12(form.endTime)}\n\n` +
              `has been cancelled.\n\n` +
              `If you require any further assistance or would like to discuss any details regarding your shift, please feel free to contact ${managerName ? managerName : 'your manager'} directly.\n\n` +
              `Warm regards,\n${shopName}`;
          } else if (changes.length > 0) {
            body =
              `Dear ${user.firstName},\n\n` +
              `Your shift has been updated. The following details were changed:\n\n` +
              changes.join('\n') +
              `\n\nDate: ${modal.date}\n\n` +
              `If you require any further assistance or would like to discuss any details regarding your shift, please feel free to contact ${managerName ? managerName : 'your manager'} directly.\n\n` +
              `Warm regards,\n${shopName}`;
          }
          if (body) {
            try {
              await sendEmail(user.emailAddress, subject, body);
            } catch (err) {
              // Optionally alert or log email error
            }
          }
        }
      }
      closeModal();
    } catch (err) {
      alert('Error saving shift');
    }
    setLoading(false);
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      doc.text('Shift List', 14, 15);
      const tableColumn = ['Date', 'Start Time', 'End Time', 'User', 'Status'];
      const tableRows = shifts.map(shift => [
        shift.date,
        shift.startTime,
        shift.endTime,
        (shift.userDto?.firstName || '') + ' ' + (shift.userDto?.lastName || ''),
        shift.status
      ]);
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      });
      doc.save('shift_list.pdf');
    } catch (error) {
      alert('Failed to generate PDF: ' + error.message);
    }
  };

  const exportToExcel = () => {
    try {
      if (!shifts || shifts.length === 0) {
        alert('There are no shifts to export');
        return;
      }
      const worksheetData = shifts.map(shift => ({
        'Date': shift.date,
        'Start Time': shift.startTime,
        'End Time': shift.endTime,
        'User': (shift.userDto?.firstName || '') + ' ' + (shift.userDto?.lastName || ''),
        'Status': shift.status
      }));
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Shifts');
      worksheet['!cols'] = [
        { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 20 }, { wch: 10 }
      ];
      XLSX.writeFile(workbook, 'shift_list.xlsx');
    } catch (error) {
      alert('Failed to export to Excel: ' + error.message);
    }
  };

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
    <Tooltip id="collapse-tooltip" {...props}>Collapse</Tooltip>
  );

  const getAvailableUsersForDate = (date) => {
    const dateObj = dayjs(date);
    const approvedHolidays = holidays.filter(h => h.status === 'Approved');
    return users.filter(user => {
      const hasLeave = approvedHolidays.some(h =>
        h.userDto?.id === user.id &&
        dayjs(h.startDate).isSameOrBefore(dateObj, 'day') &&
        dayjs(h.endDate).isSameOrAfter(dateObj, 'day')
      );
      return !hasLeave;
        });
    };

    return (
    <div className="page-wrapper" style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <div className="content" style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        {/* Page Header */}
                    <div className="page-header">
                        <div className="add-item d-flex">
                            <div className="page-title">
              <h4 className="calendar-title">Shift Calendar</h4>
              <h6 className="calendar-subtitle">Manage Your Shifts</h6>
                            </div>
                        </div>
                        <ul className="table-top-head">
                            <li>
                                <OverlayTrigger placement="top" overlay={renderTooltip}>
                <Link to="#" onClick={exportToPDF}>
                                        <ImageWithBasePath src="assets/img/icons/pdf.svg" alt="img" />
                                    </Link>
                                </OverlayTrigger>
                            </li>
                            <li>
                                <OverlayTrigger placement="top" overlay={renderExcelTooltip}>
                <Link to="#" onClick={exportToExcel}>
                                        <ImageWithBasePath src="assets/img/icons/excel.svg" alt="img" />
                                    </Link>
                                </OverlayTrigger>
                            </li>
                            <li>
                                <OverlayTrigger placement="top" overlay={renderRefreshTooltip}>
                <Link to="#" onClick={fetchShiftsData}>
                    <RotateCcw />
                                    </Link>
                                </OverlayTrigger>
                            </li>
                            <li>
                                <OverlayTrigger placement="top" overlay={renderCollapseTooltip}>
                                    <Link
                                        data-bs-toggle="tooltip"
                                        data-bs-placement="top"
                                        id="collapse-header"
                                        className={data ? "active" : ""}
                  onClick={() => { dispatch(setToogleHeader(!data)) }}
                                    >
                                        <ChevronUp />
                                    </Link>
                                </OverlayTrigger>
                            </li>
                        </ul>
                        </div>
        {/* End Page Header */}
        <div className="calendar-header">
          <Button variant="outline-primary" onClick={prevMonth}>{'<'}</Button>
          <h4 style={{ margin: 0 }}>{currentMonth.format('MMMM YYYY')}</h4>
          <Button variant="outline-primary" onClick={nextMonth}>{'>'}</Button>
                    </div>
        <div className="calendar-weekdays">
          {weekDays.map(d => <div key={d} className="calendar-weekday-label">{d}</div>)}
                            </div>
        <div className="calendar-grid">
          {days.map((date, idx) => {
            const isThisMonth = date.format('YYYY-MM') === thisMonth;
            const isPast = date.isBefore(dayjs(), 'day');
            return (
              <div
                className={`calendar-day${date.isSame(dayjs(), 'day') ? ' today' : ''}${!isThisMonth ? ' muted' : ''}`}
                key={idx}
              >
                <div className="calendar-day-number" style={{ fontWeight: 600 }}>{date.date()}</div>
                <button
                  className="add-btn"
                  title={isPast ? 'Cannot add shift for past days' : 'Add shift'}
                  onClick={() => !isPast && openAddModal(date.format('YYYY-MM-DD'))}
                  disabled={isPast}
                  style={isPast ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                >
                  <PlusCircle size={16} />
                </button>
                <div className="shift-items-scroll">
                  {(shiftsByDate[date.format('YYYY-MM-DD')] || [])
                    .slice()
                    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
                    .map(shift => {
                    // Status logic
                    let status = shift.status;
                    let statusLabel = status;
                    let shiftClass = '';
                    let statusLabelClass = 'shift-status-label';
                    if (status === 'Cancelled') {
                      shiftClass = 'shift-cancelled';
                      statusLabel = 'Cancelled';
                      statusLabelClass += ' status-cancelled';
                    } else if (status === 'Active') {
                      if (dayjs(shift.date).isBefore(dayjs(), 'day')) {
                        shiftClass = 'shift-completed';
                        statusLabel = 'Completed';
                        statusLabelClass += ' status-completed';
                      } else {
                        shiftClass = 'shift-active';
                        statusLabel = 'Active';
                      }
                    } else if (status === 'Completed') {
                      shiftClass = 'shift-completed';
                      statusLabel = 'Completed';
                      statusLabelClass += ' status-completed';
                    }
                    // Prevent update for past days
                    const shiftIsPast = dayjs(shift.date).isBefore(dayjs(), 'day');
                    return (
                      <div
                        className={`shift-item ${shiftClass}`}
                        key={shift.id}
                        onClick={() => !shiftIsPast && openEditModal(shift)}
                        style={shiftIsPast ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                        title={shiftIsPast ? 'Cannot update past shifts' : 'Update shift'}
                      >
                        <span className={statusLabelClass}>{statusLabel}</span>
                        {formatTime12(shift.startTime)} - {formatTime12(shift.endTime)} <br />
                        {shift.userDto?.firstName || ''}
                      </div>
                    );
                  })}
                </div>
            </div>
            );
          })}
        </div>
        <Modal show={modal.show} onHide={closeModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>{modal.mode === 'add' ? 'Add Shift' : 'Update Shift'}</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Date</Form.Label>
                <Form.Control type="text" value={modal.date} disabled />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Start Time</Form.Label>
                <Form.Control
                  type="time"
                  name="startTime"
                  value={form.startTime}
                  onChange={handleFormChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>End Time</Form.Label>
                <Form.Control
                  type="time"
                  name="endTime"
                  value={form.endTime}
                  onChange={handleFormChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>User</Form.Label>
                <Form.Select
                  name="userId"
                  value={form.userId}
                  onChange={handleFormChange}
                  required
                  disabled={modal.mode === 'edit'}
                >
                  <option value="">Select User</option>
                  {getAvailableUsersForDate(modal.date).map(u => (
                    <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              {/* Status dropdown only for update */}
              {modal.mode === 'edit' && (
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={form.status || 'Active'}
                    onChange={handleFormChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Cancelled">Cancelled</option>
                  </Form.Select>
                </Form.Group>
              )}
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-between align-items-center">
              <div><Button variant="secondary" onClick={closeModal}>Cancel</Button></div>
              <div><Button type="submit" variant="primary" disabled={loading}>{modal.mode === 'add' ? 'Add' : 'Update'}</Button></div>
            </Modal.Footer>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default Shift;
