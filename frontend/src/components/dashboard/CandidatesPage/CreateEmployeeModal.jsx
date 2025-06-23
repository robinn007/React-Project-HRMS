// frontend/src/components/dashboard/CandidatesPage/CreateEmployeeModal.jsx
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { EMPLOYEE_SCHEMA, DEPARTMENT_OPTIONS, WORK_LOCATION_OPTIONS, EMPLOYMENT_TYPE_OPTIONS } from './constants';
import FormField from './FormField';
import styles from './CandidatesPage.module.css';

/**
 * CreateEmployeeModal component for converting a candidate to an employee
 * @component
 */
const CreateEmployeeModal = ({ isOpen, onClose, onSubmit, candidateData }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(EMPLOYEE_SCHEMA),
    defaultValues: {
      employeeId: `EMP${Date.now()}`,
      joiningDate: new Date().toISOString().split('T')[0],
      workLocation: 'Office',
      employmentType: 'Full-time',
    },
  });

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create employee');
    }
  };

  if (!isOpen || !candidateData) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.candidateModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Create Employee from Candidate</h2>
          <button className={styles.modalCloseBtn} onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.candidateInfo}>
            <h3>Candidate Information</h3>
            <div className={styles.infoGrid}>
              <div><strong>Name:</strong> {candidateData.name}</div>
              <div><strong>Email:</strong> {candidateData.email}</div>
              <div><strong>Phone:</strong> {candidateData.phone}</div>
              <div><strong>Position:</strong> {candidateData.position}</div>
              <div><strong>Experience:</strong> {candidateData.experience}</div>
            </div>
          </div>
          <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.candidateForm}>
            <div className={styles.formGrid}>
              <FormField label="Employee ID" name="employeeId" register={register} errors={errors} required />
              <FormField label="Department" name="department" register={register} errors={errors} required type="select" options={DEPARTMENT_OPTIONS} />
              <FormField label="Salary" name="salary" register={register} errors={errors} required type="number" />
              <FormField label="Joining Date" name="joiningDate" register={register} errors={errors} required type="date" />
              <FormField label="Manager" name="manager" register={register} errors={errors} />
              <FormField label="Work Location" name="workLocation" register={register} errors={errors} required type="select" options={WORK_LOCATION_OPTIONS} />
              <FormField label="Employment Type" name="employmentType" register={register} errors={errors} required type="select" options={EMPLOYMENT_TYPE_OPTIONS} />
            </div>
            <div className={styles.formActions}>
              <button type="button" className={styles.cancelBtn} onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                {isSubmitting ? 'Creating Employee...' : 'Create Employee'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

CreateEmployeeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  candidateData: PropTypes.object,
};

export default CreateEmployeeModal;