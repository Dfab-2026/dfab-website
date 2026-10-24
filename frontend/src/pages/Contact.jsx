import { useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Phone,
  PhoneCall,
  Mail,
  MessageCircle,
  Send,
  CheckCircle,
  AlertCircle,
  Paperclip,
  ArrowUpRight,
} from "lucide-react";
import axios from "axios";
import { getVisitorId } from "../utils/analyticsApi";
import { getApiBase } from "../utils/backendApi";

const API = getApiBase();

const EMPTY = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

export default function Contact() {
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("subject", form.subject);
    formData.append("message", form.message);
    if (form.phone) formData.append("phone", form.phone);
    formData.append("visitor_id", getVisitorId());
    if (file) formData.append("file", file);

    try {
      const response = await axios.post(`${API}/contact`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000,
      });

      if (response.data?.status === "success") {
        setStatus({
          type: "success",
          msg:
            response.data.message ||
            "Your inquiry has been submitted successfully.",
        });
        setForm(EMPTY);
        setFile(null);
        const uploadInput = document.getElementById("file-upload");
        if (uploadInput) uploadInput.value = "";
      } else {
        setStatus({ type: "error", msg: "Unexpected response from server." });
      }
    } catch (err) {
      setStatus({
        type: "error",
        msg: "Something went wrong. Please try later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const onFileChange = (e) => setFile(e.target.files[0]);

  return (
    <main className="bg-white">
      {/* HEADER SECTION - Standardized */}
      <div className="bg-[#0F172A] min-h-[240px] sm:min-h-[260px] flex items-center px-4 py-8">
        <div className="max-w-7xl mx-auto w-full">
          <span className="text-xs font-semibold text-[#0A66C2] uppercase tracking-wider">Get In Touch</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-2 font-['Chivo']">Contact Us</h1>
          <p className="text-slate-400 mt-3 max-w-2xl">Reach out to our team today. We are ready to help you engineer high-precision solutions tailored to your specific industrial needs.          </p>
          <div className="flex items-center gap-2 mt-4 text-sm text-slate-400">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white">Contacts</span>
          </div>
        </div>
      </div>

      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
            {/* CONTACT DETAILS */}
            <div className="lg:col-span-2 group relative h-full">
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-[#0A66C2]/30 via-sky-300/20 to-slate-200/70 opacity-100 transition-opacity duration-300" />
              <div className="relative flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 md:p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_18px_45px_rgba(15,23,42,0.10)]">
                <div className="flex-1 space-y-5">
                  <div>
                    <span className="text-xs font-semibold text-[#0A66C2] uppercase tracking-[0.18em]">
                      Reach Us
                    </span>
                    <h2 className="text-2xl font-bold text-slate-900 mt-2 font-['Chivo'] leading-snug">
                      Let&apos;s Talk About Your Project
                    </h2>
                    <p className="text-slate-600 mt-3 text-sm leading-relaxed">
                      Contact our team for inquiries, quotations, technical
                      discussions, and industrial fabrication requirements.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="group/item flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3 transition-all duration-300 hover:border-[#93C5FD] hover:bg-white hover:shadow-sm">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0A66C2]/10 text-[#0A66C2] transition-transform duration-300 group-hover/item:scale-105">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">
                          Visit Us
                        </h4>
                        <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                          No: 3B/415, No-8 KIADB Main Road, 1st Stage, 2nd
                          Phase, Peenya Industrial Area, Bengaluru – 560058
                        </p>
                      </div>
                    </div>

                    <div className="group/item flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3 transition-all duration-300 hover:border-[#93C5FD] hover:bg-white hover:shadow-sm">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0A66C2]/10 text-[#0A66C2] transition-transform duration-300 group-hover/item:scale-105">
                        <Phone size={18} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">
                          Call Us
                        </h4>
                        <a
                          href="tel:+919908504466"
                          className="text-sm text-[#0A66C2] hover:underline mt-1 inline-block"
                        >
                          +91 9908504466
                        </a>
                      </div>
                    </div>

                    <div className="group/item flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3 transition-all duration-300 hover:border-[#93C5FD] hover:bg-white hover:shadow-sm">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0A66C2]/10 text-[#0A66C2] transition-transform duration-300 group-hover/item:scale-105">
                        <PhoneCall size={18} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">
                          Landline
                        </h4>
                        <a
                          href="tel:08022110244"
                          className="text-sm text-[#0A66C2] hover:underline mt-1 inline-block"
                        >
                          080-22110244
                        </a>
                      </div>
                    </div>

                    <div className="group/item flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3 transition-all duration-300 hover:border-[#93C5FD] hover:bg-white hover:shadow-sm">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0A66C2]/10 text-[#0A66C2] transition-transform duration-300 group-hover/item:scale-105">
                        <Mail size={18} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">
                          Email Us
                        </h4>
                        <a
                          href="mailto:info@dfab.in"
                          className="text-sm text-[#0A66C2] hover:underline mt-1 inline-block break-all"
                        >
                          info@dfab.in
                        </a>
                      </div>
                    </div>

                    <div className="group/item flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3 transition-all duration-300 hover:border-[#93C5FD] hover:bg-white hover:shadow-sm">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0A66C2]/10 text-[#0A66C2] transition-transform duration-300 group-hover/item:scale-105">
                        <MessageCircle size={18} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">
                          WhatsApp
                        </h4>
                        <a
                          href="https://api.whatsapp.com/send?phone=919908504466"
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-[#0A66C2] hover:underline mt-1 inline-block"
                        >
                          +91 9908504466
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-5">
                  <a
                    href="https://api.whatsapp.com/send?phone=919908504466"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3.5 font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1fb457] hover:shadow-md"
                  >
                    <MessageCircle size={18} />
                    Chat on WhatsApp
                    <ArrowUpRight size={16} />
                  </a>
                </div>
              </div>
            </div>

            {/* FORM */}
            <div className="lg:col-span-3 group relative h-full">
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-slate-200 via-[#0A66C2]/20 to-sky-200/40 opacity-100 transition-opacity duration-300" />
              <div className="relative flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 md:p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_18px_45px_rgba(15,23,42,0.10)]">
                <div className="mb-6">
                  <span className="text-xs font-semibold text-[#0A66C2] uppercase tracking-[0.18em]">
                    Inquiry Form
                  </span>
                  <h3 className="text-2xl font-bold mt-2 text-slate-900 font-['Chivo']">
                    Send Us a Message
                  </h3>
                  <p className="text-slate-600 mt-2 text-sm">
                    Fill in your details and our team will get back to you
                    shortly.
                  </p>
                </div>

                {status && (
                  <div
                    className={`flex items-start gap-3 p-4 mb-6 rounded-xl text-sm ${
                      status.type === "success"
                        ? "bg-green-50 border border-green-200 text-green-700"
                        : "bg-red-50 border border-red-200 text-red-600"
                    }`}
                  >
                    {status.type === "success" ? (
                      <CheckCircle size={18} className="shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    )}
                    <span>{status.msg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <input
                      name="name"
                      value={form.name}
                      onChange={onChange}
                      required
                      placeholder="Name"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-4 text-sm text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-[#0A66C2] focus:ring-4 focus:ring-[#0A66C2]/10"
                    />

                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={onChange}
                      required
                      placeholder="Email"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-4 text-sm text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-[#0A66C2] focus:ring-4 focus:ring-[#0A66C2]/10"
                    />

                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          phone: e.target.value.replace(/\D/g, ""),
                        })
                      }
                      placeholder="Phone"
                      maxLength={10}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-4 text-sm text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-[#0A66C2] focus:ring-4 focus:ring-[#0A66C2]/10"
                    />

                    <input
                      name="subject"
                      value={form.subject}
                      onChange={onChange}
                      required
                      placeholder="Subject"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-4 text-sm text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-[#0A66C2] focus:ring-4 focus:ring-[#0A66C2]/10"
                    />
                  </div>

                  <textarea
                    name="message"
                    value={form.message}
                    onChange={onChange}
                    required
                    rows={6}
                    placeholder="Message"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-10 text-sm text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 resize-none focus:border-[#0A66C2] focus:ring-4 focus:ring-[#0A66C2]/10"
                  />

                  <div className="relative">
                    <input
                      type="file"
                      id="file-upload"
                      onChange={onFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex min-h-[136px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 transition-all duration-300 hover:border-[#0A66C2] hover:bg-[#EFF6FF]"
                    >
                      <Paperclip size={16} />
                      {file ? (
                        <span className="font-medium text-slate-900 truncate">
                          {file.name}
                        </span>
                      ) : (
                        <span>Attach a document (Optional)</span>
                      )}
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A66C2] px-5 py-3.5 font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#084e96] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Send size={16} />
                    {loading ? "Sending..." : "Send Message"}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* MAP SECTION */}
          <div className="mt-16 md:mt-20">
            <div className="text-center mb-10">
              <span className="text-xs font-semibold text-[#0A66C2] uppercase tracking-[0.18em]">
                Visit Us
              </span>

              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mt-2 font-['Chivo']">
                Our Location
              </h2>

              <p className="text-slate-600 mt-3 max-w-2xl mx-auto">
                DFAB Stainless System Pvt Ltd, No: 3B/415, No-8 KIADB Main
                Road, 1st Stage, 2nd Phase, Peenya Industrial Area, Bengaluru
                – 560058
              </p>
            </div>

            <div className="group relative">
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-[#0A66C2]/25 via-sky-200/40 to-slate-200/70" />
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.08)]">
                <div className="w-full h-[320px] md:h-[430px] lg:h-[520px]">
                  <iframe
                    title="DFAB Stainless System Pvt Ltd Location"
                    src="https://maps.google.com/maps?width=100%25&height=520&hl=en&q=DFAB%20STAINLESS%20SYSTEM%20PVT%20LTD,%20Bengaluru&t=&z=17&ie=UTF8&iwloc=B&output=embed"
                    className="w-full h-full border-0"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </div>

            
              
          </div>
        </div>
      </section>
    </main>
  );
}