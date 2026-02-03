export default function JobCard({ job, onApply }) {
  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h2 className="text-xl font-bold mb-1">{job.title}</h2>
      <p className="text-slate-600 text-sm mb-2">
        {job.companyName} • {job.location}
      </p>
      <p className="text-slate-700 mb-3">{job.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {job.skillsRequired.map((skill, i) => (
          <span
            key={i}
            className="text-xs bg-slate-200 px-2 py-1 rounded"
          >
            {skill}
          </span>
        ))}
      </div>

      <button
        onClick={() => onApply(job._id)}
        className="bg-slate-900 text-white px-4 py-2 rounded-lg"
      >
        Apply
      </button>
    </div>
  );
}
