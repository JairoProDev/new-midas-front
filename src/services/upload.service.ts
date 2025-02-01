import axios from 'axios';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api`;

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add request interceptor to add auth token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const uploadService = {
  async uploadFile(file: File, type: 'receipt' | 'avatar'): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await axiosInstance.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.url;
  },

  async getFileUrl(fileId: string): Promise<string> {
    const response = await axiosInstance.get(`/files/${fileId}`);
    return response.data.url;
  },

  async deleteFile(fileId: string): Promise<void> {
    await axiosInstance.delete(`/files/${fileId}`);
  },
}; 