import { NextResponse } from 'next/server';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
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

    // Test 4: /app/venv/bin/python --version (dla Docker venv)
    try {
      const { stdout, stderr } = await execAsync('/app/venv/bin/python --version');
      results.python_tests.push({
        test: '/app/venv/bin/python --version',
        success: true,
        output: stdout.trim() || stderr.trim(),
        error: ''
      });
    } catch (error: unknown) {
      results.python_tests.push({
        test: '/app/venv/bin/python --version',
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 5: /usr/bin/python --version (dla Linux/Docker)
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

    // Test 6: python3 --version
    try {
      const { stdout, stderr } = await execAsync('python3 --version');
      results.python_tests.push({
        test: 'python3 --version',
        success: true,
        output: stdout.trim() || stderr.trim(),
        error: ''
      });
    } catch (error: unknown) {
      results.python_tests.push({
        test: 'python3 --version',
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 7: $PATH
    results.path = process.env.PATH;

    // Test 8: current working directory
    results.cwd = process.cwd();

    // Test 9: Check files
    results.file_checks = {
      scripts_dir: fs.existsSync(path.join(process.cwd(), 'scripts')),
      models_dir: fs.existsSync(path.join(process.cwd(), 'models')),
      ensemble_script: fs.existsSync(path.join(process.cwd(), 'scripts', 'predict_ensemble_compatible.py')),
      ensemble_model: fs.existsSync(path.join(process.cwd(), 'models', 'ensemble_optimized_0.79pct.pkl')),
      rf_script: fs.existsSync(path.join(process.cwd(), 'scripts', 'predict_rf.py')),
      rf_model: fs.existsSync(path.join(process.cwd(), 'models', 'valuation_rf.pkl'))
    };

    // Test 10: List scripts files
    try {
      const scriptsDir = path.join(process.cwd(), 'scripts');
      if (fs.existsSync(scriptsDir)) {
        results.scripts_files = fs.readdirSync(scriptsDir);
      } else {
        results.scripts_files_error = 'Scripts directory does not exist';
      }
    } catch (err) {
      results.scripts_files_error = err instanceof Error ? err.message : 'Unknown error';
    }

    // Test 11: List models files
    try {
      const modelsDir = path.join(process.cwd(), 'models');
      if (fs.existsSync(modelsDir)) {
        results.models_files = fs.readdirSync(modelsDir);
      } else {
        results.models_files_error = 'Models directory does not exist';
      }
    } catch (err) {
      results.models_files_error = err instanceof Error ? err.message : 'Unknown error';
    }

    return NextResponse.json(results);

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

// Test POST - spawn python script
export async function POST() {
  try {
    console.log('🧪 Running Python spawn test...');
    
    const testResult = await testPythonSpawn();
    
    return NextResponse.json({
      test: 'python_spawn',
      timestamp: new Date().toISOString(),
      result: testResult
    });
    
  } catch (error) {
    console.error('Python spawn test failed:', error);
    
    return NextResponse.json(
      { 
        test: 'python_spawn',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}

async function testPythonSpawn(): Promise<PythonSpawnResult | { success: false; error: string }> {
  const pythonCommands = [
    '/app/venv/bin/python',      // Docker venv (najważniejsze)
    '/app/venv/bin/python3',     // Docker venv python3
    'python', 
    'python3', 
    '/usr/bin/python3', 
    '/usr/bin/python'
  ];
  
  for (const pythonCmd of pythonCommands) {
    try {
      const result = await new Promise<PythonSpawnResult>((resolve) => {
        const testProcess = spawn(pythonCmd, ['--version'], {
          stdio: ['pipe', 'pipe', 'pipe']
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
          resolve({
            success: code === 0,
            python_command: pythonCmd,
            output: output || error,
            exit_code: code || -1
          });
        });
        
        testProcess.on('error', () => {
          resolve({
            success: false,
            python_command: pythonCmd,
            output: '',
            exit_code: -1
          });
        });
        
        // Timeout po 10 sekund
        setTimeout(() => {
          testProcess.kill();
          resolve({
            success: false,
            python_command: pythonCmd,
            output: 'Timeout',
            exit_code: -1
          });
        }, 10000);
      });
      
      if (result.success) {
        return result;
      }
    } catch {
      continue;
    }
  }
  
  return { success: false, error: 'No working Python command found' };
} 