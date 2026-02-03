import { useState } from "react";
import api from "../services/api";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/register", {
        name,
        email,
        password,
        role,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      if (res.data.role === "recruiter") {
        window.location.href = "/recruiter";
      } else {
        window.location.href = "/student";
      }
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md card-glass p-8 relative overflow-hidden">
        <div className="absolute -top-16 -right-10 w-40 h-40 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-emerald-400/20 blur-3xl" />
        <h1 className="text-4xl font-extrabold text-center text-white mb-1 tracking-tight">
          HireSync
        </h1>
        <p className="text-center text-slate-300 mb-6">
          Create your account ✨
        </p>

        {error && (
          <p className="text-red-400 text-sm text-center mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <input
            type="text"
            placeholder="Full Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-glass"
          />

          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-glass"
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-glass"
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="select-glass"
          >
            <option value="student">Student</option>
            <option value="recruiter">Recruiter</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}
