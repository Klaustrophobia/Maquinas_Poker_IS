"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Search, Filter, Eye, Download, Calendar, User, CheckCircle, X, Package } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

interface HistorialSolicitud {
  id: number;
  cliente_id: number;
  maquina_id: number;
  descripcion_falla: string;
  gravedad: 'leve' | 'moderada' | 'grave';
  estado: 'finalizada';
  tecnico_asignado_id?: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
  observaciones_tecnico?: string;
  fecha_reparacion_terminada?: string;
  fecha_finalizada?: string;
  maquina?: {
    id: number;
    nombre: string;
    tipo: string;
    estado?: string;
  };
  cliente?: {
    id: number;
    nombre_usuario: string;
    correo: string;
  };
  tecnico_asignado?: {
    id: number;
    nombre_usuario: string;
    correo: string;
  };
  repuestos_utilizados?: Array<{
    id: number;
    repuesto: {
      id: number;
      nombre: string;
    };
    cantidad_utilizada: number;
  }>;
}

interface FiltrosState {
  fechaDesde: string;
  fechaHasta: string;
}

export default function HistorialOrdenesPage() {
  const [historial, setHistorial] = useState<HistorialSolicitud[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosState>({
    fechaDesde: "",
    fechaHasta: ""
  });

  const { usuario } = useAuth();
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    if (usuario?.id) {
      fetchHistorialSolicitudes();
    }
  }, [usuario]);

  // Memoizar historial filtrado para mejor rendimiento
  const historialFiltrado = useMemo(() => {
    let filtered = historial;

    // Filtro de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(solicitud => {
        const busquedaLower = searchTerm.toLowerCase();
        const nombreMaquina = getNombreMaquina(solicitud).toLowerCase();
        const nombreCliente = getNombreCliente(solicitud).toLowerCase();
        const idSolicitud = solicitud.id.toString();
        
        return (
          nombreMaquina.includes(busquedaLower) ||
          nombreCliente.includes(busquedaLower) ||
          idSolicitud.includes(busquedaLower) ||
          (solicitud.descripcion_falla?.toLowerCase() || '').includes(busquedaLower)
        );
      });
    }

    // Filtros de fecha
    if (filtros.fechaDesde) {
      filtered = filtered.filter(solicitud => {
        const fechaFinal = solicitud.fecha_finalizada || solicitud.fecha_actualizacion;
        return fechaFinal && fechaFinal >= filtros.fechaDesde;
      });
    }

    if (filtros.fechaHasta) {
      filtered = filtered.filter(solicitud => {
        const fechaFinal = solicitud.fecha_finalizada || solicitud.fecha_actualizacion;
        return fechaFinal && fechaFinal <= filtros.fechaHasta;
      });
    }

    return filtered;
  }, [historial, searchTerm, filtros]);

  const fetchHistorialSolicitudes = async (): Promise<void> => {
    setLoading(true);
    try {
      const url = new URL(`${backendUrl}/api/SolicitudReparacion`);
      if (usuario?.id) {
        url.searchParams.append('tecnico_id', usuario.id.toString());
      }
      // Solo solicitudes finalizadas
      url.searchParams.append('estado', 'finalizada');
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status} al cargar historial`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        // Cargar repuestos para cada solicitud
        const solicitudesConRepuestos = await Promise.all(
          data.data.map(async (solicitud: HistorialSolicitud) => {
            try {
              const repuestosResponse = await fetch(`${backendUrl}/api/SolicitudReparacion/${solicitud.id}/repuestos`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                },
              });
              
              if (repuestosResponse.ok) {
                const repuestosData = await repuestosResponse.json();
                if (repuestosData.success && repuestosData.data) {
                  return {
                    ...solicitud,
                    repuestos_utilizados: repuestosData.data
                  };
                }
              }
            } catch (error) {
              console.error(`Error al cargar repuestos para solicitud ${solicitud.id}:`, error);
            }
            return solicitud;
          })
        );
        
        setHistorial(solicitudesConRepuestos);
      } else {
        setHistorial([]);
      }
    } catch (error) {
      console.error("Error al cargar historial:", error);
      setHistorial([]);
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltros = (): void => {
    setFiltros({
      fechaDesde: "",
      fechaHasta: ""
    });
    setSearchTerm("");
  };

  const formatFecha = (fechaString: string): string => {
    if (!fechaString) return "N/A";
    try {
      return new Date(fechaString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "Fecha inválida";
    }
  };

  const getDuracionDias = (fechaInicio: string, fechaFin: string): number => {
    if (!fechaInicio || !fechaFin) return 0;
    try {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      const diferencia = fin.getTime() - inicio.getTime();
      return Math.ceil(diferencia / (1000 * 3600 * 24));
    } catch {
      return 0;
    }
  };

  const getNombreMaquina = (solicitud: HistorialSolicitud): string => {
    return solicitud.maquina?.nombre || `Máquina #${solicitud.maquina_id}`;
  };

  const getNombreCliente = (solicitud: HistorialSolicitud): string => {
    return solicitud.cliente?.nombre_usuario || `Cliente #${solicitud.cliente_id}`;
  };

  const getGravedadStyles = (gravedad: string) => {
    switch (gravedad?.toLowerCase()) {
      case "grave":
        return "bg-red-100 text-red-700 border-red-200";
      case "moderada":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "leve":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getGravedadTexto = (gravedad: string) => {
    switch (gravedad?.toLowerCase()) {
      case "leve":
        return "Leve";
      case "moderada":
        return "Moderada";
      case "grave":
        return "Grave";
      default:
        return gravedad || "No especificada";
    }
  };

  const exportarHistorial = (): void => {
    // Simulación de exportación
    alert('Funcionalidad de exportación en desarrollo');
  };

  // Estadísticas
  const estadisticas = useMemo(() => {
    const total = historial.length;
    const duracionPromedio = total > 0 
      ? Math.round(historial.reduce((acc, solicitud) => 
          acc + getDuracionDias(solicitud.fecha_creacion, solicitud.fecha_finalizada || solicitud.fecha_actualizacion), 0) / total
        )
      : 0;

    const repuestosUtilizados = historial.reduce((acc, solicitud) => 
      acc + (solicitud.repuestos_utilizados?.length || 0), 0
    );

    const totalUnidadesRepuestos = historial.reduce((acc, solicitud) => 
      acc + (solicitud.repuestos_utilizados?.reduce((sum, repuesto) => sum + repuesto.cantidad_utilizada, 0) || 0), 0
    );

    return {
      total,
      duracionPromedio,
      repuestosUtilizados,
      totalUnidadesRepuestos
    };
  }, [historial]);

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="bg-gradient-to-br from-white to-green-50/30 rounded-2xl shadow-lg border border-green-100/50 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Historial de Reparaciones</h1>
            <p className="text-gray-600 font-bold">
              Consulta el historial completo de tus reparaciones finalizadas
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por cliente, máquina, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-64 font-bold text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Filtros Avanzados */}
        {mostrarFiltros && (
          <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Fecha Desde</label>
                <input
                  type="date"
                  value={filtros.fechaDesde}
                  onChange={(e) => setFiltros(prev => ({ ...prev, fechaDesde: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Fecha Hasta</label>
                <input
                  type="date"
                  value={filtros.fechaHasta}
                  onChange={(e) => setFiltros(prev => ({ ...prev, fechaHasta: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-bold">
                {historialFiltrado.length} de {historial.length} reparaciones en historial
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

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Reparaciones</p>
              <p className="text-2xl font-bold text-gray-900">{estadisticas.total}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Duración Promedio</p>
              <p className="text-2xl font-bold text-gray-900">
                {estadisticas.duracionPromedio} días
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Repuestos Utilizados</p>
              <p className="text-2xl font-bold text-gray-900">
                {estadisticas.repuestosUtilizados}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Unidades Usadas</p>
              <p className="text-2xl font-bold text-gray-900">
                {estadisticas.totalUnidadesRepuestos}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="bg-gradient-to-br from-white to-green-50/30 rounded-2xl shadow-lg border border-green-100/50 p-6">
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
        ) : historialFiltrado.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {searchTerm || Object.values(filtros).some(f => f) ? 'No se encontraron reparaciones' : 'No hay historial de reparaciones'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || Object.values(filtros).some(f => f) 
                ? 'Intenta ajustar los filtros de búsqueda' 
                : 'Las reparaciones finalizadas aparecerán aquí'
              }
            </p>
            {(searchTerm || Object.values(filtros).some(f => f)) && (
              <button
                onClick={limpiarFiltros}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {historialFiltrado.map((solicitud) => {
              const duracion = getDuracionDias(
                solicitud.fecha_creacion, 
                solicitud.fecha_finalizada || solicitud.fecha_actualizacion
              );

              return (
                <div key={solicitud.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border-l-4 border-yellow-500">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">Orden #{solicitud.id}</h3>
                          <p className="text-lg text-gray-700 font-bold mb-2">{getNombreMaquina(solicitud)}</p>
                          <p className="text-gray-600 font-bold">Cliente: {getNombreCliente(solicitud)}</p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold border border-green-200 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Finalizada
                          </span>
                          
                          <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getGravedadStyles(solicitud.gravedad)}`}>
                            {getGravedadTexto(solicitud.gravedad)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4 font-bold">{solicitud.descripcion_falla}</p>
                    </div>
                  </div>

                  {/* Información Detallada */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 font-bold">Fecha Solicitud:</span>
                          <p className="text-gray-900 font-bold">{formatFecha(solicitud.fecha_creacion)}</p>
                        </div>
                        
                        <div>
                          <span className="text-gray-500 font-bold">Fecha Finalización:</span>
                          <p className="text-gray-900 font-bold">
                            {formatFecha(solicitud.fecha_finalizada || solicitud.fecha_actualizacion)}
                          </p>
                        </div>
                        
                        <div>
                          <span className="text-gray-500 font-bold">Duración:</span>
                          <p className="text-gray-900 font-bold">{duracion} días</p>
                        </div>
                        
                        <div>
                          <span className="text-gray-500 font-bold">Técnico:</span>
                          <p className="text-gray-900 font-bold">{usuario?.nombre_usuario || "Tú"}</p>
                        </div>
                      </div>
                      
                      {solicitud.observaciones_tecnico && (
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <span className="text-green-800 font-bold">Observaciones:</span>
                          <p className="text-green-900 mt-1">{solicitud.observaciones_tecnico}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      {solicitud.repuestos_utilizados && solicitud.repuestos_utilizados.length > 0 ? (
                        <div>
                          <span className="text-gray-500 font-bold text-sm">Repuestos Utilizados:</span>
                          <div className="space-y-2 mt-2">
                            {solicitud.repuestos_utilizados.map((repuesto, index) => (
                              <div 
                                key={index}
                                className="flex justify-between items-center px-3 py-2 bg-blue-50 rounded-lg border border-blue-200"
                              >
                                <span className="text-blue-800 font-medium">{repuesto.repuesto.nombre}</span>
                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">
                                  {repuesto.cantidad_utilizada} unidad{repuesto.cantidad_utilizada !== 1 ? 'es' : ''}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                          <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm">
                            No se utilizaron repuestos en esta reparación
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}