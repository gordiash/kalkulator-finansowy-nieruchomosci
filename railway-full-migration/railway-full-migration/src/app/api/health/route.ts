import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Sprawdź status aplikacji
    const status = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.RAILWAY_ENVIRONMENT || 'development',
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      services: {
        nextjs: 'healthy',
        ml_models: await checkMLModels(),
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

async function checkMLModels(): Promise<string> {
  try {
    // Sprawdź czy modele ML są dostępne
    const fs = require('fs');
    const path = require('path');
    
    const modelsPath = path.join(process.cwd(), 'models');
    const ensembleExists = fs.existsSync(path.join(modelsPath, 'ensemble_optimized_0.78pct.pkl'));
    const rfExists = fs.existsSync(path.join(modelsPath, 'valuation_rf.pkl'));
    
    if (ensembleExists && rfExists) {
      return 'healthy';
    } else if (ensembleExists || rfExists) {
      return 'partial';
    } else {
      return 'fallback_only';
    }
  } catch (error) {
    return 'error';
  }
} 