import api from "./api";

export const getAllJobs = async () => {
  const res = await api.get("/jobs");
  return res.data;
};

export const applyToJob = async (jobId) => {
  const token = localStorage.getItem("token");

  const res = await api.post(
    `/applications/${jobId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};
