import { z } from 'zod';

// Schema dla rejestracji użytkownika
export const registerSchema = z.object({
  email: z.string()
    .min(1, { message: 'Email jest wymagany.' })
    .email({ message: 'Proszę podać prawidłowy adres email.' })
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(8, { message: 'Hasło musi mieć co najmniej 8 znaków.' })
    .max(128, { message: 'Hasło nie może być dłuższe niż 128 znaków.' })
    .regex(/[A-Z]/, { message: 'Hasło musi zawierać co najmniej jedną wielką literę.' })
    .regex(/[a-z]/, { message: 'Hasło musi zawierać co najmniej jedną małą literę.' })
    .regex(/[0-9]/, { message: 'Hasło musi zawierać co najmniej jedną cyfrę.' }),
  name: z.string()
    .min(1, { message: 'Imię jest wymagane.' })
    .max(100, { message: 'Imię nie może być dłuższe niż 100 znaków.' })
    .trim()
    .optional()
});

// Schema dla logowania użytkownika
export const loginSchema = z.object({
  email: z.string()
    .min(1, { message: 'Email jest wymagany.' })
    .email({ message: 'Proszę podać prawidłowy adres email.' })
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(1, { message: 'Hasło jest wymagane.' })
});

// Schema dla zmiany hasła
export const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, { message: 'Obecne hasło jest wymagane.' }),
  newPassword: z.string()
    .min(8, { message: 'Nowe hasło musi mieć co najmniej 8 znaków.' })
    .max(128, { message: 'Nowe hasło nie może być dłuższe niż 128 znaków.' })
    .regex(/[A-Z]/, { message: 'Nowe hasło musi zawierać co najmniej jedną wielką literę.' })
    .regex(/[a-z]/, { message: 'Nowe hasło musi zawierać co najmniej jedną małą literę.' })
    .regex(/[0-9]/, { message: 'Nowe hasło musi zawierać co najmniej jedną cyfrę.' }),
  confirmPassword: z.string()
    .min(1, { message: 'Potwierdzenie hasła jest wymagane.' })
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Potwierdzenie hasła nie pasuje.',
  path: ['confirmPassword']
});

// Schema dla zmiany emaila
export const changeEmailSchema = z.object({
  email: z.string()
    .min(1, { message: 'Email jest wymagany.' })
    .email({ message: 'Proszę podać prawidłowy adres email.' })
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(1, { message: 'Hasło jest wymagane do potwierdzenia zmiany.' })
});

// Schema dla resetu hasła - żądanie resetu
export const passwordResetRequestSchema = z.object({
  email: z.string()
    .min(1, { message: 'Email jest wymagany.' })
    .email({ message: 'Proszę podać prawidłowy adres email.' })
    .toLowerCase()
    .trim()
});

// Schema dla resetu hasła - ustawienie nowego hasła
export const passwordResetSchema = z.object({
  token: z.string()
    .min(1, { message: 'Token resetowania jest wymagany.' }),
  password: z.string()
    .min(8, { message: 'Hasło musi mieć co najmniej 8 znaków.' })
    .max(128, { message: 'Hasło nie może być dłuższe niż 128 znaków.' })
    .regex(/[A-Z]/, { message: 'Hasło musi zawierać co najmniej jedną wielką literę.' })
    .regex(/[a-z]/, { message: 'Hasło musi zawierać co najmniej jedną małą literę.' })
    .regex(/[0-9]/, { message: 'Hasło musi zawierać co najmniej jedną cyfrę.' })
}); 