"use client";
import { useState, useEffect } from "react";
import { Home, Users, Package, Wrench, Truck, FileText, Clipboard } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

interface Stats {
  totalUsuarios: number;
  ordenesPendientes: number;
  maquinasMantenimiento: number;
  ordenesCompletadas: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsuarios: 0,
    ordenesPendientes: 0,
    maquinasMantenimiento: 0,
    ordenesCompletadas: 0,
  });

  const { usuario } = useAuth();
  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch usuarios
      const usuariosRes = await fetch(`${backendUrl}/api/Usuario`);
      if (usuariosRes.ok) {
        const usuariosData = await usuariosRes.json();
        const usuariosArray = Array.isArray(usuariosData) ? usuariosData : [];
        setStats(prev => ({ ...prev, totalUsuarios: usuariosArray.length }));
      }

      // Fetch proveedores
      const proveedoresRes = await fetch(`${backendUrl}/api/Proveedor`);
      if (proveedoresRes.ok) {
        const proveedoresData = await proveedoresRes.json();
        setStats(prev => ({ ...prev, ordenesPendientes: Array.isArray(proveedoresData) ? proveedoresData.length : 0 }));
      }

      // Fetch máquinas
      const maquinasRes = await fetch(`${backendUrl}/api/Maquina`);
      if (maquinasRes.ok) {
        const maquinasData = await maquinasRes.json();
        const maquinasArray = Array.isArray(maquinasData) ? maquinasData : [];
        const enMantenimiento = maquinasArray.filter((m) => 
          String(m.estado || "").toLowerCase().includes("mantenimiento")
        ).length;
        setStats(prev => ({ ...prev, maquinasMantenimiento: enMantenimiento }));
      }

      // Fetch repuestos
      const repuestosRes = await fetch(`${backendUrl}/api/repuestos`);
      if (repuestosRes.ok) {
        const repuestosData = await repuestosRes.json();
        const repuestosArray = Array.isArray(repuestosData) ? repuestosData : [];
        setStats(prev => ({ ...prev, ordenesCompletadas: repuestosArray.length }));
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  // Funciones para las acciones rápidas
  const handleNuevoUsuario = () => {
    router.push("/SuperAdmin/usuarios?modal=addUsuario");
  };

  const handleNuevaOrden = () => {
    router.push("/SuperAdmin/ordenesTrabajo?modal=addOrden");
  };

  const handleRegistrarMaquina = () => {
    router.push("/SuperAdmin/maquinas?modal=addMaquina");
  };

  // Funciones para las tarjetas de estadísticas
  const handleVerUsuarios = () => {
    router.push("/SuperAdmin/usuarios");
  };

  const handleVerRepuestos = () => {
    router.push("/SuperAdmin/repuestos");
  };

  const handleVerMaquinas = () => {
    router.push("/SuperAdmin/maquinas");
  };

  const handleVerProveedores = () => {
    router.push("/SuperAdmin/proveedores");
  };

  return (
    <div>
      {/* Header con fondo decorativo */}
      <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-lg border border-blue-100/50 p-8 mb-8 relative overflow-hidden">
        {/* Elementos decorativos de fondo */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-purple-600/10 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-500/10 to-emerald-600/10 rounded-full translate-y-8 -translate-x-8"></div>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenido, {usuario?.nombre_usuario} 
          </h2>
          <p className="text-gray-600">
            Aquí está el resumen de tu sistema de gestión de órdenes y máquinas.
          </p>
        </div>
      </div>

      {/* Tarjetas de estadísticas con fondos decorativos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { 
            title: "Total de Usuarios", 
            value: stats.totalUsuarios, 
            bgColor: "bg-blue-100", 
            textColor: "text-blue-600", 
            icon: Users,
            onClick: handleVerUsuarios
          },
          { 
            title: "Proveedores", 
            value: stats.ordenesPendientes, 
            bgColor: "bg-orange-100", 
            textColor: "text-orange-600", 
            icon: Truck,
            onClick: handleVerProveedores
          },
          { 
            title: "Máquinas en Mantenimiento", 
            value: stats.maquinasMantenimiento, 
            bgColor: "bg-purple-100", 
            textColor: "text-purple-600", 
            icon: Wrench,
            onClick: handleVerMaquinas
          },
          { 
            title: "Repuestos", 
            value: stats.ordenesCompletadas, 
            bgColor: "bg-green-100", 
            textColor: "text-green-600", 
            icon: Package,
            onClick: handleVerRepuestos
          },
        ].map((card, index) => {
          const IconComponent = card.icon;
          return (
            <div 
              key={index} 
              onClick={card.onClick}
              className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-lg border border-blue-100/50 hover:shadow-xl transition-all p-6 cursor-pointer group relative overflow-hidden"
            >
              {/* Elementos decorativos de fondo */}
              <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-blue-500/10 to-purple-600/10 rounded-full -translate-y-4 translate-x-4"></div>
              <div className="absolute bottom-0 left-0 w-10 h-10 bg-gradient-to-tr from-green-500/10 to-emerald-600/10 rounded-full translate-y-4 -translate-x-4"></div>
              
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className={`${card.bgColor} ${card.textColor} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                  <IconComponent className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1 relative z-10">{card.value}</h3>
              <p className="text-sm text-gray-600 relative z-10">{card.title}</p>
            </div>
          );
        })}
      </div>

      {/* Acciones Rápidas con fondo decorativo */}
      <div className="bg-gradient-to-br from-white from-blue-500/10 to-purple-600/10 rounded-2xl shadow-lg border border-blue-100/50 p-6 mb-8 relative overflow-hidden">
        {/* Elementos decorativos de fondo */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-orange-500/10 to-red-600/10 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-purple-500/10 to-pink-600/10 rounded-full translate-y-8 -translate-x-8"></div>
        
        <div className="relative z-10">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { 
                title: "Nuevo Usuario", 
                desc: "Registrar un nuevo usuario", 
                icon: Users,
                onClick: handleNuevoUsuario
              },
              { 
                title: "Nueva Orden", 
                desc: "Crear orden de reparación", 
                icon: Package,
                onClick: handleNuevaOrden
              },
              { 
                title: "Registrar Máquina", 
                desc: "Añadir nueva máquina", 
                icon: Wrench,
                onClick: handleRegistrarMaquina
              },
            ].map((action, index) => {
              const IconComponent = action.icon;
              return (
                <button 
                  key={index} 
                  onClick={action.onClick}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all p-6 text-left group border border-gray-100 hover:border-blue-200 relative overflow-hidden"
                >
                  {/* Elemento decorativo de fondo para cada acción */}
                  <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-blue-500/10 to-purple-600/10 rounded-full -translate-y-2 translate-x-2"></div>
                  
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="bg-gradient-to-br from-esmerald-400 to-cyan-500 text-white p-3 rounded-lg group-hover:scale-110 transition-transform">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {action.title}
                      </h4>
                      <p className="text-sm text-gray-600">{action.desc}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Actividad Reciente con fondo decorativo */}
      <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-lg border border-blue-100/50 p-6 relative overflow-hidden">
        {/* Elementos decorativos de fondo */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-green-500/10 to-emerald-600/10 rounded-full -translate-y-6 translate-x-6"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-yellow-500/10 to-amber-600/10 rounded-full translate-y-6 -translate-x-6"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Actividad Reciente</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Ver todas →
            </button>
          </div>
          <div className="space-y-4">
            {[
              { action: "Nueva orden creada", user: "Juan Pérez", time: "Hace 5 minutos", icon: "📋" },
              { action: "Máquina actualizada", user: "María García", time: "Hace 1 hora", icon: "⚙️" },
              { action: "Usuario registrado", user: "Carlos López", time: "Hace 2 horas", icon: "👤" },
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-lg hover:bg-white/50 transition-colors border border-transparent hover:border-blue-100">
                <div className="text-2xl">{activity.icon}</div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">Por {activity.user}</p>
                </div>
                <span className="text-xs text-gray-500 bg-white/50 px-2 py-1 rounded-full">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}