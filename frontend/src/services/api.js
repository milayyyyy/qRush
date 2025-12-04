/**
 * API Service for communicating with Spring Boot backend
 * Handles all HTTP requests to the backend server
 */
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

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

  async getEvents() {
    return this.request('/events');
  }

  async createEvent(eventData) {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async getEvent(eventId) {
    return this.request(`/events/${eventId}`);
  }

  async trackEventView(eventId, options = {}) {
    const { userId = null, userRole = null } = options;
    const params = new URLSearchParams();
    
    if (userId) {
      params.append('userId', userId);
    }
    if (userRole) {
      params.append('userRole', userRole);
    }
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/events/${eventId}/track-view${query}`, {
      method: 'POST'
    });
  }

  async updateEvent(eventId, eventData) {
    return this.request(`/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  }

  async deleteEvent(eventId) {
    return this.request(`/events/${eventId}`, {
      method: 'DELETE',
    });
  }

  async cancelEvent(eventId, reason) {
    return this.request(`/events/${eventId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async canDeleteEvent(eventId) {
    return this.request(`/events/${eventId}/can-delete`);
  }

  async bookTickets(payload) {
    return this.request('/tickets/book', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getTicket(ticketId) {
    return this.request(`/tickets/${ticketId}`);
  }

  async scanTicket(payload) {
    return this.request('/tickets/scan', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async manualVerifyTicket(payload) {
    return this.request('/tickets/manual-verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async bulkCheckIn(payload) {
    return this.request('/tickets/bulk-check-in', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getAttendeeDashboard(userId) {
    return this.request(`/dashboard/attendee/${userId}`);
  }

  async getOrganizerDashboard(userId) {
    return this.request(`/dashboard/organizer/${userId}`);
  }

  async getStaffDashboard(eventId) {
    return this.request(`/dashboard/staff?eventId=${eventId}`);
  }

  // ==================== NOTIFICATION API METHODS ====================

  /**
   * Get all notifications for a user
   * @param {number} userId - User ID
   * @returns {Promise} - List of notifications
   */
  async getNotifications(userId) {
    return this.request(`/notifications/user/${userId}`);
  }

  /**
   * Get unread notifications for a user
   * @param {number} userId - User ID
   * @returns {Promise} - List of unread notifications
   */
  async getUnreadNotifications(userId) {
    return this.request(`/notifications/user/${userId}/unread`);
  }

  /**
   * Get unread notification count for a user
   * @param {number} userId - User ID
   * @returns {Promise} - Object with count property
   */
  async getUnreadNotificationCount(userId) {
    return this.request(`/notifications/user/${userId}/unread-count`);
  }

  /**
   * Mark a single notification as read
   * @param {number} notificationId - Notification ID
   * @returns {Promise} - Updated notification
   */
  async markNotificationAsRead(notificationId) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  /**
   * Mark all notifications as read for a user
   * @param {number} userId - User ID
   * @returns {Promise} - Success message
   */
  async markAllNotificationsAsRead(userId) {
    return this.request(`/notifications/user/${userId}/read-all`, {
      method: 'PUT',
    });
  }

  /**
   * Delete a single notification
   * @param {number} notificationId - Notification ID
   * @returns {Promise} - Success message
   */
  async deleteNotification(notificationId) {
    return this.request(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Delete all notifications for a user
   * @param {number} userId - User ID
   * @returns {Promise} - Success message
   */
  async deleteAllNotifications(userId) {
    return this.request(`/notifications/user/${userId}`, {
      method: 'DELETE',
    });
  }

  // ==================== ROLE API METHODS ====================

  /**
   * Get all roles
   * @returns {Promise} - List of roles
   */
  async getRoles() {
    return this.request('/roles');
  }

  /**
   * Get role by ID
   * @param {number} roleId - Role ID
   * @returns {Promise} - Role data
   */
  async getRoleById(roleId) {
    return this.request(`/roles/${roleId}`);
  }

  /**
   * Get role by name
   * @param {string} roleName - Role name
   * @returns {Promise} - Role data
   */
  async getRoleByName(roleName) {
    return this.request(`/roles/name/${roleName}`);
  }

  /**
   * Create a new role
   * @param {object} roleData - Role data
   * @returns {Promise} - Created role
   */
  async createRole(roleData) {
    return this.request('/roles', {
      method: 'POST',
      body: JSON.stringify(roleData),
    });
  }

  /**
   * Update a role
   * @param {number} roleId - Role ID
   * @param {object} roleData - Updated role data
   * @returns {Promise} - Updated role
   */
  async updateRole(roleId, roleData) {
    return this.request(`/roles/${roleId}`, {
      method: 'PUT',
      body: JSON.stringify(roleData),
    });
  }

  /**
   * Delete a role
   * @param {number} roleId - Role ID
   * @returns {Promise} - Success message
   */
  async deleteRole(roleId) {
    return this.request(`/roles/${roleId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Initialize default roles
   * @returns {Promise} - Success message
   */
  async initializeRoles() {
    return this.request('/roles/initialize', {
      method: 'POST',
    });
  }

  // ==================== PAYMENT API METHODS ====================

  /**
   * Get all payments
   * @returns {Promise} - List of payments
   */
  async getPayments() {
    return this.request('/payments');
  }

  /**
   * Get payment by ID
   * @param {number} paymentId - Payment ID
   * @returns {Promise} - Payment data
   */
  async getPaymentById(paymentId) {
    return this.request(`/payments/${paymentId}`);
  }

  /**
   * Get payments by user
   * @param {number} userId - User ID
   * @returns {Promise} - List of payments
   */
  async getPaymentsByUser(userId) {
    return this.request(`/payments/user/${userId}`);
  }

  /**
   * Get payments by event
   * @param {number} eventId - Event ID
   * @returns {Promise} - List of payments
   */
  async getPaymentsByEvent(eventId) {
    return this.request(`/payments/event/${eventId}`);
  }

  /**
   * Get payment by transaction reference
   * @param {string} reference - Transaction reference
   * @returns {Promise} - Payment data
   */
  async getPaymentByReference(reference) {
    return this.request(`/payments/reference/${reference}`);
  }

  /**
   * Create a new payment
   * @param {object} paymentData - Payment data
   * @returns {Promise} - Created payment
   */
  async createPayment(paymentData) {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  /**
   * Update a payment
   * @param {number} paymentId - Payment ID
   * @param {object} paymentData - Updated payment data
   * @returns {Promise} - Updated payment
   */
  async updatePayment(paymentId, paymentData) {
    return this.request(`/payments/${paymentId}`, {
      method: 'PUT',
      body: JSON.stringify(paymentData),
    });
  }

  /**
   * Delete a payment
   * @param {number} paymentId - Payment ID
   * @returns {Promise} - Success message
   */
  async deletePayment(paymentId) {
    return this.request(`/payments/${paymentId}`, {
      method: 'DELETE',
    });
  }

  // ==================== ATTENDANCE LOG API METHODS ====================

  /**
   * Get all attendance logs
   * @returns {Promise} - List of attendance logs
   */
  async getAttendanceLogs() {
    return this.request('/attendance');
  }

  /**
   * Get attendance log by ID
   * @param {number} logId - Log ID
   * @returns {Promise} - Attendance log data
   */
  async getAttendanceLogById(logId) {
    return this.request(`/attendance/${logId}`);
  }

  /**
   * Get attendance logs by user
   * @param {number} userId - User ID
   * @returns {Promise} - List of attendance logs
   */
  async getAttendanceLogsByUser(userId) {
    return this.request(`/attendance/user/${userId}`);
  }

  /**
   * Get attendance logs by event
   * @param {number} eventId - Event ID
   * @returns {Promise} - List of attendance logs
   */
  async getAttendanceLogsByEvent(eventId) {
    return this.request(`/attendance/event/${eventId}`);
  }

  /**
   * Get recent attendance logs by event
   * @param {number} eventId - Event ID
   * @returns {Promise} - List of recent attendance logs
   */
  async getRecentAttendanceLogsByEvent(eventId) {
    return this.request(`/attendance/event/${eventId}/recent`);
  }

  /**
   * Get attendance stats by event
   * @param {number} eventId - Event ID
   * @returns {Promise} - Attendance stats (checkInCount, totalLogs)
   */
  async getAttendanceStatsByEvent(eventId) {
    return this.request(`/attendance/event/${eventId}/stats`);
  }

  /**
   * Create a new attendance log
   * @param {object} logData - Attendance log data
   * @returns {Promise} - Created log
   */
  async createAttendanceLog(logData) {
    return this.request('/attendance', {
      method: 'POST',
      body: JSON.stringify(logData),
    });
  }

  /**
   * Update an attendance log
   * @param {number} logId - Log ID
   * @param {object} logData - Updated log data
   * @returns {Promise} - Updated log
   */
  async updateAttendanceLog(logId, logData) {
    return this.request(`/attendance/${logId}`, {
      method: 'PUT',
      body: JSON.stringify(logData),
    });
  }

  /**
   * Delete an attendance log
   * @param {number} logId - Log ID
   * @returns {Promise} - Success message
   */
  async deleteAttendanceLog(logId) {
    return this.request(`/attendance/${logId}`, {
      method: 'DELETE',
    });
  }

  // Additional API methods can be added here as needed
  // For events, tickets, etc.
}

// Create and export a singleton instance of the API service
export const apiService = new ApiService();