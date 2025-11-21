// app/api/recibos/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ReciboController } from '@/controllers/Recibo.controller';

const reciboController = new ReciboController();

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    const { id } = await params;
    const idNum = parseInt(id);
    
    if (isNaN(idNum)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      );
    }
    
    return await reciboController.obtenerReciboPorId(idNum);
  } catch (error) {
    console.error('Error en GET recibos/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    const { id } = await params;
    const idNum = parseInt(id);
    
    if (isNaN(idNum)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      );
    }
    
    return await reciboController.eliminarRecibo(idNum);
  } catch (error) {
    console.error('Error en DELETE recibos/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}