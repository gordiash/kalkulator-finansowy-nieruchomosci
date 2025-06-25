import { NextRequest, NextResponse } from 'next/server';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const execAsync = promisify(exec);

interface TestResult {
  success: boolean;
  error: string | null;
  posts_count?: unknown;
  sample_data?: unknown;
}

interface PythonTestResult {
  test: string;
  success: boolean;
  output: string;
  error: string;
}

interface FileChecks {
  scripts_dir: boolean;
  models_dir: boolean;
  ensemble_script: boolean;
  ensemble_model: boolean;
  rf_script: boolean;
  rf_model: boolean;
}

interface DiagnosticResults {
  timestamp: string;
  environment: string | undefined;
  python_tests: PythonTestResult[];
  supabase: {
    url_set: boolean;
    url_value: string;
    anon_key_set: boolean;
    anon_key_preview: string;
    service_role_key_set: boolean;
    connection_test: TestResult | null;
    posts_table_test: TestResult | null;
  };
  path?: string | undefined;
  cwd?: string;
  file_checks?: FileChecks;
  scripts_files?: string[];
  scripts_files_error?: string;
  models_files?: string[];
  models_files_error?: string;
}

export async function GET() {
  try {
    const results: DiagnosticResults = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      python_tests: [],
      supabase: {
        url_set: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        url_value: process.env.NEXT_PUBLIC_SUPABASE_URL || 'not set',
        anon_key_set: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        anon_key_preview: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20) + '...' : 'not set',
        service_role_key_set: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        connection_test: null,
        posts_table_test: null
      }
    };

    // Test połączenia z Supabase
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        // Test podstawowego połączenia
        const { data: connectionData, error: connectionError } = await supabase
          .from('posts')
          .select('count', { count: 'exact', head: true });

        results.supabase.connection_test = {
          success: !connectionError,
          error: connectionError?.message || null,
          posts_count: connectionData || null
        };

        // Test zapytania o posty
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('id, title, status')
          .limit(1);

        results.supabase.posts_table_test = {
          success: !postsError,
          error: postsError?.message || null,
          sample_data: postsData || null
        };

      } catch (error) {
        results.supabase.connection_test = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          posts_count: null
        };
      }
    }

    // Test 1: which python
    try {
      const { stdout, stderr } = await execAsync('which python');
      results.python_tests.push({
        test: 'which python',
        success: true,
        output: stdout.trim(),
        error: stderr
      });
    } catch (error: unknown) {
      results.python_tests.push({
        test: 'which python',
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error'
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
    } catch (error: unknown) {
      results.python_tests.push({
        test: 'whereis python',
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error'
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
    } catch (error: unknown) {
      results.python_tests.push({
        test: 'python --version',
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error'
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
    } catch (error: unknown) {
      results.python_tests.push({
        test: '/usr/bin/python --version',
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error'
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
    } catch (error: unknown) {
      results.scripts_files_error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Test 9: List files in models directory
    try {
      const modelsDir = path.join(process.cwd(), 'models');
      if (fs.existsSync(modelsDir)) {
        results.models_files = fs.readdirSync(modelsDir);
      }
    } catch (error: unknown) {
      results.models_files_error = error instanceof Error ? error.message : 'Unknown error';
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

interface PythonSpawnResult {
  success: boolean;
  python_command: string;
  output: string;
  exit_code: number;
}

async function testPythonSpawn(): Promise<PythonSpawnResult | { success: false; error: string }> {
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
        error: 'No working Python installation found'
      });
    }, 5000);
  });
} 