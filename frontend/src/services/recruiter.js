import api from "./api";

// CREATE JOB (FIX)
export const createJob = async (jobData) => {
  const res = await api.post("/jobs", jobData);
  return res.data;
};

// GET RECRUITER JOBS
export const getMyJobs = async () => {
  const res = await api.get("/jobs/my");
  return res.data;
};

// GET APPLICANTS
export const getApplicants = async (jobId) => {
  const res = await api.get(`/applications/job/${jobId}`);
  return res.data;
};

// ACCEPT / REJECT
export const updateApplicationStatus = async (id, status) => {
  const res = await api.put(`/applications/${id}/status`, { status });
  return res.data;
};
