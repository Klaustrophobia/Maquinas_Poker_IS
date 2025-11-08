"use client";
import { useState, useEffect } from "react";
import { Menu, X, Home, Users, Package, Wrench, Truck, LogOut, ChevronRight } from "lucide-react";

// Importa tu AuthContext aquí
// import { useAuth } from "@/app/context/AuthContext";

export default function AdminDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    ordenesPendientes: 0,
    maquinasMantenimiento: 0,
    ordenesCompletadas: 0,
  });
  const [loading, setLoading] = useState(true);
  const [proveedores, setProveedores] = useState([]);
  const [loadingProveedores, setLoadingProveedores] = useState(false);

  // Descomentar cuando uses tu AuthContext real
  // const { usuario, setUsuario, setToken } = useAuth();
  
  // Usuario de ejemplo - ELIMINA ESTAS LÍNEAS cuando descomenetes useAuth
  const usuario = { nombre_usuario: "Admin", rol: "Administrador" };
  const setUsuario = () => {};
  const setToken = () => {};

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "maquinas", label: "Máquinas", icon: Wrench },
    { id: "usuarios", label: "Usuarios", icon: Users },
    { id: "proveedores", label: "Proveedores", icon: Truck },
    { id: "repuestos", label: "Repuestos", icon: Package },
  ];

  useEffect(() => {
    setTimeout(() => {
      setStats({
        totalUsuarios: 245,
        ordenesPendientes: 18,
        maquinasMantenimiento: 12,
        ordenesCompletadas: 342,
      });
      setLoading(false);
    }, 1000);
  }, []);

  // Cargar proveedores cuando se selecciona la sección
  useEffect(() => {
    if (activeSection === "proveedores") {
      fetchProveedores();
    }
  }, [activeSection]);

  const fetchProveedores = async () => {
    setLoadingProveedores(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const res = await fetch(`${backendUrl}/api/Proveedor`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log("Proveedores cargados:", data); // Para debugging
        setProveedores(data);
      } else {
        console.error("Error al cargar proveedores:", res.status);
        setProveedores([]);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setProveedores([]);
    } finally {
      setLoadingProveedores(false);
    }
  };

  const handleLogout = () => {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem("correoLogin");
    // Redirigir al login - descomenta cuando tengas useRouter
    // router.push("/login");
    console.log("Cerrar sesión");
  };

  const renderContent = () => {
    switch (activeSection) {
      case "maquinas":
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Gestión de Máquinas</h2>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium">
                + Nueva Máquina
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Wrench className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      Activa
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Máquina #{i}</h3>
                  <p className="text-sm text-gray-600 mb-1">Modelo: Industrial X-{i}00</p>
                  <p className="text-sm text-gray-600 mb-4">Serie: MQ-2024-{String(i).padStart(3, '0')}</p>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
                      Ver detalles
                    </button>
                    <button className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                      Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "usuarios":
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h2>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium">
                + Nuevo Usuario
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nombre</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Rol</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Estado</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[
                    { nombre: "Juan Pérez", email: "juan@example.com", rol: "Administrador", estado: "Activo" },
                    { nombre: "María López", email: "maria@example.com", rol: "Técnico", estado: "Activo" },
                    { nombre: "Carlos Ruiz", email: "carlos@example.com", rol: "Cliente", estado: "Activo" },
                    { nombre: "Ana García", email: "ana@example.com", rol: "Técnico", estado: "Inactivo" },
                  ].map((user, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.nombre.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900">{user.nombre}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                          {user.rol}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.estado === "Activo" 
                            ? "bg-green-100 text-green-700" 
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {user.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "proveedores":
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Gestión de Proveedores</h2>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium">
                + Nuevo Proveedor
              </button>
            </div>

            {loadingProveedores ? (
              // Loading skeleton
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : proveedores.length === 0 ? (
              // Empty state
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay proveedores registrados</h3>
                <p className="text-gray-600 mb-6">Comienza agregando tu primer proveedor al sistema</p>
                <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium">
                  + Agregar Proveedor
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {proveedores.map((proveedor: any) => (
                  <div key={proveedor.id_proveedor} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                          <Truck className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{proveedor.nombre}</h3>
                          <p className="text-xs text-gray-500">ID: {proveedor.id_proveedor}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        Activo
                      </span>
                    </div>
                    <div className="space-y-2 mb-4">
                      {proveedor.correo && (
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="truncate">{proveedor.correo}</span>
                        </p>
                      )}
                      {proveedor.telefono && (
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {proveedor.telefono}
                        </p>
                      )}
                      {proveedor.direccion && (
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="truncate">{proveedor.direccion}</span>
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-purple-50 text-purple-600 py-2 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium">
                        Ver detalles
                      </button>
                      <button className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                        Editar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "repuestos":
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Inventario de Repuestos</h2>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium">
                + Nuevo Repuesto
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-5">
                  <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Package className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2 text-center">
                    Repuesto #{i}
                  </h3>
                  <p className="text-xs text-gray-600 mb-3 text-center">
                    Código: REP-{String(i).padStart(4, '0')}
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Stock:</span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        {Math.floor(Math.random() * 100)} uds
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Precio:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        L. {(Math.random() * 1000 + 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <button className="w-full bg-orange-50 text-orange-600 py-2 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium">
                    Ver detalles
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Bienvenido, {usuario?.nombre_usuario} 👋
              </h2>
              <p className="text-gray-600">
                Aquí está el resumen de tu sistema de gestión de órdenes y máquinas.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-8 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                ))
              ) : (
                [
                  { title: "Total de Usuarios", value: stats.totalUsuarios, bgColor: "bg-blue-100", textColor: "text-blue-600", icon: Users },
                  { title: "Órdenes Pendientes", value: stats.ordenesPendientes, bgColor: "bg-orange-100", textColor: "text-orange-600", icon: Package },
                  { title: "Máquinas en Mantenimiento", value: stats.maquinasMantenimiento, bgColor: "bg-purple-100", textColor: "text-purple-600", icon: Wrench },
                  { title: "Órdenes Completadas", value: stats.ordenesCompletadas, bgColor: "bg-green-100", textColor: "text-green-600", icon: ChevronRight },
                ].map((card, index) => {
                  const IconComponent = card.icon;
                  return (
                    <div key={index} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 cursor-pointer group">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`${card.bgColor} ${card.textColor} p-3 rounded-lg`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-1">{card.value}</h3>
                      <p className="text-sm text-gray-600">{card.title}</p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Acciones Rápidas</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: "Nuevo Usuario", desc: "Registrar un nuevo usuario", icon: Users },
                  { title: "Nueva Orden", desc: "Crear orden de reparación", icon: Package },
                  { title: "Registrar Máquina", desc: "Añadir nueva máquina", icon: Wrench },
                ].map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <button key={index} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 text-left group">
                      <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-3 rounded-lg group-hover:scale-110 transition-transform">
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

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6">
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
                  <div key={index} className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="text-2xl">{activity.icon}</div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">Por {activity.user}</p>
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

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${
        sidebarOpen ? "w-64" : "w-20"
      } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shadow-lg`}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-gray-900 text-lg">Admin Panel</h1>
                <p className="text-xs text-gray-500">Sistema de Gestión</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
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
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <IconComponent className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && (
                      <span className="font-medium text-sm">{item.label}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Section & Toggle */}
        <div className="p-4 border-t border-gray-200">
          {sidebarOpen && (
            <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                {usuario?.nombre_usuario?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{usuario?.nombre_usuario}</p>
                <p className="text-xs text-gray-500">{usuario?.rol}</p>
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              {sidebarOpen && <span className="text-sm font-medium">Ocultar</span>}
            </button>
            {sidebarOpen && (
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {menuItems.find(item => item.id === activeSection)?.label || "Dashboard"}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date().toLocaleDateString('es-HN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
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

        {/* Content */}
        <div className="p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}