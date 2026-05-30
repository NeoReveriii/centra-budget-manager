import { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  content: string;
  quickActions?: string[];
  table?: {
    headers: string[];
    rows: { metric: string; current: string; proposed: string; proposedColor: string }[];
  };
  recommendation?: string;
}

const KwartaAI = () => {
  const [inputValue, setInputValue] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [messages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      content:
        'Good morning! I have completed the analysis of your monthly budget performance. Your savings rate this month is 36.2%, exceeding your target of 30%. Would you like to review the spending optimizations I\'ve identified?',
      quickActions: ['Review Savings Plan', 'Analyze Spending'],
    },
    {
      id: '2',
      sender: 'user',
      content:
        '"Show me the impact if I reallocate ₱5,000 from my dining budget to my Emergency Fund goal."',
    },
    {
      id: '3',
      sender: 'ai',
      content:
        'Based on your current spending patterns, reallocating ₱5,000 from dining would bring your food budget utilization from 85% to 52%. Here is the projected impact on your savings goals:',
      table: {
        headers: ['Metric', 'Current', 'After Reallocation'],
        rows: [
          { metric: 'Emergency Fund', current: '₱28,000', proposed: '₱33,000', proposedColor: 'text-emerald-700' },
          { metric: 'Monthly Savings Rate', current: '36.2%', proposed: '41.8%', proposedColor: 'text-emerald-700' },
          { metric: 'Dining Budget Left', current: '₱12,450', proposed: '₱7,450', proposedColor: 'text-error' },
        ],
      },
      recommendation:
        'Recommendation: Proceed with the reallocation. Your dining budget will still cover essentials, and your Emergency Fund will reach its target 2 months earlier.',
    },
  ]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const assetDistribution = [
    { label: 'Savings', percent: 65, color: 'bg-primary-container' },
    { label: 'E-Wallets', percent: 20, color: 'bg-secondary' },
    { label: 'Investments', percent: 15, color: 'bg-on-primary-container' },
  ];

  return (
    <div className="grid grid-cols-12 gap-gutter animate-fade-in">
      {/* Strategy Overview Header */}
      <section className="col-span-12 mb-4">
        <div className="flex items-end justify-between border-b-2 border-primary-container pb-4">
          <div>
            <span className="font-label-caps text-secondary uppercase mb-1 block">
              AI Financial Advisor
            </span>
            <h2 className="font-h1 text-h1 text-primary">Strategy Overview</h2>
          </div>
          <div className="text-right">
            <p className="font-label-caps text-slate-500">LAST ANALYSIS</p>
            <p className="font-numeric-data text-on-surface">May 30, 2026</p>
          </div>
        </div>
      </section>

      {/* Column 1: Financial Vitals */}
      <div className="col-span-12 lg:col-span-4 space-y-gutter">
        {/* Net Worth Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="font-label-caps text-slate-500 uppercase">Total Balance</span>
            <span className="material-symbols-outlined text-emerald-600">trending_up</span>
          </div>
          <p className="text-display font-display text-primary tracking-tighter">₱125,430</p>
          <div className="mt-4 flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold">
              +12.5% vs last month
            </span>
            <span className="text-slate-400 text-xs font-body-sm">Across all wallets</span>
          </div>
        </div>

        {/* Asset Distribution */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <h3 className="font-h3 text-h3 text-on-surface mb-4">Budget Allocation</h3>
          <div className="space-y-4">
            {assetDistribution.map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-xs font-bold uppercase text-slate-500">
                  <span>{item.label}</span>
                  <span>{item.percent}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-lg hover:border-primary-container hover:bg-emerald-50 transition-all group cursor-pointer">
            <span className="material-symbols-outlined text-emerald-900 mb-2">account_balance</span>
            <span className="text-xs font-bold uppercase text-slate-600 group-hover:text-emerald-900">
              Transfer
            </span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-lg hover:border-primary-container hover:bg-emerald-50 transition-all group cursor-pointer">
            <span className="material-symbols-outlined text-emerald-900 mb-2">description</span>
            <span className="text-xs font-bold uppercase text-slate-600 group-hover:text-emerald-900">
              Statements
            </span>
          </button>
        </div>
      </div>

      {/* Column 2: Kwarta AI Chat */}
      <div className="col-span-12 lg:col-span-8 flex flex-col h-[700px] bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
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
              <h4 className="font-h3 text-sm text-primary font-bold">Kwarta AI</h4>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                  Secure Financial Intelligence Link
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 cursor-pointer">
              <span className="material-symbols-outlined">history</span>
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 cursor-pointer">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
        </div>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/20">
          {messages.map((msg) =>
            msg.sender === 'ai' ? (
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
                  <p className="font-body-sm leading-relaxed text-slate-700">{msg.content}</p>

                  {/* Data Table */}
                  {msg.table && (
                    <div className="overflow-hidden border border-slate-200 rounded-lg bg-white my-4">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 font-label-caps text-[10px] text-slate-500 uppercase">
                          <tr>
                            {msg.table.headers.map((h) => (
                              <th key={h} className="p-3 border-b border-slate-200">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="font-numeric-data text-sm">
                          {msg.table.rows.map((row, i) => (
                            <tr
                              key={i}
                              className={
                                i % 2 === 1
                                  ? 'bg-slate-50/30 border-b border-slate-100'
                                  : 'border-b border-slate-100'
                              }
                            >
                              <td className="p-3 font-medium text-slate-600">{row.metric}</td>
                              <td className="p-3">{row.current}</td>
                              <td className={`p-3 ${row.proposedColor}`}>{row.proposed}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Recommendation */}
                  {msg.recommendation && (
                    <p className="font-body-sm text-slate-700 italic border-l-2 border-emerald-900 pl-3 mt-3">
                      {msg.recommendation}
                    </p>
                  )}

                  {/* Quick Actions */}
                  {msg.quickActions && (
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {msg.quickActions.map((action) => (
                        <button
                          key={action}
                          className="px-3 py-1 bg-white border border-slate-200 text-[11px] font-bold uppercase rounded-full hover:bg-emerald-50 hover:border-primary-container transition-colors text-slate-600 cursor-pointer"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div key={msg.id} className="flex gap-4 max-w-[85%] ml-auto flex-row-reverse">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                  AP
                </div>
                <div className="border border-primary-container bg-white p-4 rounded-lg rounded-tr-none">
                  <p className="font-body-sm leading-relaxed text-primary font-medium italic">
                    {msg.content}
                  </p>
                </div>
              </div>
            )
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-6 border-t border-slate-100 bg-white">
          <div
            className={`relative flex items-center transition-shadow duration-200 ${
              inputFocused ? 'shadow-lg shadow-emerald-900/5 rounded-xl' : ''
            }`}
          >
            <button className="absolute left-4 text-slate-400 hover:text-primary transition-colors cursor-pointer">
              <span className="material-symbols-outlined">attach_file</span>
            </button>
            <input
              className="w-full pl-12 pr-24 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none font-body-sm text-on-surface"
              placeholder="Ask about your budget, savings goals, or spending trends..."
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
            />
            <div className="absolute right-4 flex items-center gap-2">
              <button className="p-2 text-slate-400 hover:text-primary transition-colors cursor-pointer">
                <span className="material-symbols-outlined">mic</span>
              </button>
              <button className="bg-primary-container text-white px-4 py-2 rounded-lg font-bold text-xs uppercase flex items-center gap-2 hover:opacity-90 transition-all active:scale-95 cursor-pointer">
                <span>Send</span>
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </div>
          </div>
          <div className="mt-3 flex justify-center gap-6">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">verified_user</span> Encrypted
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">gavel</span> Compliance Approved
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KwartaAI;
