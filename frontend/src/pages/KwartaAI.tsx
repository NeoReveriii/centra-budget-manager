import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  useChatHistory,
  useClearChatHistory,
  useTransactions,
  type Transaction,
} from "@/hooks/use-budget-data";
import { getAccessToken } from "../lib/auth-client";

interface ChatMessage {
  id: string;
  sender: "ai" | "user";
  content: string;
}

type ChartType = "income" | "expense";

interface ParsedAssistantContent {
  chartType: ChartType | null;
  displayContent: string;
}

interface ChartDatum {
  label: string;
  amount: number;
}

const currencyFormatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function parseAssistantContent(content: string): ParsedAssistantContent {
  let chartType: ChartType | null = null;
  if (content.includes("[CHART:INCOME]")) {
    chartType = "income";
  } else if (content.includes("[CHART:EXPENSE]") || content.includes("[CHART]")) {
    chartType = "expense";
  }

  const displayContent = content
    .replace(/\[CHART:(INCOME|EXPENSE)\]/g, "")
    .replace(/\[CHART\]/g, "")
    .replace(/\s*\[CHART(?::[A-Z]*)?$/g, "")
    .trim();

  return { chartType, displayContent };
}

function buildChartData(transactions: Transaction[], chartType: ChartType): ChartDatum[] {
  const filtered = transactions.filter(
    (transaction) => transaction.type.toLowerCase() === chartType,
  );
  const source = filtered.length > 0 ? filtered : transactions;
  const totals = new Map<string, number>();

  source.forEach((transaction) => {
    const label = transaction.description?.trim() || "Other";
    const amount = Number(transaction.amount || 0);
    totals.set(label, (totals.get(label) || 0) + amount);
  });

  return Array.from(totals.entries())
    .map(([label, amount]) => ({ label, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6);
}

function polarToCartesian(cx: number, cy: number, radius: number, angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function buildArcPath(startAngle: number, endAngle: number, radius: number) {
  const start = polarToCartesian(50, 50, radius, endAngle);
  const end = polarToCartesian(50, 50, radius, startAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
  return `M 50 50 L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}

function ChatVisualization({
  chartType,
  transactions,
}: {
  chartType: ChartType;
  transactions: Transaction[];
}) {
  const data = useMemo(() => buildChartData(transactions, chartType), [transactions, chartType]);
  const total = useMemo(() => data.reduce((sum, item) => sum + item.amount, 0), [data]);
  const palette = ["#0f766e", "#14b8a6", "#f59e0b", "#ef4444", "#334155", "#84cc16"];
  const title = chartType === "income" ? "Income Visual" : "Expense Visual";

  if (data.length === 0 || total <= 0) {
    return (
      <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white/70 p-4 text-sm text-slate-500">
        No transaction data to visualize yet.
      </div>
    );
  }

  let runningAngle = 0;

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
        <div>
          <p className="font-label-caps text-[10px] uppercase tracking-[0.25em] text-slate-500">
            {title}
          </p>
          <p className="text-sm font-semibold text-primary">
            Total {chartType}: {currencyFormatter.format(total)}
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
          Live data
        </span>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[180px_minmax(0,1fr)] md:items-center">
        <div className="mx-auto h-40 w-40">
          <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-sm">
            {data.map((item, index) => {
              const sliceAngle = total > 0 ? (item.amount / total) * 360 : 0;
              const startAngle = runningAngle;
              const endAngle = runningAngle + sliceAngle;
              runningAngle = endAngle;

              return (
                <path
                  key={`${item.label}-${index}`}
                  d={buildArcPath(startAngle, endAngle, 46)}
                  fill={palette[index % palette.length]}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              );
            })}
            <circle cx="50" cy="50" r="24" fill="white" />
            <text x="50" y="47" textAnchor="middle" className="fill-slate-500 text-[6px] uppercase tracking-[0.2em]">
              {chartType}
            </text>
            <text x="50" y="56" textAnchor="middle" className="fill-slate-900 text-[8px] font-semibold">
              {data.length}
            </text>
          </svg>
        </div>

        <div className="space-y-3">
          {data.map((item, index) => {
            const percent = total > 0 ? Math.round((item.amount / total) * 100) : 0;
            return (
              <div key={`${item.label}-${index}`} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: palette[index % palette.length] }}
                    />
                    <span className="truncate font-semibold text-slate-700">{item.label}</span>
                  </div>
                  <span className="shrink-0 font-mono text-slate-500">
                    {currencyFormatter.format(item.amount)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: palette[index % palette.length],
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const KwartaAI = () => {
  const [inputValue, setInputValue] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [historyHydrated, setHistoryHydrated] = useState(false);

  const { data: transactions = [], isLoading: transactionsLoading } = useTransactions();
  const { data: history, isLoading: historyLoading } = useChatHistory();
  const clearChat = useClearChatHistory();
  const isLoading = transactionsLoading || historyLoading;

  useEffect(() => {
    if (historyLoading) return;
    if (history && history.length > 0) {
      setMessages(
        history.map((msg, index) => ({
          id: msg.created_at || `hist-${index}`,
          sender: msg.role === "user" ? "user" : "ai",
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
    } catch {
      alert("Failed to clear history");
    }
  }

  async function handleSendMessage(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userMsg = inputValue.trim();
    setInputValue("");

    const newUserMsgId = Date.now().toString();
    const newAiMsgId = (Date.now() + 1).toString();

    setMessages((prev) => [
      ...prev,
      { id: newUserMsgId, sender: "user", content: userMsg },
      { id: newAiMsgId, sender: "ai", content: "" },
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
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                aiText += content;
                setMessages((prev) =>
                  prev.map((message) =>
                    message.id === newAiMsgId ? { ...message, content: aiText } : message,
                  ),
                );
              }
            } catch {
              // Ignore parse errors from partial chunks.
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) =>
        prev.map((message) =>
          message.id === newAiMsgId
            ? { ...message, content: "Error communicating with Kwarta AI. Please try again." }
            : message,
        ),
      );
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <div className="animate-fade-in pb-10">
      <div className="flex h-[calc(100dvh-8rem)] min-h-[640px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 bg-surface-container-low/30 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container">
              <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                smart_toy
              </span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-primary font-h3">Kwarta AI Elite</h4>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-500">
                  Secure Financial Intelligence Link
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleClearHistory}
              title="Clear History"
              className="flex cursor-pointer items-center rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100"
            >
              <span className="material-symbols-outlined">delete_sweep</span>
            </button>
            <button className="cursor-pointer rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50/20 px-4 py-5 sm:px-6">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <span className="material-symbols-outlined text-[32px] text-primary animate-spin">
                progress_activity
              </span>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg) => {
                if (msg.sender === "ai") {
                  const parsed = parseAssistantContent(msg.content);
                  return (
                    <div key={msg.id} className="flex max-w-[92%] gap-4">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-container">
                        <span
                          className="material-symbols-outlined text-sm text-white"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          smart_toy
                        </span>
                      </div>
                      <div className="w-full rounded-lg rounded-tl-none border border-slate-200 bg-surface-container-low/50 p-4">
                        {msg.content === "" && isTyping ? (
                          <div className="flex h-6 items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                        ) : (
                          <>
                            {parsed.displayContent ? (
                              <div className="prose prose-sm max-w-none prose-slate prose-p:leading-relaxed prose-table:overflow-hidden prose-table:rounded-lg prose-table:border prose-table:border-slate-200 prose-td:p-3 prose-th:bg-slate-50 prose-th:p-3 prose-th:text-xs prose-th:uppercase prose-th:tracking-wider">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{parsed.displayContent}</ReactMarkdown>
                              </div>
                            ) : null}
                            {parsed.chartType ? <ChatVisualization chartType={parsed.chartType} transactions={transactions} /> : null}
                          </>
                        )}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className="ml-auto flex max-w-[85%] flex-row-reverse gap-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                      Me
                    </div>
                    <div className="rounded-lg rounded-tr-none border border-primary-container bg-white p-4">
                      <p className="font-body-sm leading-relaxed text-primary font-medium italic">
                        "{msg.content}"
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="border-t border-slate-100 bg-white p-4 sm:p-5">
          <div className={`relative flex items-center transition-shadow duration-200 ${inputFocused ? "rounded-xl shadow-lg shadow-emerald-900/5" : ""}`}>
            <button
              type="button"
              className="absolute left-4 cursor-pointer text-slate-400 transition-colors hover:text-primary"
            >
              <span className="material-symbols-outlined">attach_file</span>
            </button>
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-4 pr-28 pl-12 font-body-sm text-on-surface focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
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
                className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary-container px-4 py-2.5 text-xs font-bold uppercase text-white transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="hidden sm:inline">Send</span>
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </div>
          </div>
          <div className="mt-3 flex justify-center gap-6">
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span className="material-symbols-outlined text-xs">verified_user</span>
              Encrypted
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span className="material-symbols-outlined text-xs">gavel</span>
              Compliance Approved
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KwartaAI;
