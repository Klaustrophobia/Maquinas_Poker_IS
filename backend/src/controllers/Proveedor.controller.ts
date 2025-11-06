// controllers/ProveedorController.ts
import { Request, Response } from "express";
import { ProveedorService } from "../services/Proveedor.service";

export class ProveedorController {
  private proveedorService: ProveedorService;

  constructor() {
    this.proveedorService = new ProveedorService();
  }

  // CREATE
  crearProveedor = async (req: Request, res: Response): Promise<void> => {
    try {
      const { nombre, informacion_contacto, direccion } = req.body;

      if (!nombre) {
        res.status(400).json({ error: "El nombre es requerido" });
        return;
      }

      const proveedor = await this.proveedorService.crearProveedor({
        nombre,
        informacion_contacto,
        direccion,
      });

      res.status(201).json({
        message: "Proveedor creado exitosamente",
        data: proveedor,
      });
    } catch (error) {
      console.error("Error al crear proveedor:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };

  // READ - Todos los proveedores
  obtenerProveedores = async (req: Request, res: Response): Promise<void> => {
    try {
      const proveedores = await this.proveedorService.obtenerTodosLosProveedores();
      res.json({
        message: "Proveedores obtenidos exitosamente",
        data: proveedores,
      });
    } catch (error) {
      console.error("Error al obtener proveedores:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };

  // READ - Proveedor por ID
  obtenerProveedor = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const proveedor = await this.proveedorService.obtenerProveedorPorId(parseInt(id));

      if (!proveedor) {
        res.status(404).json({ error: "Proveedor no encontrado" });
        return;
      }

      res.json({
        message: "Proveedor obtenido exitosamente",
        data: proveedor,
      });
    } catch (error) {
      console.error("Error al obtener proveedor:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };

  // UPDATE
  actualizarProveedor = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const proveedor = await this.proveedorService.actualizarProveedor(parseInt(id), updateData);

      if (!proveedor) {
        res.status(404).json({ error: "Proveedor no encontrado" });
        return;
      }

      res.json({
        message: "Proveedor actualizado exitosamente",
        data: proveedor,
      });
    } catch (error) {
      console.error("Error al actualizar proveedor:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };

  // DELETE
  eliminarProveedor = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const resultado = await this.proveedorService.eliminarProveedor(parseInt(id));

      if (!resultado) {
        res.status(404).json({ error: "Proveedor no encontrado" });
        return;
      }

      res.json({
        message: "Proveedor eliminado exitosamente",
      });
    } catch (error) {
      console.error("Error al eliminar proveedor:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };

  // READ - Búsqueda por nombre
  buscarProveedores = async (req: Request, res: Response): Promise<void> => {
    try {
      const { nombre } = req.query;
      
      if (!nombre || typeof nombre !== "string") {
        res.status(400).json({ error: "El parámetro 'nombre' es requerido" });
        return;
      }

      const proveedores = await this.proveedorService.buscarProveedoresPorNombre(nombre);
      
      res.json({
        message: "Búsqueda completada exitosamente",
        data: proveedores,
      });
    } catch (error) {
      console.error("Error al buscar proveedores:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };
}