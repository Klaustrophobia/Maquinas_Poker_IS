"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, Wrench, UserPlus, X, RefreshCw } from "lucide-react";

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

export default function AsignarMaquina() {
  const router = useRouter();
  const [maquinasAsignadas, setMaquinasAsignadas] = useState<Asignada[]>([]);
  const [maquinasNoAsignadas, setMaquinasNoAsignadas] = useState<Maquina[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMaquina, setSelectedMaquina] = useState<number | null>(null);
  const [selectedCliente, setSelectedCliente] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // ---------- Fetch de datos ----------
  const fetchData = async () => {
    try {
      // Máquinas no asignadas
      const resNoAsignadas = await fetch(`${API_URL}/api/Maquina-Cliente/listarNoAsignadas`);
      const noAsignadasData = await resNoAsignadas.json();
      setMaquinasNoAsignadas(noAsignadasData);

      // Máquinas asignadas
      const resAsignadas = await fetch(`${API_URL}/api/Maquina-Cliente/listarTodas`);
      const asignadasData = await resAsignadas.json();
      setMaquinasAsignadas(asignadasData);

      // Clientes solo rol cliente
      const resClientes = await fetch(`${API_URL}/api/Usuario/Cliente`);
      const clientesData = await resClientes.json();
      setClientes(clientesData);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ---------- Abrir modal ----------
  const openModal = (maquinaId: number) => {
    setSelectedMaquina(maquinaId);
    setSelectedCliente(null);
    setModalOpen(true);
  };

  // ---------- Asignar máquina ----------
  const handleAsignar = async () => {
    if (!selectedMaquina || !selectedCliente) {
      alert("Debes seleccionar un cliente.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/Maquina-Cliente/asignar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maquina_id: selectedMaquina,
          cliente_id: selectedCliente,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error desconocido");

      alert("Máquina asignada con éxito.");
      setModalOpen(false);
      fetchData();
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    const estadoLower = String(estado || "").toLowerCase();
    if (estadoLower.includes("funcionando")) return "bg-green-100 text-green-700";
    if (estadoLower.includes("mantenimiento")) return "bg-yellow-100 text-yellow-700";
    if (estadoLower.includes("fuera de servicio")) return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("./dashboard")}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Volver</span>
              </button>
              <div className="h-8 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Asignación de Máquinas</h1>
                <p className="text-sm text-gray-600">Asigna máquinas a clientes</p>
              </div>
            </div>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </button>
          </div>
        </div>
      </header>

      <div className="p-8 space-y-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
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

          <div className="bg-white rounded-xl shadow-sm p-6">
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

          <div className="bg-white rounded-xl shadow-sm p-6">
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

        {/* Sección de máquinas NO asignadas */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
            <div className="flex items-center gap-3">
              <Wrench className="w-6 h-6 text-orange-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Máquinas sin cliente</h2>
                <p className="text-sm text-gray-600">Estas máquinas están disponibles para asignar</p>
              </div>
            </div>
          </div>

          {maquinasNoAsignadas.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nombre</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tipo</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Estado</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {maquinasNoAsignadas.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Wrench className="w-5 h-5 text-orange-600" />
                          </div>
                          <span className="font-medium text-gray-900">{m.nombre}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{m.tipo}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(m.estado)}`}>
                          {m.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openModal(m.id)}
                          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium flex items-center gap-2"
                        >
                          <UserPlus className="w-4 h-4" />
                          Asignar cliente
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay máquinas sin cliente</h3>
              <p className="text-gray-600">Todas las máquinas están asignadas a clientes</p>
            </div>
          )}
        </div>

        {/* Sección de máquinas ASIGNADAS */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center gap-3">
              <UserPlus className="w-6 h-6 text-green-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Máquinas asignadas</h2>
                <p className="text-sm text-gray-600">Máquinas actualmente asignadas a clientes</p>
              </div>
            </div>
          </div>

          {maquinasAsignadas.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Máquina</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tipo</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Cliente</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {maquinasAsignadas.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Wrench className="w-5 h-5 text-blue-600" />
                          </div>
                          <span className="font-medium text-gray-900">{m.maquina.nombre}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{m.maquina.tipo}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                            {m.cliente?.nombre_usuario?.charAt(0) || "?"}
                          </div>
                          <span className="font-medium text-gray-900">
                            {m.cliente?.nombre_usuario || "-"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openModal(m.maquina.id)}
                          className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Cambiar cliente
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <UserPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay máquinas asignadas</h3>
              <p className="text-gray-600">Aún no se han asignado máquinas a clientes</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Asignar máquina a cliente</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecciona un cliente *
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
                  onClick={handleAsignar}
                  disabled={loading || !selectedCliente}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Asignando...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Confirmar asignación
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