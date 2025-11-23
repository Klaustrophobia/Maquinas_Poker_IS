"use client";
import { useState, useEffect } from "react";
import { Truck, Plus, Eye, Edit2, Trash2, Search, X } from "lucide-react";

interface Proveedor {
  id: number;
  nombre: string;
  informacion_contacto: string;
  direccion: string;
}

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loadingProveedores, setLoadingProveedores] = useState(false);
  const [busquedaProveedores, setBusquedaProveedores] = useState("");
  
  // Estados para modales
  const [showAddProveedorModal, setShowAddProveedorModal] = useState(false);
  const [showDetailProveedorModal, setShowDetailProveedorModal] = useState(false);
  const [showEditProveedorModal, setShowEditProveedorModal] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState<Proveedor | null>(null);
  
  const [proveedorFormData, setProveedorFormData] = useState({
    nombre: "",
    informacion_contacto: "",
    direccion: ""
  });

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    fetchProveedores();
  }, []);

  const fetchProveedores = async () => {
    setLoadingProveedores(true);
    try {
      const res = await fetch(`${backendUrl}/api/Proveedor`);
      if (res.ok) {
        const data = await res.json();
        setProveedores(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error:", error);
      setProveedores([]);
    } finally {
      setLoadingProveedores(false);
    }
  };

  // --- Validación para Proveedores ---
  const isProveedorFormValid = (): boolean => {
    return proveedorFormData.nombre.trim() !== "" &&
           proveedorFormData.informacion_contacto.trim() !== "" &&
           proveedorFormData.direccion.trim() !== "";
  };

  // Handlers para Proveedores
  const handleAddProveedor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${backendUrl}/api/Proveedor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proveedorFormData),
      });
      if (res.ok) {
        setShowAddProveedorModal(false);
        setProveedorFormData({ nombre: "", informacion_contacto: "", direccion: "" });
        fetchProveedores();
      } else {
        alert("Error al ingresar valores para crear proveedor.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión. No se pudo contactar al servidor.");
    }
  };

  const handleEditProveedor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProveedor) return;
    
    try {
      const res = await fetch(`${backendUrl}/api/Proveedor/${selectedProveedor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proveedorFormData),
      });
      if (res.ok) {
        setShowEditProveedorModal(false);
        setProveedorFormData({ nombre: "", informacion_contacto: "", direccion: "" });
        fetchProveedores();
      } else {
        alert("Error al editar el proveedor");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexion al editar el proveedor");
    }
  };

  const handleDeleteProveedor = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este proveedor?")) return;
    try {
      const res = await fetch(`${backendUrl}/api/Proveedor/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchProveedores();
      } else {
        alert("Error al eliminar el proveedor");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar el proveedor");
    }
  };

  // Filtrar proveedor según búsqueda
  const proveedoresFiltrados = proveedores.filter((proveedor: Proveedor) => {
    const coincideBusqueda = proveedor.nombre?.toLowerCase().includes(busquedaProveedores.toLowerCase());
    return coincideBusqueda;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Gestión de Proveedores</h2>
        <button 
          onClick={() => setShowAddProveedorModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Proveedor
        </button>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-lg border border-blue-100/50 p-6 mb-6 relative overflow-hidden">
        {/* Elementos decorativos de fondo */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/10 to-purple-600/10 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-green-500/10 to-emerald-600/10 rounded-full translate-y-8 -translate-x-8"></div>
        
        <div className="flex flex-col md:flex-row gap-4 items-center relative z-10">
          {/* Búsqueda por nombre */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar proveedor</label>
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={busquedaProveedores}
                onChange={(e) => setBusquedaProveedores(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="Buscar por nombre..."
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-auto">
            <span className="text-sm text-gray-600">Mostrando:</span>
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
              {proveedoresFiltrados.length} de {proveedores.length}
            </span>
          </div>
        </div>
      </div>

      {/* Renderizado Condicional */}
      {loadingProveedores ? (
        // Estado de Carga (Skeleton/Pulse)
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-lg border border-blue-100/50 p-6 animate-pulse relative overflow-hidden">
              {/* Elementos decorativos de fondo */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-500/10 to-purple-600/10 rounded-full -translate-y-6 translate-x-6"></div>
              <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-green-500/10 to-emerald-600/10 rounded-full translate-y-6 -translate-x-6"></div>
              
              <div className="flex items-start gap-3 mb-4 relative z-10">
                <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : proveedores.length === 0 ? (
        // Sin proveedores en el sistema
        <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-lg border border-blue-100/50 p-12 text-center relative overflow-hidden">
          {/* Elementos decorativos de fondo */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-purple-600/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-500/10 to-emerald-600/10 rounded-full translate-y-12 -translate-x-12"></div>
          
          <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4 relative z-10" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2 relative z-10">No hay proveedores registrados</h3>
          <p className="text-gray-600 mb-6 relative z-10">Comienza agregando tu primer proveedor al sistema</p>
          <button 
            onClick={() => setShowAddProveedorModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium inline-flex items-center gap-2 relative z-10"
          >
            <Plus className="w-5 h-5" />
            Agregar Proveedor
          </button>
        </div>
      ) : proveedoresFiltrados.length === 0 ? (
        // Sin resultados para la búsqueda actual
        <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-lg border border-blue-100/50 p-12 text-center relative overflow-hidden">
          {/* Elementos decorativos de fondo */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-purple-600/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-500/10 to-red-600/10 rounded-full translate-y-12 -translate-x-12"></div>
          
          <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4 relative z-10" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2 relative z-10">No se encontraron proveedores</h3>
          <p className="text-gray-600 mb-6 relative z-10">Ningún proveedor coincide con el término de búsqueda.</p>
          <button 
            onClick={() => {
              setBusquedaProveedores("");
            }}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium inline-flex items-center gap-2 relative z-10"
          >
            Limpiar búsqueda
          </button>
        </div>
      ) : (
        // Muestra los proveedores filtrados
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {proveedoresFiltrados.map((proveedor) => (
            <div key={proveedor.id} className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-lg border border-blue-100/50 hover:shadow-xl transition-all p-6 group relative overflow-hidden">
              {/* Elementos decorativos de fondo */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-500/10 to-purple-600/10 rounded-full -translate-y-6 translate-x-6"></div>
              <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-green-500/10 to-emerald-600/10 rounded-full translate-y-6 -translate-x-6"></div>
              
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Truck className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{proveedor.nombre}</h3>
                    <p className="text-xs text-gray-500">ID: {proveedor.id}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  Activo
                </span>
              </div>
              <div className="space-y-2 mb-4 relative z-10">
                {proveedor.informacion_contacto && (
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    📧 <span className="truncate">{proveedor.informacion_contacto}</span>
                  </p>
                )}
                {proveedor.direccion && (
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    📍 <span className="truncate">{proveedor.direccion}</span>
                  </p>
                )}
              </div>
              <div className="flex gap-2 relative z-10">
                <button 
                  onClick={() => { setSelectedProveedor(proveedor); setShowDetailProveedorModal(true); }}
                  className="flex-1 bg-purple-50 text-purple-600 py-2 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Ver detalles
                </button>
                <button
                  onClick={() => handleDeleteProveedor(proveedor.id)}
                  className="w-12 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded-lg"
                  title="Eliminar proveedor"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DETALLE PROVEEDOR */}
      {showDetailProveedorModal && selectedProveedor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Detalles del Proveedor</h3>
              <button onClick={() => setShowDetailProveedorModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Truck className="w-12 h-12 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">{selectedProveedor.nombre}</h2>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-medium text-gray-600">ID</label>
                  <p className="text-gray-900 font-medium">{selectedProveedor.id}</p>
                </div>
                {selectedProveedor.informacion_contacto && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="text-sm font-medium text-gray-600">Información Contacto</label>
                    <p className="text-gray-900 font-medium">{selectedProveedor.informacion_contacto}</p>
                  </div>
                )}
                {selectedProveedor.direccion && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="text-sm font-medium text-gray-600">Dirección</label>
                    <p className="text-gray-900 font-medium">{selectedProveedor.direccion}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowDetailProveedorModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cerrar
                </button>
                <button 
                  onClick={() => {
                    setProveedorFormData({
                      nombre: selectedProveedor.nombre,
                      informacion_contacto: selectedProveedor.informacion_contacto,
                      direccion: selectedProveedor.direccion,
                    });
                    setShowDetailProveedorModal(false);
                    setShowEditProveedorModal(true);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </button>
                <button 
                  onClick={() => {
                    setShowDetailProveedorModal(false);
                    handleDeleteProveedor(selectedProveedor.id);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR PROVEEDOR */}
      {showAddProveedorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Nuevo Proveedor</h3>
              <button onClick={() => setShowAddProveedorModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddProveedor} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={proveedorFormData.nombre}
                  onChange={(e) => setProveedorFormData({ ...proveedorFormData, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Nombre del proveedor"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Información de Contacto *</label>
                <input
                  type="text"
                  required
                  value={proveedorFormData.informacion_contacto}
                  onChange={(e) => setProveedorFormData({ ...proveedorFormData, informacion_contacto: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Email o teléfono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección *</label>
                <textarea
                  required
                  value={proveedorFormData.direccion}
                  onChange={(e) => setProveedorFormData({ ...proveedorFormData, direccion: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  rows={3}
                  placeholder="Dirección completa"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddProveedorModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!isProveedorFormValid()}
                  className={`flex-1 px-4 py-2 text-white rounded-lg hover:shadow-lg ${
                    isProveedorFormValid()
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

      {/* MODAL EDITAR PROVEEDOR */}
      {showEditProveedorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Editar Proveedor</h3>
              <button onClick={() => setShowEditProveedorModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleEditProveedor} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={proveedorFormData.nombre}
                  onChange={(e) => setProveedorFormData({ ...proveedorFormData, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Nombre del proveedor"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Información de Contacto *</label>
                <input
                  type="text"
                  required
                  value={proveedorFormData.informacion_contacto}
                  onChange={(e) => setProveedorFormData({ ...proveedorFormData, informacion_contacto: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Email o teléfono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección *</label>
                <textarea
                  required
                  value={proveedorFormData.direccion}
                  onChange={(e) => setProveedorFormData({ ...proveedorFormData, direccion: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  rows={3}
                  placeholder="Dirección completa"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditProveedorModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!isProveedorFormValid()}
                  className={`flex-1 px-4 py-2 text-white rounded-lg hover:shadow-lg ${
                    isProveedorFormValid()
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