// frontend/src/components/dashboard/CandidatesPage/constants.js
import * as yup from 'yup';

export const STATUS_COLORS = {
  scheduled: { color: '#f59e0b', background: '#fef3c7' },
  selected: { color: '#10b981', background: '#d1fae5' },
  rejected: { color: '#ef4444', background: '#fee2e2' },
  ongoing: { color: '#3b82f6', background: '#dbeafe' },
  active: { color: '#10b981', background: '#d1fae5' },
  pending: { color: '#f59e0b', background: '#fef3c7' },
  inactive: { color: '#6b7280', background: '#f3f4f6' },
};

export const STATUS_OPTIONS = [
  { value: 'all', label: 'Status' },
  { value: 'Scheduled', label: 'Scheduled' },
  { value: 'Ongoing', label: 'Ongoing' },
  { value: 'Selected', label: 'Selected' },
  { value: 'Rejected', label: 'Rejected' },
];

export const POSITION_OPTIONS = [
  { value: 'all', label: 'All Positions' },
  { value: 'Software Engineer', label: 'Software Engineer' },
  { value: 'Software Developer', label: 'Software Developer' },
  { value: 'UI/UX Developer', label: 'UI/UX Developer' },
  { value: 'Project Manager', label: 'Project Manager' },
  { value: 'Designer', label: 'Designer' },
  { value: 'Human Resource', label: 'Human Resource' },
];

export const ATTENDANCE_OPTIONS = [
  { value: 'all', label: 'Status' },
  { value: 'Present', label: 'Present' },
  { value: 'Absent', label: 'Absent' },
]

export const CANDIDATE_SCHEMA = yup.object({
  name: yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().matches(/^\+?[\d\s-]{10,}$/, 'Invalid phone number').required('Phone is required'),
  position: yup.string().required('Position is required'),
  status: yup.string().oneOf(['Active', 'Pending', 'Inactive', 'Scheduled', 'Ongoing', 'Selected', 'Rejected']).required('Status is required'),
  experience: yup.string().required('Experience is required'),
  // skills: yup.string(),
  resume: yup
    .mixed()
    .test('fileType', 'Only PDF, DOC, or DOCX files are allowed', (value) => {
      if (!value || !value[0]) return true;
      return ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(value[0].type);
    })
    .test('fileSize', 'File size must be less than 5MB', (value) => {
      if (!value || !value[0]) return true;
      return value[0].size <= 5 * 1024 * 1024;
    }),
});

export const EMPLOYEE_SCHEMA = yup.object({
  employeeId: yup.string().required('Employee ID is required'),
  department: yup.string().required('Department is required'),
  salary: yup.number().positive('Salary must be positive').required('Salary is required'),
  joiningDate: yup.date().required('Joining date is required'),
  manager: yup.string(),
  workLocation: yup.string().required('Work location is required'),
  employmentType: yup.string().oneOf(['Full-time', 'Part-time', 'Contract', 'Internship']).required('Employment type is required'),
});

export const DEPARTMENT_OPTIONS = ['Development', 'Human Resources', 'Design', 'Product Management' ];
export const WORK_LOCATION_OPTIONS = ['Office', 'Remote', 'Hybrid'];
export const EMPLOYMENT_TYPE_OPTIONS = ['Full-time', 'Part-time', 'Contract', 'Internship'];