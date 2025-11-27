"use client";
import React, { useState, useEffect } from "react";
import { Home, Wrench, ClipboardList, Clock, Eye } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

interface OrdenTrabajo {
  id: number;
  numero: string;
  cliente: string;
  maquina: string;
  fecha: string;
  estado: string;
  prioridad: string;
  descripcion: string;
}

interface HistorialOrden {
  id: number;
  numero: string;
  cliente: string;
  maquina: string;
  fecha: string;
  fechaCompletado: string;
  estado: string;
  observaciones: string;
}

interface Stats {
  ordenesActivas: number;
  ordenesCompletadas: number;
  ordenesPendientes: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    ordenesActivas: 0,
    ordenesCompletadas: 0,
    ordenesPendientes: 0,
  });
  
  const [ordenesTrabajo, setOrdenesTrabajo] = useState<OrdenTrabajo[]>([]);
  const [loadingOrdenes, setLoadingOrdenes] = useState(false);
  const [historialOrdenes, setHistorialOrdenes] = useState<HistorialOrden[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (usuario?.id) {
      fetchOrdenesTrabajo();
      fetchHistorialOrdenes();
    }
  }, [usuario]);

  const fetchOrdenesTrabajo = async (): Promise<void> => {
    if (!usuario?.id) return;
    
    setLoadingOrdenes(true);
    setError(null);
    
    try {
      // ENDPOINT CORREGIDO - usar el correcto
      const response = await fetch(
        `${backendUrl}/api/SolicitudReparacion/tecnico/${usuario.id}`, // ← SIN "s" en "tecnico"
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log('Respuesta de órdenes:', data);
      
      // La respuesta probablemente tiene una propiedad 'data' con el array
      const ordenesData = data.data || data;
      
      if (!Array.isArray(ordenesData)) {
        console.warn('La respuesta no es un array:', ordenesData);
        setOrdenesTrabajo([]);
        return;
      }
      
      // Mapear los datos de la API a la estructura de OrdenTrabajo
      const ordenesFormateadas: OrdenTrabajo[] = ordenesData.map((orden: any) => ({
        id: orden.id,
        numero: `SR-${orden.id}`,
        cliente: orden.cliente?.nombre_usuario || orden.cliente_nombre || "Cliente no especificado",
        maquina: orden.maquina?.nombre || orden.maquina_nombre || "Máquina no especificada",
        fecha: orden.fecha_creacion ? new Date(orden.fecha_creacion).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        estado: orden.estado || "pendiente",
        prioridad: orden.gravedad || "Media",
        descripcion: orden.descripcion_falla || "Sin descripción"
      }));

      setOrdenesTrabajo(ordenesFormateadas);
      
      // Calcular estadísticas basadas en los estados reales
      const activas = ordenesFormateadas.filter(o => 
        o.estado === "tecnico_asignado" || o.estado === "prefinalizada"
      ).length;
      const pendientes = ordenesFormateadas.filter(o => 
        o.estado === "pendiente"
      ).length;
      const completadas = ordenesFormateadas.filter(o => 
        o.estado === "finalizada"
      ).length;
      
      setStats({ 
        ordenesActivas: activas,
        ordenesPendientes: pendientes,
        ordenesCompletadas: completadas
      });
      
    } catch (error) {
      console.error("Error al obtener órdenes de trabajo:", error);
      setError("No se pudieron cargar las órdenes de trabajo");
      setOrdenesTrabajo([]);
    } finally {
      setLoadingOrdenes(false);
    }
  };

  const fetchHistorialOrdenes = async (): Promise<void> => {
    setLoadingHistorial(true);
    setError(null);
    
    try {
      // USAR EL MISMO ENDPOINT CORREGIDO
      const response = await fetch(
        `${backendUrl}/api/SolicitudReparacion/tecnico/${usuario?.id}`, // ← SIN "s" en "tecnico"
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      const ordenesData = data.data || data;
      
      if (!Array.isArray(ordenesData)) {
        console.warn('La respuesta no es un array:', ordenesData);
        setHistorialOrdenes([]);
        return;
      }
      
      // Filtrar solo las órdenes finalizadas para el historial
      const ordenesFinalizadas = ordenesData.filter((orden: any) => 
        orden.estado === "finalizada"
      );
      
      // Mapear los datos de la API a la estructura de HistorialOrden
      const historialFormateado: HistorialOrden[] = ordenesFinalizadas.map((orden: any) => ({
        id: orden.id,
        numero: `SR-${orden.id}`,
        cliente: orden.cliente?.nombre_usuario || orden.cliente_nombre || "Cliente no especificado",
        maquina: orden.maquina?.nombre || orden.maquina_nombre || "Máquina no especificada",
        fecha: orden.fecha_creacion ? new Date(orden.fecha_creacion).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        fechaCompletado: orden.fecha_finalizada ? new Date(orden.fecha_finalizada).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        estado: "Completada",
        observaciones: orden.observaciones_tecnico || "Sin observaciones"
      }));

      setHistorialOrdenes(historialFormateado);
      
    } catch (error) {
      console.error("Error al obtener historial de órdenes:", error);
      setError("No se pudo cargar el historial de órdenes");
      setHistorialOrdenes([]);
    } finally {
      setLoadingHistorial(false);
    }
  };

  // Función para reintentar la carga
  const reintentarCarga = () => {
    setError(null);
    fetchOrdenesTrabajo();
    fetchHistorialOrdenes();
  };

  return (
    <div className="space-y-8">
      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Error:</p>
              <p className="text-sm">{error}</p>
            </div>
            <button 
              onClick={reintentarCarga}
              className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* Encabezado con fondo decorativo */}
      <div className="bg-gradient-to-br from-white to-amber-50/30 rounded-2xl shadow-lg border border-amber-100/50 p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-amber-600/10 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-yellow-500/10 to-amber-600/10 rounded-full translate-y-8 -translate-x-8"></div>
        
        <div className="relative z-10">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Bienvenido, {usuario?.nombre_usuario}
            </h2>
            <p className="text-gray-600 font-bold">
              Este es tu panel de control. Gestiona tus órdenes de trabajo y consulta el historial.
            </p>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { 
                title: "Órdenes Activas", 
                value: loadingOrdenes ? "..." : stats.ordenesActivas, 
                bgColor: "bg-amber-100", 
                textColor: "text-amber-600", 
                icon: Wrench 
              },
              { 
                title: "Órdenes Pendientes", 
                value: loadingOrdenes ? "..." : stats.ordenesPendientes, 
                bgColor: "bg-blue-100", 
                textColor: "text-blue-600", 
                icon: Clock 
              },
              { 
                title: "Órdenes Completadas", 
                value: loadingHistorial ? "..." : stats.ordenesCompletadas, 
                bgColor: "bg-green-100", 
                textColor: "text-green-600", 
                icon: ClipboardList 
              },
            ].map((card, index) => {
              const IconComponent = card.icon;
              return (
                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                      <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                    </div>
                    <div className={`${card.bgColor} p-3 rounded-lg`}>
                      <IconComponent className={`w-6 h-6 ${card.textColor}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Accesos Rápidos */}
      <div className="bg-gradient-to-br from-white to-amber-50/30 rounded-2xl shadow-lg border border-amber-100/50 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-500/10 to-amber-600/10 rounded-full -translate-y-4 translate-x-4"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-yellow-500/10 to-amber-600/10 rounded-full translate-y-4 -translate-x-4"></div>
        
        <div className="relative z-10">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Accesos Rápidos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { 
                title: "Ver Órdenes", 
                desc: "Consulta tus órdenes de trabajo actuales", 
                icon: Wrench, 
                action: () => router.push("/tecnico/ordenesTrabajo") 
              },
              { 
                title: "Ver Historial", 
                desc: "Revisa el historial de trabajos completados", 
                icon: ClipboardList, 
                action: () => router.push("/tecnico/historialOrdenes") 
              },
            ].map((action, index) => {
              const IconComponent = action.icon;
              return (
                <button 
                  key={index} 
                  onClick={action.action}
                  className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all p-6 text-left group border border-gray-100"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-3 rounded-lg group-hover:scale-110 transition-transform">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1 group-hover:text-amber-600 transition-colors">
                        {action.title}
                      </h4>
                      <p className="text-sm text-gray-600 font-bold">{action.desc}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Actividad Reciente */}
      <div className="bg-gradient-to-br from-white to-amber-50/30 rounded-2xl shadow-lg border border-amber-100/50 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-500/10 to-amber-600/10 rounded-full -translate-y-4 translate-x-4"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-yellow-500/10 to-amber-600/10 rounded-full translate-y-4 -translate-x-4"></div>

        <div className="relative z-10">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Actividad Reciente</h3>
          
          {loadingOrdenes || loadingHistorial ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
              <p className="text-gray-600 mt-2">Cargando actividad...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Mostrar últimas órdenes completadas */}
              {historialOrdenes.slice(0, 2).map((orden, index) => (
                <div key={`hist-${index}`} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <p className="font-semibold text-gray-800">Orden completada</p>
                      <p className="text-sm text-gray-600">{orden.numero} - {orden.maquina}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{orden.fechaCompletado}</span>
                </div>
              ))}
              
              {/* Mostrar última orden activa */}
              {ordenesTrabajo.filter(o => o.estado !== "finalizada").slice(0, 1).map((orden, index) => (
                <div key={`orden-${index}`} className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-100">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⚙️</span>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {orden.estado === "pendiente" ? "Nueva orden asignada" : "Orden en proceso"}
                      </p>
                      <p className="text-sm text-gray-600">{orden.numero} - {orden.maquina}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{orden.fecha}</span>
                </div>
              ))}

              {ordenesTrabajo.length === 0 && historialOrdenes.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No hay actividad reciente
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}