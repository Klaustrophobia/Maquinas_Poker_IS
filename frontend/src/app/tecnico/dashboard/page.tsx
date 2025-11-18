"use client";
import { useState, useEffect } from "react";
import { Menu, X, Home, Wrench, ClipboardList, LogOut, Eye, Search, Clock } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

export default function TecnicoDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [stats, setStats] = useState({
    ordenesActivas: 0,
    ordenesCompletadas: 0,
    ordenesPendientes: 0,
  });
  
  const [ordenesTrabajo, setOrdenesTrabajo] = useState([]);
  const [loadingOrdenes, setLoadingOrdenes] = useState(false);
  const [historialOrdenes, setHistorialOrdenes] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  const { usuario, logout } = useAuth();
  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  // Redirección por seguridad
  useEffect(() => {
    if (!usuario) router.push("/login");
    else if (usuario.rol !== "Tecnico") router.push("/login");
  }, [usuario, router]);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "ordenes", label: "Órdenes de Trabajo", icon: Wrench },
    { id: "historial", label: "Historial de Órdenes", icon: ClipboardList },
  ];

  useEffect(() => {
    fetchOrdenesTrabajo();
    fetchHistorialOrdenes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrdenesTrabajo = async () => {
    setLoadingOrdenes(true);
    try {
      // Simular datos de órdenes de trabajo (reemplazar con tu API real)
      setTimeout(() => {
        const ordenesSimuladas = [
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

  const fetchHistorialOrdenes = async () => {
    setLoadingHistorial(true);
    try {
      // Simular datos de historial (reemplazar con tu API real)
      setTimeout(() => {
        const historialSimulado = [
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
          { 
            id: 3, 
            numero: "OT-096", 
            cliente: "Taller JKL", 
            maquina: "Esmeril",
            fecha: "2025-03-05", 
            fechaCompletado: "2025-03-06",
            estado: "Completada",
            observaciones: "Mantenimiento preventivo realizado"
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

  const getEstadoColor = (estado) => {
    const estadoLower = String(estado || "").toLowerCase();
    if (estadoLower.includes("completad")) return "bg-green-100 text-green-700";
    if (estadoLower.includes("proceso")) return "bg-blue-100 text-blue-700";
    if (estadoLower.includes("pendiente")) return "bg-yellow-100 text-yellow-700";
    if (estadoLower.includes("cancelad")) return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  const getPrioridadColor = (prioridad) => {
    const prioridadLower = String(prioridad || "").toLowerCase();
    if (prioridadLower.includes("alta")) return "bg-red-100 text-red-700";
    if (prioridadLower.includes("media")) return "bg-yellow-100 text-yellow-700";
    if (prioridadLower.includes("baja")) return "bg-green-100 text-green-700";
    return "bg-gray-100 text-gray-700";
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const renderContent = () => {
    switch (activeSection) {
      case "ordenes":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Órdenes de Trabajo</h1>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-yellow-500 text-white rounded-lg hover:from-blue-600 hover:to-yellow-600 transition-all shadow-md">
                  <Search size={18} />
                  Buscar
                </button>
              </div>
            </div>

            {loadingOrdenes ? (
              <div className="grid grid-cols-1 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white p-6 rounded-lg shadow-md">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : ordenesTrabajo.length === 0 ? (
              <div className="bg-white p-12 rounded-lg shadow-md text-center">
                <Wrench size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No tienes órdenes de trabajo</h3>
                <p className="text-gray-500">Las órdenes asignadas aparecerán aquí</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {ordenesTrabajo.map((orden) => (
                  <div key={orden.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-yellow-500 rounded-lg flex items-center justify-center">
                          <Wrench className="text-white" size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{orden.numero}</h3>
                          <p className="text-sm text-gray-500">Cliente: {orden.cliente} • {orden.fecha}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(orden.estado)}`}>
                          {orden.estado}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPrioridadColor(orden.prioridad)}`}>
                          {orden.prioridad}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2"><strong>Máquina:</strong> {orden.maquina}</p>
                    <p className="text-gray-600 mb-4">{orden.descripcion}</p>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-yellow-500 text-white rounded-lg hover:from-blue-600 hover:to-yellow-600 transition-all">
                      <Eye size={18} />
                      Ver detalles
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "historial":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-800">Historial de Órdenes</h1>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-yellow-500 text-white rounded-lg hover:from-blue-600 hover:to-yellow-600 transition-all shadow-md">
                  <Search size={18} />
                  Buscar
                </button>
              </div>
            </div>

            {loadingHistorial ? (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : historialOrdenes.length === 0 ? (
              <div className="bg-white p-12 rounded-lg shadow-md text-center">
                <ClipboardList size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay historial</h3>
                <p className="text-gray-500">Las órdenes completadas aparecerán aquí</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-500 to-yellow-500 text-white">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Número</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Cliente</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Máquina</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Fecha Inicio</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Fecha Completado</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Estado</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {historialOrdenes.map((orden) => (
                      <tr key={orden.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-yellow-500 rounded-lg flex items-center justify-center">
                              <ClipboardList className="text-white" size={16} />
                            </div>
                            {orden.numero}
                          </div>
                        </td>
                        <td className="px-6 py-4">{orden.cliente}</td>
                        <td className="px-6 py-4">{orden.maquina}</td>
                        <td className="px-6 py-4">{orden.fecha}</td>
                        <td className="px-6 py-4">{orden.fechaCompletado}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(orden.estado)}`}>
                            {orden.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-500 to-yellow-500 text-white rounded hover:from-blue-600 hover:to-yellow-600 transition-all">
                            <Eye size={16} />
                            Ver
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-500 to-yellow-500 text-white p-8 rounded-lg shadow-lg">
              <h1 className="text-3xl font-bold mb-2">
                Bienvenido, {usuario?.nombre_usuario}
              </h1>
              <p className="text-blue-50">
                Este es tu panel de control. Gestiona tus órdenes de trabajo y consulta el historial.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: "Órdenes Activas", value: stats.ordenesActivas, bgColor: "bg-blue-100", textColor: "text-blue-600", icon: Wrench, gradient: "from-blue-500 to-blue-600" },
                { title: "Órdenes Pendientes", value: stats.ordenesPendientes, bgColor: "bg-yellow-100", textColor: "text-yellow-600", icon: Clock, gradient: "from-yellow-500 to-yellow-600" },
                { title: "Órdenes Completadas", value: stats.ordenesCompletadas, bgColor: "bg-green-100", textColor: "text-green-600", icon: ClipboardList, gradient: "from-green-500 to-green-600" },
              ].map((card, index) => {
                const IconComponent = card.icon;
                return (
                  <div key={index} className={`${card.bgColor} p-6 rounded-lg shadow-md`}>
                    <div className={`w-12 h-12 bg-gradient-to-br ${card.gradient} rounded-lg flex items-center justify-center mb-4`}>
                      <IconComponent className="text-white" size={24} />
                    </div>
                    <p className={`text-4xl font-bold ${card.textColor}`}>{card.value}</p>
                    <p className="text-gray-600 mt-2">{card.title}</p>
                  </div>
                );
              })}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Accesos Rápidos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: "Ver Órdenes", desc: "Consulta tus órdenes de trabajo actuales", icon: Wrench, action: () => setActiveSection("ordenes") },
                  { title: "Ver Historial", desc: "Revisa el historial de trabajos completados", icon: ClipboardList, action: () => setActiveSection("historial") },
                ].map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={action.action}
                      className="bg-gradient-to-r from-blue-50 to-yellow-50 p-6 rounded-lg hover:from-blue-100 hover:to-yellow-100 transition-all text-left shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <IconComponent className="text-white" size={24} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 mb-1">
                            {action.title}
                          </h3>
                          <p className="text-sm text-gray-600">{action.desc}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Actividad Reciente</h2>
              <div className="space-y-4">
                {[
                  { action: "Orden completada", item: "OT-098 - Torno CNC", time: "Hace 2 días", icon: "✅" },
                  { action: "Nueva orden asignada", item: "OT-001 - Compresor Industrial", time: "Hace 3 días", icon: "🔔" },
                  { action: "Orden en proceso", item: "OT-003 - Soldadora", time: "Hace 5 días", icon: "⚙️" },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-yellow-50 rounded-lg">
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
        );
    }
  };

  if (!usuario) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`bg-white shadow-lg transition-all duration-300 ${sidebarOpen ? "w-64" : "w-20"} flex flex-col`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-yellow-500 rounded-lg flex items-center justify-center">
              <Wrench className="text-white" size={20} />
            </div>
            {sidebarOpen && (
              <div>
                <h2 className="font-bold text-gray-800">Panel Técnico</h2>
                <p className="text-xs text-gray-500">Portal Técnico</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive ? "bg-gradient-to-r from-blue-500 to-yellow-500 text-white shadow-md" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <IconComponent size={20} />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            {sidebarOpen && <span className="text-sm">Ocultar</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between p-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {menuItems.find(item => item.id === activeSection)?.label || "Dashboard"}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Bienvenido, {usuario?.nombre_usuario}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-yellow-500 text-white rounded-lg hover:from-blue-600 hover:to-yellow-600 transition-all shadow-md"
              >
                <LogOut size={18} />
                Cerrar sesión
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}