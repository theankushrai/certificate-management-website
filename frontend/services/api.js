import axios from 'axios';

// API service for Certificate Manager
// Logs all function calls and responses for debugging
// Use Vite's way of accessing env variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_BASE_URL) {
  console.error('[API] Missing VITE_API_BASE_URL');
}
if (!API_KEY) {
  console.warn('[API] Missing VITE_API_KEY (API requests will fail if required by backend)');
}

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inject x-api-key header into all requests
api.interceptors.request.use(
  (config) => {
    if (API_KEY) {
      config.headers['x-api-key'] = API_KEY;
    }
    // Log outgoing request (Vite-specific way to check for dev mode)
    if (import.meta.env.DEV) {
      console.log(
        `[API] Request: ${config.method?.toUpperCase()} ${config.baseURL ? config.baseURL : ''}${config.url}`,
        'Headers:', config.headers
      );
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) { // Use Vite's way to check for development mode
      console.log('[API] Response Data:', response.data);
    }
    return response.data; // Directly return the data payload from the response
  },
  (error) => {
    console.error('[API] Error:', error.response?.data || error.message);
    return Promise.reject(error.response?.data || error.message);
  }
);

export const getCertificates = async () => {
  try {
    return await api.get('/certificates');
  } catch (error) {
    throw error;
  }
};

export const getCertificate = async (id) => {
  try {
    // The response interceptor will return response.data
    return await api.get(`/certificates/${id}`);
  } catch (error) {
    throw error;
  }
};

export const createCertificate = async (certificateData) => {
  try {
    // The response interceptor will return response.data
    return await api.post('/certificates', certificateData);
  } catch (error) {
    throw error;
  }
};

export const updateCertificate = async (id, certificateData) => {
  try {
    // The response interceptor will return response.data
    return await api.put(`/certificates/${id}`, certificateData);
  } catch (error) {
    throw error;
  }
};

export const deleteCertificate = async (id) => {
  try {
    return await api.delete(`/certificates/${id}`);
  } catch (error) {
    throw error;
  }
};

export const rotateCertificate = async (id) => {
    try {
      // The response interceptor will return response.data
      return await api.post(`/certificates/${id}/rotate`);
    } catch (error) {
      throw error;
    }
  };