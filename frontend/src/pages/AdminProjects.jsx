import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Trash2,
  Star,
  StarOff,
  LogOut,
  PlusCircle,
  ImagePlus,
  LayoutGrid,
  ArrowLeft,
  Pencil,
  X,
} from "lucide-react";
import axios from "axios";
import { getProjectsApiBase, normalizeProjects } from "../utils/projectsApi";

const API = getProjectsApiBase();
const ADMIN_SESSION_KEY = "dfab_admin_logged_in";
const ADMIN_TOKEN_KEY = "dfab_admin_token";

const EMPTY_FORM = {
  title: "",
  tag: "",
  desc: "",
  img: "",
  featured: false,
};

export default function AdminProjects() {
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageName, setImageName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState("");

  const getToken = () => localStorage.getItem(ADMIN_TOKEN_KEY) || "";

  const authHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
  });

  const handleUnauthorized = () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setIsLoggedIn(false);
    setProjects([]);
  };

  const fetchProjects = async () => {
    try {
      setProjectsLoading(true);
      setProjectsError("");

      const res = await axios.get(`${API}/admin/projects`, {
        headers: {
          ...authHeaders(),
          Accept: "application/json",
          "Cache-Control": "no-cache",
        },
        params: { _ts: Date.now() },
      });

      setProjects(normalizeProjects(res.data));
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      if (error?.response?.status === 401) {
        handleUnauthorized();
      } else {
        setProjectsError(
          error?.response?.data?.detail ||
            "Could not load published projects. Please retry."
        );
      }
    } finally {
      setProjectsLoading(false);
    }
  };

  useEffect(() => {
    const loggedIn = localStorage.getItem(ADMIN_SESSION_KEY) === "true";
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);

    if (loggedIn && token) {
      setIsLoggedIn(true);
      fetchProjects();
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await axios.post(`${API}/admin/login`, {
        password,
      });

      localStorage.setItem(ADMIN_SESSION_KEY, "true");
      localStorage.setItem(ADMIN_TOKEN_KEY, res.data.token);

      setIsLoggedIn(true);
      setPassword("");
      await fetchProjects();
    } catch (error) {
      console.error("Login failed:", error);
      alert("Incorrect password");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setIsLoggedIn(false);
    setProjects([]);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, img: reader.result }));
      setImageName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.tag || !form.desc || !form.img) {
      alert("Please fill all fields.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: form.title,
        tag: form.tag,
        desc: form.desc,
        img: form.img,
        featured: form.featured,
        published: true,
      };

      if (editingId) {
        await axios.put(`${API}/admin/projects/${editingId}`, payload, {
          headers: authHeaders(),
        });
        alert("Project Updated Successfully!");
      } else {
        await axios.post(`${API}/admin/projects`, payload, {
          headers: authHeaders(),
        });
        alert("Project Published Successfully!");
      }

      setForm(EMPTY_FORM);
      setImageName("");
      setEditingId(null);
      await fetchProjects();
      window.dispatchEvent(new Event("dfab:projects-updated"));
    } catch (error) {
      console.error("Failed to save project:", error);
      if (error?.response?.status === 401) {
        handleUnauthorized();
      } else {
        alert("Failed to save project.");
      }
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (project) => {
    setForm({
      title: project.title || "",
      tag: project.tag || "",
      desc: project.desc || "",
      img: project.img || "",
      featured: Boolean(project.featured),
    });
    setEditingId(project.id);
    setImageName("Current Image (Click to change)");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setImageName("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;

    try {
      setLoading(true);
      await axios.delete(`${API}/admin/projects/${id}`, {
        headers: authHeaders(),
      });

      if (editingId === id) cancelEdit();
      await fetchProjects();
      window.dispatchEvent(new Event("dfab:projects-updated"));
    } catch (error) {
      console.error("Failed to delete project:", error);
      if (error?.response?.status === 401) {
        handleUnauthorized();
      } else {
        alert("Failed to delete project.");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (id) => {
    const current = projects.find((p) => p.id === id);
    if (!current) return;

    const payload = {
      title: current.title,
      tag: current.tag,
      desc: current.desc,
      img: current.img,
      featured: !current.featured,
      published: current.published ?? true,
    };

    try {
      setLoading(true);
      await axios.put(`${API}/admin/projects/${id}`, payload, {
        headers: authHeaders(),
      });
      await fetchProjects();
      window.dispatchEvent(new Event("dfab:projects-updated"));
    } catch (error) {
      console.error("Failed to update featured state:", error);
      if (error?.response?.status === 401) {
        handleUnauthorized();
      } else {
        alert("Failed to update featured status.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-50 text-[#0A66C2] rounded-full flex items-center justify-center mx-auto mb-4">
              <LayoutGrid size={32} />
            </div>
            <h1 className="text-2xl font-bold font-['Chivo'] text-slate-900">
              Admin Authentication
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
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0A66C2] text-white py-4 rounded-xl font-bold hover:bg-[#084e96] transition-all disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login to Dashboard"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#0A66C2] transition-colors"
            >
              <ArrowLeft size={16} /> Back to Projects Portfolio
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
              Project Management
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
          {/* LEFT SIDE: FORM (ADD/EDIT) */}
          <div
            className={`bg-white rounded-3xl border transition-all duration-500 shadow-sm overflow-hidden flex flex-col h-auto lg:h-[850px] ${
              editingId ? "border-amber-400 ring-2 ring-amber-100" : "border-slate-200"
            }`}
          >
            <div className="p-5 sm:p-6 md:p-8 border-b border-slate-100 bg-white flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div
                    className={`p-2 rounded-lg ${
                      editingId ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-[#0A66C2]"
                    }`}
                  >
                    {editingId ? <Pencil size={20} /> : <PlusCircle size={20} />}
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 font-['Chivo']">
                    {editingId ? "Edit Project" : "Project Creator"}
                  </h2>
                </div>
                <p className="text-sm text-slate-500">
                  {editingId
                    ? "Modify the details of your existing project."
                    : "Draft and publish new project entries."}
                </p>
              </div>
              {editingId && (
                <button
                  onClick={cancelEdit}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                >
                  <X size={24} />
                </button>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-5 sm:p-6 md:p-8 space-y-6 flex-grow overflow-y-auto custom-scrollbar"
            >
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                    Project Identity
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Title"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-[#0A66C2] bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                    Classification
                  </label>
                  <input
                    type="text"
                    name="tag"
                    value={form.tag}
                    onChange={handleChange}
                    placeholder="Category"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-[#0A66C2] bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                    Narrative
                  </label>
                  <textarea
                    name="desc"
                    value={form.desc}
                    onChange={handleChange}
                    placeholder="Description..."
                    rows="6"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-[#0A66C2] bg-slate-50/50 resize-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                    Visual Asset
                  </label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 bg-slate-50/50 text-center relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <ImagePlus
                      size={24}
                      className="text-slate-300 group-hover:text-[#0A66C2] mx-auto mb-2 transition-colors"
                    />
                    <span className="text-xs font-bold text-slate-600 block">
                      Upload Media
                    </span>
                  </div>
                  {imageName && (
                    <p className="text-[10px] text-[#0A66C2] mt-2 font-black truncate text-center">
                      {imageName}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 mt-2">
                  <input
                    type="checkbox"
                    id="f-check"
                    name="featured"
                    checked={form.featured}
                    onChange={handleChange}
                    className="w-5 h-5 accent-[#0A66C2] cursor-pointer"
                  />
                  <label
                    htmlFor="f-check"
                    className="text-xs font-black text-slate-700 uppercase tracking-tighter cursor-pointer"
                  >
                    Pin to Homepage Featured
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="flex-1 bg-slate-200 text-slate-600 py-5 rounded-xl font-black uppercase tracking-[0.2em] text-xs hover:bg-slate-300 transition-all mt-4"
                  >
                    Discard
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-[2] text-white py-5 rounded-xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl mt-4 disabled:opacity-60 ${
                    editingId
                      ? "bg-amber-500 hover:bg-amber-600 shadow-amber-100"
                      : "bg-[#0A66C2] hover:bg-[#084e96] shadow-blue-100"
                  }`}
                >
                  {loading
                    ? "Saving..."
                    : editingId
                    ? "Update Project"
                    : "Publish Entry"}
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT SIDE: SCROLLABLE DATABASE */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-auto lg:h-[850px]">
            <div className="p-5 sm:p-6 md:p-8 border-b border-slate-100 bg-white flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                    <LayoutGrid size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 font-['Chivo']">
                    Project Database
                  </h2>
                </div>
                <p className="text-sm text-slate-500">Manage all active portfolios.</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-[#0A66C2]">{projects.length}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Units
                </div>
              </div>
            </div>

            <div className="flex-1 lg:overflow-y-auto p-5 sm:p-6 md:p-8 bg-slate-50/50 custom-scrollbar">
              {projectsError && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center justify-between gap-4">
                  <span>{projectsError}</span>
                  <button
                    type="button"
                    onClick={fetchProjects}
                    className="shrink-0 rounded-lg bg-red-600 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-red-700"
                  >
                    Retry
                  </button>
                </div>
              )}

              {projectsLoading && projects.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-20 text-slate-400">
                  <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-[#0A66C2] animate-spin mb-4" />
                  <p className="font-bold uppercase tracking-widest text-xs">Loading Projects</p>
                </div>
              ) : (
              <div className="grid grid-cols-1 gap-8">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className={`bg-white rounded-3xl overflow-hidden border transition-all hover:shadow-xl group ${
                      editingId === project.id
                        ? "border-amber-400 ring-2 ring-amber-50 shadow-lg"
                        : "border-slate-200 shadow-md"
                    }`}
                  >
                    <div className="h-48 relative bg-slate-200 overflow-hidden">
                      <img
                        src={project.img}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                        <span className="bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                          {project.tag}
                        </span>
                        <span
                          className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm ${
                            project.published !== false
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-700 text-white"
                          }`}
                        >
                          {project.published !== false ? "Published" : "Draft"}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-lg font-bold text-slate-900 font-['Chivo'] mb-1">
                        {project.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4">
                        {project.desc}
                      </p>

                      <div className="flex gap-2 border-t border-slate-50 pt-4">
                        <button
                          onClick={() => toggleFeatured(project.id)}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${
                            project.featured
                              ? "bg-amber-50 text-amber-600 border-amber-200"
                              : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {project.featured ? (
                            <Star size={12} className="fill-amber-600" />
                          ) : (
                            <StarOff size={12} />
                          )}
                        </button>

                        <button
                          onClick={() => startEdit(project)}
                          className="flex-1 bg-blue-50 text-[#0A66C2] border border-blue-100 hover:bg-blue-100 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                        >
                          <Pencil size={12} /> Edit
                        </button>

                        <button
                          onClick={() => handleDelete(project.id)}
                          className="px-4 py-2.5 rounded-lg bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-all flex items-center justify-center"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              )}

              {!projectsLoading && !projectsError && projects.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center py-20 text-slate-300">
                  <PlusCircle size={48} className="mb-4 opacity-20" />
                  <p className="font-bold uppercase tracking-widest text-xs">
                    Database Empty
                  </p>
                </div>
              )}
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