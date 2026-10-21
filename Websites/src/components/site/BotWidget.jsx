import React, { useEffect, useState, useRef } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";

// Public bot widget. Renders only when a BotConfig record exists AND is
// enabled — so the admin toggle actually controls what visitors see.
// All model calls go through the botChat backend function; no credential
// ever reaches the browser.

function sessionId() {
  try {
    const key = "ach_bot_session";
    let id = sessionStorage.getItem(key);
    if (!id) { id = `s_${Math.random().toString(36).slice(2)}_${Date.now()}`; sessionStorage.setItem(key, id); }
    return id;
  } catch {
    return `s_${Math.random().toString(36).slice(2)}`;
  }
}

export default function BotWidget() {
  const [config, setConfig] = useState(null);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    base44.entities.BotConfig.list()
      .then((rows) => {
        const c = (rows || [])[0];
        if (c && c.enabled) setConfig(c);
      })
      .catch(() => {});
  }, []);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }); }, [messages, open]);

  if (!config) return null;

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    const history = [...messages, { role: "user", content: text }];
    setMessages(history); setInput(""); setSending(true); setError(null);
    try {
      const res = await base44.functions.invoke("botChat", {
        messages: history, session_id: sessionId(), persist: true,
      });
      const payload = res?.data || res;
      if (payload?.ok === false) {
        // Honest failure — never a fabricated reply.
        setError(payload.not_configured
          ? "The assistant isn't available right now."
          : (payload.error || "Something went wrong. Please try again."));
      } else {
        setMessages([...history, { role: "assistant", content: payload.reply }]);
      }
    } catch (e) {
      setError(e?.message || "Something went wrong. Please try again.");
    }
    setSending(false);
  };

  const side = config.placement === "bottom_left" ? "left-5" : "right-5";

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          title={`Chat with ${config.display_name}`}
          className={`fixed bottom-5 ${side} z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lift transition-transform hover:scale-105`}
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {open && (
        <div className={`fixed bottom-5 ${side} z-[60] flex h-[520px] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-2xl`}>
          <div className="flex flex-shrink-0 items-center justify-between bg-navy px-4 py-3 text-white">
            <div>
              <div className="text-sm font-semibold">{config.display_name}</div>
              <div className="text-[11px] text-white/50">Not a law firm. No legal advice.</div>
            </div>
            <button onClick={() => setOpen(false)} title="Close chat" className="text-white/60 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-secondary/30 p-4">
            {messages.length === 0 && (
              <div className="max-w-[85%] rounded-2xl bg-white px-4 py-2.5 text-sm text-navy shadow-sm">
                {config.greeting_message || "Hi — how can I help?"}
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm shadow-sm ${m.role === "user" ? "bg-brand text-white" : "bg-white text-navy"}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {sending && <div className="text-xs text-admuted">Typing...</div>}
            {error && <div className="text-xs text-destructive">{error}</div>}
          </div>

          <div className="flex flex-shrink-0 items-center gap-2 border-t border-border bg-white p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") send(); }}
              placeholder="Ask a question..."
              className="flex-1 rounded-full border border-border px-4 py-2 text-sm text-navy outline-none focus:border-brand"
            />
            <button onClick={send} disabled={sending || !input.trim()} title="Send" className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white disabled:opacity-50">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
