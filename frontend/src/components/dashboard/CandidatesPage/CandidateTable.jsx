// frontend/src/components/dashboard/CandidatesPage/CandidateTable.jsx
import { MoreHorizontal, Download, UserPlus, Trash2 } from 'lucide-react';
import PropTypes from 'prop-types';
import StatusDropdown from './StatusDropdown';
import styles from './CandidatesPage.module.css';

/**
 * CandidateTable component for displaying candidate data
 * @component
 */
const CandidateTable = ({ candidates, showDropdown, setShowDropdown, handleDeleteCandidate, handleDownloadResume, handleStatusUpdate, handleCreateEmployee }) => (
  <div className={styles.tableContainer}>
    <table className={styles.candidatesTable}>
      <thead>
        <tr className={styles.tableHeader}>
          <th>Sr No.</th>
          <th>Candidates Name</th>
          <th>Email Address</th>
          <th>Phone Number</th>
          <th>Position</th>
          <th>Status</th>
          <th>Experience</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {candidates.length > 0 ? (
          candidates.map((candidate, index) => (
            <tr key={candidate._id} className={styles.tableRow}>
              <td>{index + 1}</td>
              <td className={styles.nameCell}>{candidate.name}</td>
              <td>{candidate.email}</td>
              <td>{candidate.phone}</td>
              <td>{candidate.position}</td>
              <td>
                <StatusDropdown
                  candidateId={candidate._id}
                  currentStatus={candidate.status}
                  onStatusUpdate={handleStatusUpdate}
                  onCreateEmployee={handleCreateEmployee}
                />
              </td>
              <td>{candidate.experience}</td>
              <td>
                <div className={styles.actionCell}>
                  <button
                    className={styles.actionBtn}
                    onClick={() =>
                      setShowDropdown((prev) =>
                        prev === candidate._id ? null : candidate._id
                      )
                    }
                    aria-label="More actions"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                  {showDropdown === candidate._id && (
                    <div className={styles.dropdownMenu}>
                      <button
                        className={styles.dropdownItem}
                        onClick={() =>
                          handleDownloadResume(candidate._id, candidate.name)
                        }
                        disabled={!candidate.resume}
                        aria-label="Download resume"
                      >
                        <Download size={14} />
                        Download Resume
                      </button>
                      {candidate.status === 'Selected' && (
                        <button
                          className={styles.dropdownItem}
                          onClick={() => handleCreateEmployee(candidate._id)}
                          aria-label="Create employee"
                        >
                          <UserPlus size={14} />
                          Create Employee
                        </button>
                      )}
                      <button
                        className={`${styles.dropdownItem} ${styles.delete}`}
                        onClick={() => handleDeleteCandidate(candidate._id)}
                        aria-label="Delete candidate"
                      >
                        <Trash2 size={14} />
                        Delete Candidate
                      </button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="8" className={styles.noData}>
              No candidates found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

CandidateTable.propTypes = {
  candidates: PropTypes.arrayOf(PropTypes.object).isRequired,
  showDropdown: PropTypes.string,
  setShowDropdown: PropTypes.func.isRequired,
  handleDeleteCandidate: PropTypes.func.isRequired,
  handleDownloadResume: PropTypes.func.isRequired,
  handleStatusUpdate: PropTypes.func.isRequired,
  handleCreateEmployee: PropTypes.func.isRequired,
};

export default CandidateTable;