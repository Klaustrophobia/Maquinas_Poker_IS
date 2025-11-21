// app/api/lotes-recibos/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { LoteReciboController } from '@/controllers/LoteRecibo.controller';

const loteReciboController = new LoteReciboController();

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

    return await loteReciboController.obtenerLotePorId(idNum);
  } catch (error) {
    console.error('Error en GET lotes-recibos/[id]:', error);
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

    return await loteReciboController.eliminarLote(idNum);
  } catch (error) {
    console.error('Error en DELETE lotes-recibos/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}