import { neon } from '@neondatabase/serverless';
import { requireAccount } from './auth-helper.js';
import { chatMessageSchema } from './schemas.js';
import { parseBody } from './validate.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ChatHistoryRow {
  role: string;
  content: string;
  created_at: string;
}

interface TransactionContextRow {
  type: string;
  amount: number | string;
  description: string;
  wallet_type: string;
  dateoftrans: string;
}

interface WalletContextRow {
  name: string;
  type: string;
  initial_balance: number | string;
  current_balance: number | string;
  status: string | null;
}

interface GoalContextRow {
  title: string;
  target_amount: number | string;
  current_amount: number | string;
  deadline: string | null;
  category: string | null;
  priority: number | null;
}

interface AccountNameRow {
  username: string;
}

interface ColumnRow {
  column_name: string;
}

interface StreamDelta {
  choices?: Array<{
    delta?: {
      content?: string;
    };
  }>;
}

const sql = neon(process.env.DATABASE_URL!);
const CHAT_SCHEMA_CACHE_TTL_MS = 5 * 60 * 1000;

type ProviderAvailability = "online" | "offline";
let latestProviderAvailability: ProviderAvailability = process.env.DEEPSEEK_API_KEY ? "online" : "offline";
let chatSchemaValidatedAt = 0;
let chatSchemaValidationPromise: Promise<void> | null = null;

function toNumber(value: number | string | null | undefined): number {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
}

function formatPhp(value: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function normalizePrompt(message: string): string {
  return message.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
}

function isFinancePrompt(message: string): boolean {
  const normalized = normalizePrompt(message);
  const financePattern = /\b(finance|financial|budget|budgeting|money|expense|expenses|income|spending|spend|transaction|transactions|wallet|wallets|balance|balances|saving|savings|goal|goals|invest|investment|investments|stock|stocks|crypto|debt|loan|loans|cash\s?flow|net\s?worth|economy|economic|economics|retirement|emergency\s?fund|summary|summarize|monthly\s+summary|inflation|interest|market|markets|asset|assets|liability|liabilities)\b/;
  return financePattern.test(normalized);
}

function getRefusalMessage(username: string): string {
  const safeName = username.trim() || 'there';
  return `Sorry ${safeName}, I can only answer finance-related questions. Ask me about budgets, spending, balances, transactions, savings goals, investments, or economics.`;
}

function getChartType(message: string): 'income' | 'expense' | null {
  const normalized = normalizePrompt(message);
  if (normalized.includes('income')) return 'income';
  if (normalized.includes('expense') || normalized.includes('spending') || normalized.includes('summary') || normalized.includes('spend')) return 'expense';
  if (normalized.includes('chart') || normalized.includes('graph') || normalized.includes('visual') || normalized.includes('breakdown')) {
    return 'expense';
  }
  return null;
}

function wantsRecentTransactions(message: string): boolean {
  const normalized = normalizePrompt(message);
  return normalized.includes('recent transaction') || normalized.includes('recent transactions') || normalized.includes('latest transaction') || normalized.includes('latest transactions');
}

function wantsWalletSummary(message: string): boolean {
  const normalized = normalizePrompt(message);
  return normalized.includes('wallet') || normalized.includes('balance') || normalized.includes('balances') || normalized.includes('net worth');
}

function wantsGoalsSummary(message: string): boolean {
  const normalized = normalizePrompt(message);
  return normalized.includes('goal') || normalized.includes('goals') || normalized.includes('savings goal') || normalized.includes('savings goals');
}

function wantsGoalAdvice(message: string): boolean {
  const normalized = normalizePrompt(message);
  const hasGoalContext =
    normalized.includes('goal') ||
    normalized.includes('goals') ||
    normalized.includes('savings goal') ||
    normalized.includes('savings goals');
  const hasAdviceIntent =
    normalized.includes('how can i save') ||
    normalized.includes('how do i save') ||
    normalized.includes('save for that') ||
    normalized.includes('save for it') ||
    normalized.includes('reach') ||
    normalized.includes('achieve') ||
    normalized.includes('plan') ||
    normalized.includes('strategy') ||
    normalized.includes('tips') ||
    normalized.includes('advice') ||
    normalized.includes('monthly') ||
    normalized.includes('weekly') ||
    normalized.includes('per month') ||
    normalized.includes('per week') ||
    normalized.includes('budget');

  return hasGoalContext && hasAdviceIntent;
}

function monthsUntil(deadline: string | null): number | null {
  if (!deadline) return null;

  const target = new Date(deadline);
  if (Number.isNaN(target.getTime())) return null;

  const now = new Date();
  const yearMonths = (target.getFullYear() - now.getFullYear()) * 12;
  const monthDiff = target.getMonth() - now.getMonth();
  const dayAdjustment = target.getDate() >= now.getDate() ? 1 : 0;
  const totalMonths = yearMonths + monthDiff + dayAdjustment;
  return totalMonths > 0 ? totalMonths : null;
}

function pickRelevantGoal(message: string, goals: GoalContextRow[]): GoalContextRow | null {
  if (goals.length === 0) return null;

  const normalizedMessage = normalizePrompt(message);
  const messageTokens = normalizedMessage
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 2);

  let bestGoal: GoalContextRow | null = null;
  let bestScore = -1;

  for (const goal of goals) {
    const title = normalizePrompt(goal.title || '');
    let score = 0;

    for (const token of messageTokens) {
      if (title.includes(token) || token.includes(title)) {
        score += 2;
      } else if (title.split(/\s+/).includes(token)) {
        score += 1;
      }
    }

    const priorityScore = goal.priority ? Number(goal.priority) : 0;
    const combinedScore = score + priorityScore * 0.01;
    if (combinedScore > bestScore) {
      bestScore = combinedScore;
      bestGoal = goal;
    }
  }

  return bestGoal ?? goals[0] ?? null;
}

function buildGoalAdviceResponse(
  message: string,
  goals: GoalContextRow[],
  summary: ReturnType<typeof summarizeTransactions>
): string {
  if (goals.length === 0) {
    return 'I could not find any savings goals for this account.';
  }

  const goal = pickRelevantGoal(message, goals);
  if (!goal) {
    return 'I could not find any savings goals for this account.';
  }

  const target = toNumber(goal.target_amount);
  const saved = toNumber(goal.current_amount);
  const remaining = Math.max(target - saved, 0);
  const months = monthsUntil(goal.deadline);
  const deadlineLabel = goal.deadline ? new Date(goal.deadline).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : null;
  const monthlyTarget = remaining > 0 ? Math.ceil(remaining / Math.max(months ?? 6, 1)) : 0;
  const weeklyTarget = monthlyTarget > 0 ? Math.ceil(monthlyTarget / 4.33) : 0;
  const topExpense = summary.topExpenses[0];
  const buffer = Math.max(Math.ceil(remaining * 0.1), 100);
  const surplus = summary.net > 0 ? summary.net : 0;
  const canCoverWithSurplus = surplus >= monthlyTarget && monthlyTarget > 0;

  const lines = [
    `Your goal is **${goal.title}**.`,
    `You have saved ${formatPhp(saved)} of ${formatPhp(target)}${remaining > 0 ? `, so you still need ${formatPhp(remaining)}.` : '.'}`,
  ];

  if (deadlineLabel && months) {
    lines.push(`To reach it by ${deadlineLabel}, save about **${formatPhp(monthlyTarget)} per month** or **${formatPhp(weeklyTarget)} per week**.`);
  } else if (remaining > 0) {
    lines.push(`A realistic pace is about **${formatPhp(monthlyTarget)} per month** over the next 6 months.`);
  }

  if (topExpense) {
    lines.push(`Your biggest recent spending item is **${topExpense.label}** at ${formatPhp(topExpense.amount)}. Cutting that category even a little would help this goal.`);
  }

  if (summary.net !== 0) {
    lines.push(
      summary.net > 0
        ? `Your recent cash flow is positive, so you can likely fund this goal from surplus if you automate it.`
        : `Your recent cash flow is negative, so this goal will need either lower spending or a longer timeline.`,
    );
  }

  if (remaining > 0) {
    lines.push(`Try automating a transfer of ${formatPhp(Math.max(monthlyTarget, buffer))} right after payday.`);
  }

  if (canCoverWithSurplus) {
    lines.push(`Your current surplus is enough to cover the monthly target if you keep spending steady.`);
  }

  return [
    lines.join('\n'),
    'Best next steps:',
    `- Save ${formatPhp(Math.max(weeklyTarget, 1))} each week.`,
    topExpense ? `- Trim ${topExpense.label} first, then move that amount into the goal.` : '- Move any extra income or windfalls directly into the goal.',
    `- Check progress weekly so you can adjust before the deadline slips.`,
  ].join('\n');
}

async function getAiChatColumns(): Promise<Set<string>> {
  const rows = await sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'ai_chats'
  ` as ColumnRow[];
  return new Set(rows.map((row) => String(row.column_name).toLowerCase()));
}

async function ensureAiChatsSchema(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS ai_chats (
      chat_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      acc_id INTEGER NOT NULL REFERENCES accounts(acc_id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  const columns = await getAiChatColumns();
  const tryExec = async (query: Promise<unknown>): Promise<void> => {
    try {
      await query;
    } catch {
      // Ignore incompatible legacy variants and validate below.
    }
  };

  if (!columns.has('chat_id') && columns.has('id')) {
    await tryExec(sql`ALTER TABLE ai_chats RENAME COLUMN id TO chat_id`);
  }
  if (!columns.has('acc_id') && columns.has('account_id')) {
    await tryExec(sql`ALTER TABLE ai_chats RENAME COLUMN account_id TO acc_id`);
  }
  if (!columns.has('created_at') && columns.has('createdat')) {
    await tryExec(sql`ALTER TABLE ai_chats RENAME COLUMN createdat TO created_at`);
  }

  const refreshed = await getAiChatColumns();
  if (!refreshed.has('chat_id')) {
    await tryExec(sql`ALTER TABLE ai_chats ADD COLUMN chat_id INTEGER GENERATED BY DEFAULT AS IDENTITY`);
  }
  if (!refreshed.has('acc_id')) {
    await tryExec(sql`ALTER TABLE ai_chats ADD COLUMN acc_id INTEGER REFERENCES accounts(acc_id) ON DELETE CASCADE`);
  }
  if (!refreshed.has('role')) {
    await tryExec(sql`ALTER TABLE ai_chats ADD COLUMN role TEXT`);
  }
  if (!refreshed.has('content')) {
    await tryExec(sql`ALTER TABLE ai_chats ADD COLUMN content TEXT`);
  }
  if (!refreshed.has('created_at')) {
    await tryExec(sql`ALTER TABLE ai_chats ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW()`);
  }

  await tryExec(sql`ALTER TABLE ai_chats ALTER COLUMN acc_id SET NOT NULL`);
  await tryExec(sql`ALTER TABLE ai_chats ALTER COLUMN role SET NOT NULL`);
  await tryExec(sql`ALTER TABLE ai_chats ALTER COLUMN content SET NOT NULL`);
  await tryExec(sql`ALTER TABLE ai_chats ALTER COLUMN created_at SET DEFAULT NOW()`);
  await tryExec(sql`ALTER TABLE ai_chats ADD PRIMARY KEY (chat_id)`);
  await tryExec(sql`CREATE INDEX IF NOT EXISTS idx_ai_chats_acc_id_chat_id ON ai_chats(acc_id, chat_id)`);
}

async function ensureAiChatsSchemaCached(): Promise<void> {
  const now = Date.now();
  if (now - chatSchemaValidatedAt < CHAT_SCHEMA_CACHE_TTL_MS) {
    return;
  }

  if (!chatSchemaValidationPromise) {
    chatSchemaValidationPromise = (async () => {
      await ensureAiChatsSchema();
      const columns = await getAiChatColumns();
      const required = ['chat_id', 'acc_id', 'role', 'content', 'created_at'];
      const missing = required.filter((column) => !columns.has(column));
      if (missing.length > 0) {
        throw new Error(`Unsupported ai_chats schema. Missing: ${missing.join(', ')}`);
      }
      chatSchemaValidatedAt = Date.now();
    })();
  }

  try {
    await chatSchemaValidationPromise;
  } finally {
    chatSchemaValidationPromise = null;
  }
}

function writeSseHeaders(res: VercelResponse): void {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
  });
}

function writeSseMessage(res: VercelResponse, content: string): void {
  const payload = {
    choices: [
      {
        delta: {
          content,
        },
      },
    ],
  };

  res.write(`data: ${JSON.stringify(payload)}\n\n`);
  res.write('data: [DONE]\n\n');
  res.end();
}

async function storeChatMessage(accId: number, role: 'user' | 'assistant', content: string): Promise<void> {
  await sql`
    INSERT INTO ai_chats (acc_id, role, content)
    VALUES (${accId}, ${role}, ${content})
  `;
}

async function getAccountUsername(accId: number): Promise<string> {
  try {
    const rows = await sql`
      SELECT username
      FROM accounts
      WHERE acc_id = ${accId}
      LIMIT 1
    ` as AccountNameRow[];
    return rows[0]?.username?.trim() || 'there';
  } catch {
    return 'there';
  }
}

function summarizeTransactions(transactions: TransactionContextRow[]): {
  income: number;
  expense: number;
  net: number;
  topExpenses: Array<{ label: string; amount: number }>;
  recent: Array<{ label: string; amount: number; type: string; wallet: string; date: string }>;
} {
  let income = 0;
  let expense = 0;
  const expenseTotals = new Map<string, number>();

  for (const transaction of transactions) {
    const amount = toNumber(transaction.amount);
    const type = String(transaction.type || '').toLowerCase();
    const label = String(transaction.description || 'Other').trim() || 'Other';

    if (type === 'income') {
      income += amount;
    } else if (type === 'expense') {
      expense += amount;
      expenseTotals.set(label, (expenseTotals.get(label) || 0) + amount);
    }
  }

  const topExpenses = Array.from(expenseTotals.entries())
    .map(([label, amount]) => ({ label, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  const recent = transactions.slice(0, 5).map((transaction) => ({
    label: String(transaction.description || 'Other').trim() || 'Other',
    amount: toNumber(transaction.amount),
    type: String(transaction.type || ''),
    wallet: String(transaction.wallet_type || 'Unknown'),
    date: String(transaction.dateoftrans || ''),
  }));

  return {
    income,
    expense,
    net: income - expense,
    topExpenses,
    recent,
  };
}

function buildWalletSummary(wallets: WalletContextRow[]): string {
  if (wallets.length === 0) {
    return 'I could not find any wallets for this account.';
  }

  const lines = wallets.slice(0, 5).map((wallet) => {
    const balance = toNumber(wallet.current_balance);
    return `- ${wallet.name} (${wallet.type}): ${formatPhp(balance)}`;
  });

  return [`**Your wallet balances:**`, ...lines.map((line) => `- **${line.slice(2)}**`)].join('\n');
}

function buildGoalsSummary(goals: GoalContextRow[]): string {
  if (goals.length === 0) {
    return 'I could not find any savings goals for this account.';
  }

  const lines = goals.slice(0, 5).map((goal) => {
    const target = toNumber(goal.target_amount);
    const saved = toNumber(goal.current_amount);
    const progress = target > 0 ? `${((saved / target) * 100).toFixed(1)}%` : '0.0%';
    return `- ${goal.title}: ${formatPhp(saved)} saved of ${formatPhp(target)} (${progress})`;
  });

  return [`**Your savings goals:**`, ...lines.map((line) => `- **${line.slice(2)}**`)].join('\n');
}

function buildRecentSummary(transactions: TransactionContextRow[]): string {
  if (transactions.length === 0) {
    return 'No recent transactions were found.';
  }

  const lines = transactions.slice(0, 5).map((transaction) => {
    return `- ${transaction.dateoftrans}: ${transaction.type} ${formatPhp(toNumber(transaction.amount))} for ${transaction.description} (${transaction.wallet_type})`;
  });

  return [`Recent transactions:`, ...lines].join('\n');
}

function buildLocalFinanceResponse(
  message: string,
  username: string,
  transactions: TransactionContextRow[],
  wallets: WalletContextRow[],
  goals: GoalContextRow[]
): string {
  const financePrompt = isFinancePrompt(message);
  if (!financePrompt) {
    return getRefusalMessage(username);
  }

  const chartType = getChartType(message);
  const summary = summarizeTransactions(transactions);

  if (wantsGoalAdvice(message)) {
    return buildGoalAdviceResponse(message, goals, summary);
  }

  if (wantsGoalsSummary(message)) {
    return buildGoalsSummary(goals);
  }

  if (wantsWalletSummary(message)) {
    return `${buildWalletSummary(wallets)}\n\nRecent cash flow: ${formatPhp(summary.income)} income, ${formatPhp(summary.expense)} expenses, net ${formatPhp(summary.net)}.`;
  }

  if (wantsRecentTransactions(message)) {
    return buildRecentSummary(transactions);
  }

  if (chartType === 'income') {
    return [
      `**Here is a quick income summary based on your recent transactions.**`,
      `- **Total income:** ${formatPhp(summary.income)}`,
      `- **Total expenses:** ${formatPhp(summary.expense)}`,
      `- **Net cash flow:** ${formatPhp(summary.net)}`,
      summary.topExpenses.length > 0 ? `- **Largest expense items:** ${summary.topExpenses.map((item) => `${item.label} (${formatPhp(item.amount)})`).join(', ')}` : '- No expense categories were found in the recent data.',
      '[CHART:INCOME]',
    ].join('\n');
  }

  if (chartType === 'expense') {
    return [
      `**Here is a quick expense summary based on your recent transactions.**`,
      `- **Total income:** ${formatPhp(summary.income)}`,
      `- **Total expenses:** ${formatPhp(summary.expense)}`,
      `- **Net cash flow:** ${formatPhp(summary.net)}`,
      summary.topExpenses.length > 0 ? `- **Largest expense items:** ${summary.topExpenses.map((item) => `${item.label} (${formatPhp(item.amount)})`).join(', ')}` : '- No expense categories were found in the recent data.',
      '[CHART:EXPENSE]',
    ].join('\n');
  }

  return [
    `I could not reach the external AI provider, so here is a live finance snapshot from your account.`,
    `- **Income:** ${formatPhp(summary.income)}`,
    `- **Expenses:** ${formatPhp(summary.expense)}`,
    `- **Net cash flow:** ${formatPhp(summary.net)}`,
    summary.topExpenses.length > 0 ? `- **Top spending items:** ${summary.topExpenses.map((item) => `${item.label} (${formatPhp(item.amount)})`).join(', ')}` : '- No recent expense categories were found.',
    '[CHART:EXPENSE]',
  ].join('\n');
}

async function streamFinalResponse(res: VercelResponse, content: string): Promise<void> {
  writeSseHeaders(res);
  writeSseMessage(res, content);
}

async function attemptProviderResponse(
  apiKey: string,
  systemPrompt: { role: 'system'; content: string },
  message: string,
  accId: number,
  res: VercelResponse
): Promise<boolean> {
  try {
    const fetchRes = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [systemPrompt, { role: 'user' as const, content: message }],
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!fetchRes.ok || !fetchRes.body) {
      return false;
    }

    writeSseHeaders(res);

    const reader = fetchRes.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunkStr = decoder.decode(value, { stream: true });
      res.write(chunkStr);

      const lines = chunkStr.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const parsed = JSON.parse(line.slice(6)) as StreamDelta;
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullResponse += content;
            }
          } catch {
            // Ignore malformed stream chunks.
          }
        }
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();

    if (fullResponse) {
      await storeChatMessage(accId, 'assistant', fullResponse);
    }

    latestProviderAvailability = 'online';
    return true;
  } catch (error) {
    latestProviderAvailability = 'offline';
    console.error('Chat API provider failure:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;

  const account = await requireAccount(req, res);
  if (!account) return;
  const accId = account.acc_id;

  try {
    await ensureAiChatsSchemaCached();

    if (method === 'GET') {
      if (req.query.status === '1' || req.query.status === 'true') {
        return res.status(200).json({
          success: true,
          availability: {
            state: latestProviderAvailability,
          },
        });
      }

      const history = await sql`
        SELECT role, content, created_at
        FROM ai_chats
        WHERE acc_id = ${accId}
        ORDER BY chat_id ASC
      ` as ChatHistoryRow[];
      return res.status(200).json({ success: true, data: history });
    }

    if (method === 'DELETE') {
      await sql`DELETE FROM ai_chats WHERE acc_id = ${accId}`;
      return res.status(200).json({ success: true, message: 'Chat cleared' });
    }

    if (method !== 'POST') {
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const payload = parseBody(chatMessageSchema, req.body, res);
    if (!payload) return;

    const { message } = payload;
    await storeChatMessage(accId, 'user', message);

    let transactions: TransactionContextRow[] = [];
    try {
      transactions = await sql`
        SELECT type, amount, description, wallet_type, dateoftrans
        FROM transactions
        WHERE account_id = ${accId}
        ORDER BY dateoftrans DESC
        LIMIT 30
      ` as TransactionContextRow[];
    } catch (error: unknown) {
      console.error('Chat API: error fetching transactions:', error instanceof Error ? error.message : String(error));
    }

    let wallets: WalletContextRow[] = [];
    try {
      wallets = await sql`
        SELECT
          w.name,
          w.type,
          w.initial_balance,
          w.status,
          (
            w.initial_balance +
            COALESCE(SUM(CASE
              WHEN t.type = 'Income' AND t.wallet_id = w.wallet_id THEN t.amount
              WHEN t.type = 'Transfer' AND t.transfer_to_wallet_id = w.wallet_id THEN t.amount
              WHEN t.type = 'Transfer'
                AND t.transfer_to_wallet_id IS NULL
                AND t.wallet_id = w.wallet_id
                AND (t.description ILIKE 'Transfer from%' OR t.description ILIKE 'Transfer In from%')
              THEN t.amount
              ELSE 0 END), 0) -
            COALESCE(SUM(CASE
              WHEN t.type = 'Expense' AND t.wallet_id = w.wallet_id THEN t.amount
              WHEN t.type = 'Transfer' AND t.transfer_from_wallet_id = w.wallet_id THEN t.amount
              WHEN t.type = 'Transfer'
                AND t.transfer_from_wallet_id IS NULL
                AND t.wallet_id = w.wallet_id
                AND (t.description ILIKE 'Transfer to%' OR t.description ILIKE 'Transfer Out to%')
              THEN t.amount
              ELSE 0 END), 0)
          ) AS current_balance
        FROM wallets w
        LEFT JOIN transactions t
          ON t.account_id = w.account_id
        WHERE w.account_id = ${accId}
        GROUP BY w.wallet_id
        ORDER BY w.created_at ASC
      ` as WalletContextRow[];
    } catch (error: unknown) {
      console.error('Chat API: error fetching wallets:', error instanceof Error ? error.message : String(error));
    }

    let goals: GoalContextRow[] = [];
    try {
      goals = await sql`
        SELECT title, target_amount, current_amount, deadline, category, priority
        FROM goals
        WHERE account_id = ${accId}
        ORDER BY created_at DESC
      ` as GoalContextRow[];
    } catch (error: unknown) {
      console.error('Chat API: error fetching goals:', error instanceof Error ? error.message : String(error));
    }

    const username = await getAccountUsername(accId);
    const refusalRequested = !isFinancePrompt(message);
    const refusalResponse = getRefusalMessage(username);
    const localFallback = refusalRequested
      ? refusalResponse
      : buildLocalFinanceResponse(message, username, transactions, wallets, goals);

    if (refusalRequested) {
      await storeChatMessage(accId, 'assistant', refusalResponse);
      await streamFinalResponse(res, refusalResponse);
      return;
    }

    const apiKey = process.env.DEEPSEEK_API_KEY?.replace(/^"|"$/g, '') || null;
    if (apiKey) {
      const systemPrompt = {
        role: 'system' as const,
        content: `You are Kwarta AI, a strict financial assistant bot. You must ONLY answer questions related to finance, budgeting, money management, investments, economics, or the user's transaction data. If the user asks about anything else, politely decline and steer the conversation back to finance. Be helpful, concise, and friendly. Use Markdown formatting. Bold only the most important numbers, labels, warnings, and action items, and keep the rest of the answer readable with normal text.

Here is the user's REAL-TIME wallet data (this is the AUTHORITATIVE source for balances):
${JSON.stringify(wallets.map((wallet) => ({
          name: wallet.name,
          type: wallet.type,
          initial_balance: wallet.initial_balance,
          current_balance: wallet.current_balance,
          status: wallet.status,
        })))}

IMPORTANT: Each wallet has an "initial_balance" (the starting amount when created) and a "current_balance" (initial + all income/transfers in - all expenses/transfers out). When the user asks "what is my balance for X wallet?", ALWAYS use the "current_balance" field from the wallet data above. Do NOT try to manually calculate it from transactions; the current_balance already includes the initial balance and all transactions.

Here is the user's REAL-TIME transaction data (recent activity):
${JSON.stringify(transactions.map((transaction) => ({
          date: transaction.dateoftrans,
          type: transaction.type,
          amount: transaction.amount,
          desc: transaction.description,
          wallet: transaction.wallet_type,
        })))}

CRITICAL DATA OVERRIDE:
Users frequently edit, delete, or wipe their transactions. ALWAYS base your calculations strictly on the JSON data provided above.
If the data above says "No recent transactions found.", it means the user has DELETED everything. You MUST proudly state that they have ZERO transactions and ZERO expenses/income. You are FORBIDDEN from quoting, repeating, or remembering any numbers, totals, or data from previous chat history messages. The chat history is a lie if it conflicts with the JSON data above.

If the user asks how to save toward a goal, do not stop at a summary. You MUST calculate the remaining amount, estimate a monthly or weekly savings target if a deadline exists, and give at least one concrete step based on the user's spending pattern.

IMPORTANT INSTRUCTION FOR UI VISUALS:
If the user explicitly asks for a visual summary, graph, chart, or visual breakdown:
- If they ask about Income, output exactly "[CHART:INCOME]" at the very end of your response.
- If they ask about Expenses, output exactly "[CHART:EXPENSE]" at the very end of your response.
- If they ask for a general summary without specifying, default to outputting "[CHART:EXPENSE]".

Here is the user's SAVINGS GOALS data (SECONDARY context - only use when goals are explicitly asked about):
${JSON.stringify(goals.map((goal) => ({
          title: goal.title,
          target: goal.target_amount,
          saved: goal.current_amount,
          progress: toNumber(goal.target_amount) > 0 ? `${((toNumber(goal.current_amount) / toNumber(goal.target_amount)) * 100).toFixed(1)}%` : '0%',
          deadline: goal.deadline,
          category: goal.category,
          priority: goal.priority,
        })))}

QUERY TYPE ROUTING - follow these rules strictly:
1. "Monthly Summary" or "summary" -> Focus ONLY on TRANSACTION data: total income, total expenses, net cash flow, spending categories, and wallet balances. Do NOT talk about savings goals unless the user specifically mentions them.
2. "Top Expense" or "expenses" -> Analyze TRANSACTION data to find the biggest expense categories and amounts.
3. "Recent Transactions" -> List recent transactions from the transaction data.
4. "Wallet Breakdown" -> Show wallet balances and transaction activity per wallet.
5. "Budget Advice" or "Savings Tips" -> Give general budgeting advice. You may briefly reference goals if relevant, but focus on transaction patterns.
6. "My goals" or "goals" or "savings goals" -> ONLY THEN provide a detailed goals breakdown with progress, deadlines, and savings advice.
7. Any other finance question -> Use the most relevant data source (transactions, wallets, or goals) based on context.`,
      };

      const providerOk = await attemptProviderResponse(apiKey, systemPrompt, message, accId, res);
      if (providerOk) {
        return;
      }
    }

    await storeChatMessage(accId, 'assistant', localFallback);
    await streamFinalResponse(res, localFallback);
  } catch (error: unknown) {
    console.error('Chat error:', error);
    if (!res.headersSent) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      res.status(500).json({ error: message });
    }
  }
}
