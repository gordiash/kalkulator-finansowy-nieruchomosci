export async function sendResetPasswordEmail(email: string, token: string) {
  // TODO: Zaimplementować prawdziwe wysyłanie (nodemailer lub zewnętrzny provider)
  console.log(`📧 [DEV] Reset password link for ${email}: https://example.com/reset-password?token=${token}`)
} 