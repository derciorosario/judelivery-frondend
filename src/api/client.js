import axios from "axios";
export const env = "dev";
import { Capacitor, CapacitorHttp } from '@capacitor/core';
export const isNative = Capacitor.isNativePlatform();
export const API_URL = 
 env == "dev" ? isNative ? "http://192.168.18.3:5001/api" : "http://localhost:5001/api" :
  // env == "dev" ? true ? "https://judelivery-api.derflash.com/api" : "http://localhost:5001/api" :
   env == "test" ? "https://judelivery-api.derflash.com/api" :
                  "https://judelivery-api.derflash.com/api";

const client = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

const uploadClient = axios.create({
  baseURL: API_URL,
});

// TOKEN HELPERS
export function getStoredToken() {
  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    null
  );
}

export function getStoredRefreshToken() {
  return localStorage.getItem("refresh_token") || null;
}

export function setStoredToken(token) {
  if (!token) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("token");
    delete client.defaults.headers.common.Authorization;
    return;
  }
  localStorage.setItem("accessToken", token);
  localStorage.setItem("token", token);
  client.defaults.headers.common.Authorization = `Bearer ${token}`;
}

export function setStoredRefreshToken(token) {
  if (!token) {
    localStorage.removeItem("refresh_token");
    return;
  }
  localStorage.setItem("refresh_token", token);
}

const bootToken = getStoredToken();
if (bootToken) {
  client.defaults.headers.common.Authorization = `Bearer ${bootToken}`;
}

// Queue for requests that need to wait for token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// AXIOS INTERCEPTORS - Request
client.interceptors.request.use((config) => {
  const t = getStoredToken();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

uploadClient.interceptors.request.use((config) => {
  const t = getStoredToken();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

// AXIOS INTERCEPTORS - Response with automatic token refresh
client.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    
    // If 401 and not already retried
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = getStoredRefreshToken();
      
      // No refresh token available, trigger logout
      if (!refreshToken) {
        setStoredToken(null);
        setStoredRefreshToken(null);
        window.dispatchEvent(new Event("auth:unauthorized"));
        return Promise.reject(err);
      }
      
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return client(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }
      
      // Start refresh process
      isRefreshing = true;
      
      try {
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken
        });
        
        const { accessToken } = response.data;
        
        // Update stored tokens
        setStoredToken(accessToken);
        
        // Update Authorization header for current request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        // Process queued requests
        processQueue(null, accessToken);
        
        // Retry original request
        return client(originalRequest);
      } catch (refreshError) {
        // Refresh failed, process queue with error
        processQueue(refreshError, null);
        
        // Clear tokens and trigger logout
        setStoredToken(null);
        setStoredRefreshToken(null);
        window.dispatchEvent(new Event("auth:unauthorized"));
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Handle 401 for other cases (no refresh token, invalid, etc.)
    if (err.response?.status === 401) {
      setStoredToken(null);
      setStoredRefreshToken(null);
      window.dispatchEvent(new Event("auth:unauthorized"));
    }
    
    return Promise.reject(err);
  }
);

uploadClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      setStoredToken(null);
      setStoredRefreshToken(null);
      window.dispatchEvent(new Event("auth:unauthorized"));
    }
    return Promise.reject(err);
  }
);

// ---- Capacitor Native Bridge ---- //
async function nativeRequest(method, url, data = null, headers = {}) {
  const response = await CapacitorHttp.request({
    url,
    method,
    headers,
    data,
  });

  return {
    status: response.status,
    data: response.data,
    headers: response.headers,
  };
}

if (isNative) {
  client.request = async function (config) {
    const token = getStoredToken();
    const headers = {
      ...(config.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    return nativeRequest(
      config.method.toUpperCase(),
      API_URL + config.url,
      config.data,
      headers
    );
  };

  uploadClient.request = async function (config) {

    const token = getStoredToken();
    const headers = {
      ...(config.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    return nativeRequest(
      config.method.toUpperCase(),
      API_URL + config.url,
      config.data,
      headers
    ); 

  };


}

export { uploadClient };
export default client;

// ==================== API ====================

// ==================== ADMIN API ====================

// Get admin dashboard
export const getAdminDashboard = () => client.get('/profile/admin/dashboard');

// Get/update platform settings from the Admin Settings page only
export const getPlatformSettings = () => client.get('/settings');
export const getPublicSettings = () => client.get('/settings/public');
export const updatePlatformSettings = (settings) => client.put('/settings', { settings });

// ==================== MANAGERS API ====================

// Get all managers
export const getManagers = () => client.get('/users/managers');

// Create manager
export const createManager = (data) => client.post('/users/managers', data);

// Update manager
export const updateManager = (id, data) => client.put(`/users/managers/${id}`, data);

// Delete manager
export const deleteManager = (id) => client.delete(`/users/managers/${id}`);

// ==================== DRIVERS API ====================

// Get all drivers
export const getDrivers = (params) => client.get('/drivers', { params });

// Get driver by ID
export const getDriver = (id) => client.get(`/drivers/${id}`);

// Create driver
export const createDriver = (formData) => uploadClient.post('/drivers', formData);

// Update driver
export const updateDriver = (id, formData) => uploadClient.put(`/drivers/${id}`, formData);

// Delete driver
export const deleteDriver = (id) => client.delete(`/drivers/${id}`);

// Driver profile
export const getDriverProfile = () => client.get('/profile/driver');
export const updateDriverProfile = (data) => client.put('/profile/driver', data);
export const changeProfilePassword = (data) => client.post('/profile/change-password', data);
export const getDriverPerformance = () => client.get('/profile/driver/performance');
export const getDriverReports = () => client.get('/profile/driver/reports');
export const getDriverDashboard = () => client.get('/profile/driver/dashboard');

// Get operational report
export const getOperationalReport = (params) => {
  return client.get('/financial/operational', { params });
};

// Get performance report
export const getPerformanceReport = (params) => {
  return client.get('/financial/performance', { params });
};

// Find available drivers for order assignment
export const getAvailableDrivers = (params) => client.get('/drivers/available', { params });

// ==================== CUSTOMERS API ====================

// Get all customers
export const getCustomers = () => client.get('/customers');

// Get customer by ID
export const getCustomer = (id) => client.get(`/customers/${id}`);

// Get orders for a specific customer (admin)
export const getCustomerOrdersByAdmin = (customerId, params) => client.get(`/customers/${customerId}/orders`, { params });

// Create customer
export const createCustomer = (formData) => uploadClient.post('/customers', formData);

// Update customer
export const updateCustomer = (id, formData) => uploadClient.put(`/customers/${id}`, formData);

// Delete customer
export const deleteCustomer = (id) => client.delete(`/customers/${id}`);

// Customer dashboard
export const getCustomerDashboard = () => client.get('/profile/customer/dashboard');

// Customer profile
export const getCustomerProfile = () => client.get('/profile/customer');
export const updateCustomerProfile = (data) => client.put('/profile/customer', data);
export const changeCustomerPassword = (data) => client.post('/profile/change-password', data);
export const getCustomerAddresses = () => client.get('/profile/customer/addresses');
export const createCustomerAddress = (data) => client.post('/profile/customer/addresses', data);
export const updateCustomerAddress = (id, data) => client.put(`/profile/customer/addresses/${id}`, data);
export const deleteCustomerAddress = (id) => client.delete(`/profile/customer/addresses/${id}`);
export const getCustomerPaymentMethods = () => client.get('/profile/customer/payment-methods');
export const createCustomerPaymentMethod = (data) => client.post('/profile/customer/payment-methods', data);
export const updateCustomerPaymentMethod = (id, data) => client.put(`/profile/customer/payment-methods/${id}`, data);
export const deleteCustomerPaymentMethod = (id) => client.delete(`/profile/customer/payment-methods/${id}`);
export const getProfilePreferences = () => client.get('/profile/preferences');
export const updateProfilePreferences = (data) => client.put('/profile/preferences', data);
export const createSupportTicket = (data) => client.post('/profile/support-ticket', data);
export const getSupportTickets = () => client.get('/profile/support-tickets');

// ==================== ORDERS API ====================

export const getOrders = (params) => client.get('/orders',{ params });

export const getOrder = (id) => client.get(`/orders/${id}`);

export const createOrder = (data) => client.post('/orders', data);

export const updateOrder = (id, data) => client.put(`/orders/${id}`, data);

export const cancelOrder = (id, data) => client.post(`/orders/${id}/cancel`, data);

export const deleteOrder = (id) => client.delete(`/orders/${id}`);

export const getCustomerOrders = (params) => client.get('/orders/mine', { params });

export const getDriverOrders = (params) => client.get('/orders/driver',{ params });

export const getDriverStatuses = () => client.get('/drivers/statuses');

// FEEDBACKS
export const getFeedbacks = (params) => client.get('/feedbacks', { params });
export const getOrderFeedbacks = (orderId) => client.get(`/feedbacks/order/${orderId}`);
export const createFeedback = (data) => client.post('/feedbacks', data);
export const updateFeedback = (id, data) => client.patch(`/feedbacks/${id}`, data);
export const deleteFeedback = (id) => client.delete(`/feedbacks/${id}`);
export const getDriverFeedbackStats = (driverId) => client.get(`/feedbacks/driver/${driverId}/stats`);

// ==================== INCIDENTS API ====================

export const getIncidents = (params) => client.get('/incidents', { params });
export const getIncident = (id) => client.get(`/incidents/${id}`);
export const getOrderIncidents = (orderId) => client.get(`/incidents/order/${orderId}`);
export const createIncident = (formData) => uploadClient.post('/incidents', formData);
export const updateIncident = (id, data) => client.put(`/incidents/${id}`, data);
export const updateIncidentWithFiles = (id, formData) => uploadClient.put(`/incidents/${id}`, formData);
export const deleteIncident = (id) => client.delete(`/incidents/${id}`);

// ==================== NOTIFICATIONS API ====================

export const getNotifications = (params) => client.get('/notifications', { params });
export const markNotificationRead = (id) => client.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => client.patch('/notifications/read-all');
export const getUnreadNotificationCount = () => client.get('/notifications/unread-count');
export const deleteNotification = (id) => client.delete(`/notifications/${id}`);
export const deleteNotifications = (ids) => client.post('/notifications/delete-many', { ids });

// ==================== PAYMENTS API ====================

export const createPayment = (data) => client.post('/payments', data);
export const getPayment = (id) => client.get(`/payments/${id}`);
export const getOrderPayments = (orderId) => client.get(`/payments/order/${orderId}`);
export const getPayments = (params) => client.get('/payments', { params });

// ==================== FINANCIAL API ====================

export const getFinancialCategories = (params) => client.get('/financial/categories', { params });
export const createFinancialCategory = (data) => client.post('/financial/categories', data);
export const updateFinancialCategory = (id, data) => client.put(`/financial/categories/${id}`, data);
export const deleteFinancialCategory = (id) => client.delete(`/financial/categories/${id}`);

export const getFinancialTransactions = (params) => client.get('/financial/transactions', { params });
export const getFinancialTransaction = (id) => client.get(`/financial/transactions/${id}`);
export const createFinancialTransaction = (data) => client.post('/financial/transactions', data);
export const updateFinancialTransaction = (id, data) => client.put(`/financial/transactions/${id}`, data);
export const deleteFinancialTransaction = (id) => client.delete(`/financial/transactions/${id}`);
export const markTransactionAsPaid = (id) => client.patch(`/financial/transactions/${id}/mark-paid`);
export const getFinancialStats = (params) => client.get('/financial/stats', { params });

// ==================== AUDIT LOGS API ====================

// Get all audit logs with filters
export const getAuditLogs = (params) => client.get('/audit-logs', { params });

// Get audit log by ID
export const getAuditLog = (id) => client.get(`/audit-logs/${id}`);

// Get audit logs for a specific entity
export const getEntityAuditLogs = (entityType, entityId, params) =>
  client.get(`/audit-logs/entity/${entityType}/${entityId}`, { params });

// Get audit logs for a specific user
export const getUserAuditLogs = (userId, params) =>
  client.get(`/audit-logs/user/${userId}`, { params });

// Get audit statistics
export const getAuditStats = (params) => client.get('/audit-logs/stats/summary', { params });

// Get available filter options
export const getAuditFilterOptions = () => client.get('/audit-logs/meta/options');