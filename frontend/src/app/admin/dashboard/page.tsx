"use client";
import { useState, useEffect } from "react";
import { Menu, X, Home, Users, Package, Wrench, Truck, LogOut, Plus, Eye, Edit2, Trash2 } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [stats, setStats] = useState({
    totalUsuarios: 245,
    ordenesPendientes: 0,
    maquinasMantenimiento: 0,
    ordenesCompletadas: 0,
  });
  
  const [proveedores, setProveedores] = useState([]);
  const [loadingProveedores, setLoadingProveedores] = useState(false);
  const [maquinas, setMaquinas] = useState([]);
  const [loadingMaquinas, setLoadingMaquinas] = useState(false);
  const [repuestos, setRepuestos] = useState([]);
  const [loadingRepuestos, setLoadingRepuestos] = useState(false);
  
  // Estados para modales de Repuestos
  const [showAddRepuestoModal, setShowAddRepuestoModal] = useState(false);
  const [showDetailRepuestoModal, setShowDetailRepuestoModal] = useState(false);
  const [selectedRepuesto, setSelectedRepuesto] = useState(null);
  const [repuestoFormData, setRepuestoFormData] = useState({
    nombre: "",
    proveedor_id: "",
    cantidad: "",
    ubicacion: "",
    estado: "Disponible"
  });

  // Estados para modales de Proveedores
  const [showAddProveedorModal, setShowAddProveedorModal] = useState(false);
  const [showDetailProveedorModal, setShowDetailProveedorModal] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState(null);
  const [proveedorFormData, setProveedorFormData] = useState({
    nombre: "",
    informacion_contacto: "",
    direccion: ""
  });

  // Estados para modales de Máquinas
  const [showAddMaquinaModal, setShowAddMaquinaModal] = useState(false);
  const [showDetailMaquinaModal, setShowDetailMaquinaModal] = useState(false);
  const [selectedMaquina, setSelectedMaquina] = useState(null);
  const [maquinaFormData, setMaquinaFormData] = useState({
    nombre: "",
    tipo: "",
    estado: "Fuera de servicio"
  });

  const { usuario, logout } = useAuth();
  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "maquinas", label: "Máquinas", icon: Wrench },
    { id: "usuarios", label: "Usuarios", icon: Users },
    { id: "proveedores", label: "Proveedores", icon: Truck },
    { id: "repuestos", label: "Repuestos", icon: Package },
  ];

  useEffect(() => {
    fetchProveedores();
    fetchMaquinas();
    fetchRepuestos();
  }, []);

  useEffect(() => {
    if (activeSection === "proveedores") fetchProveedores();
    if (activeSection === "maquinas") fetchMaquinas();
    if (activeSection === "repuestos") fetchRepuestos();
  }, [activeSection]);

  const fetchProveedores = async () => {
    setLoadingProveedores(true);
    try {
      const res = await fetch(`${backendUrl}/api/Proveedor`);
      if (res.ok) {
        const data = await res.json();
        setProveedores(Array.isArray(data) ? data : []);
        setStats(prev => ({ ...prev, ordenesPendientes: data.length }));
      }
    } catch (error) {
      console.error("Error:", error);
      setProveedores([]);
    } finally {
      setLoadingProveedores(false);
    }
  };

  const fetchMaquinas = async () => {
    setLoadingMaquinas(true);
    try {
      const res = await fetch(`${backendUrl}/api/Maquina`);
      if (res.ok) {
        const data = await res.json();
        const maquinasArray = Array.isArray(data) ? data : [];
        setMaquinas(maquinasArray);
        const enMantenimiento = maquinasArray.filter((m) => 
          String(m.estado || "").toLowerCase().includes("mantenimiento")
        ).length;
        setStats(prev => ({ ...prev, maquinasMantenimiento: enMantenimiento }));
      }
    } catch (error) {
      console.error("Error:", error);
      setMaquinas([]);
    } finally {
      setLoadingMaquinas(false);
    }
  };

  const fetchRepuestos = async () => {
    setLoadingRepuestos(true);
    try {
      const res = await fetch(`${backendUrl}/api/repuestos`);
      if (res.ok) {
        const data = await res.json();
        const repuestosArray = Array.isArray(data) ? data : [];
        setRepuestos(repuestosArray);
        setStats(prev => ({ ...prev, ordenesCompletadas: repuestosArray.length }));
      }
    } catch (error) {
      console.error("Error:", error);
      setRepuestos([]);
    } finally {
      setLoadingRepuestos(false);
    }
  };

  // Handlers para Repuestos
  const handleAddRepuesto = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${backendUrl}/api/repuestos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(repuestoFormData),
      });
      if (res.ok) {
        setShowAddRepuestoModal(false);
        setRepuestoFormData({ nombre: "", proveedor_id: "", cantidad: "", ubicacion: "", estado: "Disponible" });
        fetchRepuestos();
      } else {
        alert("Error al crear el repuesto");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al crear el repuesto");
    }
  };

  // Handlers para Proveedores
  const handleAddProveedor = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${backendUrl}/api/Proveedor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proveedorFormData),
      });
      if (res.ok) {
        setShowAddProveedorModal(false);
        setProveedorFormData({ nombre: "", informacion_contacto: "", direccion: "" });
        fetchProveedores();
      } else {
        alert("Error al crear el proveedor");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al crear el proveedor");
    }
  };

  // Handlers para Máquinas
  const handleAddMaquina = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${backendUrl}/api/Maquina`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(maquinaFormData),
      });
      if (res.ok) {
        setShowAddMaquinaModal(false);
        setMaquinaFormData({ nombre: "", tipo: "", estado: "Fuera de servicio" });
        fetchMaquinas();
      } else {
        alert("Error al crear la máquina");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al crear la máquina");
    }
  };

  const getEstadoColor = (estado) => {
    const estadoLower = String(estado || "").toLowerCase();
    if (estadoLower.includes("disponible") || estadoLower.includes("activ")) return "bg-green-100 text-green-700";
    if (estadoLower.includes("uso") || estadoLower.includes("mantenimiento")) return "bg-blue-100 text-blue-700";
    if (estadoLower.includes("agotado") || estadoLower.includes("inactiv")) return "bg-red-100 text-red-700";
    if (estadoLower.includes("pedido")) return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-700";
  };

  const getCantidadColor = (cantidad) => {
    if (cantidad === 0) return "bg-red-100 text-red-700";
    if (cantidad < 10) return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
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
              <h2 className="text-3xl font-bold text-gray-900">Gestión de Máquinas</h2>
              <button 
                onClick={() => setShowAddMaquinaModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nueva Máquina
              </button>
            </div>

            {loadingMaquinas ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                    <div className="h-12 bg-gray-200 rounded mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : maquinas.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay máquinas registradas</h3>
                <p className="text-gray-600 mb-6">Agrega una máquina para comenzar</p>
                <button 
                  onClick={() => setShowAddMaquinaModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Agregar Primera Máquina
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {maquinas.map((m, i) => (
                  <div key={m.id_maquina || i} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Wrench className="w-6 h-6 text-blue-600" />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(m.estado)}`}>
                        {m.estado || "Activa"}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{m.nombre || `Máquina #${i + 1}`}</h3>
                    <p className="text-sm text-gray-600 mb-1">Modelo: {m.modelo || "N/A"}</p>
                    <p className="text-sm text-gray-600 mb-4">Serie: {m.serie || "N/A"}</p>
                    <button 
                      onClick={() => { setSelectedMaquina(m); setShowDetailMaquinaModal(true); }}
                      className="w-full bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Ver detalles
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "usuarios":
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h2>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Nuevo Usuario
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
                          user.estado === "Activo" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
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
              <button 
                onClick={() => setShowAddProveedorModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nuevo Proveedor
              </button>
            </div>

            {loadingProveedores ? (
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
                  </div>
                ))}
              </div>
            ) : proveedores.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay proveedores registrados</h3>
                <p className="text-gray-600 mb-6">Comienza agregando tu primer proveedor al sistema</p>
                <button 
                  onClick={() => setShowAddProveedorModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Agregar Proveedor
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {proveedores.map((proveedor) => (
                  <div key={proveedor.id_proveedor} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
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
                          📧 <span className="truncate">{proveedor.correo}</span>
                        </p>
                      )}
                      {proveedor.telefono && (
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          📞 {proveedor.telefono}
                        </p>
                      )}
                      {proveedor.direccion && (
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          📍 <span className="truncate">{proveedor.direccion}</span>
                        </p>
                      )}
                    </div>
                    <button 
                      onClick={() => { setSelectedProveedor(proveedor); setShowDetailProveedorModal(true); }}
                      className="w-full bg-purple-50 text-purple-600 py-2 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Ver detalles
                    </button>
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
              <button 
                onClick={() => setShowAddRepuestoModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nuevo Repuesto
              </button>
            </div>

            {loadingRepuestos ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm p-5 animate-pulse">
                    <div className="w-20 h-20 bg-gray-200 rounded-xl mx-auto mb-4"></div>
                  </div>
                ))}
              </div>
            ) : repuestos.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay repuestos registrados</h3>
                <p className="text-gray-600 mb-6">Agrega repuestos al inventario para comenzar</p>
                <button 
                  onClick={() => setShowAddRepuestoModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Agregar Primer Repuesto
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {repuestos.map((r) => (
                  <div key={r.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-5 group">
                    <div className="flex justify-center mb-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Package className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-2 text-center truncate" title={r.nombre}>
                      {r.nombre}
                    </h3>
                    <p className="text-xs text-gray-600 mb-3 text-center truncate">
                      {r.proveedor?.nombre || "N/A"}
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Cantidad:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCantidadColor(r.cantidad || 0)}`}>
                          {r.cantidad || 0} uds
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Estado:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getEstadoColor(r.estado)}`}>
                          {r.estado}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => { setSelectedRepuesto(r); setShowDetailRepuestoModal(true); }}
                      className="w-full bg-orange-50 text-orange-600 py-2 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Ver detalles
                    </button>
                  </div>
                ))}
              </div>
            )}
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { title: "Total de Usuarios", value: stats.totalUsuarios, bgColor: "bg-blue-100", textColor: "text-blue-600", icon: Users },
                { title: "Proveedores", value: stats.ordenesPendientes, bgColor: "bg-orange-100", textColor: "text-orange-600", icon: Truck },
                { title: "Máquinas en Mantenimiento", value: stats.maquinasMantenimiento, bgColor: "bg-purple-100", textColor: "text-purple-600", icon: Wrench },
                { title: "Repuestos", value: stats.ordenesCompletadas, bgColor: "bg-green-100", textColor: "text-green-600", icon: Package },
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
              })}
            </div>

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
      {/* SIDEBAR */}
      <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shadow-lg`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Package className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-gray-900 text-lg">Admin Panel</h1>
                <p className="text-xs text-gray-500">Sistema de Gestión</p>
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
                      isActive ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md" : "text-gray-700 hover:bg-gray-100"
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
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors mb-2"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            {sidebarOpen && <span className="text-sm font-medium">Ocultar</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
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

      {/* MODAL AGREGAR PROVEEDOR */}
      {showAddProveedorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Nuevo Proveedor</h3>
              <button onClick={() => setShowAddProveedorModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={proveedorFormData.nombre}
                  onChange={(e) => setProveedorFormData({ ...proveedorFormData, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre del proveedor"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Información de Contacto</label>
                <input
                  type="text"
                  value={proveedorFormData.informacion_contacto}
                  onChange={(e) => setProveedorFormData({ ...proveedorFormData, informacion_contacto: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Email o teléfono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <textarea
                  value={proveedorFormData.direccion}
                  onChange={(e) => setProveedorFormData({ ...proveedorFormData, direccion: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Dirección completa"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddProveedorModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddProveedor}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg"
                >
                  Crear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE PROVEEDOR */}
      {showDetailProveedorModal && selectedProveedor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Detalles del Proveedor</h3>
              <button onClick={() => setShowDetailProveedorModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Truck className="w-12 h-12 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">{selectedProveedor.nombre}</h2>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-medium text-gray-600">ID</label>
                  <p className="text-gray-900 font-medium">{selectedProveedor.id_proveedor}</p>
                </div>
                {selectedProveedor.correo && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900 font-medium">{selectedProveedor.correo}</p>
                  </div>
                )}
                {selectedProveedor.telefono && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="text-sm font-medium text-gray-600">Teléfono</label>
                    <p className="text-gray-900 font-medium">{selectedProveedor.telefono}</p>
                  </div>
                )}
                {selectedProveedor.direccion && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="text-sm font-medium text-gray-600">Dirección</label>
                    <p className="text-gray-900 font-medium">{selectedProveedor.direccion}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowDetailProveedorModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cerrar
                </button>
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                  <Edit2 className="w-4 h-4" />
                  Editar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR MÁQUINA */}
      {showAddMaquinaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Nueva Máquina</h3>
              <button onClick={() => setShowAddMaquinaModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={maquinaFormData.nombre}
                  onChange={(e) => setMaquinaFormData({ ...maquinaFormData, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre de la máquina"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                <input
                  type="text"
                  value={maquinaFormData.modelo}
                  onChange={(e) => setMaquinaFormData({ ...maquinaFormData, modelo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Modelo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Serie</label>
                <input
                  type="text"
                  value={maquinaFormData.serie}
                  onChange={(e) => setMaquinaFormData({ ...maquinaFormData, serie: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Número de serie"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                <select
                  required
                  value={maquinaFormData.estado}
                  onChange={(e) => setMaquinaFormData({ ...maquinaFormData, estado: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Activa">Activa</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                  <option value="Inactiva">Inactiva</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddMaquinaModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddMaquina}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg"
                >
                  Crear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE MÁQUINA */}
      {showDetailMaquinaModal && selectedMaquina && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Detalles de la Máquina</h3>
              <button onClick={() => setShowDetailMaquinaModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Wrench className="w-12 h-12 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">{selectedMaquina.nombre}</h2>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-medium text-gray-600">ID</label>
                  <p className="text-gray-900 font-medium">{selectedMaquina.id_maquina}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="text-sm font-medium text-gray-600">Modelo</label>
                    <p className="text-gray-900 font-medium">{selectedMaquina.modelo || "N/A"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="text-sm font-medium text-gray-600">Serie</label>
                    <p className="text-gray-900 font-medium">{selectedMaquina.serie || "N/A"}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-medium text-gray-600">Estado</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-2 ${getEstadoColor(selectedMaquina.estado)}`}>
                    {selectedMaquina.estado || "Activa"}
                  </span>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowDetailMaquinaModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cerrar
                </button>
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                  <Edit2 className="w-4 h-4" />
                  Editar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR REPUESTO */}
      {showAddRepuestoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Nuevo Repuesto</h3>
              <button onClick={() => setShowAddRepuestoModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={repuestoFormData.nombre}
                  onChange={(e) => setRepuestoFormData({ ...repuestoFormData, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre del repuesto"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor *</label>
                <select
                  required
                  value={repuestoFormData.proveedor_id}
                  onChange={(e) => setRepuestoFormData({ ...repuestoFormData, proveedor_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar...</option>
                  {proveedores.map((p) => (
                    <option key={p.id_proveedor} value={p.id_proveedor}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={repuestoFormData.cantidad}
                  onChange={(e) => setRepuestoFormData({ ...repuestoFormData, cantidad: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                <input
                  type="text"
                  value={repuestoFormData.ubicacion}
                  onChange={(e) => setRepuestoFormData({ ...repuestoFormData, ubicacion: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Estante A-12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                <select
                  required
                  value={repuestoFormData.estado}
                  onChange={(e) => setRepuestoFormData({ ...repuestoFormData, estado: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Disponible">Disponible</option>
                  <option value="En uso">En uso</option>
                  <option value="Agotado">Agotado</option>
                  <option value="En pedido">En pedido</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddRepuestoModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddRepuesto}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg"
                >
                  Crear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE REPUESTO */}
      {showDetailRepuestoModal && selectedRepuesto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Detalles del Repuesto</h3>
              <button onClick={() => setShowDetailRepuestoModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                  <Package className="w-12 h-12 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">{selectedRepuesto.nombre}</h2>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-medium text-gray-600">ID</label>
                  <p className="text-gray-900 font-medium">{selectedRepuesto.id}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-medium text-gray-600">Proveedor</label>
                  <p className="text-gray-900 font-medium">{selectedRepuesto.proveedor?.nombre || "N/A"}</p>
                  {selectedRepuesto.proveedor?.informacion_contacto && (
                    <p className="text-sm text-gray-600 mt-1">{selectedRepuesto.proveedor.informacion_contacto}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="text-sm font-medium text-gray-600">Cantidad</label>
                    <p className="text-2xl font-bold text-gray-900">{selectedRepuesto.cantidad || 0} uds</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="text-sm font-medium text-gray-600">Estado</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-2 ${getEstadoColor(selectedRepuesto.estado)}`}>
                      {selectedRepuesto.estado}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-medium text-gray-600">Ubicación</label>
                  <p className="text-gray-900 font-medium">{selectedRepuesto.ubicacion || "No especificada"}</p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowDetailRepuestoModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cerrar
                </button>
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                  <Edit2 className="w-4 h-4" />
                  Editar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}