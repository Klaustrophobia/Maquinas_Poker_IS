// routes/proveedores.ts
import { Router } from "express";
import { ProveedorController } from "@/controllers/Proveedor.controller";

const router = Router();
const proveedorController = new ProveedorController();

// CREATE
router.post("/", proveedorController.crearProveedor);

// READ - Todos los proveedores
router.get("/", proveedorController.obtenerProveedores);

// READ - Búsqueda por nombre
router.get("/buscar", proveedorController.buscarProveedores);

// READ - Proveedor por ID
router.get("/:id", proveedorController.obtenerProveedor);

// UPDATE
router.put("/:id", proveedorController.actualizarProveedor);

// DELETE
router.delete("/:id", proveedorController.eliminarProveedor);

export default router;