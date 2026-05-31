import { neon } from '@neondatabase/serverless';
import { requireAccount } from './auth-helper.js';
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

interface StreamDelta {
  choices?: Array<{
    delta?: {
      content?: string;
    };
  }>;
}

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;

  const account = await requireAccount(req, res);
  if (!account) return;
  const acc_id = account.acc_id;

  try {
    if (method === 'GET') {
      const history = await sql`
        SELECT role, content, created_at
        FROM ai_chats
        WHERE acc_id = ${acc_id}
        ORDER BY chat_id ASC
      ` as ChatHistoryRow[];
      return res.status(200).json({ success: true, data: history });

    } else if (method === 'DELETE') {
      await sql`DELETE FROM ai_chats WHERE acc_id = ${acc_id}`;
      return res.status(200).json({ success: true, message: 'Chat cleared' });

    } else if (method === 'POST') {
      const { message } = req.body as { message?: string };
      if (!message || message.trim() === '') {
        return res.status(400).json({ error: 'Message is required' });
      }

      await sql`
        INSERT INTO ai_chats (acc_id, role, content)
        VALUES (${acc_id}, 'user', ${message})
      `;

      let transactionsText = 'No recent transactions found.';
      try {
        console.log('Chat API: Fetching transactions for account_id:', acc_id);
        const trans = await sql`
          SELECT type, amount, description, wallet_type, dateoftrans
          FROM transactions
          WHERE account_id = ${acc_id}
          ORDER BY dateoftrans DESC
          LIMIT 30
        ` as TransactionContextRow[];
        console.log('Chat API: Found', trans.length, 'transactions');
        if (trans.length > 0) {
          transactionsText = JSON.stringify(trans.map(t => ({
            date: t.dateoftrans,
            type: t.type,
            amount: t.amount,
            desc: t.description,
            wallet: t.wallet_type
          })));
          console.log('Chat API: Transaction context:', transactionsText.substring(0, 200));
        }
      } catch (e: unknown) {
        const errMsg = e instanceof Error ? e.message : String(e);
        console.error('Chat API: ERROR fetching transactions:', errMsg);
      }

      let walletsText = 'No wallets found.';
      try {
        const wallets = await sql`
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
            ) as current_balance
          FROM wallets w
          LEFT JOIN transactions t
            ON t.account_id = w.account_id
          WHERE w.account_id = ${acc_id}
          GROUP BY w.wallet_id
          ORDER BY w.created_at ASC
        ` as WalletContextRow[];
        console.log('Chat API: Found', wallets.length, 'wallets');
        if (wallets.length > 0) {
          walletsText = JSON.stringify(wallets.map(w => ({
            name: w.name,
            type: w.type,
            initial_balance: w.initial_balance,
            current_balance: w.current_balance,
            status: w.status
          })));
        }
      } catch (e: unknown) {
        const errMsg = e instanceof Error ? e.message : String(e);
        console.error('Chat API: ERROR fetching wallets:', errMsg);
      }

      let goalsText = 'No savings goals found.';
      try {
        const goals = await sql`
          SELECT title, target_amount, current_amount, deadline, category, priority
          FROM goals
          WHERE account_id = ${acc_id}
          ORDER BY created_at DESC
        ` as GoalContextRow[];
        console.log('Chat API: Found', goals.length, 'goals');
        if (goals.length > 0) {
          goalsText = JSON.stringify(goals.map(g => ({
            title: g.title,
            target: g.target_amount,
            saved: g.current_amount,
            progress: Number(g.target_amount) > 0 ? ((Number(g.current_amount) / Number(g.target_amount)) * 100).toFixed(1) + '%' : '0%',
            deadline: g.deadline,
            category: g.category,
            priority: g.priority
          })));
        }
      } catch (e: unknown) {
        const errMsg = e instanceof Error ? e.message : String(e);
        console.error('Chat API: ERROR fetching goals:', errMsg);
      }

      const systemPrompt = {
        role: 'system' as const,
        content: `You are Kwarta AI, a strict financial assistant bot. You must ONLY answer questions related to finance, budgeting, money management, investments, economics, or the user's transaction data. If the user asks about anything else, politely decline and steer the conversation back to finance. Be helpful, concise, and friendly. You MUST use Markdown for formatting (lists, bolding, etc.).

Here is the user's REAL-TIME wallet data (this is the AUTHORITATIVE source for balances):
${walletsText}

IMPORTANT: Each wallet has an "initial_balance" (the starting amount when created) and a "current_balance" (initial + all income/transfers in - all expenses/transfers out). When the user asks "what is my balance for X wallet?", ALWAYS use the "current_balance" field from the wallet data above. Do NOT try to manually calculate it from transactions — the current_balance already includes the initial balance and all transactions.

Here is the user's REAL-TIME transaction data (recent activity):
${transactionsText}

CRITICAL DATA OVERRIDE:
Users frequently edit, delete, or wipe their transactions. ALWAYS base your calculations strictly on the JSON data provided above.
If the data above says "No recent transactions found.", it means the user has DELETED everything. You MUST proudly state that they have ZERO transactions and ZERO expenses/income. You are FORBIDDEN from quoting, repeating, or remembering any numbers, totals, or data from previous chat history messages. The chat history is a lie if it conflicts with the JSON data above.

IMPORTANT INSTRUCTION FOR UI VISUALS:
If the user explicitly asks for a visual summary, graph, chart, or visual breakdown:
- If they ask about Income, output exactly "[CHART:INCOME]" at the very end of your response.
- If they ask about Expenses, output exactly "[CHART:EXPENSE]" at the very end of your response.
- If they ask for a general summary without specifying, default to outputting "[CHART:EXPENSE]".

Here is the user's SAVINGS GOALS data (SECONDARY context — only use when goals are explicitly asked about):
${goalsText}

QUERY TYPE ROUTING — follow these rules strictly:
1. "Monthly Summary" or "summary" → Focus ONLY on TRANSACTION data: total income, total expenses, net cash flow, spending categories, and wallet balances. Do NOT talk about savings goals unless the user specifically mentions them.
2. "Top Expense" or "expenses" → Analyze TRANSACTION data to find the biggest expense categories and amounts.
3. "Recent Transactions" → List recent transactions from the transaction data.
4. "Wallet Breakdown" → Show wallet balances and transaction activity per wallet.
5. "Budget Advice" or "Savings Tips" → Give general budgeting advice. You may briefly reference goals if relevant, but focus on transaction patterns.
6. "My goals" or "goals" or "savings goals" → ONLY THEN provide a detailed goals breakdown with progress, deadlines, and savings advice.
7. Any other finance question → Use the most relevant data source (transactions, wallets, or goals) based on context.`
      };

      const apiKey = process.env.DEEPSEEK_API_KEY ? process.env.DEEPSEEK_API_KEY.replace(/^"|"$/g, '') : null;
      if (!apiKey) return res.status(500).json({ error: 'API key missing' });

      const apiMessages = [{ role: 'user' as const, content: message }];

      const fetchRes = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [systemPrompt, ...apiMessages],
          temperature: 0.7,
          stream: true
        })
      });

      if (!fetchRes.ok) {
        return res.status(502).json({ error: 'AI provider error' });
      }

      const body = fetchRes.body;
      if (!body) {
        return res.status(502).json({ error: 'AI provider error' });
      }

      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive'
      });

      const reader = body.getReader();
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
              if (parsed.choices?.[0]?.delta?.content) {
                fullResponse += parsed.choices[0].delta.content;
              }
            } catch {
              // ignore malformed stream chunks
            }
          }
        }
      }
      res.write('data: [DONE]\n\n');
      res.end();

      if (fullResponse) {
        await sql`
          INSERT INTO ai_chats (acc_id, role, content)
          VALUES (${acc_id}, 'assistant', ${fullResponse})
        `;
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: unknown) {
    console.error('Chat error:', error);
    if (!res.headersSent) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      res.status(500).json({ error: message });
    }
  }
}
