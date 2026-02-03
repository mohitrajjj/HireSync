import { useEffect, useState } from "react";
import { getMyApplications } from "../services/jobs";
import { logout } from "../services/auth";

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMyApplications();
        setApplications(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">My Applications</h1>
          <button onClick={logout} className="bg-black text-white px-4 py-2 rounded">Logout</button>
        </div>

        {loading ? (
          <p>Loading applications...</p>
        ) : applications.length === 0 ? (
          <p>No applications yet.</p>
        ) : (
          <div className="space-y-4">
            {applications.map((a) => (
              <div key={a._id} className="border p-4 rounded">
                <h3 className="font-semibold">{a.job?.title || "(no title)"}</h3>
                <p className="text-sm text-slate-600">{a.job?.companyName}</p>
                <p className="mt-2">Status: <strong className="capitalize">{a.status}</strong></p>
                <div className="mt-2 text-sm text-slate-600">
                  <p>Applied: {a.createdAt ? new Date(a.createdAt).toLocaleString() : "—"}</p>
                  {a.status !== "applied" && a.updatedAt && (
                    <p>Updated: {new Date(a.updatedAt).toLocaleString()}</p>
                  )}
                </div>
                {a.interviewDate && (
                  <p className="text-sm text-slate-700 mt-2">
                    Interview: {new Date(a.interviewDate).toLocaleString()}
                  </p>
                )}
                {a.interviewLink && (
                  <a href={a.interviewLink} target="_blank" rel="noreferrer" className="text-blue-600 text-sm">Join Interview</a>
                )}
                {a.resume && (
                  <a href={`http://localhost:5001/${a.resume}`} target="_blank" rel="noreferrer" className="text-blue-600 text-sm">View Resume</a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
