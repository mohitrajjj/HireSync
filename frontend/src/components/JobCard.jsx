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
    <div className="bg-white rounded-xl shadow p-5">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold mb-1">{job.title}</h2>
          <p className="text-slate-600 text-sm mb-2">{job.companyName} • {job.location} • {job.jobType || ""}</p>
          {(job.salaryMin || job.salaryMax) && (
            <p className="text-slate-500 text-xs mb-2">
              Salary: {job.salaryMin ? `$${job.salaryMin}` : ""}{job.salaryMin && job.salaryMax ? " - " : ""}{job.salaryMax ? `$${job.salaryMax}` : ""}
            </p>
          )}
        </div>
        {typeof match === 'number' && (
          <div className="text-sm text-slate-700 bg-slate-100 px-2 py-1 rounded">
            Match: <strong>{match}%</strong>
          </div>
        )}
      </div>

      <p className="text-slate-700 mb-3">{job.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {(job.skillsRequired || []).map((skill, i) => (
          <span
            key={i}
            className="text-xs bg-slate-200 px-2 py-1 rounded"
          >
            {skill}
          </span>
        ))}
      </div>

      {showReasons && missingSkills.length > 0 && (
        <p className="text-xs text-slate-600 mb-3">
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
          className={`px-4 py-2 rounded-lg ${applied ? "bg-gray-400 text-white" : "bg-slate-900 text-white"}`}
        >
          {applied ? "Applied" : "Apply"}
        </button>
        {onToggleSave && (
          <button
            onClick={() => onToggleSave(job._id)}
            className={`px-4 py-2 rounded-lg ${saved ? "bg-slate-200 text-slate-900" : "bg-white border"}`}
          >
            {saved ? "Saved" : "Save"}
          </button>
        )}
      </div>
    </div>
  );
}
