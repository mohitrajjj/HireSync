import { useRef } from "react";

export default function JobCard({ job, onApply, applied, match, missingSkills = [], saved, onToggleSave, showReasons }) {
  const fileInputRef = useRef();

  const handleClick = () => {
    if (applied) return;
    fileInputRef.current?.click();
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    onApply(job._id, file);
    // clear the input value so same file can be picked later if needed
    e.target.value = null;
  };

  return (
    <div className="card-glass p-5">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold mb-1 text-white">{job.title}</h2>
          <p className="text-slate-300 text-sm mb-2">{job.companyName} • {job.location} • {job.jobType || ""}</p>
          {(job.salaryMin || job.salaryMax) && (
            <p className="text-slate-400 text-xs mb-2">
              Salary: {job.salaryMin ? `$${job.salaryMin}` : ""}{job.salaryMin && job.salaryMax ? " - " : ""}{job.salaryMax ? `$${job.salaryMax}` : ""}
            </p>
          )}
        </div>
        {typeof match === 'number' && (
          <div className="text-sm text-slate-200 bg-white/10 px-2 py-1 rounded">
            Match: <strong>{match}%</strong>
          </div>
        )}
      </div>

      <p className="text-slate-200/90 mb-3">{job.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {(job.skillsRequired || []).map((skill, i) => (
          <span
            key={i}
            className="chip"
          >
            {skill}
          </span>
        ))}
      </div>

      {showReasons && missingSkills.length > 0 && (
        <p className="text-xs text-slate-300 mb-3">
          Skills gap: {missingSkills.join(", ")}
        </p>
      )}

      <input
        type="file"
        accept="application/pdf"
        ref={fileInputRef}
        onChange={onFileChange}
        className="hidden"
      />

      <div className="flex gap-2">
        <button
          onClick={handleClick}
          disabled={applied}
          className={`px-4 py-2 rounded-xl ${applied ? "bg-white/20 text-white" : "btn-primary"}`}
        >
          {applied ? "Applied" : "Apply"}
        </button>
        {onToggleSave && (
          <button
            onClick={() => onToggleSave(job._id)}
            className={`px-4 py-2 rounded-xl ${saved ? "bg-white/20 text-white" : "btn-ghost"}`}
          >
            {saved ? "Saved" : "Save"}
          </button>
        )}
      </div>
    </div>
  );
}
