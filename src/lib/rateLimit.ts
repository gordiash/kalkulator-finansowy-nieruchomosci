import { NextRequest, NextResponse } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export function rateLimit(request: NextRequest, maxRequests = 100, windowMs = 900000) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const key = `rate_limit:${ip}`;
  const now = Date.now();

  // Pobierz lub utwórz wpis dla tego IP
  if (!store[key] || now > store[key].resetTime) {
    store[key] = {
      count: 0,
      resetTime: now + windowMs,
    };
  }

  // Zwiększ licznik
  store[key].count++;

  // Sprawdź limit
  if (store[key].count > maxRequests) {
    return {
      success: false,
      message: 'Rate limit exceeded',
      resetTime: store[key].resetTime,
    };
  }

  return {
    success: true,
    remaining: maxRequests - store[key].count,
    resetTime: store[key].resetTime,
  };
}

export function rateLimitMiddleware(maxRequests = 100, windowMs = 900000) {
  return function(request: NextRequest) {
    const result = rateLimit(request, maxRequests, windowMs);
    
    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Too many requests', 
          message: 'Rate limit exceeded. Please try again later.',
          resetTime: result.resetTime 
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': result.resetTime.toString(),
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
          }
        }
      );
    }

    return null;
  };
} 