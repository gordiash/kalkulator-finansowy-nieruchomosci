import { POST as cancelHandler } from '@/app/api/stripe/cancel/route'

jest.mock('@/lib/auth', () => ({ getUserIdFromRequest: jest.fn(()=>123) }))

jest.mock('mysql2/promise', () => { const conn={ execute: jest.fn(), end: jest.fn() }; return {__esModule:true, createConnection: ()=>conn, default:{createConnection: ()=>conn}} })
const mysqlMock=require('mysql2/promise').createConnection()

jest.mock('@/lib/stripe', () => ({ stripe:{ subscriptions:{ update: jest.fn(async ()=>({id:'sub_1'}))}}}))
const { stripe } = require('@/lib/stripe')

describe('Cancel subscription API', ()=>{
  beforeEach(()=>{ mysqlMock.execute.mockReset(); stripe.subscriptions.update.mockClear() })
  it('returns 404 when no sub', async ()=>{
    mysqlMock.execute.mockResolvedValueOnce([[]])
    const res:any = await cancelHandler(new Request('http://localhost',{method:'POST'}) as any)
    expect(res.status).toBe(404)
  })
  it('cancels subscription', async ()=>{
    mysqlMock.execute
      .mockResolvedValueOnce([[{subscription_id:'sub_1'}]]) // select
      .mockResolvedValueOnce([{}]) // update status
    const res:any = await cancelHandler(new Request('http://localhost',{method:'POST'}) as any)
    expect(res.status).toBe(200)
    expect(stripe.subscriptions.update).toHaveBeenCalledWith('sub_1',{cancel_at_period_end:true})
    const json=await res.json()
    expect(json.ok).toBe(true)
  })
}) 