import { z } from 'zod';

// Schema dla formularza kontaktowego
export const contactSchema = z.object({
  name: z
    .string()
    .min(1, 'Pole "Imię i nazwisko" jest wymagane.')
    .min(2, 'Imię i nazwisko musi mieć co najmniej 2 znaki.')
    .max(100, 'Imię i nazwisko nie może być dłuższe niż 100 znaków.')
    .trim(),
  email: z
    .string()
    .min(1, 'Adres email jest wymagany.')
    .email('Proszę podać prawidłowy adres e-mail.')
    .max(255, 'Adres email nie może być dłuższy niż 255 znaków.')
    .toLowerCase()
    .trim(),
  message: z
    .string()
    .min(10, 'Wiadomość musi mieć co najmniej 10 znaków.')
    .max(2000, 'Wiadomość nie może być dłuższa niż 2000 znaków.')
    .trim()
});

// Schema dla newslettera
export const newsletterSchema = z.object({
  email: z
    .string()
    .min(1, 'Adres email jest wymagany.')
    .email('Podaj prawidłowy adres email.')
    .max(255, 'Adres email nie może być dłuższy niż 255 znaków.')
    .toLowerCase()
    .trim(),
  source: z
    .string()
    .max(50, 'Źródło nie może być dłuższe niż 50 znaków.')
    .optional()
    .default('popup')
});

export type ContactFormData = z.infer<typeof contactSchema>;
export type NewsletterFormData = z.infer<typeof newsletterSchema>; 