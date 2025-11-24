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
    fetchHistorialOrdenes();
  }, []);

  const fetchOrdenesTrabajo = async (): Promise<void> => {
    setLoadingOrdenes(true);
    try {
      setTimeout(() => {
        const ordenesSimuladas: OrdenTrabajo[] = [
          { 
            id: 1, 
            numero: "OT-001", 
            cliente: "Empresa ABC", 
            maquina: "Compresor Industrial",
            fecha: "2025-03-15", 
            estado: "En proceso",
            prioridad: "Alta",
            descripcion: "Falla en el motor principal"
          },
          { 
            id: 2, 
            numero: "OT-002", 
            cliente: "Industrias XYZ", 
            maquina: "Generador 500W",
            fecha: "2025-03-16", 
            estado: "Pendiente",
            prioridad: "Media",
            descripcion: "Revisión de mantenimiento preventivo"
          },
          { 
            id: 3, 
            numero: "OT-003", 
            cliente: "Fábrica 123", 
            maquina: "Soldadora",
            fecha: "2025-03-14", 
            estado: "En proceso",
            prioridad: "Baja",
            descripcion: "Calibración de equipo"
          },
        ];
        setOrdenesTrabajo(ordenesSimuladas);
        const activas = ordenesSimuladas.filter(o => o.estado === "En proceso").length;
        const pendientes = ordenesSimuladas.filter(o => o.estado === "Pendiente").length;
        setStats(prev => ({ 
          ...prev, 
          ordenesActivas: activas,
          ordenesPendientes: pendientes 
        }));
        setLoadingOrdenes(false);
      }, 500);
    } catch (error) {
      console.error("Error:", error);
      setOrdenesTrabajo([]);
      setLoadingOrdenes(false);
    }
  };

  const fetchHistorialOrdenes = async (): Promise<void> => {
    setLoadingHistorial(true);
    try {
      setTimeout(() => {
        const historialSimulado: HistorialOrden[] = [
          { 
            id: 1, 
            numero: "OT-098", 
            cliente: "Empresa DEF", 
            maquina: "Torno CNC",
            fecha: "2025-03-10", 
            fechaCompletado: "2025-03-12",
            estado: "Completada",
            observaciones: "Trabajo completado satisfactoriamente"
          },
          { 
            id: 2, 
            numero: "OT-097", 
            cliente: "Comercial GHI", 
            maquina: "Prensa Hidráulica",
            fecha: "2025-03-08", 
            fechaCompletado: "2025-03-09",
            estado: "Completada",
            observaciones: "Reemplazo de sellos hidráulicos"
          },
        ];
        setHistorialOrdenes(historialSimulado);
        setStats(prev => ({ 
          ...prev, 
          ordenesCompletadas: historialSimulado.length 
        }));
        setLoadingHistorial(false);
      }, 500);
    } catch (error) {
      console.error("Error:", error);
      setHistorialOrdenes([]);
      setLoadingHistorial(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Encabezado con fondo decorativo */}
      <div className="bg-gradient-to-br from-white to-amber-50/30 rounded-2xl shadow-lg border border-amber-100/50 p-8 relative overflow-hidden">
        {/* Elementos decorativos de fondo */}
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
              { title: "Órdenes Activas", value: stats.ordenesActivas, bgColor: "bg-amber-100", textColor: "text-amber-600", icon: Wrench },
              { title: "Órdenes Pendientes", value: stats.ordenesPendientes, bgColor: "bg-amber-100", textColor: "text-amber-600", icon: Clock },
              { title: "Órdenes Completadas", value: stats.ordenesCompletadas, bgColor: "bg-amber-100", textColor: "text-amber-600", icon: ClipboardList },
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
        {/* Elementos decorativos de fondo */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-500/10 to-amber-600/10 rounded-full -translate-y-4 translate-x-4"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-yellow-500/10 to-amber-600/10 rounded-full translate-y-4 -translate-x-4"></div>
        
        <div className="relative z-10">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Accesos Rápidos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: "Ver Órdenes", desc: "Consulta tus órdenes de trabajo actuales", icon: Wrench, action: () => router.push("/tecnico/ordenesTrabajo") },
              { title: "Ver Historial", desc: "Revisa el historial de trabajos completados", icon: ClipboardList, action: () => router.push("/tecnico/historialOrdenes") },
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
        {/* Elementos decorativos de fondo */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-500/10 to-amber-600/10 rounded-full -translate-y-4 translate-x-4"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-yellow-500/10 to-amber-600/10 rounded-full translate-y-4 -translate-x-4"></div>

        <div className="relative z-10">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Actividad Reciente</h3>
          <div className="space-y-4">
            {[
              { action: "Orden completada", item: "OT-098 - Torno CNC", time: "Hace 2 días", icon: "✅" },
              { action: "Nueva orden asignada", item: "OT-001 - Compresor Industrial", time: "Hace 3 días", icon: "🔔" },
              { action: "Orden en proceso", item: "OT-003 - Soldadora", time: "Hace 5 días", icon: "⚙️" },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{activity.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-800">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.item}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}