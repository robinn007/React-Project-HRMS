// frontend/src/components/dashboard/CandidatesPage/CandidatesPage.jsx
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import useAuth from '../../../hooks/useAuth';
import * as apiService from '../../../services/candidateService';
import Header from './Header';
import Filters from './Filters';
import CandidateTable from './CandidateTable';
import AddCandidateModal from './AddCandidateModal';
import CreateEmployeeModal from './CreateEmployeeModal';
import styles from './CandidatesPage.module.css';

/**
 * Main CandidatesPage component for managing candidate data
 * @component
 */
const CandidatesPage = () => {
  const { user, loading: authLoading, token } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchCandidates = async () => {
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
        position: positionFilter === 'all' ? undefined : positionFilter,
        userId,
      };

      const data = await apiService.getCandidates(params);
      setCandidates(data);
      if (data.length === 0) {
        setErrorMessage('No candidates found. Try adding a new candidate or adjust filters.');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch candidates.';
      setErrorMessage(message);
      toast.error(message);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && (user?._id || localStorage.getItem('user'))) {
      fetchCandidates();
    } else if (!authLoading) {
      setErrorMessage('Please log in to view candidates.');
    }
  }, [authLoading, user, searchTerm, statusFilter, positionFilter]);

  const handleDeleteCandidate = async (candidateId) => {
    try {
      await apiService.deleteCandidate(candidateId);
      setCandidates((prev) => prev.filter((candidate) => candidate._id !== candidateId));
      toast.success('Candidate deleted successfully');
      setShowDropdown(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete candidate');
    }
  };

  const handleDownloadResume = async (candidateId, candidateName) => {
    try {
      const response = await apiService.downloadResume(candidateId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${candidateName}-resume.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setShowDropdown(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to download resume');
    }
  };

  const handleStatusUpdate = async (candidateId, newStatus, employeeData = null) => {
    try {
      await apiService.updateCandidateStatus(candidateId, newStatus, employeeData);
      setCandidates((prev) =>
        prev.map((candidate) =>
          candidate._id === candidateId ? { ...candidate, status: newStatus } : candidate
        )
      );
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleCreateEmployee = async (candidateId) => {
    try {
      const candidate = candidates.find((c) => c._id === candidateId);
      if (!candidate) {
        toast.error('Candidate not found');
        return;
      }
      setSelectedCandidate(candidate);
      setShowEmployeeModal(true);
    } catch (error) {
      toast.error('Failed to prepare employee creation');
    }
  };

  const handleEmployeeSubmit = async (employeeData) => {
    try {
      await handleStatusUpdate(selectedCandidate._id, 'Selected', employeeData);
      setShowEmployeeModal(false);
      setSelectedCandidate(null);
      toast.success('Employee created successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create employee');
    }
  };

  const handleAddCandidate = async (formData) => {
    const response = await apiService.createCandidate(formData);
    setCandidates((prev) => [response.data, ...prev]);
    toast.success('Candidate added successfully');
  };

  return (
    <div className={styles.mainContent}>
      <Header title= "Candidates" />
      <div className={styles.contentArea}>
        <Filters
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          positionFilter={positionFilter}
          setPositionFilter={setPositionFilter}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setShowAddModal={setShowAddModal}
        />
        {authLoading ? (
          <div className={styles.loading}>Loading authentication...</div>
        ) : loading ? (
          <div className={styles.loading}>Loading candidates...</div>
        ) : errorMessage ? (
          <div className={styles.errorMessage}>{errorMessage}</div>
        ) : (
          <CandidateTable
            candidates={candidates}
            showDropdown={showDropdown}
            setShowDropdown={setShowDropdown}
            handleDeleteCandidate={handleDeleteCandidate}
            handleDownloadResume={handleDownloadResume}
            handleStatusUpdate={handleStatusUpdate}
            handleCreateEmployee={handleCreateEmployee}
          />
        )}
      </div>
      <AddCandidateModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddCandidate}
      />
      <CreateEmployeeModal
        isOpen={showEmployeeModal}
        onClose={() => {
          setShowEmployeeModal(false);
          setSelectedCandidate(null);
        }}
        onSubmit={handleEmployeeSubmit}
        candidateData={selectedCandidate}
      />
    </div>
  );
};

export default CandidatesPage;