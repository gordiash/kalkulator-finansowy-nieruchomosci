import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { spawn } from 'child_process'
import path from 'path'

// === Schemat wejściowy ===
const ValuationSchema = z.object({
  city: z.string().min(2, 'Podaj miasto'),
  district: z.string().min(2, 'Podaj dzielnicę').optional(),
  street: z.string().min(2).optional(),
  area: z.number().positive('Metraż musi być > 0'),
  rooms: z.number().int().positive('Liczba pokoi > 0'),
  floor: z.number().int().nonnegative().optional(),
  year: z.number().int().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const { city, district, area, rooms, floor, year } = await request.json()
    
    console.log('[Random Forest] Input:', { city, district, area, rooms, floor, year })
    
    const inputData = { city, district, area, rooms, floor, year }
    
    const scriptPath = path.join(process.cwd(), 'scripts', 'predict_rf.py')
    
    // Lista komend Python do przetestowania
    const pythonCommands = [
      'python',                    // system default
      'python3',                   // Linux/Mac default
      '/usr/bin/python3',          // system Linux path
      '/usr/bin/python',           // system Linux path
      '/usr/local/bin/python3'     // alternative installations
    ];

    // Funkcja do próbowania pojedynczej komendy Python
    async function tryPythonCommand(pythonCmd: string): Promise<number | null> {
      return new Promise((resolve) => {
        console.log(`🌳 [RF] Próbuję: ${pythonCmd}`)
        
        const pythonProcess = spawn(pythonCmd, [scriptPath, JSON.stringify(inputData)])
        
        let output = ''
        let errorOutput = ''
        
        pythonProcess.stdout.on('data', (data) => {
          output += data.toString()
          console.log(`📤 [RF] stdout: ${data.toString()}`)
        })
        
        pythonProcess.stderr.on('data', (data) => {
          errorOutput += data.toString()
          console.log(`📥 [RF] stderr: ${data.toString()}`)
        })
        
        pythonProcess.on('close', (code) => {
          console.log(`🏁 [RF] Process closed with code: ${code}`)
          
          if (code === 0) {
            try {
              const lines = output.split('\n')
              const lastLine = lines[lines.length - 2] || lines[lines.length - 1]
              const price = parseFloat(lastLine.trim())
              
              if (!isNaN(price) && price > 0) {
                console.log('✅ [RF] Success:', price)
                resolve(price)
              } else {
                console.error('❌ [RF] Nieprawidłowa wycena:', lastLine)
                resolve(null)
              }
            } catch (e) {
              console.error('💥 [RF] Błąd parsowania:', e)
              resolve(null)
            }
          } else {
            console.error(`❌ [RF] Błąd wykonania, kod: ${code}, Error: ${errorOutput}`)
            resolve(null)
          }
        })
        
        pythonProcess.on('error', (error) => {
          console.error(`⏰ [RF] ${pythonCmd} error:`, error)
          resolve(null);
        });
        
        // Timeout po 10 sekund
        setTimeout(() => {
          pythonProcess.kill()
          console.error(`⏰ [RF] ${pythonCmd} timeout`)
          resolve(null)
        }, 10000)
      })
    }

    // Próbuj kolejne komendy Python
    for (const pythonCmd of pythonCommands) {
      const result = await tryPythonCommand(pythonCmd);
      if (result !== null) {
        const price = Math.round(result);
        return NextResponse.json({
          price,
          minPrice: Math.round(price * 0.95),
          maxPrice: Math.round(price * 1.05),
          currency: 'PLN',
          method: 'random_forest',
          confidence: '±5%',
          timestamp: new Date().toISOString()
        });
      }
    }

    console.log('💀 [RF] All Python commands failed, returning error')
    return NextResponse.json({ error: 'Model ML niedostępny' }, { status: 500 })
    
  } catch (error) {
    console.error('[Random Forest] Error:', error)
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
} 