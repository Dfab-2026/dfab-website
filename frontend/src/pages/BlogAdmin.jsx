import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  LogOut,
  Save,
  LayoutGrid,
  ImagePlus,
  ArrowLeft,
  Settings,
  PlusCircle,
} from "lucide-react";
import axios from "axios";
import { getApiBase } from "../utils/backendApi";

const API = getApiBase();
const ADMIN_SESSION_KEY = "dfab_admin_logged_in";
const ADMIN_TOKEN_KEY = "dfab_admin_token";

const EMPTY_FORM = {
  title: "",
  content: "",
  excerpt: "",
  author: "DFAB Team",
  category: "Fabrication",
  image_url: "",
  tags: "",
  published: true,
};

const CATEGORIES = [
  "Fabrication",
  "Welding",
  "Industry News",
  "Quality",
  "Projects",
  "Technology",
];

export default function BlogAdmin() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageName, setImageName] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setToken("");
    setPosts([]);
    setPassword("");
    setLoginError("");
  };

  const fetchPosts = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const r = await axios.get(`${API}/admin/blog/posts`, {
        headers: {
          ...headers,
          Accept: "application/json",
          "Cache-Control": "no-cache",
        },
        params: { _ts: Date.now() },
      });
      setPosts(Array.isArray(r.data) ? r.data : []);
    } catch (err) {
      if (err?.response?.status === 401) {
        handleLogout();
      } else {
        console.error("Failed to fetch posts:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem(ADMIN_TOKEN_KEY);
    const loggedIn = localStorage.getItem(ADMIN_SESSION_KEY) === "true";

    if (storedToken && loggedIn) {
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    if (token) fetchPosts();
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const r = await axios.post(`${API}/admin/login`, { password });
      localStorage.setItem(ADMIN_TOKEN_KEY, r.data.token);
      localStorage.setItem(ADMIN_SESSION_KEY, "true");
      setToken(r.data.token);
      setPassword("");
    } catch (err) {
      setLoginError("Invalid password. Please try again.");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, image_url: reader.result }));
      setImageName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const openEdit = (post) => {
    setEditingPost(post);
    setImageName(post.image_url ? "Existing Image Attached" : "");
    setForm({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      author: post.author,
      category: post.category,
      image_url: post.image_url || "",
      tags: (post.tags || []).join(", "),
      published: post.published,
    });
  };

  const cancelEdit = () => {
    setEditingPost(null);
    setForm(EMPTY_FORM);
    setImageName("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");

    const payload = {
      ...form,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    try {
      if (editingPost) {
        await axios.put(`${API}/admin/blog/posts/${editingPost.id}`, payload, {
          headers,
        });
        setMsg("Post updated successfully!");
      } else {
        await axios.post(`${API}/admin/blog/posts`, payload, { headers });
        setMsg("Post created successfully!");
      }

      setForm(EMPTY_FORM);
      setImageName("");
      setEditingPost(null);
      await fetchPosts();
    } catch (err) {
      if (err?.response?.status === 401) {
        handleLogout();
      } else {
        setMsg("Error saving post.");
      }
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(""), 3000);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      await axios.delete(`${API}/admin/blog/posts/${id}`, { headers });
      await fetchPosts();
    } catch (err) {
      if (err?.response?.status === 401) {
        handleLogout();
      } else {
        alert("Error deleting post.");
      }
    }
  };

  if (!token) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-50 text-[#0A66C2] rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings size={32} />
            </div>
            <h1 className="text-2xl font-bold font-['Chivo'] text-slate-900">
              Blog Admin Login
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
            {loginError && (
              <p className="text-red-500 text-xs text-center">{loginError}</p>
            )}
            <button
              type="submit"
              className="w-full bg-[#0A66C2] text-white py-4 rounded-xl font-bold hover:bg-[#084e96] transition-all"
            >
              Login to Dashboard
            </button>
          </form>
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#0A66C2] transition-colors"
            >
              <ArrowLeft size={16} /> Back to Blog
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
              Blog Management
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
          {/* LEFT SIDE: IDLE FORM (No Scroll) */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-auto lg:h-[850px]">
            <div className="p-5 sm:p-6 md:p-8 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-blue-50 rounded-lg text-[#0A66C2]">
                  <PlusCircle size={20} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 font-['Chivo']">
                  {editingPost ? "Update Post" : "Post Creator"}
                </h2>
              </div>
              <p className="text-sm text-slate-500">
                Draft and publish blog entries.
              </p>
            </div>

            <form onSubmit={handleSave} className="p-5 sm:p-6 md:p-8 space-y-4 flex-grow">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
                  Title *
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0A66C2] bg-slate-50/50"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
                  Excerpt *
                </label>
                <input
                  value={form.excerpt}
                  onChange={(e) =>
                    setForm({ ...form, excerpt: e.target.value })
                  }
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0A66C2] bg-slate-50/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0A66C2] bg-slate-50/50"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
                    Tags
                  </label>
                  <input
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    placeholder="tag1, tag2"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0A66C2] bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
                  Body Content *
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) =>
                    setForm({ ...form, content: e.target.value })
                  }
                  required
                  rows="6"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0A66C2] bg-slate-50/50 resize-none"
                />
              </div>

              {/* UPLOAD FROM DEVICE SECTION */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
                  Cover Image
                </label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 bg-slate-50/50 text-center relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <ImagePlus
                    size={20}
                    className="text-slate-300 group-hover:text-[#0A66C2] mx-auto mb-1 transition-colors"
                  />
                  <span className="text-[10px] font-bold text-slate-600 block">
                    Click to upload from device
                  </span>
                </div>
                {imageName && (
                  <p className="text-[10px] text-[#0A66C2] mt-1.5 font-black truncate text-center">
                    {imageName}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <input
                  type="checkbox"
                  id="pub"
                  checked={form.published}
                  onChange={(e) =>
                    setForm({ ...form, published: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#0A66C2] cursor-pointer"
                />
                <label
                  htmlFor="pub"
                  className="text-[10px] font-black text-slate-700 uppercase tracking-tighter cursor-pointer"
                >
                  Visible to Public
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-[#0A66C2] text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#084e96] shadow-lg shadow-blue-100 disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingPost ? "Update" : "Publish"}
                </button>
                {editingPost && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-6 bg-slate-100 text-slate-600 rounded-xl font-black uppercase tracking-widest text-xs"
                  >
                    X
                  </button>
                )}
              </div>
              {msg && (
                <p className="text-center text-[10px] font-bold text-green-600 uppercase tracking-widest">
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
                    <LayoutGrid size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 font-['Chivo']">
                    Post Inventory
                  </h2>
                </div>
                <p className="text-sm text-slate-500">
                  Manage published entries.
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-[#0A66C2]">
                  {posts.length}
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Posts
                </div>
              </div>
            </div>

            <div className="flex-1 lg:overflow-y-auto p-5 sm:p-6 md:p-8 bg-slate-50/50 custom-scrollbar">
              <div className="grid grid-cols-1 gap-6">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-md transition-all hover:shadow-xl group flex flex-col md:flex-row"
                  >
                    <div className="md:w-40 h-32 relative bg-slate-200 overflow-hidden shrink-0">
                      <img
                        src={
                          post.image_url ||
                          "https://via.placeholder.com/400x300?text=No+Image"
                        }
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-1">
                        <span className="bg-blue-50 text-[#0A66C2] text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                          {post.category}
                        </span>
                        <div
                          className={`flex items-center gap-1 text-[9px] font-bold uppercase ${
                            post.published ? "text-green-600" : "text-slate-400"
                          }`}
                        >
                          {post.published ? <Eye size={10} /> : <EyeOff size={10} />}{" "}
                          {post.published ? "Live" : "Draft"}
                        </div>
                      </div>
                      <h3 className="text-md font-bold text-slate-900 font-['Chivo'] mb-1 line-clamp-1">
                        {post.title}
                      </h3>

                      <div className="flex gap-2 mt-auto pt-3 border-t border-slate-50">
                        <button
                          onClick={() => openEdit(post)}
                          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-[#0A66C2] transition-all"
                        >
                          <Edit3 size={12} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(post.id, post.title)}
                          className="px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {posts.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center py-20 text-slate-300">
                    <PlusCircle size={48} className="mb-4 opacity-20" />
                    <p className="font-bold uppercase tracking-widest text-xs">
                      Empty Inventory
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
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `,
        }}
      />
    </main>
  );
}