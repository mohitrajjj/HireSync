import { useEffect, useState } from "react";
import { getAllJobs, applyToJob } from "../services/jobs";
import JobCard from "../components/JobCard";
import { logout } from "../services/auth";

export default function StudentDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleApply = async (jobId) => {
    try {
      await applyToJob(jobId);
      alert("Applied successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Application failed");
    }
  };

  useEffect(() => {
    getAllJobs()
      .then(setJobs)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Available Jobs</h1>
          <button
            onClick={logout}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>

        {loading ? (
          <p>Loading jobs...</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                onApply={handleApply}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
