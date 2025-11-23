"use client";
import { useState, useEffect } from "react";
import { Wrench, Plus, Eye, Trash2, Search, X, Edit2 } from "lucide-react";


interface Maquina {
  id: number;
  id_maquina?: number;
  nombre: string;
  tipo: string;
  estado: string;
  ubicacion: string;
  fecha_compra: string;
  fecha_garantia: string;
  modelo?: string;
  serie?: string;
}

export default function MaquinasPage() {
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [loadingMaquinas, setLoadingMaquinas] = useState(false);
  const [filtroEstadoMaquina, setFiltroEstadoMaquina] = useState("todos");
  const [busquedaMaquinas, setBusquedaMaquinas] = useState("");
  
  // Estados para modales
  const [showAddMaquinaModal, setShowAddMaquinaModal] = useState(false);
  const [showDetailMaquinaModal, setShowDetailMaquinaModal] = useState(false);
  const [showEditMaquinaModal, setShowEditMaquinaModal] = useState(false);
  const [selectedMaquina, setSelectedMaquina] = useState<Maquina | null>(null);
  
  const [maquinaFormData, setMaquinaFormData] = useState({
    nombre: "",
    tipo: "",
    estado: "Fuera de servicio",
    ubicacion: "",
    fecha_compra: "",
    fecha_garantia: ""
  });

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    fetchMaquinas();
  }, []);

  const fetchMaquinas = async () => {
    setLoadingMaquinas(true);
    try {
      const res = await fetch(`${backendUrl}/api/Maquina`);
      if (res.ok) {
        const data = await res.json();
        const maquinasArray = Array.isArray(data) ? data : [];
        setMaquinas(maquinasArray);
      }
    } catch (error) {
      console.error("Error de conexión al intentar cargar maquinas:", error);
      setMaquinas([]);
    } finally {
      setLoadingMaquinas(false);
    }
  };

  // --- Validación para Máquinas ---
  const isMaquinaFormValid = (): boolean => {
    return maquinaFormData.nombre.trim() !== "" &&
           maquinaFormData.tipo.trim() !== "" &&
           maquinaFormData.estado.trim() !== "" &&
           maquinaFormData.ubicacion.trim() !== "" &&
           maquinaFormData.fecha_compra.trim() !== "" &&
           maquinaFormData.fecha_garantia.trim() !== "";
  };

  // Handlers para Máquinas
  const handleAddMaquina = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${backendUrl}/api/Maquina`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: maquinaFormData.nombre,
          tipo: maquinaFormData.tipo,
          estado: maquinaFormData.estado,
          ubicacion: maquinaFormData.ubicacion,
          fecha_compra: maquinaFormData.fecha_compra,
          fecha_garantia: maquinaFormData.fecha_garantia,
        }),
      });
      if (res.ok) {
        setShowAddMaquinaModal(false);
        setMaquinaFormData({ nombre: "", tipo: "", estado: "Fuera de servicio", ubicacion: "", fecha_compra: "", fecha_garantia: "" });
        fetchMaquinas();
      } else {
        alert("Error al ingresar valores para crear maquina.");
      }
    } catch (error) {
      console.error("Error de conexion:", error);
      alert("Error de conexión. No se pudo contactar al servidor.");
    }
  };

  const handleEditMaquina = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaquina) return;
    
    try {
      const res = await fetch(`${backendUrl}/api/Maquina/${selectedMaquina.id || selectedMaquina.id_maquina}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: maquinaFormData.nombre,
          tipo: maquinaFormData.tipo,
          estado: maquinaFormData.estado,
          ubicacion: maquinaFormData.ubicacion,
          fecha_compra: maquinaFormData.fecha_compra,
          fecha_garantia: maquinaFormData.fecha_garantia,
        }),
      });
      if (res.ok) {
        setShowEditMaquinaModal(false);
        setMaquinaFormData({ nombre: "", tipo: "", estado: "Fuera de servicio", ubicacion: "", fecha_compra: "", fecha_garantia: "" });
        fetchMaquinas();
      } else {
        alert("Error al editar la máquina");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al editar la máquina");
    }
  };

  const handleDeleteMaquina = async (id: number | undefined) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta máquina?")) return;
    try {
      const res = await fetch(`${backendUrl}/api/Maquina/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchMaquinas();
      } else {
        alert("Error al eliminar la máquina");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar la máquina");
    }
  };

  // --- LÓGICA DE FILTRADO COMBINADO ---
  const maquinasFiltradas = maquinas
      .filter((maquina: Maquina) => {
          const busqueda = busquedaMaquinas.toLowerCase();
          const coincideBusqueda = 
              maquina.nombre.toLowerCase().includes(busqueda);
          return coincideBusqueda;
      })
      .filter((maquina: Maquina) => {
          if (filtroEstadoMaquina === "todos") {
              return true;
          }
          return maquina.estado === filtroEstadoMaquina;
      });

  // Funciones auxiliares
  const contarMaquinasPorEstado = (estado: string) => {
      return maquinas.filter((m: Maquina) => m.estado === estado).length;
  };

  const getEstadoColor = (estado: string) => {
    const estadoLower = String(estado || "").toLowerCase();
    if (estadoLower.includes("disponible") || estadoLower.includes("activo") || estadoLower.includes("funcionando")) return "bg-green-100 text-green-700";
    if (estadoLower.includes("uso") || estadoLower.includes("mantenimiento")) return "bg-blue-100 text-blue-700";
    if (estadoLower.includes("agotado") || estadoLower.includes("inactivo") || estadoLower.includes("fuera de servicio")) return "bg-red-100 text-red-700";
    if (estadoLower.includes("pedido")) return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Gestión de Máquinas</h2>
        <div className="flex gap-3">
          <button 
            onClick={() => window.location.href = '/admin/asignarMaquina'}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all font-medium flex items-center gap-2"
          >
            <Wrench className="w-5 h-5" />
            Asignar Máquinas
          </button>
          <button 
            onClick={() => setShowAddMaquinaModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nueva Máquina
          </button>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-lg border border-blue-100/50 p-6 mb-6 relative overflow-hidden">
        {/* Elementos decorativos de fondo */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/10 to-purple-600/10 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-green-500/10 to-emerald-600/10 rounded-full translate-y-8 -translate-x-8"></div>
        
        <div className="flex flex-col md:flex-row gap-4 relative z-10">
          
          {/* Búsqueda por nombre/tipo/ubicación */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar máquina</label>
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={busquedaMaquinas}
                onChange={(e) => setBusquedaMaquinas(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="Buscar por nombre..."
              />
            </div>
          </div>
          
          {/* Filtro por estado */}
          <div className="md:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por estado</label>
            <select
              value={filtroEstadoMaquina} 
              onChange={(e) => setFiltroEstadoMaquina(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            >
              <option value="todos">Todos los estados</option>
              <option value="Funcionando">Funcionando</option>
              <option value="Mantenimiento">Mantenimiento</option>
              <option value="Fuera de servicio">Fuera de servicio</option>
            </select>
          </div>
        </div>
        
        {/* Estadísticas de filtros */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-200 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Total:</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
              {maquinas.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Funcionando:</span>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
              {contarMaquinasPorEstado("Funcionando")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Mantenimiento:</span>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
              {contarMaquinasPorEstado("Mantenimiento")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Fuera de servicio:</span>
            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
              {contarMaquinasPorEstado("Fuera de servicio")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Mostrando:</span>
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
              {maquinasFiltradas.length} de {maquinas.length}
            </span>
          </div>
        </div>
      </div>

      {/* Renderizado Condicional */}
      {loadingMaquinas ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="h-12 bg-gray-200 rounded mb-4"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : maquinas.length === 0 ? (
        // Cuando no hay máquinas registradas
        <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-lg border border-blue-100/50 p-12 text-center relative overflow-hidden">
          {/* Elementos decorativos de fondo */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-purple-600/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-500/10 to-emerald-600/10 rounded-full translate-y-12 -translate-x-12"></div>
          
          <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4 relative z-10" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2 relative z-10">No hay máquinas registradas</h3>
          <p className="text-gray-600 mb-6 relative z-10">Agrega una máquina para comenzar</p>
          <button 
            onClick={() => setShowAddMaquinaModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium inline-flex items-center gap-2 relative z-10"
          >
            <Plus className="w-5 h-5" />
            Agregar Primera Máquina
          </button>
        </div>
      ) : maquinasFiltradas.length === 0 ? (
        // Cuando no hay resultados con los filtros aplicados
        <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-lg border border-blue-100/50 p-12 text-center relative overflow-hidden">
          {/* Elementos decorativos de fondo */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-purple-600/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-500/10 to-red-600/10 rounded-full translate-y-12 -translate-x-12"></div>
          
          <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4 relative z-10" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2 relative z-10">No se encontraron máquinas</h3>
          <p className="text-gray-600 mb-6 relative z-10">No hay máquinas que coincidan con los filtros aplicados</p>
          <button 
            onClick={() => {
              setBusquedaMaquinas("");
              setFiltroEstadoMaquina("todos");
            }}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium inline-flex items-center gap-2 relative z-10"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        // Muestra SOLAMENTE las máquinas filtradas
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {maquinasFiltradas.map((m, i) => (
            <div key={m.id || m.id_maquina || i} className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-lg border border-blue-100/50 hover:shadow-xl transition-all p-6 group relative overflow-hidden">
              {/* Elementos decorativos de fondo */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-500/10 to-purple-600/10 rounded-full -translate-y-6 translate-x-6"></div>
              <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-green-500/10 to-emerald-600/10 rounded-full translate-y-6 -translate-x-6"></div>
              
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Wrench className="w-6 h-6 text-blue-600" />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(m.estado)}`}>
                  {m.estado || "Activa"}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 relative z-10">{m.nombre || `Máquina #${i + 1}`}</h3>
              <p className="text-sm text-gray-600 mb-1 relative z-10">Tipo: {m.tipo || "N/A"}</p>
              <p className="text-sm text-gray-600 mb-4 relative z-10">Ubicación: {m.ubicacion || "N/A"}</p>
              <div className="flex gap-3 relative z-10">
                <button 
                  onClick={() => { setSelectedMaquina(m); setShowDetailMaquinaModal(true); }}
                  className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Ver detalles
                </button>
                <button
                  onClick={() => handleDeleteMaquina(m.id || m.id_maquina)}
                  className="w-12 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded-lg"
                  title="Eliminar máquina"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL AGREGAR MÁQUINA */}
      {showAddMaquinaModal && (
        <div className="fixed inset-0 bg-opacity-50 bg-black flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            {/* Elementos decorativos de fondo */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-500/10 to-purple-600/10 rounded-full -translate-y-8 translate-x-8"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-green-500/10 to-emerald-600/10 rounded-full translate-y-8 -translate-x-8"></div>
            
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between relative z-10">
              <h3 className="text-xl font-bold text-gray-900">Nueva Máquina</h3>
              <button onClick={() => setShowAddMaquinaModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddMaquina} className="p-6 space-y-4 relative z-10">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={maquinaFormData.nombre}
                  onChange={(e) => setMaquinaFormData({ ...maquinaFormData, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Nombre de la máquina"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                <input
                  type="text"
                  required
                  value={maquinaFormData.tipo}
                  onChange={(e) => setMaquinaFormData({ ...maquinaFormData, tipo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Tipo de máquina"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación *</label>
                <input
                  type="text"
                  required
                  value={maquinaFormData.ubicacion}
                  onChange={(e) => setMaquinaFormData({ ...maquinaFormData, ubicacion: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Ubicación"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                <select
                  required
                  value={maquinaFormData.estado}
                  onChange={(e) => setMaquinaFormData({ ...maquinaFormData, estado: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="Fuera de servicio">Fuera de servicio</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                  <option value="Funcionando">Funcionando</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Compra *</label>
                <input
                  type="date"
                  required
                  value={maquinaFormData.fecha_compra}
                  onChange={(e) => setMaquinaFormData({ ...maquinaFormData, fecha_compra: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Garantía *</label>
                <input
                  type="date"
                  required
                  value={maquinaFormData.fecha_garantia}
                  onChange={(e) => setMaquinaFormData({ ...maquinaFormData, fecha_garantia: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddMaquinaModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!isMaquinaFormValid()}
                  className={`flex-1 px-4 py-2 text-white rounded-lg hover:shadow-lg ${
                    isMaquinaFormValid() 
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

      {/* MODAL DETALLE MÁQUINA */}
      {showDetailMaquinaModal && selectedMaquina && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            {/* Elementos decorativos de fondo */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/10 to-purple-600/10 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-green-500/10 to-emerald-600/10 rounded-full translate-y-10 -translate-x-10"></div>
            
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between relative z-10">
              <h3 className="text-xl font-bold text-gray-900">Detalles de la Máquina</h3>
              <button onClick={() => setShowDetailMaquinaModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 relative z-10">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Wrench className="w-12 h-12 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">{selectedMaquina.nombre}</h2>
              <div className="space-y-4">
                <div className="bg-white/50 rounded-lg p-4">
                  <label className="text-sm font-medium text-gray-600">ID</label>
                  <p className="text-gray-900 font-medium">{selectedMaquina.id}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/50 rounded-lg p-4">
                    <label className="text-sm font-medium text-gray-600">Tipo</label>
                    <p className="text-gray-900 font-medium">{selectedMaquina.tipo || "N/A"}</p>
                  </div>
                  <div className="bg-white/50 rounded-lg p-4">
                    <label className="text-sm font-medium text-gray-600">Estado</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-2 ${getEstadoColor(selectedMaquina.estado)}`}>
                      {selectedMaquina.estado}
                    </span>
                  </div>
                </div>
                <div className="bg-white/50 rounded-lg p-4">
                  <label className="text-sm font-medium text-gray-600">Ubicación</label>
                  <p className="text-gray-900 font-medium">{selectedMaquina.ubicacion || "N/A"}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/50 rounded-lg p-4">
                    <label className="text-sm font-medium text-gray-600">Fecha de Compra</label>
                    <p className="text-gray-900 font-medium">{new Date(selectedMaquina.fecha_compra).toLocaleDateString() || "N/A"}</p>
                  </div>
                  <div className="bg-white/50 rounded-lg p-4">
                    <label className="text-sm font-medium text-gray-600">Fecha de Garantía</label>
                    <p className="text-gray-900 font-medium">{new Date(selectedMaquina.fecha_garantia).toLocaleDateString() || "N/A"}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowDetailMaquinaModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cerrar
                </button>
                <button 
                  onClick={() => {
                    setMaquinaFormData({
                      nombre: selectedMaquina.nombre,
                      tipo: selectedMaquina.tipo,
                      estado: selectedMaquina.estado,
                      ubicacion: selectedMaquina.ubicacion,
                      fecha_compra: selectedMaquina.fecha_compra || "",
                      fecha_garantia: selectedMaquina.fecha_garantia || "",
                    });
                    setShowDetailMaquinaModal(false);
                    setShowEditMaquinaModal(true);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </button>
                <button 
                  onClick={() => {
                    setShowDetailMaquinaModal(false);
                    handleDeleteMaquina(selectedMaquina.id);
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

      {/* MODAL EDITAR MÁQUINA */}
      {showEditMaquinaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            {/* Elementos decorativos de fondo */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-500/10 to-purple-600/10 rounded-full -translate-y-8 translate-x-8"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-green-500/10 to-emerald-600/10 rounded-full translate-y-8 -translate-x-8"></div>
            
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between relative z-10">
              <h3 className="text-xl font-bold text-gray-900">Editar Máquina</h3>
              <button onClick={() => setShowEditMaquinaModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleEditMaquina} className="p-6 space-y-4 relative z-10">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={maquinaFormData.nombre}
                  onChange={(e) => setMaquinaFormData({ ...maquinaFormData, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Nombre de la máquina"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                <input
                  type="text"
                  required
                  value={maquinaFormData.tipo}
                  onChange={(e) => setMaquinaFormData({ ...maquinaFormData, tipo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Tipo de máquina"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación *</label>
                <input
                  type="text"
                  required
                  value={maquinaFormData.ubicacion}
                  onChange={(e) => setMaquinaFormData({ ...maquinaFormData, ubicacion: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Ubicación"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                <select
                  required
                  value={maquinaFormData.estado}
                  onChange={(e) => setMaquinaFormData({ ...maquinaFormData, estado: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="Fuera de servicio">Fuera de servicio</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                  <option value="Funcionando">Funcionando</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Compra</label>
                <input
                  type="date"
                  value={maquinaFormData.fecha_compra}
                  onChange={(e) => setMaquinaFormData({ ...maquinaFormData, fecha_compra: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Garantía</label>
                <input
                  type="date"
                  value={maquinaFormData.fecha_garantia}
                  onChange={(e) => setMaquinaFormData({ ...maquinaFormData, fecha_garantia: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditMaquinaModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!isMaquinaFormValid()}
                  className={`flex-1 px-4 py-2 text-white rounded-lg hover:shadow-lg ${
                    isMaquinaFormValid() 
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