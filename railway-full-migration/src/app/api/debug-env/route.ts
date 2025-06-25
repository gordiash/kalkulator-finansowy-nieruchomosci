import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function GET() {
  try {
    console.log('🔍 Starting environment debug...');
    
    const debugScript = path.join(process.cwd(), 'debug-env.js');
    const debugOutput = await runDebugScript(debugScript);
    
    return NextResponse.json({
      status: 'debug_complete',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      cwd: process.cwd(),
      output: debugOutput
    });
    
  } catch (error) {
    console.error('Debug script failed:', error);
    
    return NextResponse.json(
      { 
        status: 'debug_failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}

async function runDebugScript(scriptPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    console.log(`🔧 Running debug script: ${scriptPath}`);
    
    const nodeProcess = spawn('node', [scriptPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: process.cwd()
    });
    
    let output = '';
    let error = '';
    
    nodeProcess.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      console.log(`📤 Debug output: ${text.trim()}`);
    });
    
    nodeProcess.stderr.on('data', (data) => {
      const text = data.toString();
      error += text;
      console.log(`📥 Debug error: ${text.trim()}`);
    });
    
    nodeProcess.on('close', (code) => {
      console.log(`🏁 Debug script finished with code: ${code}`);
      
      if (code === 0) {
        resolve(output || 'Debug completed successfully');
      } else {
        reject(new Error(`Debug script failed with code ${code}: ${error}`));
      }
    });
    
    nodeProcess.on('error', (err) => {
      console.error(`❌ Failed to run debug script: ${err}`);
      reject(err);
    });
    
    // Timeout po 30 sekund
    setTimeout(() => {
      console.log(`⏰ Debug script timeout`);
      nodeProcess.kill();
      reject(new Error('Debug script timeout'));
    }, 30000);
  });
} 