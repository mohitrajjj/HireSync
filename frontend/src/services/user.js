import api from "./api";

export const getMyProfile = async () => {
  const res = await api.get('/users/me');
  return res.data;
};

export const updateMyProfile = async (data) => {
  const formData = new FormData();
  if (data.name) formData.append('name', data.name);
  if (data.bio) formData.append('bio', data.bio);
  if (data.skills) formData.append('skills', Array.isArray(data.skills) ? data.skills.join(',') : data.skills);
  if (data.resume) formData.append('resume', data.resume);

  const res = await api.put('/users/me', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};
