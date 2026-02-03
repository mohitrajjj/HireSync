import api from "./api";

export const getAllJobs = async (params = {}) => {
  const res = await api.get("/jobs", { params });
  return res.data;
};

// Apply with optional resume file
export const applyToJob = async (jobId, file) => {
  const formData = new FormData();
  if (file) formData.append("resume", file);

  const res = await api.post(`/applications/${jobId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};

// Get current student's applications
export const getMyApplications = async () => {
  const res = await api.get(`/applications/me`);
  return res.data;
};
