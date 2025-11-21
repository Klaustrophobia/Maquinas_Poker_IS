// controllers/Recibo.controller.ts
import { NextRequest, NextResponse } from 'next/server';
import { ReciboService } from '@/services/Recibo.service';
import { CrearReciboDTO } from '@/dtos/CrearReciboDTO';

export class ReciboController {
  private reciboService: ReciboService;

  constructor() {
    this.reciboService = new ReciboService();
  }

  async crearRecibo(request: NextRequest): Promise<NextResponse> {
    try {
      const reciboData: CrearReciboDTO = await request.json();
     
      if (!reciboData.cliente_id || !reciboData.maquinas || reciboData.maquinas.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Datos incompletos: cliente_id y maquinas son requeridos'
          },
          { status: 400 }
        );
      }

      for (const maquina of reciboData.maquinas) {
        if (!maquina.maquina_id || maquina.ingreso === undefined || maquina.egreso === undefined) {
          return NextResponse.json(
            {
              success: false,
              error: 'Datos incompletos en las máquinas'
            },
            { status: 400 }
          );
        }
      }

      const resultado = await this.reciboService.generarRecibo(reciboData);
     
      return NextResponse.json({
        success: true,
        data: resultado,
        message: 'Recibo generado exitosamente'
      }, { status: 201 });
     
    } catch (error) {
      console.error('Error al crear recibo:', error);
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Error interno del servidor'
        },
        { status: 500 }
      );
    }
  }

  async obtenerRecibos(request: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(request.url);
      const clienteId = searchParams.get('cliente_id');
     
      if (clienteId) {
        const recibos = await this.reciboService.obtenerRecibosPorCliente(parseInt(clienteId));
        return NextResponse.json({
          success: true,
          data: recibos
        });
      }
     
      const todosLosRecibos = await this.reciboService.obtenerTodosLosRecibos();
      return NextResponse.json({
        success: true,
        data: todosLosRecibos
      });
     
    } catch (error) {
      console.error('Error al obtener recibos:', error);
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Error interno del servidor'
        },
        { status: 500 }
      );
    }
  }

  async obtenerReciboPorId(id: number): Promise<NextResponse> {
    try {
      const recibo = await this.reciboService.obtenerReciboPorId(id);
     
      if (!recibo) {
        return NextResponse.json(
          {
            success: false,
            error: 'Recibo no encontrado'
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: recibo
      });
     
    } catch (error) {
      console.error('Error al obtener recibo:', error);
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Error interno del servidor'
        },
        { status: 500 }
      );
    }
  }

  async eliminarRecibo(id: number): Promise<NextResponse> {
    try {
      const resultado = await this.reciboService.eliminarRecibo(id);
     
      if (!resultado) {
        return NextResponse.json(
          {
            success: false,
            error: 'Recibo no encontrado'
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Recibo eliminado exitosamente'
      });
     
    } catch (error) {
      console.error('Error al eliminar recibo:', error);
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