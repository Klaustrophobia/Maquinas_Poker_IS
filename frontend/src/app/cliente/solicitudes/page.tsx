"use client";
import React, { useState, useEffect } from "react";
import { Wrench, Plus, Eye, Search, Clock, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

// Interfaces
interface Solicitud {
  id: number;
  maquina: string;
  fecha: string;
  estado: string;
  descripcion: string;
}

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const { usuario } = useAuth();

  useEffect(() => {
    if (usuario?.id) {
      fetchSolicitudes();
    }
  }, [usuario]);

  const fetchSolicitudes = async (): Promise<void> => {
    setLoadingSolicitudes(true);
    try {
      setTimeout(() => {
        const solicitudesSimuladas: Solicitud[] = [
          { id: 1, maquina: "Compresor Industrial", fecha: "2025-03-10", estado: "En proceso", descripcion: "Falla en el motor principal" },
          { id: 2, maquina: "Generador 500W", fecha: "2025-03-08", estado: "Pendiente", descripcion: "No enciende, posible falla eléctrica" },
          { id: 3, maquina: "Máquina de Soldar", fecha: "2025-03-05", estado: "Completada", descripcion: "Cambio de cables y revisión general" },
        ];
        setSolicitudes(solicitudesSimuladas);
        setLoadingSolicitudes(false);
      }, 500);
    } catch (error) {
      console.error("Error:", error);
      setSolicitudes([]);
      setLoadingSolicitudes(false);
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

  const getEstadoIcon = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "pendiente":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "en proceso":
        return <Wrench className="w-4 h-4 text-blue-600" />;
      case "completada":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "en proceso":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "completada":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const solicitudesFiltradas = solicitudes.filter(solicitud =>
    solicitud.maquina.toLowerCase().includes(busqueda.toLowerCase()) ||
    solicitud.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
    solicitud.estado.toLowerCase().includes(busqueda.toLowerCase())
  );

  const estadisticas = {
    total: solicitudes.length,
    pendientes: solicitudes.filter(s => s.estado.toLowerCase() === "pendiente").length,
    enProceso: solicitudes.filter(s => s.estado.toLowerCase() === "en proceso").length,
    completadas: solicitudes.filter(s => s.estado.toLowerCase() === "completada").length,
  };

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
              <h2 className="text-3xl font-bold text-gray-900">Mis Solicitudes de Reparación</h2>
              <p className="text-gray-600 font-bold">
                Gestiona y da seguimiento a tus solicitudes de servicio
              </p>
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-red-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all font-bold flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Nueva Solicitud
            </button>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.total}</p>
                </div>
                <Wrench className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.pendientes}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En proceso</p>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.enProceso}</p>
                </div>
                <Wrench className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completadas</p>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.completadas}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de solicitudes con fondo decorativo */}
      <div className="bg-gradient-to-br from-white to-red-50/30 rounded-2xl shadow-lg border border-red-100/50 overflow-hidden relative">
        {/* Elementos decorativos de fondo */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-500/30 to-purple-600/30 rounded-full -translate-y-4 translate-x-4"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-blue-500/30 to-purple-600/30 rounded-full translate-y-4 -translate-x-4"></div>

        {/* Buscador */}
        <div className="p-6 border-b border-red-100 bg-white/50 relative z-10">
          <div className="relative max-w-md">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-black bg-white"
              placeholder="Buscar por máquina, descripción o estado..."
            />
          </div>
        </div>

        <div className="relative z-10">
          {loadingSolicitudes ? (
            <div className="space-y-4 p-6">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 animate-pulse border border-gray-100">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                </div>
              ))}
            </div>
          ) : solicitudesFiltradas.length === 0 ? (
            <div className="p-12 text-center">
              <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {solicitudes.length === 0 ? 'No tienes solicitudes' : 'No se encontraron solicitudes'}
              </h3>
              <p className="text-gray-600 mb-6">
                {solicitudes.length === 0 
                  ? 'Crea una nueva solicitud de reparación' 
                  : 'Intenta con otros términos de búsqueda'
                }
              </p>
              <button className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-all font-bold inline-flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Nueva Solicitud
              </button>
            </div>
          ) : (
            <div className="space-y-4 p-6">
              {solicitudesFiltradas.map((s) => (
                <div key={s.id} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all p-6 border-l-4 border-red-500">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Wrench className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{s.maquina}</h3>
                        <p className="text-sm text-gray-600">Solicitud #{s.id} • {formatFecha(s.fecha)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getEstadoIcon(s.estado)}
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getEstadoColor(s.estado)}`}>
                        {s.estado}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">{s.descripcion}</p>
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