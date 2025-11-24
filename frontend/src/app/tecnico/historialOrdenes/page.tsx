"use client";
import React, { useState, useEffect } from "react";
import { Search, Filter, Eye, Download, Calendar, User, CheckCircle, X } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

interface HistorialOrden {
  id: number;
  numero: string;
  maquina: string;
  fecha_solicitud: string;
  fecha_completado: string;
  estado: string;
  descripcion: string;
  observaciones_finales: string;
  tecnico_asignado: string;
  duracion_dias: number;
  costo_total?: number;
  materiales_utilizados: string[];
}

interface FiltrosState {
  fechaDesde: string;
  fechaHasta: string;
  tecnico: string;
}

export default function HistorialOrdenesPage() {
  const [historial, setHistorial] = useState<HistorialOrden[]>([]);
  const [historialFiltrado, setHistorialFiltrado] = useState<HistorialOrden[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosState>({
    fechaDesde: "",
    fechaHasta: "",
    tecnico: ""
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
    fetchHistorialOrdenes();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [historial, searchTerm, filtros]);

  const fetchHistorialOrdenes = async (): Promise<void> => {
    setLoading(true);
    try {
      // Simulación de datos - reemplazar con API real
      setTimeout(() => {
        const historialSimulado: HistorialOrden[] = [
          {
            id: 1,
            numero: "OT-2024-002",
            maquina: "Generador Diésel 300KW",
            fecha_solicitud: "2024-01-10",
            fecha_completado: "2024-01-14",
            estado: "Completada",
            descripcion: "Mantenimiento preventivo programado",
            observaciones_finales: "Cambio de filtros de aire y combustible, cambio de aceite, verificación del sistema de enfriamiento. Equipo funcionando óptimamente.",
            tecnico_asignado: "María García",
            duracion_dias: 4,
            costo_total: 12500.00,
            materiales_utilizados: ["Filtro de aire", "Filtro de combustible", "Aceite lubricante", "Juntas"]
          },
          {
            id: 2,
            numero: "OT-2023-045",
            maquina: "Compresor de Aire 100HP",
            fecha_solicitud: "2023-12-05",
            fecha_completado: "2023-12-08",
            estado: "Completada",
            descripcion: "Reparación de válvulas de presión",
            observaciones_finales: "Reemplazo de válvulas de seguridad y calibración del sistema de presión. Pruebas de funcionamiento satisfactorias.",
            tecnico_asignado: "Juan Pérez",
            duracion_dias: 3,
            costo_total: 8500.00,
            materiales_utilizados: ["Válvulas de seguridad", "Sellos", "Kit de calibración"]
          },
          {
            id: 3,
            numero: "OT-2023-038",
            maquina: "Sistema de Enfriamiento Industrial",
            fecha_solicitud: "2023-11-20",
            fecha_completado: "2023-11-25",
            estado: "Completada",
            descripcion: "Limpieza y mantenimiento del sistema",
            observaciones_finales: "Limpieza completa de intercambiadores de calor, verificación de bombas y tuberías. Sistema operando con eficiencia mejorada.",
            tecnico_asignado: "Carlos Rodríguez",
            duracion_dias: 5,
            costo_total: 9200.00,
            materiales_utilizados: ["Productos de limpieza", "Sellos nuevos", "Anticongelante"]
          },
          {
            id: 4,
            numero: "OT-2023-029",
            maquina: "Prensa Hidráulica 50T",
            fecha_solicitud: "2023-10-15",
            fecha_completado: "2023-10-18",
            estado: "Completada",
            descripcion: "Revisión del sistema hidráulico",
            observaciones_finales: "Cambio de aceite hidráulico, verificación de cilindros y mangueras. Sistema funcionando correctamente.",
            tecnico_asignado: "Ana Martínez",
            duracion_dias: 3,
            costo_total: 6800.00,
            materiales_utilizados: ["Aceite hidráulico", "Filtros hidráulicos", "Juntas"]
          }
        ];
        setHistorial(historialSimulado);
        setHistorialFiltrado(historialSimulado);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error:", error);
      setHistorial([]);
      setHistorialFiltrado([]);
      setLoading(false);
    }
  };

  const aplicarFiltros = (): void => {
    let filtered = [...historial];

    // Filtro de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(orden =>
        orden.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orden.maquina.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orden.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orden.tecnico_asignado.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtros adicionales
    if (filtros.fechaDesde) {
      filtered = filtered.filter(orden => orden.fecha_completado >= filtros.fechaDesde);
    }

    if (filtros.fechaHasta) {
      filtered = filtered.filter(orden => orden.fecha_completado <= filtros.fechaHasta);
    }

    if (filtros.tecnico) {
      filtered = filtered.filter(orden => 
        orden.tecnico_asignado.toLowerCase().includes(filtros.tecnico.toLowerCase())
      );
    }

    setHistorialFiltrado(filtered);
  };

  const limpiarFiltros = (): void => {
    setFiltros({
      fechaDesde: "",
      fechaHasta: "",
      tecnico: ""
    });
    setSearchTerm("");
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

  const formatMoneda = (monto: number): string => {
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: 'HNL'
    }).format(monto);
  };

  const exportarHistorial = (): void => {
    // Simulación de exportación
    alert('Funcionalidad de exportación en desarrollo');
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="bg-gradient-to-br from-white to-green-50/30 rounded-2xl shadow-lg border border-green-100/50 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Historial de Órdenes</h1>
            <p className="text-gray-600 font-bold">
              Consulta el historial completo de tus órdenes de trabajo completadas
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={exportarHistorial}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
            
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
                placeholder="Buscar en historial..."
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Técnico</label>
                <input
                  type="text"
                  placeholder="Filtrar por técnico..."
                  value={filtros.tecnico}
                  onChange={(e) => setFiltros(prev => ({ ...prev, tecnico: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-bold">
                {historialFiltrado.length} de {historial.length} órdenes en historial
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
              <p className="text-sm text-gray-600 mb-1">Total Órdenes</p>
              <p className="text-2xl font-bold text-gray-900">{historial.length}</p>
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
                {historial.length > 0 
                  ? Math.round(historial.reduce((acc, orden) => acc + orden.duracion_dias, 0) / historial.length)
                  : 0
                } días
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
              <p className="text-sm text-gray-600 mb-1">Técnicos Diferentes</p>
              <p className="text-2xl font-bold text-gray-900">
                {[...new Set(historial.map(orden => orden.tecnico_asignado))].length}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <User className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Inversión Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatMoneda(historial.reduce((acc, orden) => acc + (orden.costo_total || 0), 0))}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Download className="w-6 h-6 text-orange-600" />
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
              {searchTerm || Object.values(filtros).some(f => f) ? 'No se encontraron órdenes' : 'No hay historial de órdenes'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || Object.values(filtros).some(f => f) 
                ? 'Intenta ajustar los filtros de búsqueda' 
                : 'El historial de órdenes completadas aparecerá aquí'
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
            {historialFiltrado.map((orden) => (
              <div key={orden.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border-l-4 border-green-500">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{orden.numero}</h3>
                        <p className="text-lg text-gray-700 font-bold">{orden.maquina}</p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold border border-green-200 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Completada
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4 font-bold">{orden.descripcion}</p>
                  </div>
                  
                  <div className="flex lg:flex-col gap-2">
                    <button className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors font-bold flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Ver Completo
                    </button>
                  </div>
                </div>

                {/* Información Detallada */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 font-bold">Fecha Solicitud:</span>
                        <p className="text-gray-900 font-bold">{formatFecha(orden.fecha_solicitud)}</p>
                      </div>
                      
                      <div>
                        <span className="text-gray-500 font-bold">Fecha Completado:</span>
                        <p className="text-gray-900 font-bold">{formatFecha(orden.fecha_completado)}</p>
                      </div>
                      
                      <div>
                        <span className="text-gray-500 font-bold">Duración:</span>
                        <p className="text-gray-900 font-bold">{orden.duracion_dias} días</p>
                      </div>
                      
                      <div>
                        <span className="text-gray-500 font-bold">Técnico:</span>
                        <p className="text-gray-900 font-bold">{orden.tecnico_asignado}</p>
                      </div>
                    </div>
                    
                    {orden.costo_total && (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <span className="text-green-800 font-bold">Costo Total:</span>
                        <p className="text-green-900 text-lg font-bold mt-1">{formatMoneda(orden.costo_total)}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="text-gray-500 font-bold text-sm">Observaciones Finales:</span>
                      <p className="text-gray-900 mt-1 bg-gray-50 p-3 rounded-lg border border-gray-200">
                        {orden.observaciones_finales}
                      </p>
                    </div>
                    
                    {orden.materiales_utilizados.length > 0 && (
                      <div>
                        <span className="text-gray-500 font-bold text-sm">Materiales Utilizados:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {orden.materiales_utilizados.map((material, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold border border-blue-200"
                            >
                              {material}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
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