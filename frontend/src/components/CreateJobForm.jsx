import { useState } from "react";
import { createJob } from "../services/recruiter";

export default function CreateJobForm({ onCreated }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    companyName: "",
    location: "",
    jobType: "Full-Time",
    salaryMin: "",
    salaryMax: "",
    skillsRequired: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await createJob({
      ...form,
      salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
      salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
      skillsRequired: form.skillsRequired.split(",").map(s => s.trim()),
    });

    onCreated();
    setForm({
      title: "",
      description: "",
      companyName: "",
      location: "",
      jobType: "Full-Time",
      salaryMin: "",
      salaryMax: "",
      skillsRequired: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow mb-6 space-y-3">
      <h2 className="text-xl font-bold">Post a Job</h2>

      <input name="title" placeholder="Job Title" value={form.title} onChange={handleChange} required className="w-full border p-2 rounded" />
      <input name="companyName" placeholder="Company Name" value={form.companyName} onChange={handleChange} required className="w-full border p-2 rounded" />
      <input name="location" placeholder="Location" value={form.location} onChange={handleChange} required className="w-full border p-2 rounded" />
      <select name="jobType" value={form.jobType} onChange={handleChange} className="w-full border p-2 rounded">
        <option value="Full-Time">Full-Time</option>
        <option value="Part-Time">Part-Time</option>
        <option value="Internship">Internship</option>
        <option value="Contract">Contract</option>
      </select>
      <div className="grid grid-cols-2 gap-3">
        <input name="salaryMin" placeholder="Min Salary" value={form.salaryMin} onChange={handleChange} className="w-full border p-2 rounded" />
        <input name="salaryMax" placeholder="Max Salary" value={form.salaryMax} onChange={handleChange} className="w-full border p-2 rounded" />
      </div>
      <input name="skillsRequired" placeholder="Skills (comma separated)" value={form.skillsRequired} onChange={handleChange} className="w-full border p-2 rounded" />
      <textarea name="description" placeholder="Job Description" value={form.description} onChange={handleChange} className="w-full border p-2 rounded" />

      <button className="bg-slate-900 text-white px-4 py-2 rounded">
        Post Job
      </button>
    </form>
  );
}
