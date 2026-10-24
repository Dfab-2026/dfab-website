import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { getApiBase } from "../utils/backendApi";
import {
  Plus,
  Edit3,
  Trash2,
  LogOut,
  X,
  Save,
  Settings,
  MapPin,
  Briefcase,
  ArrowLeft,
  PlusCircle,
} from "lucide-react";

const API = getApiBase();
const ADMIN_SESSION_KEY = "career_admin";
const ADMIN_TOKEN_KEY = "dfab_admin_token";

const EMPTY_FORM = {
  role: "",
  location: "",
  type: "Full Time",
  experience: "",
  desc: "",
  requirements: "",
};

export default function CareerAdmin() {
  const [loggedIn, setLoggedIn] = useState(
    localStorage.getItem(ADMIN_SESSION_KEY) === "true"
  );
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [jobs, setJobs] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem(ADMIN_TOKEN_KEY) || "";

  const headers = token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/admin/careers`, { headers });
      setJobs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
      if (err?.response?.status === 401) {
        localStorage.removeItem(ADMIN_SESSION_KEY);
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        setLoggedIn(false);
      }
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  if (loggedIn && token) {
    fetchJobs();
  }
}, [loggedIn, token]); // ✅ fixed

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(`${API}/admin/login`, {
        password,
      });

      localStorage.setItem(ADMIN_SESSION_KEY, "true");
      localStorage.setItem(ADMIN_TOKEN_KEY, res.data.token);
      setLoggedIn(true);
      setPassword("");
    } catch (err) {
      console.error("Career admin login failed:", err);
      setError("Invalid password. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setLoggedIn(false);
    setJobs([]);
  };

  const openEdit = (job) => {
    setEditingId(job.id);
    setForm({
      role: job.title || job.role || "",
      location: job.location || "",
      type: job.type || "Full Time",
      experience: job.experience || "",
      desc: job.description || job.desc || "",
      requirements: Array.isArray(job.requirements)
        ? job.requirements.join(", ")
        : "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg("");

    const payload = {
      title: form.role,
      location: form.location,
      type: form.type,
      experience: form.experience,
      description: form.desc,
      requirements: form.requirements
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean),
      published: true,
    };

    try {
      if (editingId) {
        await axios.put(`${API}/admin/careers/${editingId}`, payload, {
          headers,
        });
        setMsg("Opening updated!");
      } else {
        await axios.post(`${API}/admin/careers`, payload, {
          headers,
        });
        setMsg("New opening published!");
      }

      await fetchJobs();
      setEditingId(null);
      setForm(EMPTY_FORM);
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      console.error("Failed to save job:", err);
      if (err?.response?.status === 401) {
        handleLogout();
      } else {
        setMsg("Error saving opening.");
        setTimeout(() => setMsg(""), 3000);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job opening?")) return;

    try {
      await axios.delete(`${API}/admin/careers/${id}`, {
        headers,
      });
      await fetchJobs();
    } catch (err) {
      console.error("Delete failed:", err);
      if (err?.response?.status === 401) {
        handleLogout();
      } else {
        alert("Error deleting opening.");
      }
    }
  };

  if (!loggedIn) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-50 text-[#0A66C2] rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase size={32} />
            </div>
            <h1 className="text-2xl font-bold font-['Chivo'] text-slate-900">
              Career Admin Login
            </h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Admin Password"
              className="w-full border border-slate-300 rounded-xl px-4 py-4 outline-none focus:ring-2 focus:ring-[#0A66C2] transition-all"
            />
            {error && <p className="text-red-500 text-xs text-center">{error}</p>}
            <button
              type="submit"
              className="w-full bg-[#0A66C2] text-white py-4 rounded-xl font-bold hover:bg-[#084e96] transition-all"
            >
              Login to Dashboard
            </button>
          </form>
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <Link
              to="/careers"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#0A66C2] transition-colors"
            >
              <ArrowLeft size={16} /> Back to Careers
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <section className="bg-[#0F172A] py-10 px-4 mb-10">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white font-['Chivo'] tracking-tight">
              System Console
            </h1>
            <p className="text-blue-300/60 text-sm font-medium uppercase tracking-[0.2em] mt-1">
              Hiring & Careers
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all"
          >
            <LogOut size={18} /> Logout Session
          </button>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[450px_1fr] gap-10 items-stretch">
          {/* LEFT SIDE: IDLE FORM */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-auto lg:h-[850px]">
            <div className="p-5 sm:p-6 md:p-8 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-blue-50 rounded-lg text-[#0A66C2]">
                  <PlusCircle size={20} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 font-['Chivo']">
                  {editingId !== null ? "Update Opening" : "Job Creator"}
                </h2>
              </div>
              <p className="text-sm text-slate-500">
                Post new vacancies or modify existing ones.
              </p>
            </div>

            <form
              onSubmit={handleSave}
              className="p-5 sm:p-6 md:p-8 space-y-5 flex-grow overflow-y-auto custom-scrollbar"
            >
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
                  Job Role *
                </label>
                <input
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0A66C2] bg-slate-50/50"
                  placeholder="e.g. Senior Welder"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
                    Location
                  </label>
                  <input
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                    required
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0A66C2] bg-slate-50/50"
                    placeholder="Bengaluru"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
                    Experience
                  </label>
                  <input
                    value={form.experience}
                    onChange={(e) =>
                      setForm({ ...form, experience: e.target.value })
                    }
                    required
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0A66C2] bg-slate-50/50"
                    placeholder="3-5 Years"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
                  Job Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0A66C2] bg-slate-50/50"
                >
                  <option>Full Time</option>
                  <option>Part Time</option>
                  <option>Contract</option>
                  <option>Internship</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
                  Job Summary *
                </label>
                <textarea
                  value={form.desc}
                  onChange={(e) => setForm({ ...form, desc: e.target.value })}
                  required
                  rows="5"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0A66C2] bg-slate-50/50 resize-none"
                  placeholder="Brief details about the role..."
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
                  Requirements (Comma Separated)
                </label>
                <textarea
                  value={form.requirements}
                  onChange={(e) =>
                    setForm({ ...form, requirements: e.target.value })
                  }
                  rows="3"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0A66C2] bg-slate-50/50 resize-none"
                  placeholder="Skill 1, Skill 2, etc."
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#0A66C2] text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#084e96] shadow-lg shadow-blue-100"
                >
                  {editingId !== null ? "Update Opening" : "Publish Opening"}
                </button>
                {editingId !== null && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-6 bg-slate-100 text-slate-600 rounded-xl font-black uppercase tracking-widest text-xs"
                  >
                    Cancel
                  </button>
                )}
              </div>
              {msg && (
                <p className="text-center text-xs font-bold text-green-600 uppercase tracking-widest">
                  {msg}
                </p>
              )}
            </form>
          </div>

          {/* RIGHT SIDE: SCROLLABLE DATABASE */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-auto lg:h-[850px]">
            <div className="p-5 sm:p-6 md:p-8 border-b border-slate-100 bg-white flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                    <Settings size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 font-['Chivo']">
                    Job Inventory
                  </h2>
                </div>
                <p className="text-sm text-slate-500">
                  Manage your active hiring portal.
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-[#0A66C2]">
                  {jobs.length}
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Total Roles
                </div>
              </div>
            </div>

            <div className="flex-1 lg:overflow-y-auto p-5 sm:p-6 md:p-8 bg-slate-50/50 custom-scrollbar">
              <div className="grid grid-cols-1 gap-6">
                {loading ? (
                  <div className="text-center py-10 text-slate-400">
                    Loading openings...
                  </div>
                ) : (
                  jobs.map((job) => (
                    <div
                      key={job.id}
                      className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-md transition-all hover:shadow-xl group"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-slate-900 font-['Chivo']">
                              {job.title || job.role}
                            </h3>
                            <div className="flex gap-3 mt-1">
                              <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <MapPin size={10} /> {job.location}
                              </span>
                              <span className="flex items-center gap-1 text-[10px] font-black text-[#0A66C2] uppercase tracking-widest">
                                <Briefcase size={10} /> {job.type}
                              </span>
                            </div>
                          </div>
                          <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                            {job.experience}
                          </span>
                        </div>

                        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-6">
                          {job.description || job.desc}
                        </p>

                        <div className="flex gap-3 border-t border-slate-50 pt-5">
                          <button
                            onClick={() => openEdit(job)}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-[#0A66C2] transition-all"
                          >
                            <Edit3 size={14} /> Edit Role
                          </button>
                          <button
                            onClick={() => handleDelete(job.id)}
                            className="px-6 py-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {!loading && jobs.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center py-20 text-slate-300">
                    <Briefcase size={48} className="mb-4 opacity-20" />
                    <p className="font-bold uppercase tracking-widest text-xs">
                      No Openings Found
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `,
        }}
      />
    </main>
  );
}