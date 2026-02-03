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

export const updateApplicationFields = async (id, fields) => {
  const res = await api.patch(`/applications/${id}`, fields);
  return res.data;
};

export const bulkUpdateApplicationStatus = async (ids, status) => {
  const res = await api.put(`/applications/bulk-status`, { ids, status });
  return res.data;
};
