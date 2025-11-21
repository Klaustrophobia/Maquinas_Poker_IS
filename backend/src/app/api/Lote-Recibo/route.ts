// app/api/lotes-recibos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { LoteReciboController } from '@/controllers/LoteRecibo.controller';

const loteReciboController = new LoteReciboController();

export async function GET(request: NextRequest): Promise<NextResponse> {
  return await loteReciboController.obtenerLotes(request);
}