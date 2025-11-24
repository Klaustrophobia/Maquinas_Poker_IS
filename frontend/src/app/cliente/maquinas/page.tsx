"use client";
import React, { useState, useEffect } from "react";
import { Wrench, Eye, Search } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

// Interfaces
interface Maquina {
  id: number;
  nombre: string;
  tipo: string;
  ubicacion: string;
  estado: string;
  fecha_asignacion?: string;
  estado_asignacion?: string;
}

export default function MaquinasPage() {
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [loadingMaquinas, setLoadingMaquinas] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const { usuario } = useAuth();
  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    if (!usuario) {
      router.push("/login");
    } else if (usuario.rol !== "Cliente") {
      router.push("/login");
    }
  }, [usuario, router]);

  useEffect(() => {
    if (usuario?.id) {
      fetchMaquinas();
    }
  }, [usuario]);

  const fetchMaquinas = async (): Promise<void> => {
    setLoadingMaquinas(true);
    try {
      const res = await fetch(`${backendUrl}/api/Maquina-Cliente/listar?cliente_id=${usuario?.id}`);
      if (res.ok) {
        const data = await res.json();
        const misMaquinas: Maquina[] = Array.isArray(data) 
          ? data.map((asignacion: any) => ({
              ...asignacion.maquina,
              fecha_asignacion: asignacion.fecha_asignacion,
              estado_asignacion: asignacion.estado
            }))
          : [];
        setMaquinas(misMaquinas);
      }
    } catch (error) {
      console.error("Error:", error);
      setMaquinas([]);
    } finally {
      setLoadingMaquinas(false);
    }
  };

  const formatFecha = (fechaString: string): string => {
    if (!fechaString) return "N/A";
    try {
      return new Date(fechaString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return "Fecha inválida";
    }
  };

  const getEstadoColor = (estado: string) => {
    const estadoLower = String(estado || "").toLowerCase();
    if (estadoLower.includes("funcionando")) return "bg-green-100 text-green-700";
    if (estadoLower.includes("mantenimiento")) return "bg-yellow-100 text-yellow-700";
    if (estadoLower.includes("fuera de servicio")) return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  const maquinasFiltradas = maquinas.filter(maquina =>
    maquina.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    maquina.tipo.toLowerCase().includes(busqueda.toLowerCase()) ||
    maquina.ubicacion.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Encabezado con fondo decorativo */}
      <div className="bg-gradient-to-br from-white to-red-50/30 rounded-2xl shadow-lg border border-red-100/50 p-8 relative overflow-hidden">
        {/* Elementos decorativos de fondo */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/30 to-purple-600/30 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-blue-500/30 to-purple-600/30 rounded-full translate-y-8 -translate-x-8"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Mis Máquinas</h2>
              <p className="text-gray-600 font-bold">
                Gestiona y consulta el estado de tus equipos asignados
              </p>
            </div>
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar máquina..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-black bg-white"
              />
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total máquinas</p>
                  <p className="text-2xl font-bold text-gray-900">{maquinas.length}</p>
                </div>
                <Wrench className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En funcionamiento</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {maquinas.filter(m => m.estado.toLowerCase().includes("funcionando")).length}
                  </p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En mantenimiento</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {maquinas.filter(m => m.estado.toLowerCase().includes("mantenimiento")).length}
                  </p>
                </div>
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de máquinas con fondo decorativo */}
      <div className="bg-gradient-to-br from-white to-red-50/30 rounded-2xl shadow-lg border border-red-100/50 overflow-hidden relative">
        {/* Elementos decorativos de fondo */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-500/30 to-purple-600/30 rounded-full -translate-y-4 translate-x-4"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-blue-500/30 to-purple-600/30 rounded-full translate-y-4 -translate-x-4"></div>

        <div className="relative z-10">
          {loadingMaquinas ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 animate-pulse border border-gray-100">
                  <div className="h-12 bg-gray-200 rounded mb-4"></div>
                </div>
              ))}
            </div>
          ) : maquinasFiltradas.length === 0 ? (
            <div className="p-12 text-center">
              <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {maquinas.length === 0 ? 'No tienes máquinas asignadas' : 'No se encontraron máquinas'}
              </h3>
              <p className="text-gray-600">
                {maquinas.length === 0 
                  ? 'Contacta con el administrador para asignarte máquinas' 
                  : 'Intenta con otros términos de búsqueda'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
              {maquinasFiltradas.map((m, i) => (
                <div key={m.id || i} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all p-6 group border-l-4 border-red-500">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Wrench className="w-6 h-6 text-white" />
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getEstadoColor(m.estado)}`}>
                      {m.estado}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{m.nombre || `Máquina #${i + 1}`}</h3>
                  <p className="text-sm text-gray-600 mb-1">Tipo: {m.tipo || "N/A"}</p>
                  <p className="text-sm text-gray-600 mb-1">Ubicación: {m.ubicacion || "N/A"}</p>
                  <p className="text-sm text-gray-600 mb-4">
                    Asignada desde: {formatFecha(m.fecha_asignacion || "")}
                  </p>
                  <button className="w-full bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm font-bold flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4" />
                    Ver detalles
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}