// Validation utility functions for forms

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true, error: null };
};

// Phone number validation (Indian format)
export const validatePhone = (phone) => {
  const phoneRegex = /^[+]?[91]?[6-9]\d{9}$/;
  
  if (!phone) {
    return { isValid: false, error: 'Phone number is required' };
  }
  
  // Remove spaces and special characters
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  if (!phoneRegex.test(cleanPhone)) {
    return { isValid: false, error: 'Please enter a valid phone number' };
  }
  
  return { isValid: true, error: null };
};

// Name validation
export const validateName = (name, fieldName = 'Name') => {
  if (!name) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  if (name.length < 2) {
    return { isValid: false, error: `${fieldName} must be at least 2 characters long` };
  }
  
  if (name.length > 50) {
    return { isValid: false, error: `${fieldName} must be less than 50 characters` };
  }
  
  const nameRegex = /^[a-zA-Z\s\.]+$/;
  if (!nameRegex.test(name)) {
    return { isValid: false, error: `${fieldName} can only contain letters, spaces, and dots` };
  }
  
  return { isValid: true, error: null };
};

// Date validation
export const validateDate = (date, fieldName = 'Date') => {
  if (!date) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: 'Please enter a valid date' };
  }
  
  return { isValid: true, error: null };
};

// Date of birth validation
export const validateDateOfBirth = (dateOfBirth) => {
  const dateValidation = validateDate(dateOfBirth, 'Date of birth');
  if (!dateValidation.isValid) {
    return dateValidation;
  }
  
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  
  if (birthDate > today) {
    return { isValid: false, error: 'Date of birth cannot be in the future' };
  }
  
  if (age > 120) {
    return { isValid: false, error: 'Please enter a valid date of birth' };
  }
  
  return { isValid: true, error: null };
};

// Required field validation
export const validateRequired = (value, fieldName = 'Field') => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  return { isValid: true, error: null };
};

// Blood group validation
export const validateBloodGroup = (bloodGroup) => {
  const validGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  
  if (!bloodGroup) {
    return { isValid: false, error: 'Blood group is required' };
  }
  
  if (!validGroups.includes(bloodGroup.toUpperCase())) {
    return { isValid: false, error: 'Please select a valid blood group' };
  }
  
  return { isValid: true, error: null };
};

// Password validation
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters long' };
  }
  
  if (password.length > 50) {
    return { isValid: false, error: 'Password must be less than 50 characters' };
  }
  
  return { isValid: true, error: null };
};

// Appointment time validation
export const validateAppointmentTime = (dateTime) => {
  if (!dateTime) {
    return { isValid: false, error: 'Appointment time is required' };
  }
  
  const appointmentDate = new Date(dateTime);
  const now = new Date();
  
  if (appointmentDate <= now) {
    return { isValid: false, error: 'Appointment time must be in the future' };
  }
  
  // Check if appointment is within next 3 months
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
  
  if (appointmentDate > threeMonthsFromNow) {
    return { isValid: false, error: 'Appointments can only be booked up to 3 months in advance' };
  }
  
  return { isValid: true, error: null };
};

// Form validation helper
export class FormValidator {
  constructor() {
    this.errors = {};
  }
  
  // Validate a single field
  validateField(fieldName, value, validator, ...args) {
    const result = validator(value, ...args);
    
    if (result.isValid) {
      delete this.errors[fieldName];
    } else {
      this.errors[fieldName] = result.error;
    }
    
    return result;
  }
  
  // Validate multiple fields
  validateFields(fields) {
    this.errors = {};
    let isValid = true;
    
    Object.keys(fields).forEach(fieldName => {
      const { value, validator, args = [] } = fields[fieldName];
      const result = this.validateField(fieldName, value, validator, ...args);
      
      if (!result.isValid) {
        isValid = false;
      }
    });
    
    return { isValid, errors: this.errors };
  }
  
  // Get all errors
  getErrors() {
    return this.errors;
  }
  
  // Check if form has errors
  hasErrors() {
    return Object.keys(this.errors).length > 0;
  }
  
  // Clear all errors
  clearErrors() {
    this.errors = {};
  }
  
  // Clear specific field error
  clearFieldError(fieldName) {
    delete this.errors[fieldName];
  }
}

// Common validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[+]?[91]?[6-9]\d{9}$/,
  NAME: /^[a-zA-Z\s\.]+$/,
  NUMERIC: /^\d+$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
};

export default {
  validateEmail,
  validatePhone,
  validateName,
  validateDate,
  validateDateOfBirth,
  validateRequired,
  validateBloodGroup,
  validatePassword,
  validateAppointmentTime,
  FormValidator,
  VALIDATION_PATTERNS,
};