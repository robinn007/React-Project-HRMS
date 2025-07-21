// frontend/src/services/candidateService.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.API_URL || 'https://react-project-hrms.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error);
    return Promise.reject(error);
  }
);

// Existing functions (unchanged, included for completeness)
export const getCandidates = async (params) => {
  try {
    const response = await api.get('/candidates', { params });
    const data = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.data)
      ? response.data.data
      : [];
    console.log('getCandidates: Parsed data:', data);
    return data;
  } catch (error) {
    console.error('getCandidates Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

export const createCandidate = async (formData) => {
  try {
    const response = await api.post('/candidates', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create candidate');
  }
};

export const deleteCandidate = async (candidateId) => {
  try {
    const response = await api.delete(`/candidates/${candidateId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete candidate');
  }
};

export const downloadResume = async (candidateId) => {
  try {
    const response = await api.get(`/candidates/${candidateId}/resume`, {
      responseType: 'blob',
    });
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to download resume');
  }
};

export const updateCandidateStatus = async (candidateId, status, employeeData) => {
  try {
    const response = await api.patch(`/candidates/${candidateId}/status`, { status, employeeData });
    console.log('updateCandidateStatus: Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('updateCandidateStatus Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw new Error(error.response?.data?.message || 'Failed to update status');
  }
};

export const getEmployees = async (params) => {
  try {
    const response = await api.get('/employees', { params });
    const data = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.data)
      ? response.data.data
      : [];
    console.log('getEmployees: Parsed data:', data);
    return data;
  } catch (error) {
    console.error('getEmployees Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

export const createEmployee = async (employeeData) => {
  try {
    const response = await api.post('/employees', employeeData);
    console.log('createEmployee: Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('createEmployee Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw new Error(error.response?.data?.message || 'Failed to create employee');
  }
};

export const deleteEmployee = async (employeeId) => {
  try {
    const response = await api.delete(`/employees/${employeeId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete employee');
  }
};

export const downloadEmployeeResume = async (employeeId) => {
  try {
    const response = await api.get(`/employees/${employeeId}/resume`, {
      responseType: 'blob',
    });
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to download resume');
  }
};

export const updateEmployeeStatus = async (employeeId, status) => {
  try {
    const response = await api.patch(`/employees/${employeeId}/status`, { status });
    console.log('updateEmployeeStatus: Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('updateEmployeeStatus Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw new Error(error.response?.data?.message || 'Failed to update employee status');
  }
};

export const updateEmployee = async (employeeId, employeeData) => {
  try {
    const response = await api.patch(`/employees/${employeeId}`, employeeData);
    console.log('updateEmployee: Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('updateEmployee Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw new Error(error.response?.data?.message || 'Failed to update employee');
  }
};

export const getAttendance = async (params) => {
  try {
    const response = await api.get('/attendance', { params });
    const data = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.data)
      ? response.data.data
      : [];
    console.log('getAttendance: Parsed data:', data);
    return data;
  } catch (error) {
    console.error('getAttendance Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

export const updateAttendance = async (attendanceData) => {
  try {
    const response = await api.post('/attendance', attendanceData);
    console.log('updateAttendance: Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('updateAttendance Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw new Error(error.response?.data?.message || 'Failed to update attendance');
  }
};

export const getLeaves = async (params) => {
  try {
    const response = await api.get('/leave', { params });
    const data = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.data)
      ? response.data.data
      : [];
    console.log('getLeaves: Parsed data:', data);
    return data;
  } catch (error) {
    console.error('getLeaves Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

export const createLeave = async (leaveData) => {
  try {
    const response = await api.post('/leave', leaveData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log('createLeave: Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('createLeave Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw new Error(error.response?.data?.message || 'Failed to create leave request');
  }
};

export const updateLeaveStatus = async (leaveId, status) => {
  try {
    const response = await api.patch(`/leave/${leaveId}/status`, { status });
    console.log('updateLeaveStatus: Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('updateLeaveStatus Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw new Error(error.response?.data?.message || 'Failed to update leave status');
  }
};

export const downloadLeaveDocument = async (leaveId) => {
  try {
    const response = await api.get(`/leave/${leaveId}/document`, {
      responseType: 'blob',
    });
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to download document');
  }
};