import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';



async function checkMLModels(): Promise<{ status: string; details: object }> {
  try {
    // Sprawdź czy modele ML są dostępne
    const modelsPath = path.join(process.cwd(), 'models');
    
    const models = {
      ensemble: fs.existsSync(path.join(modelsPath, 'ensemble_optimized_0.79pct.pkl')),
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
  } catch (err) {
    return {
      status: 'error',
      details: { error: err instanceof Error ? err.message : 'Unknown error' }
    };
  }
}

async function checkPythonEnvironment(): Promise<{ status: string; details: object }> {
  // Lista komend Python do przetestowania
  const pythonCommands = [
    'python',                    // system default
    'python3',                   // Linux/Mac default
    '/usr/bin/python3',          // system Linux path
    '/usr/bin/python',           // system Linux path
    '/usr/local/bin/python3'     // alternative installations
  ];

  for (const pythonCmd of pythonCommands) {
    const result = await testSinglePythonCommand(pythonCmd);
    if (result.success) {
      return {
        status: 'healthy',
        details: {
          version: result.version,
          python_available: true,
          command_used: pythonCmd
        }
      };
    }
  }

  return {
    status: 'error',
    details: {
      python_available: false,
      error: 'No working Python command found'
    }
  };
}

async function testSinglePythonCommand(pythonCmd: string): Promise<{ success: boolean; version?: string; error?: string }> {
  return new Promise((resolve) => {
    try {
      console.log(`🐍 [Health] Testing: ${pythonCmd}`);
      
      const pythonProcess = spawn(pythonCmd, ['--version'], {
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
            success: true,
            version: output.trim() || error.trim()
          });
        } else {
          resolve({
            success: false,
            error: error || 'Python command failed'
          });
        }
      });
      
      pythonProcess.on('error', () => {
        resolve({
          success: false,
          error: 'Command not found'
        });
      });
      
      // Timeout po 5 sekund
      setTimeout(() => {
        pythonProcess.kill();
        resolve({
          success: false,
          error: 'Python check timeout'
        });
      }, 5000);
      
    } catch {
      resolve({
        success: false,
        error: 'Exception occurred'
      });
    }
  });
}



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
        python_env: await checkPythonEnvironment(),
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