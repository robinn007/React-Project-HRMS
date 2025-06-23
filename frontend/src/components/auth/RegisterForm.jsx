// frontend/src/components/auth/RegisterForm.jsx
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { registerSchema } from '../../utils/validationSchemas.js.js';
import useAuth from '../../hooks/useAuth.js';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';
import './RegisterForm.css';
import { Link } from 'react-router-dom';

const RegisterForm = () => {
  const { register } = useAuth();
  const {
    register: formRegister,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: { role: 'employee' },
  });

  const onSubmit = async (data) => {
    const { name, email, password, confirmPassword } = data;
    await register({ name, email, password, confirmPassword });
  };

  return (
    <div className="register-form-container">
      <h2 className="register-form-title">Welcome to Dashboard</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="register-form">
        <div className="form-group">
          <label className="input-label">Full name*</label>
          <Input
            type="text"
            className={`input-field ${errors.name ? 'error' : ''}`}
            placeholder="Full name"
            {...formRegister('name')}
          />
          {errors.name && <span className="error-message">{errors.name.message}</span>}
        </div>

        <div className="form-group">
          <label className="input-label">Email Address*</label>
          <Input
            type="email"
            className={`input-field ${errors.email ? 'error' : ''}`}
            placeholder="Email Address"
            {...formRegister('email')}
          />
          {errors.email && <span className="error-message">{errors.email.message}</span>}
        </div>

        <div className="form-group">
          <label className="input-label">Password*</label>
          <div className="password-container">
            <input
              type="password"
              className={`input-field ${errors.password ? 'error' : ''}`}
              placeholder="Password"
              {...formRegister('password')}
            />
            <span className="password-toggle"></span>
          </div>
          {errors.password && <span className="error-message">{errors.password.message}</span>}
        </div>

        <div className="form-group">
          <label className="input-label">Confirm Password*</label>
          <div className="password-container">
            <input
              type="password"
              className={`input-field ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="Confirm Password"
              {...formRegister('confirmPassword')}
            />
            <span className="password-toggle"></span>
          </div>
          {errors.confirmPassword && <span className="error-message">{errors.confirmPassword.message}</span>}
        </div>

        <Button 
          type="submit" 
          className="register-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Registering...' : 'Register'}
        </Button>

        <p className="login-link">
          Already have an account? <Link to="/auth/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterForm;