// frontend/src/components/dashboard/CandidatesPage/StatusDropdown.jsx
import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import PropTypes from 'prop-types';
import { STATUS_COLORS, STATUS_OPTIONS } from './constants';
import styles from './CandidatesPage.module.css';

/**
 * StatusDropdown component for updating candidate status
 * @component
 */
const StatusDropdown = ({ candidateId, currentStatus, onStatusUpdate, onCreateEmployee }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const inlineStatusOptions = STATUS_OPTIONS.filter((option) => option.value !== 'all');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStatusChange = (newStatus) => {
    if (newStatus === 'Selected' && currentStatus !== 'Selected') {
      if (window.confirm('This candidate will be converted to an employee. Do you want to proceed?')) {
        onCreateEmployee(candidateId);
      }
    } else {
      onStatusUpdate(candidateId, newStatus);
    }
    setIsOpen(false);
  };

  return (
    <div className={styles.inlineStatusDropdown} ref={dropdownRef}>
      <button
        className={styles.statusDropdownTrigger}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          color: STATUS_COLORS[currentStatus?.toLowerCase()]?.color,
          backgroundColor: STATUS_COLORS[currentStatus?.toLowerCase()]?.background,
          border: `1px solid ${STATUS_COLORS[currentStatus?.toLowerCase()]?.color}`,
        }}
        aria-expanded={isOpen}
      >
        <span>{currentStatus}</span>
        <ChevronDown size={12} />
      </button>
      {isOpen && (
        <div className={styles.inlineDropdownMenu}>
          {inlineStatusOptions.map((option) => (
            <button
              key={option.value}
              className={`${styles.inlineDropdownItem} ${currentStatus === option.value ? styles.selected : ''}`}
              onClick={() => handleStatusChange(option.value)}
              style={{
                backgroundColor: currentStatus === option.value ? STATUS_COLORS[option.value.toLowerCase()]?.background : 'transparent',
                color: STATUS_COLORS[option.value.toLowerCase()]?.color,
              }}
              aria-label={`Change status to ${option.label}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

StatusDropdown.propTypes = {
  candidateId: PropTypes.string.isRequired,
  currentStatus: PropTypes.string.isRequired,
  onStatusUpdate: PropTypes.func.isRequired,
  onCreateEmployee: PropTypes.func.isRequired,
};

export default StatusDropdown;