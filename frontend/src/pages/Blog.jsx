import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Calendar, User, Settings, RefreshCw } from "lucide-react";
import axios from "axios";
import { getApiBase } from "../utils/backendApi";

const API = getApiBase();


const CATEGORIES = ["All", "Fabrication", "Welding", "Industry News", "Quality", "Projects"];

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError("");

    let lastError = null;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const response = await axios.get(`${API}/blog/posts`, {
          headers: { Accept: "application/json", "Cache-Control": "no-cache" },
          params: { _ts: Date.now() },
          timeout: 75000,
        });

        setPosts(Array.isArray(response.data) ? response.data : []);
        setLoading(false);
        return;
      } catch (err) {
        lastError = err;
        if (attempt === 0) {
          await new Promise((resolve) => window.setTimeout(resolve, 1500));
        }
      }
    }

    console.error("Failed to load blog posts from MongoDB:", lastError);
    setPosts([]);
    setError("Could not load published posts from the database.");
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const filtered =
    activeCategory === "All"
      ? posts
      : posts.filter((p) => p.category === activeCategory);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <main className="bg-white relative">
      
      {/* ADMIN BUTTON */}
      <div className="absolute top-4 right-4 z-50 opacity-50 hover:opacity-100 transition-all duration-300">
        <Link
          to="/Blog/admin"
          className="flex items-center gap-1.5 px-3 py-2 bg-white/20 text-white/70 hover:text-white hover:bg-[#0A66C2] rounded-lg border border-white/20 hover:border-[#0A66C2] transition-all shadow-lg hover:shadow-blue-500/20 backdrop-blur-sm"
          title="Careers Admin Console"
        >
          <Settings size={14} className="animate-pulse-slow" />
          <span className="text-[10px] font-black uppercase tracking-widest">Admin</span>
        </Link>
      </div>

      {/* HEADER SECTION */}
      <section className="bg-[#0F172A] min-h-[240px] sm:min-h-[260px] flex items-center px-4 py-8">
        <div className="max-w-7xl mx-auto w-full">
          <span className="text-xs font-semibold text-[#0A66C2] uppercase tracking-wider">Knowledge Hub</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-2 font-['Chivo']">Technical Blog</h1>
          <p className="text-slate-400 mt-3 max-w-2xl">
            Explore insights, industry trends, and expert knowledge in fabrication, welding, 
  machining, and manufacturing technologies from the DFAB team.
          </p>
          <div className="flex items-center gap-2 mt-4 text-sm text-slate-400">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white">Blog</span>
          </div>
        </div>
      </section>

      {/* BLOG CONTENT */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 mb-12">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                  activeCategory === cat
                    ? "bg-[#0A66C2] text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-slate-50 min-h-[420px] md:h-[550px] rounded-xl" />
              ))}
            </div>
          ) : error ? (
            <div className="border border-red-100 bg-red-50 rounded-xl p-8 text-center">
              <p className="text-sm font-semibold text-red-700">{error}</p>
              <button
                type="button"
                onClick={loadPosts}
                className="mt-4 inline-flex items-center gap-2 bg-[#0A66C2] text-white px-5 py-2.5 rounded-md text-sm font-bold hover:bg-[#084e96] transition-colors"
              >
                <RefreshCw size={15} /> Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="border border-slate-200 bg-slate-50 rounded-xl p-6 sm:p-8 md:p-10 text-center">
              <p className="text-sm font-semibold text-slate-600">
                No published blog posts are available in the database.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((post) => (
                <article
                  key={post.id}
                  className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-500 flex flex-col min-h-[500px] md:h-[550px]"
                >
                  {/* Fixed Image Area */}
                  <div className="relative h-44 overflow-hidden shrink-0 bg-slate-100">
                    {post.image_url ? (
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center px-6 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                        DFAB Technical Blog
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="bg-[#0A66C2] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  {/* FULL ARTICLE BOX WITH SCROLL */}
                  <div className="p-6 flex flex-col flex-grow overflow-hidden bg-slate-50/30">
                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 shrink-0">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(post.created_at)}</span>
                      <span className="flex items-center gap-1"><User size={12} /> {post.author}</span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-3 font-['Chivo'] leading-tight border-b border-slate-200 pb-2 shrink-0">
                      {post.title}
                    </h3>

                    {/* Scrollable Full Content Area */}
                    <div className="text-sm text-slate-600 leading-relaxed overflow-y-auto pr-2 custom-scrollbar flex-grow">
                      <p className="text-justify whitespace-pre-line">
                        {/* Displaying post.content directly instead of excerpt */}
                        {post.content || post.excerpt}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="mt-20 border-t border-slate-100"></div>
        </div>
      </section>

      {/* Internal Scrollbar Styling */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #0A66C2;
        }
      `}</style>
    </main>
  );
}