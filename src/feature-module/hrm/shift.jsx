import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';
import Select from 'react-select';
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

function to12h(time24) {
  if (!time24) return { hours: '12', minutes: '00', ampm: 'AM' };
  const [h, m] = time24.split(':');
  let hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return { hours: String(hour).padStart(2, '0'), minutes: m || '00', ampm };
}

function to24h(hours12, minutes, ampm) {
  let h = parseInt(hours12, 10) || 12;
  if (ampm === 'AM') {
    if (h === 12) h = 0;
  } else {
    if (h !== 12) h += 12;
  }
  return `${String(h).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function TimeInput({ value, onChange, timeFormat }) {
  TimeInput.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    timeFormat: PropTypes.string,
  };

  const [hRaw, mRaw] = (value || '00:00').split(':');
  const hour24 = parseInt(hRaw, 10) || 0;
  const minuteVal = parseInt(mRaw, 10) || 0;
  const { hours: hours12, minutes, ampm } = to12h(value);

  if (timeFormat === '24h') {
    return (
      <div className="d-flex align-items-center gap-2">
        <input
          type="number"
          min="0"
          max="23"
          value={hour24}
          onChange={(e) => {
            let h = parseInt(e.target.value, 10);
            if (isNaN(h) || h < 0) h = 0;
            if (h > 23) h = 23;
            onChange(`${String(h).padStart(2, '0')}:${String(minuteVal).padStart(2, '0')}`);
          }}
          className="form-control"
          style={{ width: 68, textAlign: 'center' }}
        />
        <span style={{ fontWeight: 'bold', fontSize: 18 }}>:</span>
        <input
          type="number"
          min="0"
          max="59"
          value={minuteVal}
          onChange={(e) => {
            let m = parseInt(e.target.value, 10);
            if (isNaN(m) || m < 0) m = 0;
            if (m > 59) m = 59;
            onChange(`${String(hour24).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
          }}
          className="form-control"
          style={{ width: 68, textAlign: 'center' }}
        />
      </div>
    );
  }

  // 12h mode
  const handleHours = (e) => {
    let h = parseInt(e.target.value, 10);
    if (isNaN(h) || h < 1) h = 1;
    if (h > 12) h = 12;
    onChange(to24h(h, minutes, ampm));
  };

  const handleMinutes = (e) => {
    let m = parseInt(e.target.value, 10);
    if (isNaN(m) || m < 0) m = 0;
    if (m > 59) m = 59;
    onChange(to24h(hours12, String(m).padStart(2, '0'), ampm));
  };

  return (
    <div className="d-flex align-items-center gap-2">
      <input
        type="number"
        min="1"
        max="12"
        value={parseInt(hours12, 10)}
        onChange={handleHours}
        className="form-control"
        style={{ width: 68, textAlign: 'center' }}
      />
      <span style={{ fontWeight: 'bold', fontSize: 18 }}>:</span>
      <input
        type="number"
        min="0"
        max="59"
        value={parseInt(minutes, 10)}
        onChange={handleMinutes}
        className="form-control"
        style={{ width: 68, textAlign: 'center' }}
      />
      <div className="btn-group ms-1">
        <button
          type="button"
          className={`btn btn-sm ${ampm === 'AM' ? 'btn-success' : 'btn-outline-secondary'}`}
          onClick={() => onChange(to24h(hours12, minutes, 'AM'))}
        >AM</button>
        <button
          type="button"
          className={`btn btn-sm ${ampm === 'PM' ? 'btn-success' : 'btn-outline-secondary'}`}
          onClick={() => onChange(to24h(hours12, minutes, 'PM'))}
        >PM</button>
      </div>
    </div>
  );
}

const Shift = () => {
  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf('month'));
  const [shifts, setShifts] = useState([]);
  const [users, setUsers] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [modal, setModal] = useState({ show: false, date: null, mode: 'add', shift: null });
  const [emailModal, setEmailModal] = useState({ show: false, startDate: '', endDate: '', sendToAll: true, selectedUsers: [] });
  const [form, setForm] = useState({ startTime: '', endTime: '', userId: '', status: 'Active' });
  const [timeError, setTimeError] = useState('');
  const [timeFormat, setTimeFormat] = useState('12h');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const data = useSelector((state) => state.toggle_header);
  const [exportModal, setExportModal] = useState({ show: false, startDate: '', endDate: '', type: '' });

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
    setForm({ startTime: '06:00', endTime: '14:00', userId: '', status: 'Active' });
    setTimeError('');
    setModal({ show: true, date, mode: 'add', shift: null });
  };
  const openEditModal = (shift) => {
    setForm({ startTime: shift.startTime, endTime: shift.endTime, userId: shift.userDto?.id, status: shift.status });
    setTimeError('');
    setModal({ show: true, date: shift.date, mode: 'edit', shift });
  };
  const closeModal = () => {
    setTimeError('');
    setModal({ show: false, date: null, mode: 'add', shift: null });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  function isOnLeave(userId, date) {
    return holidays.some(h =>
      h.userDto?.id === Number(userId) &&
      h.status === 'Approved' &&
      dayjs(h.startDate).isSameOrBefore(dayjs(date), 'day') &&
      dayjs(h.endDate).isSameOrAfter(dayjs(date), 'day')
    );
  }

  function formatTime(timeStr, fmt) {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h, 10);
    const min = m || '00';
    if (fmt === '24h') {
      return `${String(hour).padStart(2, '0')}:${min}`;
    }
    const ampm = hour >= 12 ? 'PM' : 'AM';
    let h12 = hour % 12;
    if (h12 === 0) h12 = 12;
    return `${h12.toString().padStart(2, '0')}:${min} ${ampm}`;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.startTime && form.endTime && form.endTime <= form.startTime) {
      setTimeError('End time must be after start time.');
      return;
    }
    setTimeError('');
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
      } else if (modal.mode === 'edit') {
        await updateShift({ ...payload, id: modal.shift.id });
      }
      closeModal();
    } catch (err) {
      alert('Error saving shift');
    }
    setLoading(false);
  };

  const handleEmailSubmit = async () => {
    if (!emailModal.startDate || !emailModal.endDate) {
      alert('Please select both start and end dates');
      return;
    }

    setLoading(true);
    try {
      const startDate = dayjs(emailModal.startDate);
      const endDate = dayjs(emailModal.endDate);
      // Get all dates in the range
      const allDates = [];
      let d = startDate;
      while (d.isSameOrBefore(endDate, 'day')) {
        allDates.push(d.format('YYYY-MM-DD'));
        d = d.add(1, 'day');
      }
      // Get shifts for the selected date range
      const result = await getShiftsByDateRange(emailModal.startDate, emailModal.endDate);
      // Group shifts by user, filter out cancelled
      const shiftsByUser = result.filter(s => s.status !== 'Cancelled').reduce((acc, shift) => {
        const userId = shift.userDto?.id;
        if (!acc[userId]) acc[userId] = [];
        acc[userId].push(shift);
        return acc;
      }, {});
      // Get user IDs — all users or selected subset
      const targetUserIds = emailModal.sendToAll
        ? Array.from(new Set([...Object.keys(shiftsByUser), ...users.map(u => String(u.id))]))
        : emailModal.selectedUsers.map(u => String(u.value));
      const userIds = targetUserIds;
      // Send email to each user with their shifts or off days
      for (const userId of userIds) {
        const user = users.find(u => u.id === Number(userId));
        if (user && user.emailAddress) {
          const userShifts = (shiftsByUser[userId] || []);
          // Map date to shift for quick lookup
          const shiftMap = {};
          userShifts.forEach(shift => { shiftMap[shift.date] = shift; });
          // Build table rows for all dates
          const tableRows = allDates.map(date => {
            const shift = shiftMap[date];
            if (shift) {
              return `${date.padEnd(11)}  ${formatTime(shift.startTime, timeFormat).padEnd(10)}  ${formatTime(shift.endTime, timeFormat).padEnd(10)}`;
            } else if (isOnLeave(user.id, date)) {
              return `${date.padEnd(11)}  On Leave`;
            } else {
              return `${date.padEnd(11)}  Off day`;
            }
          }).join('\n');
          let managerName = '';
          const managerId = localStorage.getItem('userId');
          if (managerId && users.length > 0) {
            const manager = users.find(u => u.id === Number(managerId));
            if (manager) managerName = manager.firstName;
          }
          const shopName = localStorage.getItem('shopName') || '';
          const header = 'Date        Start Time   End Time';
          const divider = '--------------------------------------------';
          const subject = `Your Shifts (${startDate.format('MMM D')} - ${endDate.format('MMM D')})`;
          const body =
            `Dear ${user.firstName},\n\n` +
            `Here are your shifts for the period ${startDate.format('MMM D')} - ${endDate.format('MMM D')}:\n\n` +
            `${header}\n${divider}\n${tableRows}\n\n` +
            `If you require any further assistance or would like to discuss any details regarding your shifts, please feel free to contact ${managerName ? managerName : 'your manager'} directly.\n\n` +
            `Warm regards,\n${shopName}`;
          try {
            await sendEmail(user.emailAddress, subject, body);
          } catch (err) {
            console.error('Error sending email:', err);
          }
        }
      }
      setEmailModal({ show: false, startDate: '', endDate: '', sendToAll: true, selectedUsers: [] });
      Swal.fire({
        title: 'Success!',
        text: 'Shifts sent via email successfully.',
        icon: 'success',
      });
    } catch (err) {
      alert('Error sending emails');
    }
    setLoading(false);
  };

  function getAllDatesInRange(start, end) {
    const dates = [];
    let d = dayjs(start);
    const endD = dayjs(end);
    while (d.isSameOrBefore(endD, 'day')) {
      dates.push(d.format('YYYY-MM-DD'));
      d = d.add(1, 'day');
    }
    return dates;
  }

  const handleExport = async () => {
    if (!exportModal.startDate || !exportModal.endDate) {
      alert('Please select both start and end dates');
      return;
    }
    console.log('Exporting from', exportModal.startDate, 'to', exportModal.endDate);
    const allDates = getAllDatesInRange(exportModal.startDate, exportModal.endDate);
    const result = await getShiftsByDateRange(exportModal.startDate, exportModal.endDate);
    const shiftMap = {};
    result.filter(s => s.status !== 'Cancelled').forEach(shift => {
      const userId = shift.userDto?.id;
      if (!shiftMap[userId]) shiftMap[userId] = {};
      shiftMap[userId][shift.date] = shift;
    });
    const matrixRows = users.map(user => {
      const row = [user.firstName + ' ' + user.lastName];
      allDates.forEach(date => {
        const shift = shiftMap[user.id]?.[date];
        if (shift) {
          row.push(`${formatTime(shift.startTime, timeFormat)} - ${formatTime(shift.endTime, timeFormat)}`);
        } else if (isOnLeave(user.id, date)) {
          row.push('On Leave');
        } else {
          row.push('Off day');
        }
      });
      return row;
    });
    const headerRow = ['User'];
    allDates.forEach(date => headerRow.push(dayjs(date).format('MMM DD')));
    if (exportModal.type === 'pdf') {
      try {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        doc.text('Shifts', 14, 15);
        autoTable(doc, {
          head: [headerRow],
          body: matrixRows,
          startY: 20,
          theme: 'grid',
          styles: { fontSize: 12, cellPadding: 3, cellWidth: 'auto' },
          headStyles: { fontSize: 13, fillColor: [41, 128, 185], textColor: 255 },
          margin: { left: 8, right: 8 },
          tableWidth: 'wrap',
        });
        doc.save('shift.pdf');
      } catch (error) {
        alert('Failed to generate PDF: ' + error.message);
      }
    } else if (exportModal.type === 'excel') {
      try {
        const worksheetData = [headerRow, ...matrixRows];
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Shifts');
        worksheet['!cols'] = [
          { wch: 20 },
          ...allDates.map(() => ({ wch: 18 }))
        ];
        XLSX.writeFile(workbook, 'shift.xlsx');
      } catch (error) {
        alert('Failed to export to Excel: ' + error.message);
      }
    }
    setExportModal({ show: false, startDate: '', endDate: '', type: '' });
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

  return (
    <div className="page-wrapper" style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <div className="content" style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        {/* Page Header */}
        <div className="page-header">
          <div className="add-item d-flex align-items-center">
            <div className="page-title">
              <h4 className="calendar-title">Shift Calendar</h4>
              <h6 className="calendar-subtitle">Manage Your Shifts</h6>
            </div>
            <Button
              variant="primary"
              className="ms-4"
              style={{ minWidth: 140 }}
              onClick={() => setEmailModal({ show: true, startDate: '', endDate: '', sendToAll: true, selectedUsers: [] })}
            >
              Send Email
            </Button>
          </div>
          <ul className="table-top-head">
            <li>
              <OverlayTrigger placement="top" overlay={renderTooltip}>
                <Link to="#" onClick={() => setExportModal({ show: true, startDate: '', endDate: '', type: 'pdf' })}>
                  <ImageWithBasePath src="assets/img/icons/pdf.svg" alt="img" />
                </Link>
              </OverlayTrigger>
            </li>
            <li>
              <OverlayTrigger placement="top" overlay={renderExcelTooltip}>
                <Link to="#" onClick={() => setExportModal({ show: true, startDate: '', endDate: '', type: 'excel' })}>
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
          <div className="btn-group btn-group-sm" style={{ margin: '0 12px' }}>
            <button
              type="button"
              className={`btn btn-sm ${timeFormat === '12h' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setTimeFormat('12h')}
            >12h</button>
            <button
              type="button"
              className={`btn btn-sm ${timeFormat === '24h' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setTimeFormat('24h')}
            >24h</button>
          </div>
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
                          {formatTime(shift.startTime, timeFormat)} - {formatTime(shift.endTime, timeFormat)} <br />
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
                <TimeInput
                  value={form.startTime}
                  onChange={(val) => setForm(f => ({ ...f, startTime: val }))}
                  timeFormat={timeFormat}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>End Time</Form.Label>
                <TimeInput
                  value={form.endTime}
                  timeFormat={timeFormat}
                  onChange={(val) => {
                    setForm(f => ({ ...f, endTime: val }));
                    if (form.startTime && val <= form.startTime) {
                      setTimeError('End time must be after start time.');
                    } else {
                      setTimeError('');
                    }
                  }}
                />
                {timeError && (
                  <div style={{ color: '#dc3545', fontSize: 13, marginTop: 6 }}>
                    ⚠️ {timeError}
                  </div>
                )}
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
                  {users.map(u => {
                    const dateObj = dayjs(modal.date);
                    const leave = holidays.find(h =>
                      h.userDto?.id === u.id &&
                      h.status === 'Approved' &&
                      dayjs(h.startDate).isSameOrBefore(dateObj, 'day') &&
                      dayjs(h.endDate).isSameOrAfter(dateObj, 'day')
                    );
                    if (leave) {
                      return (
                        <option
                          key={u.id}
                          value={u.id}
                          disabled
                          style={{ backgroundColor: '#EDC001', color: '#3d2e00', fontStyle: 'italic' }}
                        >
                          ⚠ {u.firstName} {u.lastName} (On Leave: {leave.startDate} to {leave.endDate})
                        </option>
                      );
                    } else {
                      return (
                        <option key={u.id} value={u.id}>
                          {u.firstName} {u.lastName}
                        </option>
                      );
                    }
                  })}
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
              <div><Button type="submit" variant="primary" disabled={loading || !!timeError}>{modal.mode === 'add' ? 'Add' : 'Update'}</Button></div>
            </Modal.Footer>
          </Form>
        </Modal>
        {/* Email Modal */}
        <Modal show={emailModal.show} onHide={() => setEmailModal({ show: false, startDate: '', endDate: '', sendToAll: true, selectedUsers: [] })} centered>
          <Modal.Header closeButton>
            <Modal.Title>Send Shift Emails</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={emailModal.startDate}
                  onChange={(e) => setEmailModal(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={emailModal.endDate}
                  onChange={(e) => setEmailModal(prev => ({ ...prev, endDate: e.target.value }))}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Send To</Form.Label>
                <div className="mb-2">
                  <Form.Check
                    type="checkbox"
                    label="All Users"
                    checked={emailModal.sendToAll}
                    onChange={(e) => setEmailModal(prev => ({ ...prev, sendToAll: e.target.checked, selectedUsers: [] }))}
                  />
                </div>
                {!emailModal.sendToAll && (
                  <Select
                    isMulti
                    options={users.map(u => ({ value: u.id, label: `${u.firstName} ${u.lastName}` }))}
                    value={emailModal.selectedUsers}
                    onChange={(selected) => setEmailModal(prev => ({ ...prev, selectedUsers: selected || [] }))}
                    placeholder="Select user(s)..."
                    classNamePrefix="react-select"
                  />
                )}
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setEmailModal({ show: false, startDate: '', endDate: '', sendToAll: true, selectedUsers: [] })}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleEmailSubmit}
              disabled={loading || (!emailModal.sendToAll && emailModal.selectedUsers.length === 0)}
            >
              {loading ? 'Sending...' : 'Send Emails'}
            </Button>
          </Modal.Footer>
        </Modal>
        {/* Export Modal */}
        <Modal show={exportModal.show} onHide={() => setExportModal({ show: false, startDate: '', endDate: '', type: '' })} centered>
          <Modal.Header closeButton>
            <Modal.Title>Export Shifts ({exportModal.type === 'pdf' ? 'PDF' : 'Excel'})</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={exportModal.startDate}
                  onChange={e => setExportModal(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={exportModal.endDate}
                  onChange={e => setExportModal(prev => ({ ...prev, endDate: e.target.value }))}
                  required
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setExportModal({ show: false, startDate: '', endDate: '', type: '' })}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleExport} disabled={!exportModal.startDate || !exportModal.endDate}>
              Export
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default Shift;

