import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    api: { status: string; response_time_ms?: number };
    python: { status: string; version?: string; error?: string };
    ml_models: { status: string; available_models?: string[]; missing_models?: string[] };
    ml_scripts: { status: string; available_scripts?: string[]; missing_scripts?: string[] };
  };
  overall_ml_status: 'available' | 'degraded' | 'unavailable';
}

async function checkPython(): Promise<{ status: string; version?: string; error?: string }> {
  const pythonCommands = ['python', 'python3', '/usr/bin/python3', '/usr/bin/python'];
  
  for (const pythonCmd of pythonCommands) {
    try {
      const result = await new Promise<{ status: string; version?: string; error?: string }>((resolve) => {
        const testProcess = spawn(pythonCmd, ['--version'], {
          stdio: ['pipe', 'pipe', 'pipe'],
          timeout: 5000
        });
        
        let output = '';
        let error = '';
        
        testProcess.stdout.on('data', (data) => {
          output += data.toString();
        });
        
        testProcess.stderr.on('data', (data) => {
          error += data.toString();
        });
        
        testProcess.on('close', (code) => {
          if (code === 0) {
            resolve({
              status: 'healthy',
              version: (output || error).trim()
            });
          } else {
            resolve({
              status: 'unhealthy',
              error: `Exit code ${code}: ${error}`
            });
          }
        });
        
        testProcess.on('error', (err) => {
          resolve({
            status: 'unhealthy',
            error: err.message
          });
        });
        
        setTimeout(() => {
          testProcess.kill();
          resolve({
            status: 'unhealthy',
            error: 'Timeout'
          });
        }, 5000);
      });
      
      if (result.status === 'healthy') {
        return result;
      }
    } catch (error) {
      continue;
    }
  }
  
  return {
    status: 'unhealthy',
    error: 'No working Python command found'
  };
}

async function checkMLModels(): Promise<{ status: string; available_models?: string[]; missing_models?: string[] }> {
  try {
    const fs = require('fs');
    const modelsDir = path.join(process.cwd(), 'models');
    
    const requiredModels = [
      'ensemble_optimized_0.79pct.pkl',
      'valuation_rf.pkl'
    ];
    
    if (!fs.existsSync(modelsDir)) {
      return {
        status: 'unhealthy',
        missing_models: requiredModels
      };
    }
    
    const availableFiles = fs.readdirSync(modelsDir);
    const availableModels = availableFiles.filter((file: string) => file.endsWith('.pkl'));
    const missingModels = requiredModels.filter(model => !availableModels.includes(model));
    
    if (missingModels.length === 0) {
      return {
        status: 'healthy',
        available_models: availableModels
      };
    } else if (availableModels.length > 0) {
      return {
        status: 'degraded',
        available_models: availableModels,
        missing_models: missingModels
      };
    } else {
      return {
        status: 'unhealthy',
        missing_models: missingModels
      };
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      missing_models: ['Error accessing models directory']
    };
  }
}

async function checkMLScripts(): Promise<{ status: string; available_scripts?: string[]; missing_scripts?: string[] }> {
  try {
    const fs = require('fs');
    const scriptsDir = path.join(process.cwd(), 'scripts');
    
    const requiredScripts = [
      'predict_ensemble_compatible.py',
      'predict_rf.py'
    ];
    
    if (!fs.existsSync(scriptsDir)) {
      return {
        status: 'unhealthy',
        missing_scripts: requiredScripts
      };
    }
    
    const availableFiles = fs.readdirSync(scriptsDir);
    const availableScripts = availableFiles.filter((file: string) => file.endsWith('.py'));
    const missingScripts = requiredScripts.filter(script => !availableScripts.includes(script));
    
    if (missingScripts.length === 0) {
      return {
        status: 'healthy',
        available_scripts: availableScripts
      };
    } else if (availableScripts.length > 0) {
      return {
        status: 'degraded',
        available_scripts: availableScripts,
        missing_scripts: missingScripts
      };
    } else {
      return {
        status: 'unhealthy',
        missing_scripts: missingScripts
      };
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      missing_scripts: ['Error accessing scripts directory']
    };
  }
}

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Parallel health checks
    const [pythonStatus, mlModelsStatus, mlScriptsStatus] = await Promise.all([
      checkPython(),
      checkMLModels(),
      checkMLScripts()
    ]);
    
    const responseTime = Date.now() - startTime;
    
    // Determine overall ML status
    let overallMLStatus: 'available' | 'degraded' | 'unavailable' = 'available';
    
    if (pythonStatus.status === 'unhealthy' || 
        mlModelsStatus.status === 'unhealthy' || 
        mlScriptsStatus.status === 'unhealthy') {
      overallMLStatus = 'unavailable';
    } else if (pythonStatus.status === 'degraded' || 
               mlModelsStatus.status === 'degraded' || 
               mlScriptsStatus.status === 'degraded') {
      overallMLStatus = 'degraded';
    }
    
    // Determine overall system status
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (overallMLStatus === 'unavailable') {
      overallStatus = 'degraded'; // System can still work with heuristics
    }
    
    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks: {
        api: {
          status: 'healthy',
          response_time_ms: responseTime
        },
        python: pythonStatus,
        ml_models: mlModelsStatus,
        ml_scripts: mlScriptsStatus
      },
      overall_ml_status: overallMLStatus
    };
    
    const httpStatus = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503;
    
    return NextResponse.json(healthStatus, { status: httpStatus });
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: {
        api: {
          status: 'unhealthy',
          response_time_ms: responseTime
        },
        python: { status: 'unknown', error: 'Health check failed' },
        ml_models: { status: 'unknown' },
        ml_scripts: { status: 'unknown' }
      },
      overall_ml_status: 'unavailable',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as HealthStatus & { error: string }, { status: 503 });
  }
} 