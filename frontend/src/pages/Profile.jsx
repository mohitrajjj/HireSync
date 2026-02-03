import { useEffect, useState, useRef } from "react";
import { getMyProfile, updateMyProfile } from "../services/user";
import { useToast } from "../components/ToastProvider";
import { logout } from "../services/auth";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const fileRef = useRef();
  const { addToast } = useToast();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getMyProfile();
        setProfile(data);
        setName(data.name || "");
        setBio(data.bio || "");
        setSkills((data.skills || []).join(", "));
      } catch (err) {
        addToast("Failed to load profile", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateMyProfile({ name, bio, skills, resume: resumeFile });
      addToast("Profile updated", "success");
      const data = await getMyProfile();
      setProfile(data);
    } catch (err) {
      addToast(err.response?.data?.message || "Update failed", "error");
    }
  };

  return (
    <div className="page-shell px-6 py-10">
      <div className="max-w-3xl mx-auto card-glass p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <button onClick={logout} className="btn-dark">Logout</button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block">
              <div className="text-sm font-medium mb-1">Name</div>
              <input value={name} onChange={(e) => setName(e.target.value)} className="input-glass" />
            </label>

            <label className="block">
              <div className="text-sm font-medium mb-1">Bio</div>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="input-glass" />
            </label>

            <label className="block">
              <div className="text-sm font-medium mb-1">Skills (comma separated)</div>
              <input value={skills} onChange={(e) => setSkills(e.target.value)} className="input-glass" />
            </label>

            <label className="block">
              <div className="text-sm font-medium mb-1">Resume (PDF)</div>
              {profile?.resume && (
                <div className="mb-2">
                  <a href={`http://localhost:5001/${profile.resume}`} target="_blank" rel="noreferrer" className="text-cyan-300">View current resume</a>
                </div>
              )}
              <input ref={fileRef} type="file" accept="application/pdf" onChange={(e) => setResumeFile(e.target.files[0])} />
            </label>

            {profile?.resumeHistory?.length > 0 && (
              <div className="card-soft p-3">
                <h4 className="font-semibold mb-2">Resume history</h4>
                <ul className="text-sm text-slate-200 list-disc pl-4">
                  {profile.resumeHistory.map((r, idx) => (
                    <li key={idx}>
                      <a href={`http://localhost:5001/${r.path}`} target="_blank" rel="noreferrer" className="text-cyan-300">Previous resume</a>
                      {r.uploadedAt ? ` • ${new Date(r.uploadedAt).toLocaleString()}` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3">
              <button type="submit" className="btn-primary">Save</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
