import { useState, useEffect } from "react";
import { X, Phone, Calendar, Mail, MessageSquare } from "lucide-react";

const WHATSAPP_NUM = "919908504466";
const EMPTY_FORM = { date: "", email: "", phone: "", message: "" };

export default function InquireModal({ onClose }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const validate = () => {
    const errs = {};
    if (!form.date) errs.date = "Please select a date";
    if (!form.email) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.phone) errs.phone = "Phone number is required";
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const formatDate = (d) =>
      new Date(d).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

    const lines = [
      "📋 *New Inquiry from DFAB Website*",
      "",
      `📅 *Preferred Schedule:* ${formatDate(form.date)}`,
      `📧 *Email:* ${form.email}`,
      `📞 *Phone:* ${form.phone}`,
    ];
    if (form.message.trim()) lines.push(`💬 *Message:* ${form.message.trim()}`);
    lines.push("", "_Sent via DFAB Website_");

    window.open(`https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank");
    onClose();
  };

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto" data-testid="inquire-modal-overlay">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-md max-h-[calc(100svh-1.5rem)] bg-white rounded-2xl shadow-2xl overflow-y-auto animate-scale-in my-auto" data-testid="inquire-modal">
        {/* Header */}
        <div className="bg-[#0A66C2] px-5 sm:px-7 py-5 sm:py-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-white font-['Chivo']">Inquire Now</h2>
              <p className="text-blue-100 text-sm mt-1">
                We'll contact you via WhatsApp
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors"
              data-testid="inquire-modal-close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 sm:px-7 py-5 sm:py-6 space-y-5" data-testid="inquire-form">

          {/* Schedule Date */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <Calendar size={14} className="text-[#0A66C2]" />
              Schedule Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={onChange}
              min={today}
              className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66C2] transition-shadow ${errors.date ? "border-red-400 bg-red-50" : "border-slate-300"}`}
              data-testid="inquire-date-input"
            />
            {errors.date && <p className="text-red-500 text-xs mt-1.5">{errors.date}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <Mail size={14} className="text-[#0A66C2]" />
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="your@email.com"
              className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66C2] transition-shadow ${errors.email ? "border-red-400 bg-red-50" : "border-slate-300"}`}
              data-testid="inquire-email-input"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <Phone size={14} className="text-[#0A66C2]" />
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={onChange}
              placeholder="+91 XXXXX XXXXX"
              className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66C2] transition-shadow ${errors.phone ? "border-red-400 bg-red-50" : "border-slate-300"}`}
              data-testid="inquire-phone-input"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1.5">{errors.phone}</p>}
          </div>

          {/* Message Optional */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <MessageSquare size={14} className="text-[#0A66C2]" />
              Message
              <span className="text-xs font-normal text-slate-400 ml-1">(optional)</span>
            </label>
            <textarea
              name="message"
              value={form.message}
              onChange={onChange}
              rows={3}
              placeholder="Describe your requirement or project..."
              className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66C2] transition-shadow resize-none"
              data-testid="inquire-message-input"
            />
          </div>

          {/* WhatsApp Submit */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white py-3.5 rounded-xl font-semibold text-sm transition-colors shadow-md"
            data-testid="inquire-submit-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.861L.054 23.761a.5.5 0 00.609.634l6.101-1.6A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.94 9.94 0 01-5.073-1.387l-.36-.214-3.742.981.999-3.648-.235-.374A9.95 9.95 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            Send via WhatsApp
          </button>

          <p className="text-center text-xs text-slate-400">
            Opens WhatsApp with your details pre-filled
          </p>
        </form>
      </div>
    </div>
  );
}
