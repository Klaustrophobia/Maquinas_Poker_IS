// controllers/RepuestoController.ts
import { Request, Response } from "express";
import { RepuestoService } from "../services/Repuestos.service";

export class RepuestoController {
  private repuestoService: RepuestoService;

  constructor() {
    this.repuestoService = new RepuestoService();
  }

  // CREATE
  crearRepuesto = async (req: Request, res: Response): Promise<void> => {
    try {
      const { nombre, proveedor_id, cantidad, ubicacion, estado } = req.body;

      // Validaciones básicas
      if (!nombre || !proveedor_id || cantidad === undefined || !estado) {
        res.status(400).json({ 
          error: "Los campos nombre, proveedor_id, cantidad y estado son requeridos" 
        });
        return;
      }

      if (cantidad < 0) {
        res.status(400).json({ error: "La cantidad no puede ser negativa" });
        return;
      }

      const repuesto = await this.repuestoService.crearRepuesto({
        nombre,
        proveedor_id: parseInt(proveedor_id),
        cantidad,
        ubicacion,
        estado,
      });

      res.status(201).json({
        message: "Repuesto creado exitosamente",
        data: repuesto,
      });
    } catch (error: any) {
      console.error("Error al crear repuesto:", error);
      
      if (error.message === "Proveedor no encontrado") {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Error interno del servidor" });
      }
    }
  };

  // READ - Todos los repuestos
  obtenerRepuestos = async (req: Request, res: Response): Promise<void> => {
    try {
      const repuestos = await this.repuestoService.obtenerTodosLosRepuestos();
      res.json({
        message: "Repuestos obtenidos exitosamente",
        data: repuestos,
      });
    } catch (error) {
      console.error("Error al obtener repuestos:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };

  // READ - Repuesto por ID
  obtenerRepuesto = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const repuesto = await this.repuestoService.obtenerRepuestoPorId(parseInt(id));

      if (!repuesto) {
        res.status(404).json({ error: "Repuesto no encontrado" });
        return;
      }

      res.json({
        message: "Repuesto obtenido exitosamente",
        data: repuesto,
      });
    } catch (error) {
      console.error("Error al obtener repuesto:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };

  // UPDATE
  actualizarRepuesto = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Convertir proveedor_id a número si existe
      if (updateData.proveedor_id) {
        updateData.proveedor_id = parseInt(updateData.proveedor_id);
      }

      // Validar cantidad si se está actualizando
      if (updateData.cantidad !== undefined && updateData.cantidad < 0) {
        res.status(400).json({ error: "La cantidad no puede ser negativa" });
        return;
      }

      const repuesto = await this.repuestoService.actualizarRepuesto(parseInt(id), updateData);

      if (!repuesto) {
        res.status(404).json({ error: "Repuesto no encontrado" });
        return;
      }

      res.json({
        message: "Repuesto actualizado exitosamente",
        data: repuesto,
      });
    } catch (error: any) {
      console.error("Error al actualizar repuesto:", error);
      
      if (error.message === "Proveedor no encontrado") {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Error interno del servidor" });
      }
    }
  };

  // DELETE
  eliminarRepuesto = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const resultado = await this.repuestoService.eliminarRepuesto(parseInt(id));

      if (!resultado) {
        res.status(404).json({ error: "Repuesto no encontrado" });
        return;
      }

      res.json({
        message: "Repuesto eliminado exitosamente",
      });
    } catch (error) {
      console.error("Error al eliminar repuesto:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };

  // READ - Repuestos por proveedor
  obtenerRepuestosPorProveedor = async (req: Request, res: Response): Promise<void> => {
    try {
      const { proveedorId } = req.params;
      const repuestos = await this.repuestoService.obtenerRepuestosPorProveedor(parseInt(proveedorId));
      
      res.json({
        message: "Repuestos del proveedor obtenidos exitosamente",
        data: repuestos,
      });
    } catch (error) {
      console.error("Error al obtener repuestos por proveedor:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };

  // READ - Búsqueda por nombre
  buscarRepuestos = async (req: Request, res: Response): Promise<void> => {
    try {
      const { nombre } = req.query;
      
      if (!nombre || typeof nombre !== "string") {
        res.status(400).json({ error: "El parámetro 'nombre' es requerido" });
        return;
      }

      const repuestos = await this.repuestoService.buscarRepuestosPorNombre(nombre);
      
      res.json({
        message: "Búsqueda completada exitosamente",
        data: repuestos,
      });
    } catch (error) {
      console.error("Error al buscar repuestos:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };

  // UPDATE - Cantidad específica
  actualizarCantidad = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { cantidad } = req.body;

      if (cantidad === undefined || cantidad < 0) {
        res.status(400).json({ error: "La cantidad es requerida y no puede ser negativa" });
        return;
      }

      const repuesto = await this.repuestoService.actualizarCantidadRepuesto(parseInt(id), cantidad);

      if (!repuesto) {
        res.status(404).json({ error: "Repuesto no encontrado" });
        return;
      }

      res.json({
        message: "Cantidad actualizada exitosamente",
        data: repuesto,
      });
    } catch (error) {
      console.error("Error al actualizar cantidad:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };
}