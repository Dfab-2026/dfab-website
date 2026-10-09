import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, User, Tag, ArrowLeft, Share2 } from "lucide-react";
import axios from "axios";
import { getApiBase } from "../utils/backendApi";
import AutoSEOHead from "../components/AutoSEOHead";
import { DEFAULT_OG_IMAGE, SITE_URL } from "../seoConfig";

const API = getApiBase();

export default function BlogPost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setPost(null);

    axios
      .get(`${API}/blog/posts/${id}`, {
        headers: { Accept: "application/json", "Cache-Control": "no-cache" },
        params: { _ts: Date.now() },
      })
      .then((r) => {
        if (!cancelled) setPost(r.data);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Failed to load blog post from MongoDB:", err);
          setPost(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-[#0A66C2] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-slate-900 mb-4 font-['Chivo']">Post Not Found</h2>
        <Link to="/blog" className="text-[#0A66C2] hover:underline">Back to Blog</Link>
      </div>
    );
  }

  const rawSeoDescription = (post.excerpt || post.content || "")
    .replace(/\s+/g, " ")
    .trim();
  const seoDescription = (
    rawSeoDescription.length >= 80
      ? rawSeoDescription
      : `${rawSeoDescription} Read DFAB technical insights on industrial fabrication, welding and manufacturing practices.`
  )
    .trim()
    .slice(0, 165);
  const seoTitle = `${post.title} | DFAB`.slice(0, 70);
  const seoKeywords = Array.from(
    new Set([post.category, ...(post.tags || []), "DFAB", "industrial manufacturing"])
  ).filter(Boolean);
  const canonicalPath = `/blog/${id}`;
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: seoDescription,
    image: post.image_url || DEFAULT_OG_IMAGE,
    datePublished: post.created_at,
    dateModified: post.updated_at || post.created_at,
    author: {
      "@type": "Organization",
      name: post.author || "DFAB Team",
    },
    publisher: {
      "@type": "Organization",
      name: "DFAB Stainless System Pvt Ltd",
      logo: {
        "@type": "ImageObject",
        url: DEFAULT_OG_IMAGE,
      },
    },
    mainEntityOfPage: `${SITE_URL}${canonicalPath}`,
  };

  return (
    <>
      <AutoSEOHead
        cacheKey={`blog:${id}:${post.updated_at || post.created_at || "current"}`}
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        canonicalPath={canonicalPath}
        image={post.image_url || DEFAULT_OG_IMAGE}
        imageAlt={post.title}
        type="article"
        publishedTime={post.created_at}
        modifiedTime={post.updated_at || post.created_at}
        author={post.author || "DFAB Team"}
        schema={articleSchema}
        contentSummary={`${post.title}. ${post.excerpt || ""} ${(post.content || "").slice(0, 1200)}`}
      />
      <main className="bg-white">
      {/* Visual Header */}
      {post.image_url && (
        <div className="relative h-72 md:h-96">
          <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 flex items-end">
            <div className="max-w-4xl mx-auto px-4 md:px-8 pb-10 w-full">
              <span className="inline-block bg-[#0A66C2] text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
                {post.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-white font-['Chivo']">
                {post.title}
              </h1>
            </div>
          </div>
        </div>
      )}

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          {/* Metadata Bar */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-8 pb-6 border-b border-slate-200">
            <Link to="/blog" className="flex items-center gap-1 text-[#0A66C2] hover:underline font-medium">
              <ArrowLeft size={16} /> Back to Blog
            </Link>
            <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(post.created_at)}</span>
            <span className="flex items-center gap-1"><User size={14} /> {post.author}</span>
            <button
              onClick={() => navigator.share?.({ title: post.title, url: window.location.href })}
              className="flex items-center gap-1 ml-auto hover:text-[#0A66C2] transition-colors font-semibold"
            >
              <Share2 size={14} /> Share
            </button>
          </div>

          {!post.image_url && (
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 font-['Chivo']">{post.title}</h1>
          )}

          {/* Intro Excerpt */}
          <p className="text-xl text-slate-600 leading-relaxed mb-8 font-medium border-l-4 border-[#0A66C2] pl-5">
            {post.excerpt}
          </p>

          {/* FIXED IDLE BOX WITH INTERNAL SCROLL */}
          <div className="border border-slate-200 rounded-2xl bg-slate-50 p-2 shadow-xl">
            <div
              className="h-[700px] overflow-y-auto p-6 md:p-12 bg-white rounded-xl custom-scrollbar prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap"
              style={{ textAlign: 'justify' }}
            >
              {post.content}
            </div>
          </div>

          {/* Tags Footer */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-slate-200">
              <Tag size={16} className="text-slate-400 mt-0.5" />
              {post.tags.map((tag) => (
                <span key={tag} className="text-sm bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Final Call to Action */}
          <div className="mt-12 text-center bg-[#0F172A] rounded-2xl p-10 text-white">
            <h3 className="text-2xl font-bold mb-3 font-['Chivo'] tracking-tight">
              Ready to Start Your Project?
            </h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Contact DFAB today for high-precision fabrication and expert engineering services tailored to your needs.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-[#0A66C2] text-white px-8 py-3 rounded-sm font-bold hover:bg-[#084e96] transition-all shadow-lg"
            >
              Get a Free Quote
            </Link>
          </div>
        </div>
      </section>

      {/* Scoped Styling for the Fixed Content Box */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
          border: 2px solid #f8fafc;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #0A66C2;
        }
        
        /* Ensures whitespace preservation and paragraph spacing */
        .prose {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
      </main>
    </>
  );
}