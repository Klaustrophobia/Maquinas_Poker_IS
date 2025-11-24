"use client";
import React, { useState, useEffect } from "react";
import { Home, Wrench, FileText, Plus, Eye } from "lucide-react";
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

interface Solicitud {
  id: number;
  maquina: string;
  fecha: string;
  estado: string;
  descripcion: string;
}

interface LoteRecibo {
  id: number;
  cliente_id: number;
  fecha_recibo: string;
  ingreso: number;
  egreso: number;
  total: number;
  parte_empresa: number;
  parte_cliente: number;
  fecha_creacion: string;
  cantidad_recibos: number;
}

interface Stats {
  totalMaquinas: number;
  solicitudesPendientes: number;
  recibosTotal: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalMaquinas: 0,
    solicitudesPendientes: 0,
    recibosTotal: 0,
  });
  
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [loadingMaquinas, setLoadingMaquinas] = useState(false);
  const [lotesRecibos, setLotesRecibos] = useState<LoteRecibo[]>([]);
  const [loadingLotesRecibos, setLoadingLotesRecibos] = useState(false);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);

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
      fetchLotesRecibos();
      fetchSolicitudes();
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
        setStats(prev => ({ ...prev, totalMaquinas: misMaquinas.length }));
      }
    } catch (error) {
      console.error("Error:", error);
      setMaquinas([]);
    } finally {
      setLoadingMaquinas(false);
    }
  };

  const fetchLotesRecibos = async (): Promise<void> => {
    setLoadingLotesRecibos(true);
    try {
      const res = await fetch(`${backendUrl}/api/Lote-Recibo?cliente_id=${usuario?.id}`);
      
      if (res.ok) {
        const data = await res.json();
        let lotesData: LoteRecibo[] = [];
        
        if (data.success && Array.isArray(data.data)) {
          lotesData = data.data;
        } else if (Array.isArray(data)) {
          lotesData = data;
        }
        
        lotesData.sort((a, b) => b.id - a.id);
        setLotesRecibos(lotesData);
        setStats(prev => ({ ...prev, recibosTotal: lotesData.length }));
      }
    } catch (error) {
      console.error("Error:", error);
      setLotesRecibos([]);
    } finally {
      setLoadingLotesRecibos(false);
    }
  };

  const fetchSolicitudes = async (): Promise<void> => {
    setLoadingSolicitudes(true);
    try {
      setTimeout(() => {
        const solicitudesSimuladas: Solicitud[] = [
          { id: 1, maquina: "Compresor Industrial", fecha: "2025-03-10", estado: "En proceso", descripcion: "Falla en el motor" },
          { id: 2, maquina: "Generador 500W", fecha: "2025-03-08", estado: "Pendiente", descripcion: "No enciende" },
        ];
        setSolicitudes(solicitudesSimuladas);
        const pendientes = solicitudesSimuladas.filter(s => s.estado === "Pendiente").length;
        setStats(prev => ({ ...prev, solicitudesPendientes: pendientes }));
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

  if (!usuario) return null;

  return (
    <div className="space-y-8">
      {/* Encabezado con fondo decorativo */}
      <div className="bg-gradient-to-br from-white to-red-50/30 rounded-2xl shadow-lg border border-red-100/50 p-8 relative overflow-hidden">
        {/* Elementos decorativos de fondo */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl  from-blue-500/30 to-purple-600/30 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-blue-500/30 to-purple-600/30 rounded-full translate-y-8 -translate-x-8"></div>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenido, {usuario?.nombre_usuario}
          </h2>
          <p className="text-gray-600 font-bold">
            Este es tu panel de control. Gestiona tus máquinas, solicitudes y recibos.
          </p>
        </div>
      </div>

      {/* Estadísticas con fondo decorativo */}
      <div className="bg-gradient-to-br from-white to-red-50/30 rounded-2xl shadow-lg border border-red-100/50 p-6 relative overflow-hidden">
        {/* Elementos decorativos de fondo */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/30 to-purple-600/30 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-blue-500/30 to-purple-600/30 rounded-full translate-y-8 -translate-x-8"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {[
            { title: "Mis Máquinas", value: stats.totalMaquinas, bgColor: "bg-red-100", textColor: "text-red-600", icon: Wrench },
            { title: "Solicitudes Pendientes", value: stats.solicitudesPendientes, bgColor: "bg-red-100", textColor: "text-red-600", icon: Wrench },
            { title: "Total Recibos", value: stats.recibosTotal, bgColor: "bg-red-100", textColor: "text-red-600", icon: FileText },
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

      {/* Accesos Rápidos con fondo decorativo */}
      <div className="bg-gradient-to-br from-white to-red-50/30 rounded-2xl shadow-lg border border-red-100/50 p-6 relative overflow-hidden">
        {/* Elementos decorativos de fondo */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-500/30 to-purple-600/30 rounded-full -translate-y-4 translate-x-4"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-blue-500/30 to-purple-600/30 rounded-full translate-y-4 -translate-x-4"></div>
        
        <div className="relative z-10">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Accesos Rápidos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "Ver Máquinas", desc: "Consulta el estado de tus equipos", icon: Wrench, action: () => router.push("/cliente/maquinas") },
              { title: "Nueva Solicitud", desc: "Solicita reparación de máquina", icon: Wrench, action: () => router.push("/cliente/solicitudes") },
              { title: "Mis Recibos", desc: "Consulta tu historial de pagos", icon: FileText, action: () => router.push("/cliente/recibos") },
            ].map((action, index) => {
              const IconComponent = action.icon;
              return (
                <button 
                  key={index} 
                  onClick={action.action}
                  className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all p-6 text-left group border border-gray-100"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-br from-red-500 to-blue-600 text-white p-3 rounded-lg group-hover:scale-110 transition-transform">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1 group-hover:text-red-600 transition-colors">
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
    </div>
  );
}