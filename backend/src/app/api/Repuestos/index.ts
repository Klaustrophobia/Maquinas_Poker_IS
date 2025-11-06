// routes/repuestos.ts
import { Router } from "express";
import { RepuestoController } from '@/controllers/Repuestos.controller';

const router = Router();
const repuestoController = new RepuestoController();

// CREATE
router.post("/", repuestoController.crearRepuesto);

// READ - Todos los repuestos
router.get("/", repuestoController.obtenerRepuestos);

// READ - Búsqueda por nombre
router.get("/buscar", repuestoController.buscarRepuestos);

// READ - Repuestos por proveedor
router.get("/proveedor/:proveedorId", repuestoController.obtenerRepuestosPorProveedor);

// READ - Repuesto por ID
router.get("/:id", repuestoController.obtenerRepuesto);

// UPDATE
router.put("/:id", repuestoController.actualizarRepuesto);

// UPDATE - Cantidad específica
router.patch("/:id/cantidad", repuestoController.actualizarCantidad);

// DELETE
router.delete("/:id", repuestoController.eliminarRepuesto);

export default router;