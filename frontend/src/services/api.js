/**
 * API Service for communicating with Spring Boot backend
 * Handles all HTTP requests to the backend server
 */
const API_BASE_URL = 'http://localhost:8080/api';

class ApiService {
  
  /**
   * Generic request method to handle all API calls
   * @param {string} endpoint - The API endpoint to call
   * @param {object} options - Fetch API options
   * @returns {Promise} - Parsed JSON response
   */
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Default configuration for all requests
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    try {
      console.log(`Making API request to: ${url}`);
      
      const response = await fetch(url, config);
      
      // Handle non-successful HTTP responses
      if (!response.ok) {
        // Try to extract error message from response body
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }
      
      // Parse and return JSON response for successful requests
      return await response.json();
      
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * Register a new user with the backend
   * @param {object} userData - User registration data
   * @returns {Promise} - Authentication response with user data
   */
  async signup(userData) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  /**
   * Authenticate an existing user
   * @param {object} credentials - User login credentials
   * @returns {Promise} - Authentication response with user data
   */
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  /**
   * Get user profile data
   * @param {string} userId - Unique user identifier
   * @returns {Promise} - User profile data
   */
  async getUserProfile(userId) {
    return this.request(`/users/${userId}`);
  }

  // Additional API methods can be added here as needed
  // For events, tickets, etc.
}

// Create and export a singleton instance of the API service
export const apiService = new ApiService();