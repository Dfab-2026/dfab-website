import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import axios from "axios";
import { getApiBase } from "../utils/backendApi";

const API = getApiBase();

const PROACTIVE_PROMPTS = [
  "👋 Need help with a fabrication project?",
  "🔧 Ask me about welding or machining!",
  "💡 Looking for a pressure vessel quote?",
  "🏭 What can DFAB fabricate for you?",
  "⚙️ Got a custom industrial requirement?",
  "📐 Need stainless steel experts?",
];

const QUICK_QUESTIONS = [
  "What services do you offer?",
  "How do I get a quote?",
  "What welding types do you do?",
  "Which industries do you serve?",
  "What is 6G pipe welding?",
  "Tell me about your facility",
];

function getSessionId() {
  let sid = sessionStorage.getItem("dfab_chat_sid");
  if (!sid) {
    const randomPart =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    sid = `chat_${randomPart}`;
    sessionStorage.setItem("dfab_chat_sid", sid);
  }
  return sid;
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span key={i} className="w-2 h-2 bg-slate-400 rounded-full"
          style={{ animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
      ))}
    </div>
  );
}

/* ── Animated Robot SVG ── */
function RobotSVG({ size = 64 }) {
  return (
    <svg
      width={size}
      height={Math.round(size * 1.15)}
      viewBox="0 0 56 66"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* ── Antenna ── */}
      <line x1="28" y1="1" x2="28" y2="11"
        stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" />
      {/* Antenna ball */}
      <circle cx="28" cy="1" r="3.5" fill="#60a5fa" />
      {/* Antenna glow pulse */}
      <circle cx="28" cy="1" r="3.5" fill="#60a5fa" opacity="0.5">
        <animate attributeName="r"       values="3.5;8;3.5"   dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;0;0.5"   dur="2s" repeatCount="indefinite" />
      </circle>

      {/* ── Head ── */}
      <rect x="5" y="11" width="46" height="34" rx="9" fill="#0A66C2" />
      {/* Head highlight */}
      <rect x="11" y="15" width="18" height="6" rx="3" fill="white" opacity="0.12" />

      {/* ── Left Eye white ── */}
      <circle cx="19" cy="27" r="7.5" fill="white" className="robot-blink" />
      {/* Left pupil */}
      <circle cx="21" cy="27" r="3.8" fill="#0F172A" className="robot-blink" />
      {/* Left eye shine */}
      <circle cx="22" cy="25" r="1.4" fill="white" className="robot-blink" />

      {/* ── Right Eye white ── */}
      <circle cx="37" cy="27" r="7.5" fill="white" className="robot-blink" />
      {/* Right pupil */}
      <circle cx="39" cy="27" r="3.8" fill="#0F172A" className="robot-blink" />
      {/* Right eye shine */}
      <circle cx="40" cy="25" r="1.4" fill="white" className="robot-blink" />

      {/* ── Mouth (smile) ── */}
      <path d="M17 37 Q28 45 39 37" stroke="white" strokeWidth="2.5"
        fill="none" strokeLinecap="round" />

      {/* ── Body ── */}
      <rect x="11" y="47" width="34" height="17" rx="6" fill="#1565C0" />

      {/* Chest strip */}
      <rect x="19" y="51" width="18" height="3" rx="1.5" fill="#93c5fd" opacity="0.5" />
      {/* Chest light */}
      <circle cx="28" cy="58" r="3.5" fill="#60a5fa" className="robot-chest" />

      {/* ── Left Arm ── */}
      <rect x="1" y="48" width="8" height="13" rx="4" fill="#1565C0"
        className="robot-wave-l" />
      {/* ── Right Arm ── */}
      <rect x="47" y="48" width="8" height="13" rx="4" fill="#1565C0"
        className="robot-wave-r" />
    </svg>
  );
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! I'm DFAB's AI assistant — your expert for all fabrication questions. Ask me about welding, pressure vessels, materials, pricing guidance, or our services. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleText, setBubbleText] = useState("");
  const [showQuick, setShowQuick] = useState(true);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const sessionId = useRef(getSessionId());
  const bubbleTimer = useRef(null);
  const bubbleCycle = useRef(null);

  const showNextBubble = useCallback(() => {
    setBubbleText(PROACTIVE_PROMPTS[Math.floor(Math.random() * PROACTIVE_PROMPTS.length)]);
    setShowBubble(true);
  }, []);

  useEffect(() => {
    bubbleTimer.current = setTimeout(() => {
      setBubbleText(PROACTIVE_PROMPTS[0]);
      setShowBubble(true);
      bubbleCycle.current = setInterval(showNextBubble, 6000);
    }, 4000);
    return () => { clearTimeout(bubbleTimer.current); clearInterval(bubbleCycle.current); };
  }, [showNextBubble]);

  useEffect(() => {
    if (open) {
      setShowBubble(false);
      clearInterval(bubbleCycle.current);
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 150);
    } else {
      bubbleTimer.current = setTimeout(() => {
        setShowBubble(true);
        setBubbleText(PROACTIVE_PROMPTS[Math.floor(Math.random() * PROACTIVE_PROMPTS.length)]);
        bubbleCycle.current = setInterval(showNextBubble, 6000);
      }, 8000);
    }
    return () => clearTimeout(bubbleTimer.current);
  }, [open, showNextBubble]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    setShowQuick(false);
    setMessages((prev) => [...prev, { role: "user", text: msg }]);
    setLoading(true);
    try {
      const r = await axios.post(
        `${API}/chat`,
        { session_id: sessionId.current, message: msg },
        { timeout: 15000 }
      );
      setMessages((prev) => [...prev, { role: "assistant", text: r.data.response }]);
      if (!open) setUnread((n) => n + 1);
    } catch {
      setMessages((prev) => [...prev, {
        role: "assistant",
        text: "I'm having trouble connecting right now. Please WhatsApp us at +91 9187638186 for immediate help!",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      {/* ── Proactive Bubble ── */}
      {showBubble && !open && (
        <div className="fixed bottom-[5.5rem] right-7 z-50 max-w-[210px] chatbubble-enter" data-testid="chatbot-bubble">
          <div className="bg-white border border-slate-200 rounded-2xl rounded-br-sm px-4 py-3 shadow-xl text-sm text-slate-700 font-medium relative leading-snug">
            {bubbleText}
            <button
              onClick={() => { setShowBubble(false); clearInterval(bubbleCycle.current); }}
              className="absolute -top-2 -right-2 w-5 h-5 bg-slate-200 hover:bg-slate-300 rounded-full text-xs flex items-center justify-center text-slate-600 leading-none"
            >×</button>
          </div>
          <div className="absolute bottom-0 right-5 w-3 h-3 bg-white border-b border-r border-slate-200 rotate-45 translate-y-1.5" />
        </div>
      )}

      {/* ── Robot Float Button ── */}
      <div
        className={`fixed bottom-4 right-5 z-50 transition-all duration-300 ${open ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100"}`}
        data-testid="chatbot-open-btn"
        onClick={() => setOpen(true)}
      >
        <button className="robot-btn robot-float" aria-label="Open AI Chat">
          <RobotSVG size={64} />
        </button>

        {/* Unread badge */}
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-bounce-in">
            {unread}
          </span>
        )}
      </div>

      {/* ── Chat Window ── */}
      <div
        className={`fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col transition-all duration-300 origin-bottom-right ${open ? "scale-100 opacity-100" : "scale-75 opacity-0 pointer-events-none"}`}
        style={{ height: "580px" }}
        data-testid="chatbot-window"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0A66C2] to-[#1d7fd4] text-white px-5 py-4 rounded-t-2xl flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center overflow-hidden relative shrink-0">
            <RobotSVG size={32} />
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-sm font-['Chivo'] flex items-center gap-1.5">
              DFAB AI Assistant
              <Sparkles size={13} className="text-yellow-300" />
            </div>
            <div className="text-xs text-blue-100">Expert in fabrication · Always online</div>
          </div>
          <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-white/20 rounded-full transition-colors" data-testid="chatbot-close-btn">
            <X size={17} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50/80">
          {messages.map((m, i) => (
            <div key={i} className={`flex items-start gap-2.5 msg-enter ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 overflow-hidden ${m.role === "user" ? "bg-[#0A66C2]" : "bg-white border border-slate-200 shadow-sm"}`}>
                {m.role === "user"
                  ? <User size={13} className="text-white" />
                  : <RobotSVG size={22} />
                }
              </div>
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                m.role === "user"
                  ? "bg-[#0A66C2] text-white rounded-tr-sm"
                  : "bg-white text-slate-800 border border-slate-100 rounded-tl-sm"
              }`}>
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm overflow-hidden">
                <RobotSVG size={22} />
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm shadow-sm">
                <TypingDots />
              </div>
            </div>
          )}

          {/* Quick Questions */}
          {showQuick && messages.length === 1 && !loading && (
            <div className="space-y-1.5 mt-2" data-testid="quick-questions">
              <p className="text-xs text-slate-400 font-semibold px-1 uppercase tracking-wider">Quick questions</p>
              <div className="grid grid-cols-1 gap-1.5">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-left text-xs bg-white hover:bg-blue-50 border border-slate-200 hover:border-[#0A66C2] text-slate-700 hover:text-[#0A66C2] px-3.5 py-2 rounded-xl transition-all duration-150 font-medium"
                    data-testid={`quick-q-${q.substring(0, 8).replace(/\s/g, "-").toLowerCase()}`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 bg-white border-t border-slate-100 rounded-b-2xl">
          <div className="flex items-center gap-2 bg-slate-100 hover:bg-slate-50 border border-slate-200 hover:border-[#0A66C2] rounded-2xl px-4 py-2.5 transition-colors">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask anything about fabrication..."
              className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
              disabled={loading}
              data-testid="chatbot-input"
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="w-8 h-8 bg-[#0A66C2] text-white rounded-xl flex items-center justify-center hover:bg-[#084e96] transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              data-testid="chatbot-send-btn"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </div>
          <p className="text-center text-[11px] text-slate-400 mt-2">DFAB AI · For urgent matters call 9187638186</p>
        </div>
      </div>
    </>
  );
}
