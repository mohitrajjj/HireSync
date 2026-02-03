import api from './api';

export const getRecruiterAnalytics = async () => {
  const res = await api.get('/analytics/recruiter');
  return res.data;
};
