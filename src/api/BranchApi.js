import axios from 'axios';

export const fetchBranch = async () => {
  return await axios.get('/api/branches'); // Replace with your actual API endpoint
}; 