import { POST as portalHandler } from '@/app/api/stripe/customer-portal/route'
jest.mock('@/lib/auth', () => ({ getUserIdFromRequest: jest.fn(()=>123) }))
jest.mock('mysql2/promise', () => { const conn={ execute: jest.fn(), end: jest.fn() }; return {__esModule:true, createConnection: ()=>conn, default:{createConnection: ()=>conn}} })
const mysqlMock=require('mysql2/promise').createConnection()
jest.mock('@/lib/stripe', () => ({ stripe:{ billingPortal:{ sessions:{ create: jest.fn(async ()=>({url:'https://portal'}))}}}}))

describe('Customer portal API', ()=>{
  beforeEach(()=>{ mysqlMock.execute.mockReset() })
  it('returns 404 when no sub', async()=>{ mysqlMock.execute.mockResolvedValueOnce([[]]); const res:any = await portalHandler(new Request('http://localhost',{method:'POST'}) as any); expect(res.status).toBe(404); })
  it('returns portal url', async()=>{ mysqlMock.execute.mockResolvedValueOnce([[{customer_id:'cus_1'}]]); const res:any=await portalHandler(new Request('http://localhost',{method:'POST'}) as any); expect(res.status).toBe(200); const json=await res.json(); expect(json.url).toBe('https://portal') })
}) 