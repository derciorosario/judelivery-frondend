import axios from "axios";
const env = "dev";
let isNative=false
export const API_URL = 
  env == "dev" ? isNative ? "http://10.24.0.78:5001/api" : "http://localhost:5001/api" :
  env == "test" ? "https://kaziwani-server.visum.co.mz/api" :
                  "https://meucasamento-api.runwithbroto.com/api";

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
export const getAdminDashboard = () => client.get('/admin/dashboard');

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

// ==================== CUSTOMERS API ====================

// Get all customers
export const getCustomers = () => client.get('/customers');

// Get customer by ID
export const getCustomer = (id) => client.get(`/customers/${id}`);

// Create customer
export const createCustomer = (formData) => uploadClient.post('/customers', formData);

// Update customer
export const updateCustomer = (id, formData) => uploadClient.put(`/customers/${id}`, formData);

// Delete customer
export const deleteCustomer = (id) => client.delete(`/customers/${id}`);

// ==================== ORDERS API ====================

export const getOrders = () => client.get('/orders');

export const getOrder = (id) => client.get(`/orders/${id}`);

export const createOrder = (data) => client.post('/orders', data);

export const updateOrder = (id, data) => client.put(`/orders/${id}`, data);

export const deleteOrder = (id) => client.delete(`/orders/${id}`);

export const getCustomerOrders = () => client.get('/orders/mine');

export const getDriverOrders = () => client.get('/orders/driver');

export const getDriverStatuses = () => client.get('/drivers/statuses');


