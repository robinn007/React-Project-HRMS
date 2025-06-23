// frontend/src/components/dashboard/LeavesPage.jsx
import  React,{ useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth';
import * as apiService from '../../services/candidateService';
import styles from './CandidatesPage/CandidatesPage.module.css';
import { ChevronDown, Search, Plus, X, ChevronLeft, ChevronRight, Calendar, Download } from 'lucide-react';
import PropTypes from 'prop-types';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: '#ef4444', textAlign: 'center' }}>
          <h3>Something went wrong in the Leave Calendar.</h3>
          <p>{this.state.error?.message || 'Please try again later.'}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

// Leave status options
const LEAVE_STATUS_OPTIONS = [
  { value: 'All', label: 'All' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' },
];

// Leave type options
const LEAVE_TYPE_OPTIONS = [
  { value: 'Sick Leave', label: 'Sick Leave' },
  { value: 'Casual Leave', label: 'Casual Leave' },
  { value: 'Annual Leave', label: 'Annual Leave' },
  { value: 'Maternity Leave', label: 'Maternity Leave' },
  { value: 'Paternity Leave', label: 'Paternity Leave' },
  { value: 'Emergency Leave', label: 'Emergency Leave' },
];

/**
 * Function to get color style based on leave status
 */
const getStatusStyle = (status) => {
  switch (status) {
    case 'Approved':
      return {
        color: '#22c55e',
        backgroundColor: '#dcfce7',
      };
    case 'Pending':
      return {
        color: '#f59e0b',
        backgroundColor: '#fef3c7',
      };
    case 'Rejected':
      return {
        color: '#ef4444',
        backgroundColor: '#fee2e2',
      };
    default:
      return {
        color: '#6b7280',
        backgroundColor: '#f3f4f6',
      };
  }
};

/**
 * Dropdown component for selecting options
 */
const Dropdown = ({
  options,
  selectedValue,
  onSelect,
  triggerLabel,
  className,
  triggerClassName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((option) => option.value === selectedValue);

  return (
    <div className={`${styles.customDropdown} ${className}`} ref={dropdownRef}>
      <button
        className={`${styles.dropdownTrigger} ${triggerClassName}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        style={{
          ...(selectedValue !== 'All' ? getStatusStyle(selectedValue) : {}),
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minWidth: '100px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          border: '1px solid #e5e7eb',
        }}
      >
        <span className={styles.dropdownText}>
          {selectedOption?.label || triggerLabel}
        </span>
        <ChevronDown
          className={`${styles.dropdownIcon} ${isOpen ? styles.rotated : ''}`}
          size={16}
          style={{ marginLeft: '8px' }}
        />
      </button>
      {isOpen && (
        <div
          className={styles.dropdownMenuCustom}
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            padding: '4px',
            marginTop: '4px',
            minWidth: '120px',
            zIndex: 1000,
          }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              className={`${styles.dropdownItemCustom} ${
                selectedValue === option.value ? styles.selected : ''
              }`}
              onClick={() => {
                onSelect(option.value);
                setIsOpen(false);
              }}
              aria-label={option.label}
              style={{
                ...(option.value !== 'All' ? getStatusStyle(option.value) : {}),
                padding: '8px 12px',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '500',
                width: '100%',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginBottom: '2px',
                opacity: selectedValue === option.value ? '1' : '0.8',
              }}
              onMouseEnter={(e) => {
                e.target.style.opacity = '1';
                e.target.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = selectedValue === option.value ? '1' : '0.8';
                e.target.style.transform = 'scale(1)';
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

Dropdown.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectedValue: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
  triggerLabel: PropTypes.string.isRequired,
  className: PropTypes.string,
  triggerClassName: PropTypes.string,
};

/**
 * Add Leave Modal Component
 */
const AddLeaveModal = ({ isOpen, onClose, onSubmit, employees }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    leaveType: 'Sick Leave',
    startDate: '',
    endDate: '',
    reason: '',
    document: null,
  });

  // Calculate tomorrow's date for min attribute
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const minStartDate = tomorrow.toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employeeId || !formData.startDate || !formData.endDate || !formData.reason.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast.error('End date cannot be before start date');
      return;
    }
    if (new Date(formData.startDate) < tomorrow) {
      toast.error('Leave can only start from tomorrow or later');
      return;
    }

    const form = new FormData();
    form.append('employeeId', formData.employeeId);
    form.append('leaveType', formData.leaveType);
    form.append('startDate', formData.startDate);
    form.append('endDate', formData.endDate);
    form.append('reason', formData.reason);
    if (formData.document) {
      form.append('document', formData.document);
    }

    try {
      await onSubmit(form);
      setFormData({
        einsuranceId: '',
        leaveType: 'Sick Leave',
        startDate: '',
        endDate: '',
        reason: '',
        document: null,
      });
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to submit leave request');
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          width: '90%',
          maxWidth: '500px',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
          }}
        >
          <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>
            Add Leave Request
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Employee
            </label>
            <select
              value={formData.employeeId}
              onChange={(e) => handleChange('employeeId', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
              }}
              required
            >
              <option value="">Select Employee</option>
              {employees.map((employee) => (
                <option key={employee._id} value={employee._id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Leave Type
            </label>
            <Dropdown
              options={LEAVE_TYPE_OPTIONS}
              selectedValue={formData.leaveType}
              onSelect={(value) => handleChange('leaveType', value)}
              triggerLabel="Select Leave Type"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Start Date
            </label>
            <input
              type="date"
              value={formData.startDate}
              min={minStartDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              End Date
            </label>
            <input
              type="date"
              value={formData.endDate}
              min={formData.startDate || minStartDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Reason
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
              placeholder="Please provide reason for leave..."
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                minHeight: '100px',
                resize: 'vertical',
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Document (Optional, PDF/DOC/DOCX)
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleChange('document', e.target.files[0])}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 24px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '12px 24px',
                backgroundColor: '#7c3aed',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

AddLeaveModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  employees: PropTypes.array.isRequired,
};

/**
 * Calendar Component
 */
const LeaveCalendar = ({ leaves }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredDay, setHoveredDay] = useState(null); // State for tooltip visibility

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const isLeaveDay = (day) => {
    if (!day) return [];
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return leaves
      .filter(
        (leave) =>
          leave.status === 'Approved' &&
          leave.employeeId &&
          typeof leave.employeeId === 'object' &&
          leave.employeeId.name &&
          leave.startDate &&
          leave.endDate &&
          dateStr >= (leave.startDate.split('T')[0] || '') &&
          dateStr <= (leave.endDate.split('T')[0] || '')
      )
      .map((leave) => ({
        employeeName: leave.employeeId.name || 'Unknown',
        leaveType: leave.leaveType || 'Unknown',
      }));
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid #e5e7eb',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
          Leave Calendar
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigateMonth(-1)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <span
            style={{
              fontSize: '16px',
              fontWeight: '500',
              minWidth: '140px',
              textAlign: 'center',
            }}
          >
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button
            onClick={() => navigateMonth(1)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '8px',
          marginBottom: '8px',
        }}
      >
        {daysOfWeek.map((day) => (
          <div
            key={day}
            style={{
              textAlign: 'center',
              fontSize: '12px',
              fontWeight: '600',
              color: '#6b7280',
              padding: '8px',
            }}
          >
            {day}
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '4px',
        }}
      >
        {days.map((day, index) => {
          const leaveDetails = day ? isLeaveDay(day) : [];
          return (
            <div
              key={index}
              style={{
                textAlign: 'center',
                padding: '8px',
                fontSize: '14px',
                borderRadius: '6px',
                backgroundColor: leaveDetails.length > 0 ? '#7c3aed' : 'transparent',
                color: leaveDetails.length > 0 ? 'white' : day ? '#374151' : 'transparent',
                fontWeight: leaveDetails.length > 0 ? '600' : 'normal',
                minHeight: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
              onMouseEnter={() => day && setHoveredDay(index)}
              onMouseLeave={() => setHoveredDay(null)}
            >
              {day}
              {leaveDetails.length > 0 && hoveredDay === index && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    padding: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    zIndex: 10,
                    minWidth: '200px',
                  }}
                >
                  {leaveDetails.map((detail, idx) => (
                    <div key={idx} style={{ fontSize: '12px', marginBottom: '4px' }}>
                      {detail.employeeName} ({detail.leaveType})
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '16px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
          Approved Leaves
        </h4>
        {leaves.filter(
          (leave) =>
            leave.status === 'Approved' &&
            leave.startDate &&
            leave.endDate &&
            new Date(leave.startDate).getMonth() === currentDate.getMonth() &&
            new Date(leave.startDate).getFullYear() === currentDate.getFullYear()
        ).length > 0 ? (
          leaves
            .filter(
              (leave) =>
                leave.status === 'Approved' &&
                leave.startDate &&
                leave.endDate &&
                new Date(leave.startDate).getMonth() === currentDate.getMonth() &&
                new Date(leave.startDate).getFullYear() === currentDate.getFullYear()
            )
            .map((leave) => (
              <div
                key={leave._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 0',
                  borderBottom: '1px solid #f3f4f6',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}
                >
                  {leave.employeeId && leave.employeeId.name
                    ? leave.employeeId.name.charAt(0)
                    : 'U'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '500' }}>
                    {leave.employeeId && leave.employeeId.name
                      ? leave.employeeId.name
                      : 'Unknown Employee'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {leave.employeeId && leave.employeeId.position
                      ? leave.employeeId.position
                      : 'No Position'}
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'right' }}>
                  {(leave.startDate && new Date(leave.startDate).toLocaleDateString('en-GB')) || 'N/A'} -{' '}
                  {(leave.endDate && new Date(leave.endDate).toLocaleDateString('en-GB')) || 'N/A'}
                </div>
              </div>
            ))
        ) : (
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            No approved leaves this month
          </div>
        )}
      </div>
    </div>
  );
};

LeaveCalendar.propTypes = {
  leaves: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      employeeId: PropTypes.shape({
        _id: PropTypes.string,
        name: PropTypes.string,
        position: PropTypes.string,
      }),
      startDate: PropTypes.string,
      endDate: PropTypes.string,
      leaveType: PropTypes.string,
      status: PropTypes.oneOf(['Pending', 'Approved', 'Rejected']),
      reason: PropTypes.string,
      document: PropTypes.string,
    })
  ).isRequired,
};

/**
 * LeavesPage component for managing employee leaves
 */
const LeavesPage = () => {
  const { user, loading: authLoading, token } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isAddLeaveModalOpen, setIsAddLeaveModalOpen] = useState(false);

  const fetchLeavesAndEmployees = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      let userId = user?._id;
      if (!userId && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          userId = parsedUser?._id || parsedUser?.id;
        } catch (error) {
          console.error('Error parsing stored user:', error);
        }
      }

      const authToken = token || storedToken;
      if (!authToken || !userId) {
        throw new Error('Authentication required. Please log in again.');
      }

      const params = {
        search: searchTerm || undefined,
        status: statusFilter === 'All' ? undefined : statusFilter,
        userId,
      };

      const [leaveData, employeeData] = await Promise.all([
        apiService.getLeaves(params),
        apiService.getEmployees({ userId }),
      ]);

      // Normalize leave data to ensure employeeId is valid
      const normalizedLeaves = leaveData.filter((leave) => {
        if (!leave.employeeId || typeof leave.employeeId !== 'object' || !leave.employeeId.name) {
          console.warn('Invalid leave data filtered out:', leave);
          return false;
        }
        return true;
      });

      setLeaves(normalizedLeaves);
      setEmployees(employeeData);

      if (normalizedLeaves.length === 0) {
        setErrorMessage('No valid leaves found.');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch leaves or employees.';
      setErrorMessage(message);
      toast.error(message);
      setLeaves([]);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && (user?._id || localStorage.getItem('user'))) {
      fetchLeavesAndEmployees();
    } else if (!authLoading) {
      setErrorMessage('Please log in to view leaves.');
    }
  }, [authLoading, user, searchTerm, statusFilter]);

  const handleAddLeave = async (formData) => {
    try {
      const response = await apiService.createLeave(formData);
      setLeaves((prev) => [response.data, ...prev]);
      toast.success('Leave request submitted successfully');
    } catch (error) {
      throw error; // Handled in AddLeaveModal
    }
  };

  const handleStatusChange = async (leaveId, newStatus) => {
    try {
      const response = await apiService.updateLeaveStatus(leaveId, newStatus);
      setLeaves((prev) =>
        prev.map((leave) =>
          leave._id === leaveId ? { ...leave, status: newStatus } : leave
        )
      );
      toast.success(`Leave status updated to ${newStatus}`);
    } catch (error) {
      toast.error(error.message || 'Failed to update leave status');
    }
  };

  const handleDownloadDocument = async (leaveId) => {
    try {
      const response = await apiService.downloadLeaveDocument(leaveId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leave-document-${leaveId}.${response.data.type.split('/')[1]}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Document downloaded successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to download document');
    }
  };

  return (
    <div className={styles.mainContent}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Leaves</h1>
        </div>
        <button
          onClick={() => setIsAddLeaveModalOpen(true)}
          style={{
            backgroundColor: '#7c3aed',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Plus size={16} />
          Add Leave
        </button>
      </div>

      <div style={{ display: 'flex', gap: '24px', height: 'calc(100vh - 120px)' }}>
        {/* Left Panel - Applied Leaves */}
        <div style={{ flex: '2', display: 'flex', flexDirection: 'column' }}>
          <div className={styles.filtersSection}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Dropdown
                options={LEAVE_STATUS_OPTIONS}
                selectedValue={statusFilter}
                onSelect={setStatusFilter}
                triggerLabel="Status"
              />
              <div className={styles.searchContainer}>
                <Search className={styles.searchIcon} size={16} />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                  aria-label="Search leaves"
                />
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#7c3aed',
              color: 'white',
              padding: '16px 20px',
              borderRadius: '12px 12px 0 0',
              fontSize: '16px',
              fontWeight: '600',
            }}
          >
            Applied Leaves
          </div>

          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '0 0 12px 12px',
              borderTop: 'none',
              flex: 1,
              overflow: 'auto',
            }}
          >
            {authLoading ? (
              <div className={styles.loading}>Loading authentication...</div>
            ) : loading ? (
              <div className={styles.loading}>Loading leaves...</div>
            ) : errorMessage ? (
              <div className={styles.errorMessage}>{errorMessage}</div>
            ) : (
              <div className={styles.tableContainer} style={{ borderRadius: '0px' }}>
                <table className={styles.candidatesTable} style={{ margin: 0 }}>
                  <thead>
                    <tr className={styles.tableHeader} style={{ backgroundColor: '#7c3aed' }}>
                      <th style={{ color: 'white', padding: '12px 16px' }}>Profile</th>
                      <th style={{ color: 'white', padding: '12px 16px' }}>Name</th>
                      <th style={{ color: 'white', padding: '12px 16px' }}>Date</th>
                      <th style={{ color: 'white', padding: '12px 16px' }}>Reason</th>
                      <th style={{ color: 'white', padding: '12px 16px' }}>Type</th>
                      <th style={{ color: 'white', padding: '12px 16px' }}>Status</th>
                      <th style={{ color: 'white', padding: '12px 16px' }}>Docs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.length > 0 ? (
                      leaves.map((leave) => (
                        <tr key={leave._id} className={styles.tableRow}>
                          <td style={{ padding: '12px 16px' }}>
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: '#e5e7eb',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: '600',
                              }}
                            >
                              {leave.employeeId && leave.employeeId.name
                                ? leave.employeeId.name.charAt(0)
                                : 'U'}
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div>
                              <div style={{ fontWeight: '500' }}>
                                {leave.employeeId && leave.employeeId.name
                                  ? leave.employeeId.name
                                  : 'Unknown Employee'}
                              </div>
                              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                {leave.employeeId && leave.employeeId.position
                                  ? leave.employeeId.position
                                  : 'No Position'}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            {(leave.startDate && new Date(leave.startDate).toLocaleDateString('en-GB')) || 'N/A'} -{' '}
                            {(leave.endDate && new Date(leave.endDate).toLocaleDateString('en-GB')) || 'N/A'}
                          </td>
                          <td style={{ padding: '12px 16px' }}>{leave.reason || 'No Reason'}</td>
                          <td style={{ padding: '12px 16px' }}>{leave.leaveType || 'Unknown'}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <Dropdown
                              options={LEAVE_STATUS_OPTIONS.filter((opt) => opt.value !== 'All')}
                              selectedValue={leave.status}
                              onSelect={(status) => handleStatusChange(leave._id, status)}
                              triggerLabel="Select Status"
                              triggerClassName={styles.statusDropdown}
                            />
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            {leave.document ? (
                              <button
                                onClick={() => handleDownloadDocument(leave._id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#7c3aed',
                                  cursor: 'pointer',
                                  textDecoration: 'underline',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <Download size={16} />
                                Download
                              </button>
                            ) : (
                              <span style={{ color: '#6b7280' }}>-</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className={styles.noData}>
                          No leaves found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Leave Calendar */}
        <div style={{ flex: '1' }}>
          <ErrorBoundary>
            <LeaveCalendar leaves={leaves} />
          </ErrorBoundary>
        </div>
      </div>

      <AddLeaveModal
        isOpen={isAddLeaveModalOpen}
        onClose={() => setIsAddLeaveModalOpen(false)}
        onSubmit={handleAddLeave}
        employees={employees}
      />
    </div>
  );
};

export default LeavesPage;