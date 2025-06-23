// frontend/src/components/common/Button.jsx
import './Button.css';

const Button = ({ children, isLoading, disabled, className = '', ...props }) => {
  return (
    <button
      disabled={disabled || isLoading}
      className={`button ${isLoading ? 'button--loading' : ''} ${className}`}
      {...props}
    >
      {isLoading ? 'Processing...' : children}
    </button>
  );
};

export default Button;