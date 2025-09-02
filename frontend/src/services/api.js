import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds for file uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    return Promise.reject(error);
  }
);

// File operations
export const fileAPI = {
  // Upload file
  upload: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // List files
  list: async () => {
    const response = await api.get('/files/list');
    return response.data;
  },

  // Delete file
  delete: async (filename) => {
    const response = await api.delete(`/files/delete/${filename}`);
    return response.data;
  },

  // Download file
  download: async (filename) => {
    const response = await api.get(`/files/download/${filename}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Download all processed files as ZIP
  downloadAll: async () => {
    const response = await api.get('/files/download-all', {
      responseType: 'blob',
    });
    return response.data;
  },

  // Delete all input files
  deleteAll: async () => {
    const response = await api.delete('/files/delete-all');
    return response.data;
  },
};

// Processing operations
export const processingAPI = {
  // Start processing
  start: async () => {
    const response = await api.post('/process/start');
    return response.data;
  },

  // Get processing status
  getStatus: async () => {
    const response = await api.get('/process/status');
    return response.data;
  },

  // Consolidate files
  consolidate: async () => {
    const response = await api.post('/process/consolidate');
    return response.data;
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;
