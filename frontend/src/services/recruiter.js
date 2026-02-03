import api from "./api";

export const createJob = async (jobData) => {
  const res = await api.post("/jobs", jobData);
  return res.data;
};

export const getMyJobs = async () => {
  const res = await api.get("/jobs/my");
  return res.data;
};

export const getApplicants = async (jobId, params = {}) => {
  const res = await api.get(`/applications/job/${jobId}`, { params });
  return res.data;
};

export const updateApplicationStatus = async (id, status) => {
  const res = await api.put(`/applications/${id}/status`, { status });
  return res.data;
};
