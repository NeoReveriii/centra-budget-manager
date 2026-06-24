import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  useChatHistory,
  useClearChatHistory,
} from "@/hooks/use-budget-data";
import { getAccessToken } from "../lib/auth-client";

interface ChatMessage {
  id: string;
  sender: "ai" | "user";
  content: string;
}

const KwartaAI = () => {
  const [inputValue, setInputValue] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [historyHydrated, setHistoryHydrated] = useState(false);

  const { data: history, isLoading: historyLoading } = useChatHistory();
  const clearChat = useClearChatHistory();
  const isLoading = historyLoading;

  useEffect(() => {
    if (historyLoading) return;
    if (history && history.length > 0) {
      setMessages(
        history.map((msg, i) => ({
          id: msg.created_at || `hist-${i}`,
          sender: (msg.role === "user" ? "user" : "ai") as "user" | "ai",
          content: msg.content,
        })),
      );
    } else if (!historyHydrated) {
      setMessages([
        {
          id: "welcome",
          sender: "ai",
          content:
            "Good morning! I am Kwarta AI, your strict financial advisor. I have secure access to your live wallets and transactions. How can I assist you with your budget or investments today?",
        },
      ]);
    }
    setHistoryHydrated(true);
  }, [history, historyLoading, historyHydrated]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  async function handleClearHistory() {
    if (!confirm("Are you sure you want to clear your chat history?")) return;
    try {
      await clearChat.mutateAsync();
      setMessages([
        {
          id: "welcome-reset",
          sender: "ai",
          content: "History cleared. How can I help you today?",
        },
      ]);
    } catch (e) {
      alert("Failed to clear history");
    }
  }

  async function handleSendMessage(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userMsg = inputValue.trim();
    setInputValue("");

    // Optimistic UI
    const newUserMsgId = Date.now().toString();
    const newAiMsgId = (Date.now() + 1).toString();

    setMessages((prev) => [
      ...prev,
      { id: newUserMsgId, sender: "user", content: userMsg },
      { id: newAiMsgId, sender: "ai", content: "" }, // Placeholder for streaming
    ]);

    setIsTyping(true);

    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Unauthorized");
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: userMsg }),
      });

      if (!res.ok || !res.body) throw new Error("Stream failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkStr = decoder.decode(value, { stream: true });
        const lines = chunkStr.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try {
              const parsed = JSON.parse(line.slice(6));
              if (parsed.choices[0].delta.content) {
                aiText += parsed.choices[0].delta.content;
                // Update the placeholder AI message
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === newAiMsgId ? { ...m, content: aiText } : m,
                  ),
                );
              }
            } catch (err) {
              // Ignore parse errors from partial chunks
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === newAiMsgId
            ? {
                ...m,
                content:
                  "Error communicating with Kwarta AI. Please try again.",
              }
            : m,
        ),
      );
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <div className="grid grid-cols-12 gap-gutter animate-fade-in pb-10">
      {/* Strategy Overview Header */}
      <section className="col-span-12 mb-4">
        <div className="flex items-end justify-between border-b-2 border-primary-container pb-4">
          <div>
            <span className="font-label-caps text-secondary uppercase mb-1 block">
              AI Financial Advisor
            </span>
            <h2 className="font-h1 text-h1 text-primary">Kwarta AI Chat</h2>
          </div>
          <div className="text-right">
            <p className="font-label-caps text-slate-500">LIVE SYNC</p>
            <p className="font-numeric-data text-on-surface flex items-center justify-end gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Connected
            </p>
          </div>
        </div>
      </section>

      {/* Column 2: Kwarta AI Chat */}
      <div className="col-span-12 flex flex-col h-[700px] bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-surface-container-low/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
              <span
                className="material-symbols-outlined text-white"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                smart_toy
              </span>
            </div>
            <div>
              <h4 className="font-h3 text-sm text-primary font-bold">
                Kwarta AI Elite
              </h4>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                  Secure Financial Intelligence Link
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleClearHistory}
              title="Clear History"
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 cursor-pointer flex items-center"
            >
              <span className="material-symbols-outlined">delete_sweep</span>
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 cursor-pointer">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
        </div>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/20">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <span className="material-symbols-outlined animate-spin text-[32px] text-primary">
                progress_activity
              </span>
            </div>
          ) : (
            messages.map((msg) =>
              msg.sender === "ai" ? (
                <div key={msg.id} className="flex gap-4 max-w-[90%]">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
                    <span
                      className="material-symbols-outlined text-white text-sm"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      smart_toy
                    </span>
                  </div>
                  <div className="bg-surface-container-low/50 border border-slate-200 p-4 rounded-lg rounded-tl-none w-full">
                    {msg.content === "" && isTyping ? (
                      <div className="flex items-center gap-1 h-6">
                        <span
                          className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <span
                          className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <span
                          className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                    ) : (
                      <div className="prose prose-sm prose-slate max-w-none prose-p:leading-relaxed prose-th:bg-slate-50 prose-th:p-3 prose-th:text-xs prose-th:uppercase prose-th:tracking-wider prose-td:p-3 prose-table:overflow-hidden prose-table:rounded-lg prose-table:border prose-table:border-slate-200">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  key={msg.id}
                  className="flex gap-4 max-w-[85%] ml-auto flex-row-reverse"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                    Me
                  </div>
                  <div className="border border-primary-container bg-white p-4 rounded-lg rounded-tr-none">
                    <p className="font-body-sm leading-relaxed text-primary font-medium italic">
                      "{msg.content}"
                    </p>
                  </div>
                </div>
              ),
            )
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <form
          onSubmit={handleSendMessage}
          className="p-6 border-t border-slate-100 bg-white"
        >
          <div
            className={`relative flex items-center transition-shadow duration-200 ${
              inputFocused ? "shadow-lg shadow-emerald-900/5 rounded-xl" : ""
            }`}
          >
            <button
              type="button"
              className="absolute left-4 text-slate-400 hover:text-primary transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">attach_file</span>
            </button>
            <input
              className="w-full pl-12 pr-28 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none font-body-sm text-on-surface"
              placeholder="Ask about your budget, savings goals, or spending trends..."
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              disabled={isTyping}
            />
            <div className="absolute right-3 flex items-center gap-2">
              <button
                type="submit"
                disabled={isTyping || !inputValue.trim()}
                className="bg-primary-container text-white px-4 py-2.5 rounded-lg font-bold text-xs uppercase flex items-center gap-2 hover:opacity-90 transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="hidden sm:inline">Send</span>
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </div>
          </div>
          <div className="mt-3 flex justify-center gap-6">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">
                verified_user
              </span>{" "}
              Encrypted
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">gavel</span>{" "}
              Compliance Approved
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KwartaAI;
