import { useEffect, useState } from "react";
import {
  getMyJobs,
  getApplicants,
  updateApplicationStatus,
} from "../services/recruiter";
import CreateJobForm from "../components/CreateJobForm";
import ApplicationChart from "../components/ApplicationChart";
import AnalyticsPanel from "../components/AnalyticsPanel";
import { logout } from "../services/auth";
import { useToast } from "../components/ToastProvider";

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [appFilterSkill, setAppFilterSkill] = useState("");
  const [appFilterName, setAppFilterName] = useState("");
  const [appFilterStatus, setAppFilterStatus] = useState("");
  const [appExcludeStatus, setAppExcludeStatus] = useState(false);
  const { addToast } = useToast();

  const loadJobs = async () => {
    const data = await getMyJobs();
    setJobs(data);
  };

  const viewApplicants = async (jobId) => {
    try {
      const params = {};
      if (appFilterSkill) params.skill = appFilterSkill;
      if (appFilterName) params.name = appFilterName;
      if (appFilterStatus) {
        if (appExcludeStatus) params.excludeStatus = appFilterStatus;
        else params.status = appFilterStatus;
      }

      const data = await getApplicants(jobId, params);
      setApplicants(data);
      setSelectedJob(jobId);
    } catch (err) {
      console.error("VIEW APPLICANTS ERROR:", err, err.response?.data);
      setApplicants([]);
      setSelectedJob(null);
      const msg = err.response?.data?.message || "Failed to load applicants. Make sure you're logged in as a recruiter.";
      addToast(msg, "error");
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateApplicationStatus(id, status);
      // refresh applicants after status change
      if (selectedJob) {
        const params = { skill: appFilterSkill, name: appFilterName };
        if (appFilterStatus) {
          if (appExcludeStatus) params.excludeStatus = appFilterStatus;
          else params.status = appFilterStatus;
        }
        const data = await getApplicants(selectedJob, params);
        setApplicants(data);
      }
      addToast("Status updated", "success");
    } catch (err) {
      console.error("UPDATE STATUS ERROR:", err);
      addToast("Failed to update application status.", "error");
    }
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

        {/* Analytics */}
        <AnalyticsPanel />


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

            <div className="mb-3 flex gap-3 items-center">
              <input placeholder="Filter by skill" value={appFilterSkill} onChange={(e) => setAppFilterSkill(e.target.value)} className="border px-3 py-1 rounded" />
              <input placeholder="Filter by name" value={appFilterName} onChange={(e) => setAppFilterName(e.target.value)} className="border px-3 py-1 rounded" />
              <select value={appFilterStatus} onChange={(e) => setAppFilterStatus(e.target.value)} className="border px-3 py-1 rounded">
                <option value="">All</option>
                <option value="applied">Applied</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={appExcludeStatus} onChange={(e) => setAppExcludeStatus(e.target.checked)} />
                <span className="text-sm">Exclude status</span>
              </label>
              <button onClick={() => viewApplicants(selectedJob)} className="bg-slate-700 text-white px-3 py-1 rounded">Apply Filters</button>
            </div>

            {applicants.map(a => (
              <div key={a._id} className="border-b py-3">
                <p className="font-medium">{a.student?.name || '(no name)'}</p>
                <p className="text-sm">{a.student?.email}</p>

                {a.resume && (
                  <a
                    href={`http://localhost:5001/${a.resume}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 text-sm"
                  >
                    View Resume
                  </a>
                )}

                <div className="flex gap-2 mt-2">
                  {a.status === "applied" && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(a._id, "accepted")}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(a._id, "rejected")}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Reject
                      </button>
                    </>
                  )}
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
