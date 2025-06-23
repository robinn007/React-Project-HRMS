// frontend/src/contexts/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as authService from '../services/authService.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionTimer, setSessionTimer] = useState(null);
  const navigate = useNavigate();

  const SESSION_DURATION = 2 * 60 * 60 * 1000; // 2 hours

  const startSessionTimer = () => {
    if (sessionTimer) clearTimeout(sessionTimer);

    const timer = setTimeout(() => {
      logout();
      toast.info('Session expired. Please login again.');
    }, SESSION_DURATION);

    setSessionTimer(timer);
  };

  const login = async (credentials) => {
    try {
      const { success, token, user } = await authService.login(credentials);
      if (success) {
        localStorage.setItem('token', token);
        localStorage.setItem('loginTime', Date.now().toString());
        setUser(user);
        startSessionTimer();
        navigate('/dashboard');
        toast.success('Login successful!');
        return { success: true };
      }
    } catch (error) {
      toast.error(error.message || 'Login failed');
      return { success: false, message: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const { success, token, user } = await authService.register(userData);
      if (success) {
        localStorage.setItem('token', token);
        localStorage.setItem('loginTime', Date.now().toString());
        setUser(user);
        startSessionTimer();
        navigate('/dashboard');
        toast.success('Registration successful!');
        return { success: true };
      }
    } catch (error) {
      toast.error(error.message || 'Registration failed');
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loginTime');
    setUser(null);
    if (sessionTimer) clearTimeout(sessionTimer);
    navigate('/auth/login');
    toast.info('Logged out successfully');
  };

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token');
    const loginTime = localStorage.getItem('loginTime');

    if (!token || !loginTime) {
      setLoading(false);
      return;
    }

    const sessionAge = Date.now() - parseInt(loginTime);
    if (sessionAge > SESSION_DURATION) {
      logout();
      setLoading(false);
      return;
    }

    try {
      const { success, user } = await authService.verifyToken();
      if (success) {
        setUser(user);
        const remainingTime = SESSION_DURATION - sessionAge;
        const timer = setTimeout(() => {
          logout();
          toast.info('Session expired. Please login again.');
        }, remainingTime);
        setSessionTimer(timer);
      } else {
        logout();
      }
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
    return () => {
      if (sessionTimer) clearTimeout(sessionTimer);
    };
  }, []);

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;