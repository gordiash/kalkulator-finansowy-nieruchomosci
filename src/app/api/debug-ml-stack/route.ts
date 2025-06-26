/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface ModelsDetails {
  directory_exists: boolean;
  ensemble_model: boolean;
  rf_model: boolean;
}

interface ScriptsDetails {
  directory_exists: boolean;
  ensemble_script: boolean;
  rf_script: boolean;
}

interface LocalEnvironment {
  cwd: string;
  python_available: boolean;
  models_available: boolean;
  scripts_available: boolean;
  models_details: ModelsDetails;
  scripts_details: ScriptsDetails;
  error: string | null;
}

interface TestResults {
  valuation_test?: {
    success: boolean;
    status?: number;
    input_data?: Record<string, unknown>;
    response?: unknown;
    error?: string;
  };
}

export async function GET() {
  const result = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    ml_stack_debug: {
      local_environment: {
        cwd: process.cwd(),
        python_available: false,
        models_available: false,
        scripts_available: false,
        models_details: {} as ModelsDetails,
        scripts_details: {} as ScriptsDetails,
        error: null as string | null
      } as LocalEnvironment,
      railway_api: {
        configured: !!process.env.RAILWAY_ML_API_URL,
        url_preview: process.env.RAILWAY_ML_API_URL ? 
          `${process.env.RAILWAY_ML_API_URL.substring(0, 30)}...` : null
      },
      test_results: {} as TestResults
    }
  };

  // Test local environment
  try {

    // Check models directory
    const modelsDir = path.join(process.cwd(), 'models');
    const ensembleModel = path.join(modelsDir, 'ensemble_optimized_0.79pct.pkl');
    const rfModel = path.join(modelsDir, 'valuation_rf.pkl');

    // Check scripts directory  
    const scriptsDir = path.join(process.cwd(), 'scripts');
    const ensembleScript = path.join(scriptsDir, 'predict_ensemble_compatible.py');
    const rfScript = path.join(scriptsDir, 'predict_rf.py');

    result.ml_stack_debug.local_environment = {
      cwd: process.cwd(),
      python_available: false, // we know this is false on Lambda
      models_available: fs.existsSync(modelsDir),
      models_details: {
        directory_exists: fs.existsSync(modelsDir),
        ensemble_model: fs.existsSync(ensembleModel),
        rf_model: fs.existsSync(rfModel)
      },
      scripts_available: fs.existsSync(scriptsDir),
      scripts_details: {
        directory_exists: fs.existsSync(scriptsDir),
        ensemble_script: fs.existsSync(ensembleScript),
        rf_script: fs.existsSync(rfScript)
      },
      error: null
    };
  } catch (error) {
    result.ml_stack_debug.local_environment.error = 
      error instanceof Error ? error.message : 'Unknown error';
  }

  // Test sample valuation to see what method is used
  try {
    console.log('🧪 Testing sample valuation request...');
    
    const sampleRequest = {
      city: "Olsztyn",
      district: "Centrum", 
      area: 65,
      rooms: 3,
      year: 2015,
      locationTier: "medium",
      condition: "good"
    };

    // Call our own valuation endpoint
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                   (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '');
    
    if (baseUrl) {
      const valuationResponse = await fetch(`${baseUrl}/api/valuation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'DebugAgent/1.0'
        },
        body: JSON.stringify(sampleRequest),
        signal: AbortSignal.timeout(45000) // longer timeout for ML
      });

      result.ml_stack_debug.test_results.valuation_test = {
        success: valuationResponse.ok,
        status: valuationResponse.status,
        input_data: sampleRequest,
        response: valuationResponse.ok ? 
          await valuationResponse.json() : 
          await valuationResponse.text()
      };
    } else {
      result.ml_stack_debug.test_results.valuation_test = {
        success: false,
        error: 'Cannot determine base URL for self-test'
      };
    }
  } catch (error) {
    result.ml_stack_debug.test_results.valuation_test = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }

  return NextResponse.json(result, { 
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}

export async function POST() {
  return NextResponse.json(
    { error: 'Use GET method for ML stack debug' },
    { status: 405 }
  );
} 