// frontend/src/components/dashboard/EditEmployeeModal.jsx
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { X, Plus, Trash2 } from 'lucide-react';
import styles from './CandidatesPage/CandidatesPage.module.css';

// Validation schema for editing employee
const EMPLOYEE_UPDATE_SCHEMA = yup.object().shape({
  joiningDate: yup
    .date()
    .required('Joining date is required')
    .typeError('Invalid date format'),
  employmentType: yup
    .string()
    .required('Employment type is required')
    .oneOf(['Full-time', 'Part-time', 'Contract', 'Internship'], 'Invalid employment type'),
  position: yup
    .string()
    .required('Position is required')
    .trim(),
  tasks: yup
    .array()
    .of(
      yup.object().shape({
        description: yup.string().required('Task description is required').trim(),
        dueDate: yup
          .date()
          .required('Due date is required')
          .typeError('Invalid due date format'),
      })
    )
    .required('Tasks are required'),
});

// Employment type options
const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'Full-time', label: 'Full-time' },
  { value: 'Part-time', label: 'Part-time' },
  { value: 'Contract', label: 'Contract' },
  { value: 'Internship', label: 'Internship' },
];

/**
 * EditEmployeeModal component for editing employee details
 * @component
 */
const EditEmployeeModal = ({ isOpen, onClose, onSubmit, employeeData }) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(EMPLOYEE_UPDATE_SCHEMA),
    defaultValues: {
      joiningDate: employeeData?.joiningDate
        ? new Date(employeeData.joiningDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      employmentType: employeeData?.employmentType || 'Full-time',
      position: employeeData?.position || '',
      tasks: employeeData?.tasks?.length
        ? employeeData.tasks.map((task) => ({
            description: task.description,
            dueDate: new Date(task.dueDate).toISOString().split('T')[0],
          }))
        : [{ description: '', dueDate: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tasks',
  });

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
      toast.success('Employee updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update employee');
    }
  };

  if (!isOpen || !employeeData) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.candidateModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Edit Employee</h2>
          <button className={styles.modalCloseBtn} onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.candidateInfo}>
            <h3>Employee Information</h3>
            <div className={styles.infoGrid}>
              <div><strong>Name:</strong> {employeeData.name}</div>
              <div><strong>Email:</strong> {employeeData.email}</div>
              <div><strong>Phone:</strong> {employeeData.phone}</div>
              <div><strong>Department:</strong> {employeeData.department}</div>
            </div>
          </div>
          <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.candidateForm}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="position">Position *</label>
                <input
                  type="text"
                  id="position"
                  {...register('position')}
                  className={styles.input}
                  style={{height: "36px", padding:"10px"}}
                />
                {errors.position && (
                  <span className={styles.error}>{errors.position.message}</span>
                )}
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="joiningDate">Joining Date *</label>
                <input
                  type="date"
                  id="joiningDate"
                  {...register('joiningDate')}
                  className={styles.input}
                    style={{height: "36px", padding:"10px"}}
                />
                {errors.joiningDate && (
                  <span className={styles.error}>{errors.joiningDate.message}</span>
                )}
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="employmentType">Employment Type *</label>
                <select id="employmentType" {...register('employmentType')} className={styles.input}
                  style={{height: "36px", padding:"10px"}}
                >
                  {EMPLOYMENT_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.employmentType && (
                  <span className={styles.error}>{errors.employmentType.message}</span>
                )}
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>Tasks *</label>
              {fields.map((field, index) => (
                <div key={field.id} className={styles.taskRow}>
                  <div className={styles.taskField}>
                    <input
                      type="text"
                      placeholder="Task description"
                      {...register(`tasks.${index}.description`)}
                      className={styles.input}
                        style={{height: "36px", padding:"10px", width: "360px"}}
                    />
                    {errors.tasks?.[index]?.description && (
                      <span className={styles.error}>{errors.tasks[index].description.message}</span>
                    )}
                  </div>
                  <div className={styles.taskField} style={{marginTop: "12px"}}>
                    <input
                      type="date"
                      {...register(`tasks.${index}.dueDate`)}
                      className={styles.input}
                        style={{height: "36px", padding:"10px"}}
                    />
                    {errors.tasks?.[index]?.dueDate && (
                      <span className={styles.error}>{errors.tasks[index].dueDate.message}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className={styles.removeTaskBtn}
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    aria-label="Remove task"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className={styles.addTaskBtn}
                onClick={() => append({ description: '', dueDate: '' })}
                  style={{height: "36px", padding:"10px"}}
              >
                <Plus size={16} /> Add Task
              </button>
            </div>
            <div className={styles.formActions}>
              <button type="button" 
              className={styles.cancelBtn} 
              onClick={onClose}
                style={{height: "36px", padding:"10px", width: "120px"}}
              >
                Cancel
              </button>
              <button type="submit" className={styles.submitBtn} disabled={isSubmitting}
                style={{height: "36px", padding:"10px", width: "160px"}}
              >
                {isSubmitting ? 'Updating...' : 'Update Employee'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

EditEmployeeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  employeeData: PropTypes.object,
};

export default EditEmployeeModal;