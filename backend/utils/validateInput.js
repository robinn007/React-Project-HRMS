// backend/utils/validateInput.js
const validateInput = (data, type) => {
  const errors = {};

  if (type === 'register') {
    if (!data.name || data.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long';
    }
    if (!data.confirmPassword || data.password !== data.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
  }

  if (!data.email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!data.password || data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters long';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};

module.exports = validateInput;