"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, Wrench, UserPlus, X, RefreshCw, UserCheck, Search } from "lucide-react";

// Interfaces
interface Maquina {
  id: number;
  nombre: string;
  tipo: string;
  estado: string;
}

interface Asignada {
  id: number;
  maquina: Maquina;
  cliente: { id: number; nombre_usuario: string } | null;
}

interface Cliente {
  id: number;
  nombre_usuario: string;
}

interface ClienteActual {
  cliente_id: number;
  cliente_nombre: string;
  fecha_asignacion: string;
}

export default function AsignarMaquina() {
  const router = useRouter();
  const [maquinasAsignadas, setMaquinasAsignadas] = useState<Asignada[]>([]);
  const [maquinasNoAsignadas, setMaquinasNoAsignadas] = useState<Maquina[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMaquina, setSelectedMaquina] = useState<number | null>(null);
  const [selectedCliente, setSelectedCliente] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalMode, setModalMode] = useState<'asignar' | 'reasignar'>('asignar');
  const [clienteActual, setClienteActual] = useState<ClienteActual | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para búsquedas
  const [busquedaNoAsignadas, setBusquedaNoAsignadas] = useState("");
  const [busquedaAsignadas, setBusquedaAsignadas] = useState("");

  // ---------- Fetch de datos ----------
  const fetchData = async () => {
    setError(null);
    try {
      
      // Máquinas no asignadas - URL absoluta con puerto 3000
      const resNoAsignadas = await fetch('http://localhost:3000/api/Maquina-Cliente/listarNoAsignadas');
      
      if (!resNoAsignadas.ok) {
        throw new Error(`Error ${resNoAsignadas.status} al cargar máquinas no asignadas`);
      }
      
      const noAsignadasData = await resNoAsignadas.json();
      setMaquinasNoAsignadas(noAsignadasData);

      // Máquinas asignadas - URL absoluta con puerto 3000
      const resAsignadas = await fetch('http://localhost:3000/api/Maquina-Cliente/listarTodas');
      
      if (!resAsignadas.ok) {
        throw new Error(`Error ${resAsignadas.status} al cargar máquinas asignadas`);
      }
      
      const asignadasData = await resAsignadas.json();
      setMaquinasAsignadas(asignadasData);

      // Clientes solo rol cliente - URL absoluta con puerto 3000
      const resClientes = await fetch('http://localhost:3000/api/Usuario/Cliente');
      
      if (!resClientes.ok) {
        throw new Error(`Error ${resClientes.status} al cargar clientes`);
      }
      
      const clientesData = await resClientes.json();
      setClientes(clientesData);

      
    } catch (error) {
      console.error("Error completo al cargar datos:", error);
      setError(error instanceof Error ? error.message : "Error desconocido al cargar datos");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ---------- Filtrar máquinas ----------
  const maquinasNoAsignadasFiltradas = maquinasNoAsignadas.filter(maquina =>
    maquina.nombre.toLowerCase().includes(busquedaNoAsignadas.toLowerCase()) ||
    maquina.tipo.toLowerCase().includes(busquedaNoAsignadas.toLowerCase())
  );

  const maquinasAsignadasFiltradas = maquinasAsignadas.filter(asignada =>
    asignada.maquina.nombre.toLowerCase().includes(busquedaAsignadas.toLowerCase()) ||
    asignada.maquina.tipo.toLowerCase().includes(busquedaAsignadas.toLowerCase()) ||
    asignada.cliente?.nombre_usuario.toLowerCase().includes(busquedaAsignadas.toLowerCase())
  );

  // ---------- Abrir modal para ASIGNAR ----------
  const openModalAsignar = (maquinaId: number) => {
    setSelectedMaquina(maquinaId);
    setSelectedCliente(null);
    setModalMode('asignar');
    setClienteActual(null);
    setModalOpen(true);
  };

  // ---------- Abrir modal para REASIGNAR ----------
  const openModalReasignar = async (maquinaId: number) => {
    setSelectedMaquina(maquinaId);
    setSelectedCliente(null);
    setModalMode('reasignar');
    setModalOpen(true);
    
    // Obtener el cliente actual de la máquina
    try {
      const res = await fetch(`http://localhost:3000/api/Maquina-Cliente/cliente-actual?maquina_id=${maquinaId}`);
      
      if (!res.ok) {
        throw new Error(`Error ${res.status} al obtener cliente actual`);
      }
      
      const data = await res.json();
      setClienteActual(data);
    } catch (error) {
      console.error("Error al obtener cliente actual:", error);
      setClienteActual(null);
    }
  };

  // ---------- Asignar máquina ----------
  const handleAsignar = async () => {
    if (!selectedMaquina || !selectedCliente) {
      alert("Debes seleccionar un cliente.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/Maquina-Cliente/asignar', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maquina_id: selectedMaquina,
          cliente_id: selectedCliente,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || `Error ${res.status} al asignar máquina`);
      }

      alert("Máquina asignada con éxito.");
      setModalOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Error en asignar:", error);
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------- REASIGNAR máquina ----------
  const handleReasignar = async () => {
    if (!selectedMaquina || !selectedCliente) {
      alert("Debes seleccionar un cliente.");
      return;
    }

    // Validar que no sea el mismo cliente
    if (clienteActual && selectedCliente === clienteActual.cliente_id) {
      alert("La máquina ya está asignada a este cliente.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/Maquina-Cliente/reasignar', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maquina_id: selectedMaquina,
          nuevo_cliente_id: selectedCliente,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || `Error ${res.status} al reasignar máquina`);
      }

      alert("Máquina reasignada con éxito.");
      setModalOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Error en reasignar:", error);
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------- Función única para manejar ambas acciones ----------
  const handleConfirm = () => {
    if (modalMode === 'asignar') {
      handleAsignar();
    } else {
      handleReasignar();
    }
  };

  const getEstadoColor = (estado: string) => {
    const estadoLower = String(estado || "").toLowerCase();
    if (estadoLower.includes("funcionando")) return "bg-green-100 text-green-700";
    if (estadoLower.includes("mantenimiento")) return "bg-yellow-100 text-yellow-700";
    if (estadoLower.includes("fuera de servicio")) return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  // Obtener nombre de máquina por ID
  const getNombreMaquina = (id: number) => {
    const todasMaquinas = [...maquinasAsignadas.map(a => a.maquina), ...maquinasNoAsignadas];
    return todasMaquinas.find(m => m.id === id)?.nombre || `Máquina #${id}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <h2 className="text-3xl font-bold text-gray-900">Asignación de Máquinas</h2>
      <div className="p-8 space-y-8">
        {/* Mensaje de error */}
        {error && (
          <div className="bg-gradient-to-br from-white to-red-50/30 rounded-2xl shadow-lg border border-red-100/50 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-red-500/10 to-pink-600/10 rounded-full -translate-y-4 translate-x-4"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-red-800 mb-2">
                <span className="font-medium">Error:</span>
                <span>{error}</span>
              </div>
              <button 
                onClick={fetchData}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors"
              >
                Reintentar carga de datos
              </button>
            </div>
          </div>
        )}

        {/* Estadísticas con fondo decorativo */}
        <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-lg border border-blue-100/50 p-6 relative overflow-hidden">
          {/* Elementos decorativos de fondo */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/10 to-purple-600/10 rounded-full -translate-y-8 translate-x-8"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-green-500/10 to-emerald-600/10 rounded-full translate-y-8 -translate-x-8"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Máquinas sin asignar</p>
                  <p className="text-3xl font-bold text-gray-900">{maquinasNoAsignadas.length}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Máquinas asignadas</p>
                  <p className="text-3xl font-bold text-gray-900">{maquinasAsignadas.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Clientes disponibles</p>
                  <p className="text-3xl font-bold text-gray-900">{clientes.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Secciones en paralelo */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Sección de máquinas NO asignadas */}
          <div className="bg-gradient-to-br from-white to-orange-50/30 rounded-2xl shadow-lg border border-orange-100/50 overflow-hidden relative">
            {/* Elementos decorativos de fondo */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-orange-500/10 to-red-600/10 rounded-full -translate-y-4 translate-x-4"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-yellow-500/10 to-amber-600/10 rounded-full translate-y-4 -translate-x-4"></div>
            
            <div className="px-6 py-4 border-b border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 relative z-10">
              <div className="flex items-center gap-3">
                <Wrench className="w-6 h-6 text-orange-600" />
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">Máquinas sin cliente</h2>
                  <p className="text-sm text-gray-600">Estas máquinas están disponibles para asignar</p>
                </div>
                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {maquinasNoAsignadasFiltradas.length} de {maquinasNoAsignadas.length}
                </span>
              </div>
            </div>

            {/* Buscador */}
            <div className="p-4 border-b border-orange-100 bg-white/50 relative z-10">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  value={busquedaNoAsignadas}
                  onChange={(e) => setBusquedaNoAsignadas(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-black bg-white"
                  placeholder="Buscar por nombre o tipo..."
                />
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto relative z-10">
              {maquinasNoAsignadasFiltradas.length > 0 ? (
                <div className="divide-y divide-orange-100">
                  {maquinasNoAsignadasFiltradas.map((m) => (
                    <div key={m.id} className="p-4 hover:bg-orange-50/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Wrench className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-900 block">{m.nombre}</span>
                            <span className="text-sm text-gray-600">{m.tipo}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getEstadoColor(m.estado)}`}>
                            {m.estado}
                          </span>
                          <button
                            onClick={() => openModalAsignar(m.id)}
                            className="px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium flex items-center gap-2"
                          >
                            <UserPlus className="w-4 h-4" />
                            Asignar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {maquinasNoAsignadas.length === 0 ? 'No hay máquinas sin cliente' : 'No se encontraron máquinas'}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {maquinasNoAsignadas.length === 0 
                      ? 'Todas las máquinas están asignadas a clientes' 
                      : 'Intenta con otros términos de búsqueda'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sección de máquinas ASIGNADAS */}
          <div className="bg-gradient-to-br from-white to-green-50/30 rounded-2xl shadow-lg border border-green-100/50 overflow-hidden relative">
            {/* Elementos decorativos de fondo */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-green-500/10 to-emerald-600/10 rounded-full -translate-y-4 translate-x-4"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-blue-500/10 to-cyan-600/10 rounded-full translate-y-4 -translate-x-4"></div>
            
            <div className="px-6 py-4 border-b border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 relative z-10">
              <div className="flex items-center gap-3">
                <UserPlus className="w-6 h-6 text-green-600" />
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">Máquinas asignadas</h2>
                  <p className="text-sm text-gray-600">Máquinas actualmente asignadas a clientes</p>
                </div>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {maquinasAsignadasFiltradas.length} de {maquinasAsignadas.length}
                </span>
              </div>
            </div>

            {/* Buscador */}
            <div className="p-4 border-b border-green-100 bg-white/50 relative z-10">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  value={busquedaAsignadas}
                  onChange={(e) => setBusquedaAsignadas(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black bg-white"
                  placeholder="Buscar por máquina, tipo o cliente..."
                />
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto relative z-10">
              {maquinasAsignadasFiltradas.length > 0 ? (
                <div className="divide-y divide-green-100">
                  {maquinasAsignadasFiltradas.map((m) => (
                    <div key={m.id} className="p-4 hover:bg-green-50/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Wrench className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-900 block">{m.maquina.nombre}</span>
                            <span className="text-sm text-gray-600">{m.maquina.tipo}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                              {m.cliente?.nombre_usuario?.charAt(0) || "?"}
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {m.cliente?.nombre_usuario || "-"}
                            </span>
                          </div>
                          <button
                            onClick={() => openModalReasignar(m.maquina.id)}
                            className="px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium flex items-center gap-2"
                          >
                            <UserCheck className="w-4 h-4" />
                            Cambiar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {maquinasAsignadas.length === 0 ? 'No hay máquinas asignadas' : 'No se encontraron máquinas'}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {maquinasAsignadas.length === 0 
                      ? 'Aún no se han asignado máquinas a clientes' 
                      : 'Intenta con otros términos de búsqueda'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className={`border-b px-6 py-4 flex items-center justify-between ${
              modalMode === 'asignar' ? 'bg-gradient-to-r from-blue-50 to-purple-50' : 'bg-gradient-to-r from-green-50 to-emerald-50'
            }`}>
              <div className="flex items-center gap-3">
                {modalMode === 'asignar' ? (
                  <UserPlus className="w-6 h-6 text-blue-600" />
                ) : (
                  <UserCheck className="w-6 h-6 text-green-600" />
                )}
                <h3 className="text-xl font-bold text-gray-900">
                  {modalMode === 'asignar' ? 'Asignar máquina' : 'Reasignar máquina'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Información de la máquina */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Máquina seleccionada:</p>
                <p className="font-semibold text-gray-900">
                  {selectedMaquina ? getNombreMaquina(selectedMaquina) : 'N/A'}
                </p>
              </div>

              {/* Información del cliente actual (solo en reasignación) */}
              {modalMode === 'reasignar' && clienteActual && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 font-medium mb-1">Cliente actual:</p>
                  <p className="text-yellow-900">{clienteActual.cliente_nombre}</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Asignado el: {new Date(clienteActual.fecha_asignacion).toLocaleDateString()}
                  </p>
                </div>
              )}

              {/* Selector de cliente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {modalMode === 'asignar' ? 'Selecciona un cliente *' : 'Selecciona el nuevo cliente *'}
                </label>
                {clientes.length > 0 ? (
                  <select
                    value={selectedCliente ?? ""}
                    onChange={(e) => setSelectedCliente(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  >
                    <option value="">-- Selecciona un cliente --</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre_usuario}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">No hay clientes disponibles en el sistema.</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading || !selectedCliente}
                  className={`flex-1 px-4 py-2 text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                    modalMode === 'asignar' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                      : 'bg-gradient-to-r from-green-500 to-emerald-600'
                  }`}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      {modalMode === 'asignar' ? 'Asignando...' : 'Reasignando...'}
                    </>
                  ) : (
                    <>
                      {modalMode === 'asignar' ? <UserPlus className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      {modalMode === 'asignar' ? 'Confirmar asignación' : 'Confirmar reasignación'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}