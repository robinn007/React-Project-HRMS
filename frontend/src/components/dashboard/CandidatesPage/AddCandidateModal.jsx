// frontend/src/components/dashboard/CandidatesPage/AddCandidateModal.jsx
import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { CANDIDATE_SCHEMA } from './constants';
import FormField from './FormField';
import styles from './CandidatesPage.module.css';

/**
 * AddCandidateModal component for adding new candidates
 * @component
 */
const AddCandidateModal = ({ isOpen, onClose, onSubmit }) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(CANDIDATE_SCHEMA),
    defaultValues: { status: 'Pending' },
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only PDF, DOC, or DOCX files are allowed');
        setSelectedFile(null);
        setValue('resume', null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        setSelectedFile(null);
        setValue('resume', null);
        return;
      }
      setSelectedFile(file);
      setValue('resume', e.target.files);
    } else {
      setSelectedFile(null);
      setValue('resume', null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setValue('resume', null);
    document.getElementById('resume-upload').value = '';
  };

  const handleFormSubmit = async (data) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'skills' && value) {
          formData.append(key, JSON.stringify(value.split(',').map((skill) => skill.trim())));
        } else if (key !== 'resume' && value) {
          formData.append(key, value);
        }
      });
      if (selectedFile) formData.append('resume', selectedFile);
      await onSubmit(formData);
      reset();
      setSelectedFile(null);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add candidate');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.candidateModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Add New Candidate</h2>
          <button className={styles.modalCloseBtn} onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>
        <div className={styles.modalBody}>
          <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.candidateForm}>
            <div className={styles.formGrid}>
              <FormField label="Full Name" name="name" register={register} errors={errors} required />
              <FormField label="Email Address" name="email" register={register} errors={errors} required type="email" />
              <FormField label="Phone Number" name="phone" register={register} errors={errors} required />
              <FormField label="Position" name="position" register={register} errors={errors} required />
              <FormField label="Experience" name="experience" register={register} errors={errors} required />
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Resume</label>
                <div className={styles.fileUploadContainer}>
                  {!selectedFile ? (
                    <>
                      <input
                        type="file"
                        className={styles.fileInput}
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        id="resume-upload"
                      />
                      <label htmlFor="resume-upload" className={styles.fileUploadLabel}>
                        <Upload size={16} />
                        Upload Resume
                      </label>
                    </>
                  ) : (
                    <div className={styles.fileSelected}>
                      <span className={styles.fileName}>{selectedFile.name}</span>
                      <button
                        type="button"
                        className={styles.fileRemoveBtn}
                        onClick={handleRemoveFile}
                        aria-label="Remove file"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                  {errors.resume && <span className={styles.errorText}>{errors.resume.message}</span>}
                </div>
              </div>
            </div>
            <div className={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="declaration"
                className={styles.checkboxInput}
                required
              />
              <label htmlFor="declaration" className={styles.checkboxLabel}>
                I hereby declare that the above information is true to the best of my knowledge and belief
              </label>
            </div>
            <div className={styles.formActions}>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

AddCandidateModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default AddCandidateModal;