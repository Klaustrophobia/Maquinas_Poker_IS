"use client";
import { useState, useEffect } from "react";
import { Menu, X, Home, Wrench, FileText, LogOut, Plus, Eye, Search } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

export default function ClienteDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [stats, setStats] = useState({
    totalMaquinas: 0,
    solicitudesPendientes: 0,
    recibosTotal: 0,
  });
  
  const [maquinas, setMaquinas] = useState([]);
  const [loadingMaquinas, setLoadingMaquinas] = useState(false);
  const [recibos, setRecibos] = useState([]);
  const [loadingRecibos, setLoadingRecibos] = useState(false);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);

  const { usuario, logout } = useAuth();
  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  // Redirección por seguridad
  useEffect(() => {
    if (!usuario) router.push("/login");
    else if (usuario.rol !== "Cliente") router.push("/login");
  }, [usuario, router]);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "maquinas", label: "Mis Máquinas", icon: Wrench },
    { id: "solicitudes", label: "Solicitudes", icon: Wrench }, // Cambiado de Tool a Wrench
    { id: "recibos", label: "Recibos", icon: FileText },
  ];

  useEffect(() => {
    fetchMaquinas();
    fetchRecibos();
    fetchSolicitudes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMaquinas = async () => {
    setLoadingMaquinas(true);
    try {
      const res = await fetch(`${backendUrl}/api/Maquina`);
      if (res.ok) {
        const data = await res.json();
        const maquinasArray = Array.isArray(data) ? data : [];
        // Filtrar solo las máquinas del cliente actual
        const misMaquinas = maquinasArray.filter(m => m.cliente_id === usuario?.id);
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

  const fetchRecibos = async () => {
    setLoadingRecibos(true);
    try {
      // Simular datos de recibos (reemplazar con tu API real)
      setTimeout(() => {
        const recibosSimulados = [
          { id: 1, numero: "REC-001", fecha: "2025-01-15", monto: 250.00, estado: "Pagado" },
          { id: 2, numero: "REC-002", fecha: "2025-02-10", monto: 180.50, estado: "Pendiente" },
          { id: 3, numero: "REC-003", fecha: "2025-03-05", monto: 320.00, estado: "Pagado" },
        ];
        setRecibos(recibosSimulados);
        setStats(prev => ({ ...prev, recibosTotal: recibosSimulados.length }));
        setLoadingRecibos(false);
      }, 500);
    } catch (error) {
      console.error("Error:", error);
      setRecibos([]);
      setLoadingRecibos(false);
    }
  };

  const fetchSolicitudes = async () => {
    setLoadingSolicitudes(true);
    try {
      // Simular datos de solicitudes (reemplazar con tu API real)
      setTimeout(() => {
        const solicitudesSimuladas = [
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

  const getEstadoColor = (estado) => {
    const estadoLower = String(estado || "").toLowerCase();
    if (estadoLower.includes("pagado") || estadoLower.includes("completad")) return "bg-green-100 text-green-700";
    if (estadoLower.includes("proceso")) return "bg-blue-100 text-blue-700";
    if (estadoLower.includes("pendiente")) return "bg-yellow-100 text-yellow-700";
    if (estadoLower.includes("rechazad")) return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const renderContent = () => {
    switch (activeSection) {
      case "maquinas":
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Mis Máquinas</h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar máquina..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {loadingMaquinas ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                    <div className="h-12 bg-gray-200 rounded mb-4"></div>
                  </div>
                ))}
              </div>
            ) : maquinas.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes máquinas registradas</h3>
                <p className="text-gray-600">Contacta con soporte para registrar tus máquinas</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {maquinas.map((m, i) => (
                  <div key={m.id || i} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 group border-l-4 border-blue-500">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-red-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Wrench className="w-6 h-6 text-white" />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(m.estado)}`}>
                        {m.estado || "Activa"}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{m.nombre || `Máquina #${i + 1}`}</h3>
                    <p className="text-sm text-gray-600 mb-1">Tipo: {m.tipo || "N/A"}</p>
                    <p className="text-sm text-gray-600 mb-4">Ubicación: {m.ubicacion || "N/A"}</p>
                    <button className="w-full bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                      <Eye className="w-4 h-4" />
                      Ver detalles
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "solicitudes":
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Mis Solicitudes de Reparación</h2>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-red-500 text-white rounded-lg hover:shadow-lg transition-all font-medium flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Nueva Solicitud
              </button>
            </div>

            {loadingSolicitudes ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  </div>
                ))}
              </div>
            ) : solicitudes.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes solicitudes</h3>
                <p className="text-gray-600 mb-6">Crea una nueva solicitud de reparación</p>
                <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-red-500 text-white rounded-lg hover:shadow-lg transition-all font-medium inline-flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Nueva Solicitud
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {solicitudes.map((s) => (
                  <div key={s.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border-l-4 border-red-500">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-blue-500 rounded-lg flex items-center justify-center">
                          <Wrench className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{s.maquina}</h3>
                          <p className="text-sm text-gray-600">Solicitud #{s.id} • {s.fecha}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(s.estado)}`}>
                        {s.estado}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-4">{s.descripcion}</p>
                    <button className="w-full bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                      <Eye className="w-4 h-4" />
                      Ver detalles
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "recibos":
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Mis Recibos</h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar recibo..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {loadingRecibos ? (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 animate-pulse">
                  <div className="h-8 bg-gray-200 rounded mb-4"></div>
                </div>
              </div>
            ) : recibos.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes recibos</h3>
                <p className="text-gray-600">Los recibos aparecerán aquí cuando realices pagos</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Número</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Fecha</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Monto</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Estado</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recibos.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-red-500 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-medium text-gray-900">{r.numero}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{r.fecha}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">L. {r.monto.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(r.estado)}`}>
                            {r.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
                            <Eye className="w-4 h-4" />
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
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Bienvenido, {usuario?.nombre_usuario}
              </h2>
              <p className="text-gray-600">
                Este es tu panel de control. Gestiona tus máquinas, solicitudes y recibos.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { title: "Mis Máquinas", value: stats.totalMaquinas, bgColor: "bg-blue-100", textColor: "text-blue-600", icon: Wrench, gradient: "from-blue-500 to-blue-600" },
                { title: "Solicitudes Pendientes", value: stats.solicitudesPendientes, bgColor: "bg-red-100", textColor: "text-red-600", icon: Wrench, gradient: "from-red-500 to-red-600" },
                { title: "Total Recibos", value: stats.recibosTotal, bgColor: "bg-purple-100", textColor: "text-purple-600", icon: FileText, gradient: "from-purple-500 to-purple-600" },
              ].map((card, index) => {
                const IconComponent = card.icon;
                return (
                  <div key={index} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6">
                    <div className={`${card.bgColor} ${card.textColor} p-3 rounded-lg inline-block mb-4`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">{card.value}</h3>
                    <p className="text-sm text-gray-600">{card.title}</p>
                  </div>
                );
              })}
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Accesos Rápidos</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: "Ver Máquinas", desc: "Consulta el estado de tus equipos", icon: Wrench, action: () => setActiveSection("maquinas") },
                  { title: "Nueva Solicitud", desc: "Solicita reparación de máquina", icon: Wrench, action: () => setActiveSection("solicitudes") },
                  { title: "Mis Recibos", desc: "Consulta tu historial de pagos", icon: FileText, action: () => setActiveSection("recibos") },
                ].map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <button 
                      key={index} 
                      onClick={action.action}
                      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 text-left group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-br from-blue-500 to-red-500 text-white p-3 rounded-lg group-hover:scale-110 transition-transform">
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

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Actividad Reciente</h3>
              <div className="space-y-4">
                {[
                  { action: "Solicitud de reparación creada", item: "Compresor Industrial", time: "Hace 2 días", icon: "🔧" },
                  { action: "Recibo generado", item: "REC-002", time: "Hace 5 días", icon: "🧾" },
                  { action: "Máquina actualizada", item: "Generador 500W", time: "Hace 1 semana", icon: "⚙️" },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border-l-4 border-blue-500">
                    <div className="text-2xl">{activity.icon}</div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.item}</p>
                    </div>
                    <span className="text-xs text-gray-500">{activity.time}</span>
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
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-red-50 overflow-hidden">
      <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shadow-lg`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-gray-900 text-lg">Mi Panel</h1>
                <p className="text-xs text-gray-500">Portal Cliente</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeSection === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive ? "bg-gradient-to-r from-blue-500 to-red-500 text-white shadow-md" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <IconComponent className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            {sidebarOpen && <span className="text-sm font-medium">Ocultar</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="px-8 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {menuItems.find(item => item.id === activeSection)?.label || "Dashboard"}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Bienvenido, {usuario?.nombre_usuario}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </header>
        <div className="p-8">{renderContent()}</div>
      </main>
    </div>
  );
}