// app/api/recibos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ReciboController } from '@/controllers/Recibo.controller';

const reciboController = new ReciboController();

export async function POST(request: NextRequest): Promise<NextResponse> {
  return await reciboController.crearRecibo(request);
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  return await reciboController.obtenerRecibos(request);
}