import { POST as webhookHandler } from '@/app/api/stripe/webhook/route'

jest.mock('@/lib/stripe', () => {
  const stripeMock = {
    webhooks: {
      constructEvent: jest.fn(() => ({
        type: 'customer.subscription.updated',
        data: { object: { customer: 'cus_123', status: 'active' } }
      }))
    }
  }
  return { stripe: stripeMock, webhookSecret: 'whsec_test' }
})

jest.mock('mysql2/promise', () => {
  const connection = { execute: jest.fn(), end: jest.fn() }
  return { __esModule: true, createConnection: () => connection, default: { createConnection: () => connection } }
})

describe('Stripe webhook', () => {
  it('updates subscription in DB', async () => {
    const req = new Request('http://localhost', {
      method: 'POST',
      headers: { 'stripe-signature': 'sig_test' },
      body: 'raw-body'
    }) as any
    const res: any = await webhookHandler(req)
    expect(res.status).toBe(200)
  })
}) 