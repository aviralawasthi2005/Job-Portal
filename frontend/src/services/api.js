import axios from 'axios';

// Axios client designed to hit the local backend (proxied via Vite during development)
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10s timeout
});

export const JobService = {
  /**
   * Retrieves jobs using filter parameters
   */
  async getJobs(params = {}) {
    try {
      const response = await api.get('/jobs', { params });
      return response.data;
    } catch (error) {
      console.error('API Error in getJobs:', error);
      throw error.response?.data || new Error('Network error fetching jobs');
    }
  },

  /**
   * Retrieves single job details using GUID
   */
  async getJobDetails(guid) {
    try {
      const response = await api.get(`/jobs/${encodeURIComponent(guid)}`);
      return response.data;
    } catch (error) {
      console.error(`API Error in getJobDetails for GUID ${guid}:`, error);
      throw error.response?.data || new Error('Network error fetching job details');
    }
  },

  /**
   * Manually creates a new job listing
   */
  async createManualJob(jobData) {
    try {
      const response = await api.post('/jobs/manual', jobData);
      return response.data;
    } catch (error) {
      console.error('API Error in createManualJob:', error);
      throw error.response?.data || new Error('Network error posting job');
    }
  }
};

export default api;
