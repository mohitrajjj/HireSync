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

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        if (filterSkill) params.skill = filterSkill;
        if (filterLocation) params.location = filterLocation;

        const [jobsRes, apps, prof] = await Promise.all([getAllJobs(params), getMyApplications(), getMyProfile()]);
        setJobs(jobsRes);
        setAppliedJobIds(new Set(apps.map((a) => a.job._id)));
        setProfile(prof);
      } catch (err) {
        console.error("LOAD DATA ERR:", err);
        addToast("Failed to load data", "error");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [search, filterSkill, filterLocation]);

  // compute match percentage between job and profile skills
  const computeMatch = (job) => {
    if (!profile?.skills || profile.skills.length === 0) return 0;
    const jobSkills = job.skillsRequired || [];
    if (jobSkills.length === 0) return 0;
    const overlap = jobSkills.filter((s) => profile.skills.includes(s));
    return Math.round((overlap.length / jobSkills.length) * 100);
  };

  const recommended = jobs
    .map((job) => ({ job, score: computeMatch(job) }))
    .filter((x) => x.score >= 50)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.job);

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Available Jobs</h1>
          <div className="flex gap-3">
            <Link to="/student/profile" className="bg-slate-700 text-white px-4 py-2 rounded-lg">Profile</Link>
            <Link to="/student/applications" className="bg-slate-700 text-white px-4 py-2 rounded-lg">My Applications</Link>
            <button
              onClick={logout}
              className="bg-slate-900 text-white px-4 py-2 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2"><Spinner size={1.5} /> <span>Loading data...</span></div>
        ) : (
          <>
            <div className="mb-6 bg-white p-4 rounded shadow">
              <h3 className="font-semibold mb-3">Filters</h3>
              <div className="flex gap-3">
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search jobs" className="border px-3 py-2 rounded w-1/3" />
                <input value={filterSkill} onChange={(e) => setFilterSkill(e.target.value)} placeholder="Skill (e.g., React)" className="border px-3 py-2 rounded w-1/4" />
                <input value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} placeholder="Location" className="border px-3 py-2 rounded w-1/4" />
              </div>
            </div>

            {recommended.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Recommended for you</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {recommended.map((job) => (
                    <JobCard
                      key={job._id}
                      job={job}
                      onApply={handleApply}
                      applied={appliedJobIds.has(job._id)}
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
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
