import { useEffect, useState } from "react";
import { getAllJobs, applyToJob, getMyApplications } from "../services/jobs";
import { getMyProfile } from "../services/user";
import JobCard from "../components/JobCard";
import { logout } from "../services/auth";
import { Link } from "react-router-dom";
import { useToast } from "../components/ToastProvider";
import Spinner from "../components/Spinner";

export default function StudentDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [profile, setProfile] = useState(null);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [updates, setUpdates] = useState([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const { addToast } = useToast();

  const handleApply = async (jobId, file) => {
    try {
      await applyToJob(jobId, file);
      addToast("Applied successfully!", "success");
      setAppliedJobIds((s) => new Set([...Array.from(s), jobId]));
    } catch (err) {
      addToast(err.response?.data?.message || "Application failed", "error");
    }
  };

  const [search, setSearch] = useState("");
  const [filterSkill, setFilterSkill] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalJobs, setTotalJobs] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = { page, limit };
        if (debouncedSearch) params.search = debouncedSearch;
        if (filterSkill) params.skill = filterSkill;
        if (filterLocation) params.location = filterLocation;
        if (jobType) params.jobType = jobType;
        if (minSalary) params.minSalary = minSalary;
        if (maxSalary) params.maxSalary = maxSalary;
        if (remoteOnly && !filterLocation) params.location = "remote";

        const [jobsRes, apps, prof] = await Promise.all([
          getAllJobs(params),
          getMyApplications(),
          getMyProfile(),
        ]);

        const jobItems = Array.isArray(jobsRes) ? jobsRes : jobsRes.items || [];
        const total = Array.isArray(jobsRes) ? jobsRes.length : jobsRes.total || 0;

        setJobs(jobItems);
        setTotalJobs(total);
        setAppliedJobIds(new Set(apps.map((a) => a.job._id)));
        setProfile(prof);

        const savedIds = new Set(JSON.parse(localStorage.getItem("savedJobs") || "[]"));
        setSavedJobIds(savedIds);

        const statusMap = JSON.parse(localStorage.getItem("appStatusMap") || "{}");
        const changed = apps
          .filter((a) => statusMap[a._id] && statusMap[a._id] !== a.status)
          .map((a) => ({ id: a._id, jobTitle: a.job?.title || "(no title)", status: a.status }));
        setUpdates(changed);

        const upcoming = apps.filter((a) => a.interviewDate && new Date(a.interviewDate) > new Date());
        setUpcomingInterviews(upcoming);

        const newMap = apps.reduce((acc, a) => {
          acc[a._id] = a.status;
          return acc;
        }, {});
        localStorage.setItem("appStatusMap", JSON.stringify(newMap));
      } catch (err) {
        console.error("LOAD DATA ERR:", err);
        addToast("Failed to load data", "error");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [debouncedSearch, filterSkill, filterLocation, jobType, minSalary, maxSalary, remoteOnly, page, limit]);

  // compute match percentage between job and profile skills
  const computeMatch = (job) => {
    if (!profile?.skills || profile.skills.length === 0) return 0;
    const jobSkills = job.skillsRequired || [];
    if (jobSkills.length === 0) return 0;
    const overlap = jobSkills.filter((s) => profile.skills.includes(s));
    return Math.round((overlap.length / jobSkills.length) * 100);
  };

  const getMissingSkills = (job) => {
    const jobSkills = job.skillsRequired || [];
    const mySkills = profile?.skills || [];
    return jobSkills.filter((s) => !mySkills.includes(s));
  };

  const profileCompletion = () => {
    if (!profile) return 0;
    const checks = [
      !!profile.name,
      !!profile.bio,
      Array.isArray(profile.skills) && profile.skills.length > 0,
      !!profile.resume,
    ];
    const done = checks.filter(Boolean).length;
    return Math.round((done / checks.length) * 100);
  };

  const toggleSaveJob = (jobId) => {
    setSavedJobIds((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId);
      else next.add(jobId);
      localStorage.setItem("savedJobs", JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const markUpdatesRead = () => {
    setUpdates([]);
    addToast("Updates marked as read", "success");
  };

  const recommended = jobs
    .map((job) => ({ job, score: computeMatch(job) }))
    .filter((x) => x.score >= 50)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.job);

  return (
    <div className="page-shell px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Available Jobs</h1>
          <div className="flex gap-3">
            <Link to="/student/profile" className="btn-ghost">Profile</Link>
            <Link to="/student/applications" className="btn-ghost">My Applications</Link>
            <button
              onClick={logout}
              className="btn-dark"
            >
              Logout
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2"><Spinner size={1.5} /> <span>Loading data...</span></div>
        ) : (
          <>
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card-glass p-4">
                <h3 className="font-semibold mb-2">Profile completion</h3>
                <div className="w-full bg-slate-200 rounded h-2 mb-2">
                  <div className="bg-fuchsia-400 h-2 rounded" style={{ width: `${profileCompletion()}%` }} />
                </div>
                <p className="text-sm text-slate-300">{profileCompletion()}% complete</p>
                {profileCompletion() < 100 && (
                  <p className="text-xs text-slate-400 mt-2">
                    Tip: Add bio, skills, or resume to improve recommendations.
                  </p>
                )}
              </div>
              <div className="card-glass p-4">
                <h3 className="font-semibold mb-2">Updates</h3>
                {updates.length === 0 ? (
                  <p className="text-sm text-slate-300">No new status updates.</p>
                ) : (
                  <>
                    <ul className="text-sm text-slate-200 list-disc pl-4">
                      {updates.map((u) => (
                        <li key={u.id}>{u.jobTitle}: {u.status}</li>
                      ))}
                    </ul>
                    <button onClick={markUpdatesRead} className="mt-2 text-sm text-cyan-300">Mark as read</button>
                  </>
                )}
              </div>
              <div className="card-glass p-4">
                <h3 className="font-semibold mb-2">Upcoming interviews</h3>
                {upcomingInterviews.length === 0 ? (
                  <p className="text-sm text-slate-300">No upcoming interviews.</p>
                ) : (
                  <ul className="text-sm text-slate-200 list-disc pl-4">
                    {upcomingInterviews.map((a) => (
                      <li key={a._id}>
                        {a.job?.title || "(no title)"} • {new Date(a.interviewDate).toLocaleString()} {a.interviewLink ? "• link available" : ""}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="mb-6 card-glass p-4">
              <h3 className="font-semibold mb-3">Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search jobs" className="input-glass" />
                <input value={filterSkill} onChange={(e) => { setFilterSkill(e.target.value); setPage(1); }} placeholder="Skill (e.g., React)" className="input-glass" />
                <input value={filterLocation} onChange={(e) => { setFilterLocation(e.target.value); setPage(1); }} placeholder="Location" className="input-glass" />
                <select value={jobType} onChange={(e) => { setJobType(e.target.value); setPage(1); }} className="select-glass">
                  <option value="">All types</option>
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                </select>
                <input value={minSalary} onChange={(e) => { setMinSalary(e.target.value); setPage(1); }} placeholder="Min Salary" className="input-glass" />
                <input value={maxSalary} onChange={(e) => { setMaxSalary(e.target.value); setPage(1); }} placeholder="Max Salary" className="input-glass" />
              </div>
              <label className="flex items-center gap-2 mt-3 text-sm text-slate-200">
                <input type="checkbox" checked={remoteOnly} onChange={(e) => { setRemoteOnly(e.target.checked); setPage(1); }} />
                Remote only
              </label>
            </div>

            {savedJobIds.size > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Saved jobs</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {jobs.filter((j) => savedJobIds.has(j._id)).map((job) => (
                    <JobCard
                      key={job._id}
                      job={job}
                      onApply={handleApply}
                      applied={appliedJobIds.has(job._id)}
                      match={computeMatch(job)}
                      missingSkills={getMissingSkills(job)}
                      saved={savedJobIds.has(job._id)}
                      onToggleSave={toggleSaveJob}
                      showReasons
                    />
                  ))}
                </div>
              </div>
            )}

            {recommended.length > 0 && (
              <div className="mb-6">
                <h2 className="section-title mb-3">Recommended for you</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {recommended.map((job) => (
                    <JobCard
                      key={job._id}
                      job={job}
                      onApply={handleApply}
                      applied={appliedJobIds.has(job._id)}
                      match={computeMatch(job)}
                      missingSkills={getMissingSkills(job)}
                      saved={savedJobIds.has(job._id)}
                      onToggleSave={toggleSaveJob}
                      showReasons
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  onApply={handleApply}
                  applied={appliedJobIds.has(job._id)}
                  match={computeMatch(job)}
                  missingSkills={getMissingSkills(job)}
                  saved={savedJobIds.has(job._id)}
                  onToggleSave={toggleSaveJob}
                  showReasons
                />
              ))}
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="btn-ghost text-sm disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-sm">Page {page}</span>
              <button
                disabled={page * limit >= totalJobs}
                onClick={() => setPage((p) => p + 1)}
                className="btn-ghost text-sm disabled:opacity-50"
              >
                Next
              </button>
              <select value={limit} onChange={(e) => { setPage(1); setLimit(Number(e.target.value)); }} className="select-glass text-sm">
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
