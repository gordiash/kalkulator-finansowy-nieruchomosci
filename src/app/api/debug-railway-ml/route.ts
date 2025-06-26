/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';

interface TestResult {
  success: boolean;
  status?: number;
  response?: unknown;
  error?: string;
  input_data?: Record<string, unknown>;
}

interface Tests {
  config_error?: string;
  health_check?: TestResult;
  diagnostics?: TestResult;
  ml_prediction?: TestResult;
}

export async function GET() {
  let RAILWAY_ML_API = process.env.RAILWAY_ML_API_URL;
  
  const result = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    railway_ml_config: {
      url_set: !!RAILWAY_ML_API,
      url_preview: RAILWAY_ML_API ? `${RAILWAY_ML_API.substring(0, 50)}...` : null,
      url_raw: RAILWAY_ML_API,
      url_final: null as string | null
    },
    tests: {} as Tests
  };

  if (!RAILWAY_ML_API) {
    result.tests.config_error = 'RAILWAY_ML_API_URL not set in environment variables';
    return NextResponse.json(result);
  }

  // Dodaj https:// jeśli brakuje
  if (!RAILWAY_ML_API.startsWith('http://') && !RAILWAY_ML_API.startsWith('https://')) {
    RAILWAY_ML_API = `https://${RAILWAY_ML_API}`;
  }
  result.railway_ml_config.url_final = RAILWAY_ML_API;

  // Test 1: Health check
  try {
    console.log('🧪 Testing Railway ML API health...');
    const healthResponse = await fetch(`${RAILWAY_ML_API}/api/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'DebugAgent/1.0'
      },
      signal: AbortSignal.timeout(10000)
    });

    result.tests.health_check = {
      success: healthResponse.ok,
      status: healthResponse.status,
      response: healthResponse.ok ? await healthResponse.json() : await healthResponse.text()
    };
  } catch (error) {
    result.tests.health_check = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }

  // Test 2: Diagnostics
  try {
    console.log('🧪 Testing Railway ML API diagnostics...');
    const diagResponse = await fetch(`${RAILWAY_ML_API}/api/diagnostics`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'DebugAgent/1.0'
      },
      signal: AbortSignal.timeout(10000)
    });

    result.tests.diagnostics = {
      success: diagResponse.ok,
      status: diagResponse.status,
      response: diagResponse.ok ? await diagResponse.json() : await diagResponse.text()
    };
  } catch (error) {
    result.tests.diagnostics = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }

  // Test 3: Sample ML prediction (format kompatybilny z Railway)
  try {
    console.log('🧪 Testing Railway ML API prediction...');
    const sampleData = {
      city: "Olsztyn",
      district: "Centrum",
      area: 65,
      rooms: 3,
      year: 2015, // Railway expects 'year', not 'year_built'
      locationTier: "medium", // Railway accepts: 'low' | 'medium' | 'high'
      condition: "good", // Railway accepts: 'poor' | 'average' | 'good' | 'excellent'
      buildingType: "apartment", // Railway accepts: 'apartment' | 'house' | 'tenement'
      parking: "none", // Railway accepts: 'none' | 'street' | 'garage' | 'underground'
      finishing: "standard", // Railway accepts: 'basic' | 'standard' | 'high' | 'luxury'
      elevator: "no", // Railway accepts: 'yes' | 'no'
      balcony: "none", // Railway accepts: 'none' | 'balcony' | 'terrace' | 'garden'
      orientation: "unknown", // Railway accepts: 'north' | 'south' | 'east' | 'west' | 'unknown'
      transport: "medium" // Railway accepts: 'poor' | 'medium' | 'good' | 'excellent'
    };

    const predResponse = await fetch(`${RAILWAY_ML_API}/api/valuation-railway`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'DebugAgent/1.0',
        'Origin': process.env.NEXT_PUBLIC_SITE_URL || 'https://kalkulatorynieruchomosci.pl'
      },
      body: JSON.stringify(sampleData),
      signal: AbortSignal.timeout(30000)
    });

    result.tests.ml_prediction = {
      success: predResponse.ok,
      status: predResponse.status,
      input_data: sampleData,
      response: predResponse.ok ? await predResponse.json() : await predResponse.text()
    };
  } catch (error) {
    result.tests.ml_prediction = {
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
    { error: 'Use GET method for Railway ML debug' },
    { status: 405 }
  );
} 