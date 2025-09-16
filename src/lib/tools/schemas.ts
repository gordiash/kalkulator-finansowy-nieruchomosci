import { z } from 'zod';

export const creditCapacitySchema = z.object({
  income: z.number().positive(),
  liabilities: z.number().min(0).default(0).optional(),
  interestRate: z.number().positive(), // rocznie, np. 7.2 (%) lub 0.072 (dziesiętnie)
  termYears: z.number().int().min(1).max(40),
});

export type CreditCapacityInput = z.infer<typeof creditCapacitySchema>;

export const purchaseCostsSchema = z.object({
  price: z.number().positive(),
  market: z.enum(['primary', 'secondary']).default('secondary'),
  mortgage: z.boolean().default(false).optional(),
});

export type PurchaseCostsInput = z.infer<typeof purchaseCostsSchema>;


