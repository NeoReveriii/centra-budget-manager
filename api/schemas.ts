import { z } from 'zod';

const positiveAmount = z.coerce.number().positive('Amount must be greater than 0');
const idFromBody = z.coerce.number().int().positive();

export const accountUpdateSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  username: z.string().trim().min(1).max(100).optional(),
  pnumber: z.string().trim().max(30).nullable().optional(),
  bio: z.string().trim().max(500).nullable().optional(),
  avatar_seed: z.string().trim().max(100).nullable().optional(),
  avatar_url: z.string().max(500).nullable().optional(),
});

export const accountDeleteSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
});

export const createTransactionSchema = z
  .object({
    description: z.string().trim().min(1).max(200).optional(),
    title: z.string().trim().min(1).max(200).optional(),
    type: z.enum(['Income', 'Expense', 'income', 'expense']),
    wallet_type: z.string().trim().min(1).max(100).optional(),
    wallet: z.string().trim().min(1).max(100).optional(),
    wallet_id: z.coerce.number().int().positive().optional(),
    category: z.string().trim().max(100).optional(),
    amount: positiveAmount,
  })
  .refine((data) => Boolean(data.description || data.title), {
    message: 'Description is required',
    path: ['description'],
  })
  .refine((data) => Boolean(data.wallet_type || data.wallet), {
    message: 'wallet_type is required',
    path: ['wallet_type'],
  });

export const transferFundsSchema = z.object({
  from_wallet_id: idFromBody,
  to_wallet_id: idFromBody,
  amount: positiveAmount,
}).refine((data) => data.from_wallet_id !== data.to_wallet_id, {
  message: 'Cannot transfer to the same wallet',
  path: ['to_wallet_id'],
});

export const updateTransactionSchema = z.object({
  trans_id: idFromBody.optional(),
  id: idFromBody.optional(),
  description: z.string().trim().min(1).max(200).optional(),
  title: z.string().trim().min(1).max(200).optional(),
  type: z.enum(['Income', 'Expense', 'income', 'expense']).optional(),
  wallet_type: z.string().trim().min(1).max(100).optional(),
  wallet: z.string().trim().min(1).max(100).optional(),
  wallet_id: z.coerce.number().int().positive().optional(),
  category: z.string().trim().max(100).optional(),
  amount: positiveAmount.optional(),
}).refine((data) => data.trans_id != null || data.id != null, {
  message: 'Transaction ID required',
  path: ['trans_id'],
});

export const deleteTransactionSchema = z.object({
  trans_id: idFromBody.optional(),
  id: idFromBody.optional(),
}).refine((data) => data.trans_id != null || data.id != null, {
  message: 'Transaction ID required',
  path: ['trans_id'],
});

export const createWalletSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  type: z.string().trim().min(1, 'Type is required').max(100),
  initial_balance: z.coerce.number().nonnegative().optional().default(0),
});

export const updateWalletSchema = z.object({
  wallet_id: idFromBody,
  name: z.string().trim().min(1, 'Name is required').max(100),
  type: z.string().trim().min(1, 'Type is required').max(100),
  status: z.enum(['ACTIVE', 'ARCHIVED']).optional(),
  initial_balance: z.coerce.number().nonnegative().optional(),
});

export const deleteWalletSchema = z.object({
  wallet_id: idFromBody,
});

export const createGoalSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(150),
  target_amount: positiveAmount,
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Deadline must use YYYY-MM-DD').optional(),
  category: z.string().trim().max(100).optional(),
  priority: z.coerce.number().int().min(1).max(5).optional(),
  allow_expense: z.union([z.boolean(), z.string()]).optional(),
});

export const updateGoalSchema = z.object({
  goal_id: idFromBody,
  add_amount: positiveAmount,
  note: z.string().trim().max(500).optional(),
});

export const deleteGoalSchema = z.object({
  goal_id: idFromBody,
});

export const chatMessageSchema = z.object({
  message: z.string().trim().min(1, 'Message is required').max(4000, 'Message is too long'),
});

