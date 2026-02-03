import { useEffect, useState } from "react";
import {
  getMyJobs,
  getApplicants,
  updateApplicationStatus,
} from "../services/recruiter";
import CreateJobForm from "../components/CreateJobForm";
import ApplicationChart from "../components/ApplicationChart";
import { logout } from "../services/auth";

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);

  const loadJobs = async () => {
    const data = await getMyJobs();
    setJobs(data);
  };

  const viewApplicants = async (jobId) => {
    const data = await getApplicants(jobId);
    setApplicants(data);
    setSelectedJob(jobId);
  };

  const chartData = [
    { name: "Accepted", value: applicants.filter(a => a.status === "accepted").length },
    { name: "Rejected", value: applicants.filter(a => a.status === "rejected").length },
    { name: "Applied", value: applicants.filter(a => a.status === "applied").length },
  ];

  useEffect(() => {
    loadJobs();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between mb-4">
          <h1 className="text-2xl font-bold">Recruiter Dashboard</h1>
          <button onClick={logout} className="bg-black text-white px-4 py-2 rounded">
            Logout
          </button>
        </div>

        <CreateJobForm onCreated={loadJobs} />

        <h2 className="text-xl font-semibold mb-3">My Jobs</h2>

        {jobs.map(job => (
          <div key={job._id} className="bg-white p-4 rounded shadow mb-3">
            <h3 className="font-bold">{job.title}</h3>
            <button
              onClick={() => viewApplicants(job._id)}
              className="mt-2 bg-slate-800 text-white px-3 py-1 rounded"
            >
              View Applicants
            </button>
          </div>
        ))}

        {selectedJob && (
          <div className="mt-6 bg-white p-4 rounded shadow">
            <h2 className="font-bold mb-2">Applicants</h2>

            {applicants.map(a => (
              <div key={a._id} className="border-b py-3">
                <p className="font-medium">{a.student.name}</p>
                <p className="text-sm">{a.student.email}</p>

                {a.resume && (
                  <a
                    href={`http://localhost:5001${a.resume}`}
                    target="_blank"
                    className="text-blue-600 text-sm"
                  >
                    View Resume
                  </a>
                )}

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => updateApplicationStatus(a._id, "accepted")}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => updateApplicationStatus(a._id, "rejected")}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Reject
                  </button>
                </div>

                <span className="text-xs text-blue-600">
                  Status: {a.status}
                </span>
              </div>
            ))}

            <ApplicationChart data={chartData} />
          </div>
        )}
      </div>
    </div>
  );
}
