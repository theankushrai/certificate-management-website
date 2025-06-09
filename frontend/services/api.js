import axios from 'axios';

// API service for Certificate Manager
// Logs all function calls and responses for debugging

// Use Amplify/React env vars
const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;

if (!API_BASE_URL) {
  console.error('[API] Missing API_BASE_URL');
}
if (!API_KEY) {
  console.warn('[API] Missing API_KEY (API requests will fail if required by backend)');
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
    // Log outgoing request
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[API] Response:', response);
    }
    return response.data ? response : response;
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
    return await api.get(`/certificates/${id}`);
  } catch (error) {
    throw error;
  }
};

export const createCertificate = async (certificateData) => {
  try {
    return await api.post('/certificates', certificateData);
  } catch (error) {
    throw error;
  }
};

export const updateCertificate = async (id, certificateData) => {
  try {
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
      const response = await api.post(`/certificates/${id}/rotate`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };