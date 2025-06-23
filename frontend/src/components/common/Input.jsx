// frontend/src/components/common/Input.jsx
import './Input.css';

const Input = ({ label, error, type = 'text', ...props }) => {
  return (
    <div className="input-container">
      <label className="input-label">{label}</label>
      <input
        type={type}
        className={`input-field ${error ? 'input-field--error' : ''}`}
        {...props}
      />
      {error && <p className="input-error">{error}</p>}
    </div>
  );
};

export default Input;