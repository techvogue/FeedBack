import axios from './axiosInstance'; // your configured axios instance

export const fetchAISummary = async (eventId) => {
  const res = await axios.get(`/ai-feedback-summary/${eventId}`);
  return res.data.summary;
};
