"use client";
import React, { useState, useEffect } from "react";
import { Search, Filter, Eye, Clock, AlertCircle, CheckCircle, X } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

interface OrdenTrabajo {
  id: number;
  numero: string;
  maquina: string;
  fecha_solicitud: string;
  fecha_asignacion?: string;
  fecha_completado?: string;
  estado: string;
  prioridad: string;
  descripcion: string;
  observaciones?: string;
  tecnico_asignado?: string;
}

interface FiltrosState {
  estado: string;
  prioridad: string;
  fechaDesde: string;
  fechaHasta: string;
}

export default function OrdenesTrabajoPage() {
  const [ordenes, setOrdenes] = useState<OrdenTrabajo[]>([]);
  const [ordenesFiltradas, setOrdenesFiltradas] = useState<OrdenTrabajo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosState>({
    estado: "",
    prioridad: "",
    fechaDesde: "",
    fechaHasta: ""
  });

  const { usuario } = useAuth();
  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    if (!usuario) {
      router.push("/login");
    } else if (usuario.rol !== "Tecnico") {
      router.push("/login");
    }
  }, [usuario, router]);

  useEffect(() => {
    fetchOrdenesTrabajo();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [ordenes, searchTerm, filtros]);

  const fetchOrdenesTrabajo = async (): Promise<void> => {
    setLoading(true);
    try {
      // Simulación de datos - reemplazar con API real
      setTimeout(() => {
        const ordenesSimuladas: OrdenTrabajo[] = [
          {
            id: 1,
            numero: "OT-2024-001",
            maquina: "Compresor Industrial 500HP",
            fecha_solicitud: "2024-01-15",
            fecha_asignacion: "2024-01-16",
            estado: "En Proceso",
            prioridad: "Alta",
            descripcion: "Fuga de aceite en el compresor principal",
            observaciones: "Se requiere cambio de sellos y verificación de presión",
            tecnico_asignado: "Juan Pérez"
          },
          {
            id: 2,
            numero: "OT-2024-002",
            maquina: "Generador Diésel 300KW",
            fecha_solicitud: "2024-01-10",
            fecha_completado: "2024-01-14",
            estado: "Completada",
            prioridad: "Media",
            descripcion: "Mantenimiento preventivo programado",
            observaciones: "Cambio de filtros y aceite completado",
            tecnico_asignado: "María García"
          },
          {
            id: 3,
            numero: "OT-2024-003",
            maquina: "Sistema de Aire Acondicionado",
            fecha_solicitud: "2024-01-18",
            estado: "Pendiente",
            prioridad: "Baja",
            descripcion: "Revisión de temperatura irregular",
            observaciones: "",
            tecnico_asignado: ""
          },
          {
            id: 4,
            numero: "OT-2024-004",
            maquina: "Prensa Hidráulica 100T",
            fecha_solicitud: "2024-01-12",
            fecha_asignacion: "2024-01-13",
            estado: "En Proceso",
            prioridad: "Alta",
            descripcion: "Falla en el sistema hidráulico",
            observaciones: "Diagnóstico en curso",
            tecnico_asignado: "Carlos Rodríguez"
          }
        ];
        setOrdenes(ordenesSimuladas);
        setOrdenesFiltradas(ordenesSimuladas);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error:", error);
      setOrdenes([]);
      setOrdenesFiltradas([]);
      setLoading(false);
    }
  };

  const aplicarFiltros = (): void => {
    let filtered = [...ordenes];

    // Filtro de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(orden =>
        orden.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orden.maquina.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orden.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtros adicionales
    if (filtros.estado) {
      filtered = filtered.filter(orden => orden.estado === filtros.estado);
    }

    if (filtros.prioridad) {
      filtered = filtered.filter(orden => orden.prioridad === filtros.prioridad);
    }

    if (filtros.fechaDesde) {
      filtered = filtered.filter(orden => orden.fecha_solicitud >= filtros.fechaDesde);
    }

    if (filtros.fechaHasta) {
      filtered = filtered.filter(orden => orden.fecha_solicitud <= filtros.fechaHasta);
    }

    setOrdenesFiltradas(filtered);
  };

  const limpiarFiltros = (): void => {
    setFiltros({
      estado: "",
      prioridad: "",
      fechaDesde: "",
      fechaHasta: ""
    });
    setSearchTerm("");
  };

  const getEstadoStyles = (estado: string) => {
    switch (estado) {
      case "Completada":
        return "bg-green-100 text-green-800 border-green-200";
      case "En Proceso":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Pendiente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPrioridadStyles = (prioridad: string) => {
    switch (prioridad) {
      case "Alta":
        return "bg-red-100 text-red-800 border-red-200";
      case "Media":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Baja":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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
    switch (estado) {
      case "Completada":
        return <CheckCircle className="w-4 h-4" />;
      case "En Proceso":
        return <Clock className="w-4 h-4" />;
      case "Pendiente":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-lg border border-blue-100/50 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Órdenes de Trabajo</h1>
            <p className="text-gray-600 font-bold">
              Gestiona y consulta el estado de tus órdenes de trabajo
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-bold flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtros
            </button>
            
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar órdenes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 font-bold text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Filtros Avanzados */}
        {mostrarFiltros && (
          <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Estado</label>
                <select
                  value={filtros.estado}
                  onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos los estados</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="En Proceso">En Proceso</option>
                  <option value="Completada">Completada</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Prioridad</label>
                <select
                  value={filtros.prioridad}
                  onChange={(e) => setFiltros(prev => ({ ...prev, prioridad: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todas las prioridades</option>
                  <option value="Alta">Alta</option>
                  <option value="Media">Media</option>
                  <option value="Baja">Baja</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Fecha Desde</label>
                <input
                  type="date"
                  value={filtros.fechaDesde}
                  onChange={(e) => setFiltros(prev => ({ ...prev, fechaDesde: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Fecha Hasta</label>
                <input
                  type="date"
                  value={filtros.fechaHasta}
                  onChange={(e) => setFiltros(prev => ({ ...prev, fechaHasta: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-bold">
                {ordenesFiltradas.length} de {ordenes.length} órdenes mostradas
              </span>
              
              <button
                onClick={limpiarFiltros}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-bold flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Limpiar filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Contenido Principal */}
      <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-lg border border-blue-100/50 p-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : ordenesFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {searchTerm || Object.values(filtros).some(f => f) ? 'No se encontraron órdenes' : 'No tienes órdenes de trabajo'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || Object.values(filtros).some(f => f) 
                ? 'Intenta ajustar los filtros de búsqueda' 
                : 'Las órdenes de trabajo aparecerán aquí cuando se creen'
              }
            </p>
            {(searchTerm || Object.values(filtros).some(f => f)) && (
              <button
                onClick={limpiarFiltros}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {ordenesFiltradas.map((orden) => (
              <div key={orden.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border-l-4 border-blue-500">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{orden.numero}</h3>
                        <p className="text-lg text-gray-700 font-bold mb-2">{orden.maquina}</p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getEstadoStyles(orden.estado)} flex items-center gap-1`}>
                          {getEstadoIcon(orden.estado)}
                          {orden.estado}
                        </span>
                        
                        <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getPrioridadStyles(orden.prioridad)}`}>
                          {orden.prioridad}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4 font-bold">{orden.descripcion}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 font-bold">Fecha Solicitud:</span>
                        <p className="text-gray-900 font-bold">{formatFecha(orden.fecha_solicitud)}</p>
                      </div>
                      
                      {orden.fecha_asignacion && (
                        <div>
                          <span className="text-gray-500 font-bold">Fecha Asignación:</span>
                          <p className="text-gray-900 font-bold">{formatFecha(orden.fecha_asignacion)}</p>
                        </div>
                      )}
                      
                      {orden.fecha_completado && (
                        <div>
                          <span className="text-gray-500 font-bold">Fecha Completado:</span>
                          <p className="text-gray-900 font-bold">{formatFecha(orden.fecha_completado)}</p>
                        </div>
                      )}
                      
                      {orden.tecnico_asignado && (
                        <div>
                          <span className="text-gray-500 font-bold">Técnico Asignado:</span>
                          <p className="text-gray-900 font-bold">{orden.tecnico_asignado}</p>
                        </div>
                      )}
                    </div>
                    
                    {orden.observaciones && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <span className="text-blue-800 font-bold text-sm">Observaciones:</span>
                        <p className="text-blue-900 mt-1">{orden.observaciones}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex lg:flex-col gap-2">
                    <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-bold flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Ver Detalles
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}