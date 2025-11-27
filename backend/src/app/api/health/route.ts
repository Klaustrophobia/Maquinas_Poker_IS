import { NextResponse } from 'next/server';
import { getDatabaseConnection } from '@/lib/db';

export async function GET() {
  try {
    const connection = await getDatabaseConnection();
    await connection.query('SELECT 1');
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // Manejo seguro del error unknown
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json({
      status: 'unhealthy',
      database: 'disconnected',
      error: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}