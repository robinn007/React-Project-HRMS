// frontend/src/pages/AuthPage.jsx
import { useParams, useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm.jsx';
import RegisterForm from '../components/auth/RegisterForm.jsx';
import './AuthPage.css';

const AuthPage = () => {
  const { type } = useParams();
  const navigate = useNavigate();

  const isLogin = type === 'login';

  return (
    <div className="auth-page">
      <div className="auth-toggle">
        {/* <button
          onClick={() => navigate('/auth/login')}
          className={`auth-toggle-button ${isLogin ? 'auth-toggle-button--active' : ''}`}
        >
          Login
        </button>
        <button
          onClick={() => navigate('/auth/register')}
          className={`auth-toggle-button ${!isLogin ? 'auth-toggle-button--active' : ''}`}
        >
          Register
        </button> */}
      </div>
      {isLogin ? <LoginForm /> : <RegisterForm />}
    </div>
  );
};

export default AuthPage;