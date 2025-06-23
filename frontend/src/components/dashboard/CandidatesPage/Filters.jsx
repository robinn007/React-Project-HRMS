// frontend/src/components/dashboard/CandidatesPage/Filters.jsx
import { Search, Plus } from 'lucide-react';
import PropTypes from 'prop-types';
import Dropdown from './Dropdown';
import { STATUS_OPTIONS, POSITION_OPTIONS } from './constants';
import styles from './CandidatesPage.module.css';

/**
 * Filters component for candidate filtering and searching
 * @component
 */
const Filters = ({ statusFilter, setStatusFilter, positionFilter, setPositionFilter, searchTerm, setSearchTerm, setShowAddModal }) => (
  <div className={styles.filtersSection}>
    <div className={styles.filtersLeft}>
      <Dropdown
        options={STATUS_OPTIONS}
        selectedValue={statusFilter}
        onSelect={setStatusFilter}
        triggerLabel="All Statuses"
        triggerClassName={styles.statusDropdown}
      />
      <Dropdown
        options={POSITION_OPTIONS}
        selectedValue={positionFilter}
        onSelect={setPositionFilter}
        triggerLabel="All Positions"
        triggerClassName={styles.positionDropdown}
      />
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
          aria-label="Search candidates"
        />
      </div>
      <button
        className={styles.addBtn}
        onClick={() => setShowAddModal(true)}
        aria-label="Add new candidate"
      >
        <Plus size={16} />
        Add Candidate
      </button>
    </div>
  </div>
);

Filters.propTypes = {
  statusFilter: PropTypes.string.isRequired,
  setStatusFilter: PropTypes.func.isRequired,
  positionFilter: PropTypes.string.isRequired,
  setPositionFilter: PropTypes.func.isRequired,
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
  setShowAddModal: PropTypes.func.isRequired,
};

export default Filters;