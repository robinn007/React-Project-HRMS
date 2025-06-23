// frontend/src/components/dashboard/CandidatesPage/FormField.jsx
import PropTypes from 'prop-types';
import styles from './CandidatesPage.module.css';

/**
 * FormField component for reusable form inputs
 * @component
 */
const FormField = ({ label, name, register, errors, required, type = 'text', options }) => (
  <div className={styles.formGroup}>
    <label className={styles.formLabel}>
      {label} {required && <span className={styles.required}>*</span>}
    </label>
    {type === 'select' ? (
      <select className={styles.formInput} {...register(name)}>
        <option value="">{`Select ${label}`}</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        className={styles.formInput}
        placeholder={`Enter ${label.toLowerCase()}`}
        {...register(name)}
      />
    )}
    {errors[name] && <span className={styles.errorText}>{errors[name].message}</span>}
  </div>
);

FormField.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  register: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
  required: PropTypes.bool,
  type: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.string),
};

export default FormField;