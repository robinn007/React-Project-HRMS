// frontend/src/components/dashboard/CandidatesPage/Dropdown.jsx
import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import PropTypes from 'prop-types';
import styles from './CandidatesPage.module.css';

/**
 * Dropdown component for selecting options from a list
 * @component
 */
const Dropdown = ({ options, selectedValue, onSelect, triggerLabel, className, triggerClassName }) => {
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
        <ChevronDown className={`${styles.dropdownIcon} ${isOpen ? styles.rotated : ''}`} size={16} />
      </button>
      {isOpen && (
        <div className={styles.dropdownMenuCustom}>
          {options.map((option) => (
            <button
              key={option.value}
              className={`${styles.dropdownItemCustom} ${selectedValue === option.value ? styles.selected : ''}`}
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
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })).isRequired,
  selectedValue: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
  triggerLabel: PropTypes.string.isRequired,
  className: PropTypes.string,
  triggerClassName: PropTypes.string,
};

export default Dropdown;