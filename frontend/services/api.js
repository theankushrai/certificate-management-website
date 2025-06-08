import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
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