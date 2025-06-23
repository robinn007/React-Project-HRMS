// frontend/src/utils/validationSchemas.js
import * as yup from 'yup';

export const loginSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .required('Password is required'),
});

export const registerSchema = yup.object({
  name: yup
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .required('Name is required'),
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords do not match')
    .required('Confirm password is required'),
  // role: yup
  //   .string()
  //   .oneOf(['employee', 'hr', 'admin'], 'Invalid role')
  //   .required('Role is required'),
});