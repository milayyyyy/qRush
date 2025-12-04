/**
 * Validation utilities for form inputs
 */

export const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, message: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }
  
  return { isValid: true, message: '' };
};

export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  
  return { isValid: true, message: '' };
};

export const validateName = (name) => {
  if (!name) {
    return { isValid: false, message: 'Full name is required' };
  }
  
  if (name.length < 2) {
    return { isValid: false, message: 'Name must be at least 2 characters long' };
  }
  
  if (name.length > 50) {
    return { isValid: false, message: 'Name must be less than 50 characters' };
  }
  
  return { isValid: true, message: '' };
};

export const validateRole = (role) => {
  if (!role) {
    return { isValid: false, message: 'Please select a role' };
  }
  
  const validRoles = ['attendee', 'organizer', 'staff'];
  if (!validRoles.includes(role.toLowerCase())) {
    return { isValid: false, message: 'Please select a valid role' };
  }
  
  return { isValid: true, message: '' };
};

export const validateContact = (contact) => {
  if (!contact) {
    return { isValid: false, message: 'Contact number is required' };
  }
  
  // Remove any spaces or dashes
  const cleanContact = contact.replace(/[\s-]/g, '');
  
  if (!/^09\d{9}$/.test(cleanContact)) {
    return { isValid: false, message: 'Contact must be 11 digits starting with 09 (e.g., 09123456789)' };
  }
  
  return { isValid: true, message: '' };
};

export const validateBirthdate = (birthdate) => {
  if (!birthdate) {
    return { isValid: false, message: 'Birthdate is required' };
  }
  
  const date = new Date(birthdate);
  const today = new Date();
  
  if (isNaN(date.getTime())) {
    return { isValid: false, message: 'Please enter a valid date' };
  }
  
  if (date > today) {
    return { isValid: false, message: 'Birthdate cannot be in the future' };
  }
  
  // Calculate age
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age--;
  }
  
  if (age < 13) {
    return { isValid: false, message: 'You must be at least 13 years old' };
  }
  
  if (age > 120) {
    return { isValid: false, message: 'Please enter a valid birthdate' };
  }
  
  return { isValid: true, message: '' };
};

export const validateGender = (gender) => {
  if (!gender) {
    return { isValid: false, message: 'Please select your gender' };
  }
  
  const validGenders = ['male', 'female', 'other', 'prefer-not-to-say'];
  if (!validGenders.includes(gender.toLowerCase())) {
    return { isValid: false, message: 'Please select a valid gender option' };
  }
  
  return { isValid: true, message: '' };
};