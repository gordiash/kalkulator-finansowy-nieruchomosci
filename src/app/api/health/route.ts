import { NextResponse } from 'next/server';



// Uproszczona wersja bez sprawdzania Python i modeli ML
async function checkBasicHealth(): Promise<{ status: string; details: object }> {
  try {
    return {
      status: 'healthy',
      details: {
        nextjs: 'running',
        timestamp: new Date().toISOString()
      }
    };
  } catch (err) {
    return {
      status: 'error',
      details: { error: err instanceof Error ? err.message : 'Unknown error' }
    };
  }
}



export async function GET() {
  try {
    const healthCheck = await checkBasicHealth();
    
    const status = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      services: {
        nextjs: healthCheck.status,
        api: 'healthy'
      }
    };

    return NextResponse.json(status, { status: 200 });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 
      { status: 503 }
    );
  }
} 