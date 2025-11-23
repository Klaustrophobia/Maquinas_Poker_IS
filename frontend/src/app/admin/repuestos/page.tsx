"use client";
import { useState, useEffect } from "react";
import { Package, Plus, Eye, Edit2, Trash2, Search, X } from "lucide-react";

interface Repuesto {
  id: number;
  nombre: string;
  proveedor_id: number;
  cantidad: number;
  ubicacion: string;
  estado: string;
  proveedor?: {
    id: number;
    nombre: string;
    informacion_contacto: string;
    direccion: string;
  };
}

interface Proveedor {
  id: number;
  nombre: string;
  informacion_contacto: string;
  direccion: string;
}

export default function RepuestosPage() {
  const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loadingRepuestos, setLoadingRepuestos] = useState(false);
  const [filtroEstadoR, setFiltroEstadoR] = useState("todos");
  const [busquedaRepuestos, setBusquedaRepuestos] = useState("");
  
  // Estados para modales
  const [showAddRepuestoModal, setShowAddRepuestoModal] = useState(false);
  const [showDetailRepuestoModal, setShowDetailRepuestoModal] = useState(false);
  const [showEditRepuestoModal, setShowEditRepuestoModal] = useState(false);
  const [selectedRepuesto, setSelectedRepuesto] = useState<Repuesto | null>(null);
  
  const [repuestoFormData, setRepuestoFormData] = useState({
    nombre: "",
    proveedor_id: "",
    cantidad: "",
    ubicacion: "",
    estado: "Disponible"
  });

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    fetchRepuestos();
    fetchProveedores();
  }, []);

  const fetchRepuestos = async () => {
    setLoadingRepuestos(true);
    try {
      const res = await fetch(`${backendUrl}/api/repuestos`);
      if (res.ok) {
        const data = await res.json();
        const repuestosArray = Array.isArray(data) ? data : [];
        setRepuestos(repuestosArray);
      }
    } catch (error) {
      console.error("Error de conexión al intentar cargar repuestos:", error);
      setRepuestos([]);
    } finally {
      setLoadingRepuestos(false);
    }
  };

  const fetchProveedores = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/Proveedor`);
      if (res.ok) {
        const data = await res.json();
        setProveedores(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error al cargar proveedores:", error);
      setProveedores([]);
    }
  };

  // --- Validación para Repuestos ---
  const isRepuestoFormValid = (): boolean => {
    return repuestoFormData.nombre.trim() !== "" &&
        repuestoFormData.proveedor_id.trim() !== "" &&
        repuestoFormData.cantidad.trim() !== "" && 
        repuestoFormData.ubicacion.trim() !== "" &&
        repuestoFormData.estado.trim() !== "";
  };

  // Función para preparar el modal de edición de Repuestos
  const handleOpenEditRepuesto = (repuesto: Repuesto) => {
    setRepuestoFormData({
      nombre: repuesto.nombre,
      proveedor_id: repuesto.proveedor_id ? String(repuesto.proveedor_id) : "",
      cantidad: String(repuesto.cantidad), 
      ubicacion: repuesto.ubicacion,
      estado: repuesto.estado,
    });
    setSelectedRepuesto(repuesto);
    setShowDetailRepuestoModal(false);
    setShowEditRepuestoModal(true);
  };

  // Handlers para Repuestos
  const handleAddRepuesto = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!repuestoFormData.proveedor_id) {
        alert("Por favor selecciona un proveedor");
        return;
      }
      const res = await fetch(`${backendUrl}/api/repuestos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: repuestoFormData.nombre,
          proveedor_id: parseInt(repuestoFormData.proveedor_id, 10),
          cantidad: parseInt(repuestoFormData.cantidad, 10) || 0,
          ubicacion: repuestoFormData.ubicacion,
          estado: repuestoFormData.estado,
        }),
      });
      if (res.ok) {
        setShowAddRepuestoModal(false);
        setRepuestoFormData({ nombre: "", proveedor_id: "", cantidad: "", ubicacion: "", estado: "Disponible" });
        fetchRepuestos();
      } else {
        const errorData = await res.json();
        alert(`Error al crear el repuesto: ${errorData.message || "Error desconocido"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al crear el repuesto");
    }
  };

  const handleEditRepuesto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRepuesto) return;
    
    try {
      if (!repuestoFormData.proveedor_id) {
        alert("Por favor selecciona un proveedor");
        return;
      }
      const res = await fetch(`${backendUrl}/api/repuestos/${selectedRepuesto.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: repuestoFormData.nombre,
          proveedor_id: parseInt(repuestoFormData.proveedor_id, 10),
          cantidad: parseInt(repuestoFormData.cantidad, 10) || 0,
          ubicacion: repuestoFormData.ubicacion,
          estado: repuestoFormData.estado,
        }),
      });
      if (res.ok) {
        setShowEditRepuestoModal(false);
        setRepuestoFormData({ nombre: "", proveedor_id: "", cantidad: "", ubicacion: "", estado: "Disponible" });
        fetchRepuestos();
      } else {
        alert("Error al editar el repuesto");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexion al editar el repuesto");
    }
  };

  const handleDeleteRepuesto = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este repuesto?")) return;
    try {
      const res = await fetch(`${backendUrl}/api/repuestos/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchRepuestos();
      } else {
        alert("Error al eliminar el repuesto");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar el repuesto");
    }
  };

  // Filtrar repuestos según búsqueda
  const repuestosFiltrados = repuestos
    .filter((repuesto: Repuesto) => {
      const busqueda = busquedaRepuestos.toLowerCase();
      const coincideBusqueda = repuesto.nombre.toLowerCase().includes(busqueda);
      return coincideBusqueda;
    })
    .filter((repuesto: Repuesto) => {
      if (filtroEstadoR === "todos") {
        return true;
      }
      return repuesto.estado === filtroEstadoR;
    });

  // Contar repuesto por estado para las estadísticas del filtro
  const contarRepuestosPorEstado = (estado: string) => {
    return repuestos.filter((r: Repuesto) => r.estado === estado).length;
  };

  const getEstadoColor = (estado: string) => {
    const estadoLower = String(estado || "").toLowerCase();
    if (estadoLower.includes("disponible") || estadoLower.includes("activo")) return "bg-green-100 text-green-700";
    if (estadoLower.includes("uso") || estadoLower.includes("mantenimiento")) return "bg-blue-100 text-blue-700";
    if (estadoLower.includes("agotado") || estadoLower.includes("inactivo")) return "bg-red-100 text-red-700";
    if (estadoLower.includes("pedido")) return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-700";
  };

  const getCantidadColor = (cantidad: number) => {
    if (cantidad === 0) return "bg-red-100 text-red-700";
    if (cantidad < 10) return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Inventario de Repuestos</h2>
        <button 
          onClick={() => setShowAddRepuestoModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Repuesto
        </button>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-lg border border-blue-100/50 p-6 mb-6 relative overflow-hidden">
        {/* Elementos decorativos de fondo */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/10 to-purple-600/10 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-green-500/10 to-emerald-600/10 rounded-full translate-y-8 -translate-x-8"></div>
        
        <div className="flex flex-col md:flex-row gap-4 relative z-10">
          
          {/* Búsqueda por nombre */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar repuesto</label>
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={busquedaRepuestos}
                onChange={(e) => setBusquedaRepuestos(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="Buscar por nombre..."
              />
            </div>
          </div>
          
          {/* Filtro por estado */}
          <div className="md:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por estado</label>
            <select
              value={filtroEstadoR} 
              onChange={(e) => setFiltroEstadoR(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            >
              <option value="todos">Todos los estados</option>
              <option value="Disponible">Disponible</option>
              <option value="En uso">En uso</option>
              <option value="Agotado">Agotado</option>
              <option value="En pedido">En pedido</option>
            </select>
          </div>
        </div>
        
        {/* Estadísticas de filtros */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-200 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Total:</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
              {repuestos.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Disponible:</span>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
              {contarRepuestosPorEstado("Disponible")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">En uso:</span>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
              {contarRepuestosPorEstado("En uso")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Agotado:</span>
            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
              {contarRepuestosPorEstado("Agotado")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">En pedido:</span>
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
              {contarRepuestosPorEstado("En pedido")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Mostrando:</span>
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
              {repuestosFiltrados.length} de {repuestos.length}
            </span>
          </div>
        </div>
      </div>
      
      {/* Renderizado Condicional */}
      {loadingRepuestos ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-lg border border-blue-100/50 p-5 animate-pulse relative overflow-hidden">
              {/* Elementos decorativos de fondo */}
              <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-blue-500/10 to-purple-600/10 rounded-full -translate-y-4 translate-x-4"></div>
              <div className="absolute bottom-0 left-0 w-10 h-10 bg-gradient-to-tr from-green-500/10 to-emerald-600/10 rounded-full translate-y-4 -translate-x-4"></div>
              
              <div className="w-20 h-20 bg-gray-200 rounded-xl mx-auto mb-4 relative z-10"></div>
              <div className="h-4 bg-gray-200 rounded mb-2 relative z-10"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4 relative z-10"></div>
            </div>
          ))}
        </div>
      ) : repuestos.length === 0 ? (
        <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-lg border border-blue-100/50 p-12 text-center relative overflow-hidden">
          {/* Elementos decorativos de fondo */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-purple-600/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-500/10 to-emerald-600/10 rounded-full translate-y-12 -translate-x-12"></div>
          
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4 relative z-10" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2 relative z-10">No hay repuestos registrados</h3>
          <p className="text-gray-600 mb-6 relative z-10">Agrega repuestos al inventario para comenzar</p>
          <button 
            onClick={() => setShowAddRepuestoModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium inline-flex items-center gap-2 relative z-10"
          >
            <Plus className="w-5 h-5" />
            Agregar Primer Repuesto
          </button>
        </div>
      ) : repuestosFiltrados.length === 0 ? (
        <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-lg border border-blue-100/50 p-12 text-center relative overflow-hidden">
          {/* Elementos decorativos de fondo */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-purple-600/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-500/10 to-red-600/10 rounded-full translate-y-12 -translate-x-12"></div>
          
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4 relative z-10" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2 relative z-10">No se encontraron repuestos</h3>
          <p className="text-gray-600 mb-6 relative z-10">No hay repuestos que coincidan con los filtros aplicados</p>
          <button 
            onClick={() => {
              setBusquedaRepuestos("");
              setFiltroEstadoR("todos");
            }}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium inline-flex items-center gap-2 relative z-10"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {repuestosFiltrados.map((r) => (
            <div key={r.id} className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-lg border border-blue-100/50 hover:shadow-xl transition-all p-5 group relative overflow-hidden">
              {/* Elementos decorativos de fondo */}
              <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-blue-500/10 to-purple-600/10 rounded-full -translate-y-4 translate-x-4"></div>
              <div className="absolute bottom-0 left-0 w-10 h-10 bg-gradient-to-tr from-green-500/10 to-emerald-600/10 rounded-full translate-y-4 -translate-x-4"></div>
              
              <div className="flex justify-center mb-4 relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Package className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2 text-center truncate relative z-10" title={r.nombre}>
                {r.nombre}
              </h3>
              <p className="text-xs text-gray-600 mb-3 text-center truncate relative z-10">
                {r.proveedor?.nombre || "N/A"}
              </p>
              <div className="space-y-2 mb-4 relative z-10">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Cantidad:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCantidadColor(r.cantidad || 0)}`}>
                    {r.cantidad || 0} uds
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Estado:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getEstadoColor(r.estado)}`}>
                    {r.estado}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 relative z-10">
                <button 
                  onClick={() => { setSelectedRepuesto(r); setShowDetailRepuestoModal(true); }}
                  className="flex-1 bg-orange-50 text-orange-600 py-2 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Ver detalles
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL AGREGAR REPUESTO */}
      {showAddRepuestoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Nuevo Repuesto</h3>
              <button onClick={() => setShowAddRepuestoModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddRepuesto} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={repuestoFormData.nombre}
                  onChange={(e) => setRepuestoFormData({ ...repuestoFormData, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Nombre del repuesto"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor *</label>
                <select
                  required
                  value={repuestoFormData.proveedor_id}
                  onChange={(e) => setRepuestoFormData({ ...repuestoFormData, proveedor_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="">Seleccionar...</option>
                  {proveedores.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={repuestoFormData.cantidad}
                  onChange={(e) => setRepuestoFormData({ ...repuestoFormData, cantidad: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación *</label>
                <input
                  type="text"
                  required
                  value={repuestoFormData.ubicacion}
                  onChange={(e) => setRepuestoFormData({ ...repuestoFormData, ubicacion: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Ej: Estante A-12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                <select
                  required
                  value={repuestoFormData.estado}
                  onChange={(e) => setRepuestoFormData({ ...repuestoFormData, estado: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="Disponible">Disponible</option>
                  <option value="En uso">En uso</option>
                  <option value="Agotado">Agotado</option>
                  <option value="En pedido">En pedido</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddRepuestoModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-black"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!isRepuestoFormValid()}
                  className={`flex-1 px-4 py-2 text-white rounded-lg hover:shadow-lg ${
                    isRepuestoFormValid() 
                      ? "bg-gradient-to-r from-blue-500 to-purple-600"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETALLE REPUESTO */}
      {showDetailRepuestoModal && selectedRepuesto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Detalles del Repuesto</h3>
              <button onClick={() => setShowDetailRepuestoModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                  <Package className="w-12 h-12 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">{selectedRepuesto.nombre}</h2>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-medium text-gray-600">ID</label>
                  <p className="text-gray-900 font-medium">{selectedRepuesto.id}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-medium text-gray-600">Proveedor</label>
                  <p className="text-gray-900 font-medium">{selectedRepuesto.proveedor?.nombre || "N/A"}</p>
                  {selectedRepuesto.proveedor?.informacion_contacto && (
                    <p className="text-sm text-gray-600 mt-1">{selectedRepuesto.proveedor.informacion_contacto}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="text-sm font-medium text-gray-600">Cantidad</label>
                    <p className="text-2xl font-bold text-gray-900">{selectedRepuesto.cantidad || 0} uds</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="text-sm font-medium text-gray-600">Estado</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-2 ${getEstadoColor(selectedRepuesto.estado)}`}>
                      {selectedRepuesto.estado}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-medium text-gray-600">Ubicación</label>
                  <p className="text-gray-900 font-medium">{selectedRepuesto.ubicacion || "No especificada"}</p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowDetailRepuestoModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-black"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => selectedRepuesto && handleOpenEditRepuesto(selectedRepuesto)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR REPUESTO */}
      {showEditRepuestoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Editar Repuesto</h3>
              <button onClick={() => setShowEditRepuestoModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleEditRepuesto} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={repuestoFormData.nombre}
                  onChange={(e) => setRepuestoFormData({ ...repuestoFormData, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Nombre del repuesto"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor *</label>
                <select
                  required
                  value={repuestoFormData.proveedor_id}
                  onChange={(e) => setRepuestoFormData({ ...repuestoFormData, proveedor_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="">Selecciona un proveedor</option>
                  {proveedores.map((p) => (
                    <option 
                      key={p.id} 
                      value={String(p.id)}
                    >
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={repuestoFormData.cantidad}
                  onChange={(e) => setRepuestoFormData({ ...repuestoFormData, cantidad: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación *</label>
                <input
                  type="text"
                  required
                  value={repuestoFormData.ubicacion}
                  onChange={(e) => setRepuestoFormData({ ...repuestoFormData, ubicacion: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Ej: Estante A-12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                <select
                  required
                  value={repuestoFormData.estado}
                  onChange={(e) => setRepuestoFormData({ ...repuestoFormData, estado: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="Disponible">Disponible</option>
                  <option value="En uso">En uso</option>
                  <option value="Agotado">Agotado</option>
                  <option value="En pedido">En pedido</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditRepuestoModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-black"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!isRepuestoFormValid()}
                  className={`flex-1 px-4 py-2 text-white rounded-lg hover:shadow-lg ${
                    isRepuestoFormValid() 
                      ? "bg-gradient-to-r from-blue-500 to-purple-600"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}