// frontend/src/components/dashboard/AttendancePage.jsx
import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth';
import * as apiService from '../../services/candidateService';
import styles from './CandidatesPage/CandidatesPage.module.css';
import { ChevronDown, Search } from 'lucide-react';
import PropTypes from 'prop-types';

// Attendance status options
const ATTENDANCE_STATUS_OPTIONS = [
   { value: 'All', label: 'All' },
  { value: 'Present', label: 'Present' },
  { value: 'Absent', label: 'Absent' },
];

/**
 * Function to get color style based on attendance status
 * @param {string} status - The attendance status
 * @returns {object} Style object with color and background
 */
const getStatusStyle = (status) => {
  switch (status) {
    case 'Present':
      return {
        color: '#22c55e',
        backgroundColor: '#f0fdf4',
      }; // Green color with light green background
    case 'Absent':
      return {
        color: '#ef4444',
        backgroundColor: '#fef2f2',
      }; // Red color with light red background
    default:
      return {
        color: '#6b7280',
        backgroundColor: '#f9fafb',
      }; // Gray color for default
  }
};

/**
 * Function to get status badge style
 * @param {string} status - The attendance status
 * @returns {object} Style object for status badge
 */
const getStatusBadgeStyle = (status) => {
  switch (status) {
    case 'Present':
      return {
        color: '#22c55e',
        backgroundColor: '#dcfce7',
      };
    case 'Absent':
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
 * @component
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
          ...getStatusBadgeStyle(selectedValue),
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
                ...getStatusBadgeStyle(option.value),
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
 * AttendancePage component for displaying employee attendance
 * @component
 */
const AttendancePage = () => {
  const { user, loading: authLoading, token } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const fetchEmployeesAndAttendance = async () => {
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

      // Fetch employees
      const employeeParams = {
        search: searchTerm || undefined,
        userId,
      };
      const employeeData = await apiService.getEmployees(employeeParams);

      // Fetch attendance for the selected date
      const attendanceParams = {
        date: selectedDate,
        userId,
      };
      const attendanceData = await apiService.getAttendance(attendanceParams);

      // Map attendance to employees
      const attendanceMap = attendanceData.reduce((acc, record) => ({
        ...acc,
        [record.employeeId._id]: record.status,
      }), {});

      // Combine employee data with attendance status
      const combinedData = employeeData.map((employee) => ({
        ...employee,
        attendanceStatus: attendanceMap[employee._id] || 'Present', // Default to Present if no record
      }));

      setEmployees(combinedData);
      setAttendance(attendanceMap);

      if (employeeData.length === 0) {
        setErrorMessage('No employees found.');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch employees or attendance.';
      setErrorMessage(message);
      toast.error(message);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && (user?._id || localStorage.getItem('user'))) {
      fetchEmployeesAndAttendance();
    } else if (!authLoading) {
      setErrorMessage('Please log in to view attendance.');
    }
  }, [authLoading, user, searchTerm, selectedDate]);

  const handleAttendanceChange = async (employeeId, status) => {
    try {
      await apiService.updateAttendance({
        employeeId,
        date: selectedDate,
        status,
      });
      setAttendance((prev) => ({
        ...prev,
        [employeeId]: status,
      }));
      setEmployees((prev) =>
        prev.map((employee) =>
          employee._id === employeeId
            ? { ...employee, attendanceStatus: status }
            : employee
        )
      );
      toast.success(`Attendance updated for employee ID ${employeeId}`);
    } catch (error) {
      toast.error(error.message || 'Failed to update attendance');
    }
  };

  return (
    <div className={styles.mainContent}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Attendance</h1>
        </div>
      </div>
      <div className={styles.contentArea}>
        <div className={styles.filtersSection}>
          <div className={styles.filtersLeft}>
            <div className={styles.formGroup}>
              <label htmlFor="selectedDate">Select Date</label>
              <input
                type="date"
                id="selectedDate"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>
          <div className={styles.filtersRight}>
            <div className={styles.searchContainer}>
              <Search className={styles.searchIcon} size={16} />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
                aria-label="Search employees"
              />
            </div>
          </div>
        </div>
        {authLoading ? (
          <div className={styles.loading}>Loading authentication...</div>
        ) : loading ? (
          <div className={styles.loading}>Loading employees...</div>
        ) : errorMessage ? (
          <div className={styles.errorMessage}>{errorMessage}</div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.candidatesTable}>
              <thead>
                <tr className={styles.tableHeader}>
                  <th>Sr No.</th>
                  <th>Employee Name</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Tasks</th>
                  <th>Attendance Status</th>
                </tr>
              </thead>
              <tbody>
                {employees.length > 0 ? (
                  employees.map((employee, index) => (
                    <tr key={employee._id} className={styles.tableRow}>
                      <td>{index + 1}</td>
                      <td className={styles.nameCell}>{employee.name}</td>
                      <td>{employee.department}</td>
                      <td>{employee.position}</td>
                      <td>
                        {employee.tasks?.length
                          ? employee.tasks
                              .map(
                                (task) =>
                                  `${task.description} (Due: ${new Date(
                                    task.dueDate
                                  ).toLocaleDateString()})`
                              )
                              .join(', ')
                          : 'No tasks assigned'}
                      </td>
                      <td>
                        <Dropdown
                          options={ATTENDANCE_STATUS_OPTIONS}
                          selectedValue={employee.attendanceStatus || 'Present'}
                          onSelect={(status) => handleAttendanceChange(employee._id, status)}
                          triggerLabel="Select Status"
                          triggerClassName={styles.statusDropdown}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className={styles.noData}>
                      No employees found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;