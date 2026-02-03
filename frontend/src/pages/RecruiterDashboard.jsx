import { useEffect, useState } from "react";
import {
  getMyJobs,
  getApplicants,
  updateApplicationStatus,
  updateApplicationFields,
  bulkUpdateApplicationStatus,
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
  const [appSort, setAppSort] = useState("newest");
  const [appPage, setAppPage] = useState(1);
  const [appLimit, setAppLimit] = useState(10);
  const [appTotal, setAppTotal] = useState(0);
  const [selectedIds, setSelectedIds] = useState([]);
  const [notesDraft, setNotesDraft] = useState({});
  const [linkDraft, setLinkDraft] = useState({});
  const [dateDraft, setDateDraft] = useState({});
  const [debouncedName, setDebouncedName] = useState("");
  const [debouncedSkill, setDebouncedSkill] = useState("");
  const { addToast } = useToast();

  const loadJobs = async () => {
    const data = await getMyJobs();
    setJobs(data);
  };

  const buildApplicantParams = () => {
    const params = { page: appPage, limit: appLimit, sort: appSort };
    if (debouncedSkill) params.skill = debouncedSkill;
    if (debouncedName) params.name = debouncedName;
    if (appFilterStatus) {
      if (appExcludeStatus) params.excludeStatus = appFilterStatus;
      else params.status = appFilterStatus;
    }
    return params;
  };

  const viewApplicants = async (job) => {
    try {
      const params = buildApplicantParams();
      const data = await getApplicants(job._id, params);
      const items = Array.isArray(data) ? data : data.items || [];
      const total = Array.isArray(data) ? data.length : data.total || 0;
      setApplicants(items);
      setAppTotal(total);
      setSelectedJob(job);
      setSelectedIds([]);
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
        const params = buildApplicantParams();
        const data = await getApplicants(selectedJob._id, params);
        const items = Array.isArray(data) ? data : data.items || [];
        const total = Array.isArray(data) ? data.length : data.total || 0;
        setApplicants(items);
        setAppTotal(total);
      }
      addToast("Status updated", "success");
    } catch (err) {
      console.error("UPDATE STATUS ERROR:", err);
      addToast("Failed to update application status.", "error");
    }
  };

  const handleBulkUpdate = async (status) => {
    if (selectedIds.length === 0) {
      addToast("Select at least one applicant.", "error");
      return;
    }
    try {
      await bulkUpdateApplicationStatus(selectedIds, status);
      if (selectedJob) {
        const params = buildApplicantParams();
        const data = await getApplicants(selectedJob._id, params);
        const items = Array.isArray(data) ? data : data.items || [];
        const total = Array.isArray(data) ? data.length : data.total || 0;
        setApplicants(items);
        setAppTotal(total);
        setSelectedIds([]);
      }
      addToast("Bulk status updated", "success");
    } catch (err) {
      console.error("BULK STATUS ERROR:", err);
      addToast("Failed to bulk update status.", "error");
    }
  };

  const saveNotes = async (id) => {
    try {
      await updateApplicationFields(id, {
        notes: notesDraft[id] || "",
        interviewLink: linkDraft[id] || "",
        interviewDate: dateDraft[id] || "",
      });
      addToast("Notes saved", "success");
    } catch (err) {
      console.error("SAVE NOTES ERROR:", err);
      addToast("Failed to save notes.", "error");
    }
  };

  const formatDateTimeLocal = (value) => {
    if (!value) return "";
    const d = new Date(value);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === applicants.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(applicants.map((a) => a._id));
    }
  };

  const getStatusClass = (status) => {
    if (status === "accepted") return "bg-green-100 text-green-700";
    if (status === "rejected") return "bg-red-100 text-red-700";
    return "bg-blue-100 text-blue-700";
  };

  const formatSize = (bytes) => {
    if (!bytes && bytes !== 0) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const calcMatch = (studentSkills = [], jobSkills = []) => {
    if (!jobSkills || jobSkills.length === 0) return 0;
    const matches = jobSkills.filter((s) => studentSkills.includes(s));
    return Math.round((matches.length / jobSkills.length) * 100);
  };

  const exportCsv = () => {
    if (!selectedJob) return;
    const headers = ["Name", "Email", "Status", "Applied At", "Match %", "Notes", "Interview Link"];
    const rows = applicants.map((a) => {
      const match = calcMatch(a.student?.skills || [], selectedJob?.skillsRequired || []);
      return [
        a.student?.name || "",
        a.student?.email || "",
        a.status || "",
        a.createdAt ? new Date(a.createdAt).toISOString() : "",
        match,
        (a.notes || "").replace(/\n/g, " "),
        a.interviewLink || "",
      ];
    });
    const csv = [headers, ...rows]
      .map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `applicants-${selectedJob._id}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const chartData = [
    { name: "Accepted", value: applicants.filter(a => a.status === "accepted").length },
    { name: "Rejected", value: applicants.filter(a => a.status === "rejected").length },
    { name: "Applied", value: applicants.filter(a => a.status === "applied").length },
  ];

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedName(appFilterName);
      setDebouncedSkill(appFilterSkill);
    }, 400);
    return () => clearTimeout(timer);
  }, [appFilterName, appFilterSkill]);

  useEffect(() => {
    if (selectedJob) {
      viewApplicants(selectedJob);
    }
  }, [debouncedName, debouncedSkill, appFilterStatus, appExcludeStatus, appSort, appPage, appLimit]);

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
              onClick={() => {
                setAppPage(1);
                viewApplicants(job);
              }}
              className="mt-2 bg-slate-800 text-white px-3 py-1 rounded"
            >
              View Applicants
            </button>
          </div>
        ))}

        {selectedJob && (
          <div className="mt-6 bg-white p-4 rounded shadow">
            <h2 className="font-bold mb-2">Applicants</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-slate-50 p-3 rounded">
                <p className="text-xs text-slate-500">Total</p>
                <p className="text-lg font-semibold">{appTotal}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded">
                <p className="text-xs text-slate-500">Applied</p>
                <p className="text-lg font-semibold">{applicants.filter(a => a.status === "applied").length}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded">
                <p className="text-xs text-slate-500">Accepted</p>
                <p className="text-lg font-semibold">{applicants.filter(a => a.status === "accepted").length}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded">
                <p className="text-xs text-slate-500">Rejected</p>
                <p className="text-lg font-semibold">{applicants.filter(a => a.status === "rejected").length}</p>
              </div>
            </div>

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
              <select value={appSort} onChange={(e) => setAppSort(e.target.value)} className="border px-3 py-1 rounded">
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
              <button onClick={() => viewApplicants(selectedJob)} className="bg-slate-700 text-white px-3 py-1 rounded">Apply Filters</button>
            </div>

            <div className="mb-3 flex gap-2 flex-wrap">
              <button onClick={() => { setAppFilterStatus(""); setAppExcludeStatus(false); }} className="border px-3 py-1 rounded text-sm">All</button>
              <button onClick={() => { setAppFilterStatus("applied"); setAppExcludeStatus(false); }} className="border px-3 py-1 rounded text-sm">Applied</button>
              <button onClick={() => { setAppFilterStatus("accepted"); setAppExcludeStatus(false); }} className="border px-3 py-1 rounded text-sm">Accepted</button>
              <button onClick={() => { setAppFilterStatus("rejected"); setAppExcludeStatus(false); }} className="border px-3 py-1 rounded text-sm">Rejected</button>
            </div>

            <div className="mb-3 flex gap-2 items-center">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={selectedIds.length === applicants.length && applicants.length > 0} onChange={toggleSelectAll} />
                <span className="text-sm">Select all</span>
              </label>
              <button onClick={() => handleBulkUpdate("accepted")} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Bulk Accept</button>
              <button onClick={() => handleBulkUpdate("rejected")} className="bg-red-600 text-white px-3 py-1 rounded text-sm">Bulk Reject</button>
              <button onClick={exportCsv} className="bg-slate-800 text-white px-3 py-1 rounded text-sm">Export CSV</button>
            </div>

            {applicants.map(a => (
              <div key={a._id} className="border-b py-3">
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={selectedIds.includes(a._id)} onChange={() => toggleSelect(a._id)} />
                  <div>
                    <p className="font-medium">{a.student?.name || '(no name)'}</p>
                    <p className="text-sm">{a.student?.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${getStatusClass(a.status)}`}>Status: {a.status}</span>
                </div>

                <p className="text-xs text-slate-500 mt-1">
                  Applied: {a.createdAt ? new Date(a.createdAt).toLocaleString() : "—"}
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Match: {calcMatch(a.student?.skills || [], selectedJob?.skillsRequired || [])}%
                </p>

                {a.resume && (
                  <div className="flex gap-2 items-center mt-1">
                    <a
                      href={`http://localhost:5001/${a.resume}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 text-sm"
                    >
                      View Resume
                    </a>
                    <a
                      href={`http://localhost:5001/${a.resume}`}
                      download
                      className="text-blue-600 text-sm"
                    >
                      Download
                    </a>
                    {a.resumeSize ? (
                      <span className="text-xs text-slate-500">{formatSize(a.resumeSize)}</span>
                    ) : null}
                  </div>
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

                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-slate-500">Recruiter notes</label>
                    <textarea
                      value={notesDraft[a._id] ?? a.notes ?? ""}
                      onChange={(e) => setNotesDraft((prev) => ({ ...prev, [a._id]: e.target.value }))}
                      className="w-full border rounded p-2 text-sm"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Interview link</label>
                    <input
                      value={linkDraft[a._id] ?? a.interviewLink ?? ""}
                      onChange={(e) => setLinkDraft((prev) => ({ ...prev, [a._id]: e.target.value }))}
                      className="w-full border rounded p-2 text-sm"
                      placeholder="https://meet..."
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Interview date</label>
                    <input
                      type="datetime-local"
                      value={dateDraft[a._id] ?? formatDateTimeLocal(a.interviewDate)}
                      onChange={(e) => setDateDraft((prev) => ({ ...prev, [a._id]: e.target.value }))}
                      className="w-full border rounded p-2 text-sm"
                    />
                  </div>
                </div>
                <button
                  onClick={() => saveNotes(a._id)}
                  className="mt-2 bg-slate-800 text-white px-3 py-1 rounded text-sm"
                >
                  Save Notes
                </button>
              </div>
            ))}

            <div className="mt-4 flex gap-2 items-center">
              <button
                disabled={appPage <= 1}
                onClick={() => setAppPage((p) => Math.max(1, p - 1))}
                className="border px-3 py-1 rounded text-sm disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-sm">Page {appPage}</span>
              <button
                disabled={appPage * appLimit >= appTotal}
                onClick={() => setAppPage((p) => p + 1)}
                className="border px-3 py-1 rounded text-sm disabled:opacity-50"
              >
                Next
              </button>
              <select value={appLimit} onChange={(e) => { setAppPage(1); setAppLimit(Number(e.target.value)); }} className="border px-3 py-1 rounded text-sm">
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>

            <ApplicationChart data={chartData} />
          </div>
        )}
      </div>
    </div>
  );
}
