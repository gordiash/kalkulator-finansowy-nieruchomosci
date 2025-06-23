import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function GET() {
  try {
    // Sprawdź status aplikacji
    const status = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.RAILWAY_ENVIRONMENT || 'development',
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage()
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

async function checkMLModels(): Promise<{ status: string; details: any }> {
  try {
    // Sprawdź czy modele ML są dostępne
    const fs = require('fs');
    const modelsPath = path.join(process.cwd(), 'models');
    
    const models = {
      ensemble: fs.existsSync(path.join(modelsPath, 'ensemble_optimized_0.78pct.pkl')),
      rf: fs.existsSync(path.join(modelsPath, 'valuation_rf.pkl')),
      xgb: fs.existsSync(path.join(modelsPath, 'valuation_xgb.pkl')),
    };
    
    const scripts = {
      ensemble_compatible: fs.existsSync(path.join(process.cwd(), 'scripts', 'predict_ensemble_compatible.py')),
      ensemble_railway: fs.existsSync(path.join(process.cwd(), 'scripts', 'predict_ensemble_railway.py')),
      rf: fs.existsSync(path.join(process.cwd(), 'scripts', 'predict_rf.py')),
    };
    
    let status = 'healthy';
    if (!models.ensemble && !models.rf) {
      status = 'fallback_only';
    } else if (!models.ensemble || !models.rf) {
      status = 'partial';
    }
    
    return {
      status,
      details: {
        models,
        scripts,
        models_directory: modelsPath
      }
    };
  } catch (error) {
    return {
      status: 'error',
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    };
  }
}

async function checkPythonEnvironment(): Promise<{ status: string; details: any }> {
  return new Promise((resolve) => {
    try {
      const pythonProcess = spawn('python3', ['--version'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let output = '';
      let error = '';
      
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
      });
      
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          resolve({
            status: 'healthy',
            details: {
              version: output.trim() || error.trim(),
              python_available: true
            }
          });
        } else {
          resolve({
            status: 'error',
            details: {
              python_available: false,
              error: error || 'Python not found'
            }
          });
        }
      });
      
      pythonProcess.on('error', (err) => {
        resolve({
          status: 'error',
          details: {
            python_available: false,
            error: err.message
          }
        });
      });
      
      // Timeout po 5 sekund
      setTimeout(() => {
        pythonProcess.kill();
        resolve({
          status: 'timeout',
          details: {
            python_available: false,
            error: 'Python check timeout'
          }
        });
      }, 5000);
      
    } catch (error) {
      resolve({
        status: 'error',
        details: {
          python_available: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  });
}

// Endpoint GET do testowania modeli
export async function POST() {
  try {
    console.log('🧪 Running ML models test...');
    
    const testResult = await runMLTest();
    
    return NextResponse.json({
      test: 'ml_models',
      timestamp: new Date().toISOString(),
      result: testResult
    });
    
  } catch (error) {
    console.error('ML test failed:', error);
    
    return NextResponse.json(
      { 
        test: 'ml_models',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}

async function runMLTest(): Promise<any> {
  return new Promise((resolve) => {
    const scriptPath = path.join(process.cwd(), 'scripts', 'test_models_railway.py');
    
    const pythonProcess = spawn('python3', [scriptPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: process.cwd()
    });
    
    let output = '';
    let error = '';
    
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      resolve({
        exit_code: code,
        output: output,
        error: error,
        success: code === 0
      });
    });
    
    pythonProcess.on('error', (err) => {
      resolve({
        exit_code: -1,
        output: '',
        error: err.message,
        success: false
      });
    });
    
    // Timeout po 30 sekund
    setTimeout(() => {
      pythonProcess.kill();
      resolve({
        exit_code: -1,
        output: output,
        error: 'Test timeout',
        success: false
      });
    }, 30000);
  });
} 