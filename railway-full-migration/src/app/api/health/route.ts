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

async function checkMLModels(): Promise<{ status: string; details: any }> {
  try {
    // Sprawdź czy modele ML są dostępne
    const fs = require('fs');
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
  } catch (error) {
    return {
      status: 'error',
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    };
  }
}

async function checkPythonEnvironment(): Promise<{ status: string; details: any }> {
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
      
      pythonProcess.on('error', (err) => {
        resolve({
          success: false,
          error: err.message
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
      
    } catch (error) {
      resolve({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}

// Endpoint POST do testowania modeli
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
  // Lista komend Python do przetestowania
  const pythonCommands = [
    'python',                    // system default
    'python3',                   // Linux/Mac default
    '/usr/bin/python3',          // system Linux path
    '/usr/bin/python',           // system Linux path
    '/usr/local/bin/python3'     // alternative installations
  ];

  const scriptPath = path.join(process.cwd(), 'scripts', 'test_models_railway.py');

  for (const pythonCmd of pythonCommands) {
    const result = await testMLWithCommand(pythonCmd, scriptPath);
    if (result.success) {
      return result;
    }
  }

  // Jeśli wszystkie komendy zawiodą
  return {
    exit_code: -1,
    output: '',
    error: 'No working Python command found for ML test',
    success: false
  };
}

async function testMLWithCommand(pythonCmd: string, scriptPath: string): Promise<any> {
  return new Promise((resolve) => {
    console.log(`🧪 [Health] Testing ML with: ${pythonCmd}`);
    
    const pythonProcess = spawn(pythonCmd, [scriptPath], {
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
        success: code === 0,
        command_used: pythonCmd
      });
    });
    
    pythonProcess.on('error', (err) => {
      resolve({
        exit_code: -1,
        output: '',
        error: err.message,
        success: false,
        command_used: pythonCmd
      });
    });
    
    // Timeout po 30 sekund
    setTimeout(() => {
      pythonProcess.kill();
      resolve({
        exit_code: -1,
        output: output,
        error: 'Test timeout',
        success: false,
        command_used: pythonCmd
      });
    }, 30000);
  });
} 