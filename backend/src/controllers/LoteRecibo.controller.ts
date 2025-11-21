// controllers/LoteRecibo.controller.ts
import { NextRequest, NextResponse } from 'next/server';
import { LoteReciboService } from '@/services/LoteRecibo.service';

export class LoteReciboController {
  private loteReciboService: LoteReciboService;

  constructor() {
    this.loteReciboService = new LoteReciboService();
  }

  async obtenerLotes(request: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(request.url);
      const clienteId = searchParams.get('cliente_id');
      const fechaInicio = searchParams.get('fecha_inicio');
      const fechaFin = searchParams.get('fecha_fin');

      if (clienteId || fechaInicio || fechaFin) {
        const lotes = await this.loteReciboService.obtenerLotesConFiltros({
          clienteId: clienteId ? parseInt(clienteId) : undefined,
          fechaInicio: fechaInicio || undefined,
          fechaFin: fechaFin || undefined
        });
        
        return NextResponse.json({
          success: true,
          data: lotes
        });
      }

      const todosLosLotes = await this.loteReciboService.obtenerTodosLosLotes();
      return NextResponse.json({
        success: true,
        data: todosLosLotes
      });

    } catch (error) {
      console.error('Error al obtener lotes:', error);
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Error interno del servidor'
        },
        { status: 500 }
      );
    }
  }

  async obtenerLotePorId(id: number): Promise<NextResponse> {
    try {
      const lote = await this.loteReciboService.obtenerLotePorId(id);

      if (!lote) {
        return NextResponse.json(
          {
            success: false,
            error: 'Lote no encontrado'
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: lote
      });

    } catch (error) {
      console.error('Error al obtener lote:', error);
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Error interno del servidor'
        },
        { status: 500 }
      );
    }
  }

  async eliminarLote(id: number): Promise<NextResponse> {
    try {
      const resultado = await this.loteReciboService.eliminarLote(id);

      if (!resultado) {
        return NextResponse.json(
          {
            success: false,
            error: 'Lote no encontrado'
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Lote eliminado exitosamente'
      });

    } catch (error) {
      console.error('Error al eliminar lote:', error);
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Error interno del servidor'
        },
        { status: 500 }
      );
    }
  }
}