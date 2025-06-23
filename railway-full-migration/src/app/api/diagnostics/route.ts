import { NextRequest, NextResponse } from 'next/server';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function GET() {
  try {
    const results: any = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      python_tests: []
    };

    // Test 1: which python
    try {
      const { stdout, stderr } = await execAsync('which python');
      results.python_tests.push({
        test: 'which python',
        success: true,
        output: stdout.trim(),
        error: stderr
      });
    } catch (error: any) {
      results.python_tests.push({
        test: 'which python',
        success: false,
        output: '',
        error: error.message
      });
    }

    // Test 2: whereis python
    try {
      const { stdout, stderr } = await execAsync('whereis python');
      results.python_tests.push({
        test: 'whereis python',
        success: true,
        output: stdout.trim(),
        error: stderr
      });
    } catch (error: any) {
      results.python_tests.push({
        test: 'whereis python',
        success: false,
        output: '',
        error: error.message
      });
    }

    // Test 3: python --version
    try {
      const { stdout, stderr } = await execAsync('python --version');
      results.python_tests.push({
        test: 'python --version',
        success: true,
        output: stdout.trim() || stderr.trim(),
        error: ''
      });
    } catch (error: any) {
      results.python_tests.push({
        test: 'python --version',
        success: false,
        output: '',
        error: error.message
      });
    }

    // Test 4: /usr/bin/python --version
    try {
      const { stdout, stderr } = await execAsync('/usr/bin/python --version');
      results.python_tests.push({
        test: '/usr/bin/python --version',
        success: true,
        output: stdout.trim() || stderr.trim(),
        error: ''
      });
    } catch (error: any) {
      results.python_tests.push({
        test: '/usr/bin/python --version',
        success: false,
        output: '',
        error: error.message
      });
    }

    // Test 5: $PATH
    results.path = process.env.PATH;

    // Test 6: current working directory
    results.cwd = process.cwd();

    // Test 7: Check files
    const fs = require('fs');
    results.file_checks = {
      scripts_dir: fs.existsSync(path.join(process.cwd(), 'scripts')),
      models_dir: fs.existsSync(path.join(process.cwd(), 'models')),
      ensemble_script: fs.existsSync(path.join(process.cwd(), 'scripts', 'predict_ensemble_compatible.py')),
      ensemble_model: fs.existsSync(path.join(process.cwd(), 'models', 'ensemble_optimized_0.78pct.pkl')),
      rf_script: fs.existsSync(path.join(process.cwd(), 'scripts', 'predict_rf.py')),
      rf_model: fs.existsSync(path.join(process.cwd(), 'models', 'valuation_rf.pkl'))
    };

    // Test 8: List files in scripts directory
    try {
      const scriptsDir = path.join(process.cwd(), 'scripts');
      if (fs.existsSync(scriptsDir)) {
        results.scripts_files = fs.readdirSync(scriptsDir);
      }
    } catch (error: any) {
      results.scripts_files_error = error.message;
    }

    // Test 9: List files in models directory
    try {
      const modelsDir = path.join(process.cwd(), 'models');
      if (fs.existsSync(modelsDir)) {
        results.models_files = fs.readdirSync(modelsDir);
      }
    } catch (error: any) {
      results.models_files_error = error.message;
    }

    return NextResponse.json(results);

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    // Test spawn python z prostym skryptem
    const testResult = await testPythonSpawn();
    
    return NextResponse.json({
      test: 'python_spawn',
      timestamp: new Date().toISOString(),
      result: testResult
    });

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

async function testPythonSpawn(): Promise<any> {
  return new Promise((resolve) => {
    const pythonCommands = ['python', '/usr/bin/python', '/usr/local/bin/python'];
    
    for (const pythonCmd of pythonCommands) {
      try {
        console.log(`Testing: ${pythonCmd}`);
        
        const pythonProcess = spawn(pythonCmd, ['--version'], {
          stdio: ['pipe', 'pipe', 'pipe'],
          env: { ...process.env, PATH: '/usr/local/bin:/usr/bin:/bin' }
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
              python_command: pythonCmd,
              output: output.trim() || error.trim(),
              exit_code: code
            });
            return;
          }
        });
        
        pythonProcess.on('error', (err) => {
          console.log(`${pythonCmd} failed:`, err.message);
        });
        
      } catch (error) {
        console.log(`${pythonCmd} exception:`, error);
      }
    }
    
    // Jeśli nic nie działa
    setTimeout(() => {
      resolve({
        success: false,
        error: 'All Python commands failed',
        tested_commands: pythonCommands
      });
    }, 5000);
  });
} 