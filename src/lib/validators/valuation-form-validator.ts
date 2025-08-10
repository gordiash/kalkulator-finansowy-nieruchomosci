import { z } from 'zod';

export const valuationFormSchema = z.object({
  city: z.string().min(1, 'Miasto jest wymagane.'),
  district: z.string().optional(),
  street: z.string().optional(),
  
  area: z.coerce.number({ invalid_type_error: 'Metraż musi być liczbą.' }).min(1, 'Metraż jest wymagany.'),
  rooms: z.coerce.number({ invalid_type_error: 'Liczba pokoi musi być liczbą.' }).int().min(1, 'Liczba pokoi jest wymagana.'),
  floor: z.coerce.number({ invalid_type_error: 'Piętro musi być liczbą.' }).int().min(0, 'Piętro nie może być ujemne.'),
  year: z.coerce.number({ invalid_type_error: 'Rok budowy musi być liczbą.' }).int().min(1900, 'Zbyt stary rok budowy.').max(new Date().getFullYear(), 'Rok budowy nie może być w przyszłości.').optional().or(z.literal('')),

  locationTier: z.enum(['premium', 'standard', 'economy']),
  condition: z.enum(['new', 'good', 'to_renovate']),
  buildingType: z.enum(['blok', 'apartamentowiec', 'kamienica', 'dom']),
  
  parking: z.string().optional(),
  finishing: z.string().optional(),
  elevator: z.enum(['yes', 'no']).optional(),
  balcony: z.string().optional(),
  orientation: z.string().optional(),
  transport: z.string().optional(),

  totalFloors: z.coerce.number().int().optional().or(z.literal('')),
  heating: z.string().optional(),
  bathrooms: z.coerce.number().int().optional().or(z.literal('')),
  kitchenType: z.string().optional(),
  basement: z.string().optional(),
  buildingMaterial: z.string().optional(),
  ownership: z.string().optional(),
  balconyArea: z.coerce.number().optional().or(z.literal('')),
  lastRenovation: z.coerce.number().int().optional().or(z.literal('')),
});

export type ValuationFormData = z.infer<typeof valuationFormSchema>; 