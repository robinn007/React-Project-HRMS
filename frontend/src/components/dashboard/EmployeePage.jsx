// frontend/src/components/dashboard/EmployeePage.jsx
import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth';
import * as apiService from '../../services/candidateService';
import styles from './CandidatesPage/CandidatesPage.module.css';
import { STATUS_COLORS, STATUS_OPTIONS } from './CandidatesPage/constants';
import { ChevronDown, Search, MoreHorizontal, Trash2, SquarePen } from 'lucide-react';
import PropTypes from 'prop-types';
import EditEmployeeModal from './EditEmployeeModal';
import Header from './CandidatesPage/Header.jsx';

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

  return (
    <div className={`${styles.customDropdown} ${className}`} ref={dropdownRef}>
      <button
        className={`${styles.dropdownTrigger} ${triggerClassName}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className={styles.dropdownText}>
          {options.find((option) => option.value === selectedValue)?.label || triggerLabel}
        </span>
        <ChevronDown
          className={`${styles.dropdownIcon} ${isOpen ? styles.rotated : ''}`}
          size={16}
        />
      </button>
      {isOpen && (
        <div className={styles.dropdownMenuCustom}>
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
 * EmployeePage component for managing employee data
 * @component
 */
const EmployeePage = () => {
  const { user, loading: authLoading, token } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [showDropdown, setShowDropdown] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const departmentOptions = [
    { value: 'all', label: 'All Departments' },
    { value: 'Development', label: 'Development' },
    { value: 'Human Resources', label: 'Human Resources' },
    { value: 'Design', label: 'Design' },
    { value: 'Product Management', label: 'Product Management' },
  ];

  const fetchEmployees = async () => {
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
        status: statusFilter === 'all' ? undefined : statusFilter,
        department: departmentFilter === 'all' ? undefined : departmentFilter,
        userId,
      };

      const data = await apiService.getEmployees(params);
      setEmployees(data);
      if (data.length === 0) {
        setErrorMessage('No employees found. Try adjusting filters.');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch employees.';
      setErrorMessage(message);
      toast.error(message);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && (user?._id || localStorage.getItem('user'))) {
      fetchEmployees();
    } else if (!authLoading) {
      setErrorMessage('Please log in to view employees.');
    }
  }, [authLoading, user, searchTerm, statusFilter, departmentFilter]);

  const handleDeleteEmployee = async (employeeId) => {
    try {
      await apiService.deleteEmployee(employeeId);
      setEmployees((prev) => prev.filter((employee) => employee._id !== employeeId));
      toast.success('Employee deleted successfully');
      setShowDropdown(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete employee');
    }
  };

  const handleEditEmployee = (employeeId) => {
    const employee = employees.find((emp) => emp._id === employeeId);
    if (employee) {
      setSelectedEmployee(employee);
      setShowEditModal(true);
      setShowDropdown(null);
    }
  };

  const handleUpdateEmployee = async (employeeData) => {
    try {
      const response = await apiService.updateEmployee(selectedEmployee._id, employeeData);
      setEmployees((prev) =>
        prev.map((employee) =>
          employee._id === selectedEmployee._id
            ? { ...employee, ...response.data }
            : employee
        )
      );
      setShowEditModal(false);
      setSelectedEmployee(null);
    } catch (error) {
      toast.error(error.message || 'Failed to update employee');
    }
  };

  return (
    <>
    <div className={styles.mainContent}>
        <Header title= "Employess" />
      <div className={styles.contentArea}>
        <div className={styles.filtersSection}>
          <div className={styles.filtersLeft}>
            <Dropdown
              options={STATUS_OPTIONS}
              selectedValue={statusFilter}
              onSelect={setStatusFilter}
              triggerLabel='All Statuses'
              triggerClassName={styles.statusDropdown}
            />
            <Dropdown
              options={departmentOptions}
              selectedValue={departmentFilter}
              onSelect={setDepartmentFilter}
              triggerLabel='All Departments'
              triggerClassName={styles.positionDropdown}
            />
          </div>
          <div className={styles.filtersRight}>
            <div className={styles.searchContainer}>
              <Search className={styles.searchIcon} size={16} />
              <input
                type='text'
                placeholder='Search'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
                aria-label='Search employees'
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
                  <th>Email Address</th>
                  <th>Phone Number</th>
                  <th>Position</th>
                  <th>Department</th>
                   <th>Date of Joining</th>
                  {/* <th>Employment Type</th> 
                  <th>Tasks</th> */}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {employees.length > 0 ? (
                  employees.map((employee, index) => (
                    <tr key={employee._id} className={styles.tableRow}>
                      <td>{index + 1}</td>
                      <td className={styles.nameCell}>{employee.name}</td>
                      <td>{employee.email}</td>
                      <td>{employee.phone}</td>
                      <td>{employee.position}</td>
                      <td>{employee.department}</td>
                      <td>
                        {(() => {
                          const date = new Date(employee.joiningDate);
                          const day = date.getDate();
                          const month = date.getMonth() + 1;
                          const year = date.getFullYear();
                          return `${day}/${month}/${year}`;
                        })()}
                      </td>
                      {/* <td>{employee.employmentType}</td>
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
                          : 'None'}
                      </td> */}
                      <td>
                        <div className={styles.actionCell}>
                          <button
                            className={styles.actionBtn}
                            onClick={() =>
                              setShowDropdown((prev) =>
                                prev === employee._id ? null : employee._id
                              )
                            }
                            aria-label='More actions'
                          >
                            <MoreHorizontal size={16} />
                          </button>
                          {showDropdown === employee._id && (
                            <div className={styles.dropdownMenu}>
                              <button
                                className={styles.dropdownItem}
                                onClick={() => handleEditEmployee(employee._id)}
                                aria-label='Edit employee'
                              >
                                <SquarePen size={14} />
                                Edit
                              </button>
                              <button
                                className={`${styles.dropdownItem} ${styles.delete}`}
                                onClick={() => handleDeleteEmployee(employee._id)}
                                aria-label='Delete employee'
                              >
                                <Trash2 size={14} />
                                Delete Employee
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan='10' className={styles.noData}>
                      No employees found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <EditEmployeeModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedEmployee(null);
          }}
          onSubmit={handleUpdateEmployee}
          employeeData={selectedEmployee}
        />
      </div>
    </div>
    </>
  );
};

export default EmployeePage;