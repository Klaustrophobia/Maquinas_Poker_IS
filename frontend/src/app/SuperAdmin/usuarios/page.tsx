"use client";
import { useState, useEffect } from "react";
import { Users, Plus, Eye, Edit2, Trash2, Search, X } from "lucide-react";

interface Usuario {
  id: number;
  nombre_usuario: string;
  contraseña: string;
  correo: string;
  rol: string;
  activo: boolean;
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [filtroRol, setFiltroRol] = useState("todos");
  const [busquedaUsuario, setBusquedaUsuario] = useState("");
  
  // Estados para modales
  const [showAddUsuarioModal, setShowAddUsuarioModal] = useState(false);
  const [showDetailUsuarioModal, setShowDetailUsuarioModal] = useState(false);
  const [showEditUsuarioModal, setShowEditUsuarioModal] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  
  const [usuarioFormData, setUsuarioFormData] = useState({
    nombre_usuario: "",
    contraseña: "",
    correo: "",
    rol: "",
    activo: "true"
  });

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    setLoadingUsuarios(true);
    try {
      const res = await fetch(`${backendUrl}/api/Usuario`);
      if (res.ok) {
        const data = await res.json();
        console.log("Datos de usuarios recibidos:", data);
        const usuariosArray = Array.isArray(data) ? data : [];
        setUsuarios(usuariosArray);
      } else {
        console.error("Fallo al obtener usuarios:", res.status);
      }
    } catch (error) {
      console.error("Error de conexión al intentar cargar usuarios:", error);
      setUsuarios([]);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  // Validación para Usuarios
  const isUsuarioFormValid = (): boolean => {
    const baseValidation = usuarioFormData.nombre_usuario.trim() !== "" &&
                        usuarioFormData.correo.trim() !== "" &&
                        usuarioFormData.rol.trim() !== "";
                        
    if (showAddUsuarioModal) {
      return baseValidation && usuarioFormData.contraseña.trim() !== "";
    }
    
    if (showEditUsuarioModal) {
      return baseValidation;
    }
    
    return false;
  };

  // Handlers para Usuarios
  const handleAddUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log("=== DEBUG DETALLADO ===");
      
      const userData = {
        nombre_usuario: usuarioFormData.nombre_usuario.trim(),
        contraseña: usuarioFormData.contraseña,
        rol: usuarioFormData.rol,
        correo: usuarioFormData.correo.trim(),
      };

      console.log("1. Datos preparados:", JSON.stringify(userData, null, 2));
      console.log("2. URL:", `${backendUrl}/api/Usuario`);

      const res = await fetch(`${backendUrl}/api/Usuario`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(userData),
      });
      
      console.log("3. Status:", res.status);
      console.log("4. Status Text:", res.statusText);
      
      const responseText = await res.text();
      console.log("5. Respuesta completa:", responseText);
      
      if (res.ok) {
        console.log(" USUARIO CREADO EXITOSAMENTE");
        setShowAddUsuarioModal(false);
        setUsuarioFormData({ 
          nombre_usuario: "", 
          correo: "", 
          contraseña: "",
          rol: "Cliente", 
          activo: "true"
        });
        fetchUsuarios();
      } else {
        console.log("Error del servidor al crear el usuario");
        let errorData = {};
        try {
          errorData = responseText ? JSON.parse(responseText) : {};
        } catch (e) {
          console.error("Respuesta del servidor no es JSON. Error de formato:", e);
        }
        
        alert(`Error al ingresar valores para crear usuario.`);
      }
    } catch (error) {
      console.error(" ERROR DE CONEXIÓN:", error);
      alert("Error de conexión. No se pudo contactar al servidor.");
    }
  };

  const handleEditUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUsuario) return;
    
    try {
      console.log("Editando usuario:", selectedUsuario.id, usuarioFormData);
      
      const res = await fetch(`${backendUrl}/api/Usuario/${selectedUsuario.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_usuario: usuarioFormData.nombre_usuario,
          contraseña: usuarioFormData.contraseña,
          correo: usuarioFormData.correo,
          rol: usuarioFormData.rol,
          activo: usuarioFormData.activo === "true",
        }),
      });
      
      if (res.ok) {
        const updatedUser = await res.json();
        console.log("Usuario actualizado:", updatedUser);
        setShowEditUsuarioModal(false);
        setUsuarioFormData({ nombre_usuario: "", contraseña:"", correo: "", rol: "", activo: "true" });
        setSelectedUsuario(null);
        fetchUsuarios();
      } else {
        const errorData = await res.json();
        console.error("Error del servidor:", errorData);
        alert(`Error al editar el usuario: ${errorData.message || "Error desconocido"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión al editar el usuario");
    }
  };

  const handleDeleteUsuario = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este usuario?")) return;
    try {
      const res = await fetch(`${backendUrl}/api/Usuario/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchUsuarios();
      } else {
        const errorData = await res.json();
        alert(`Error al eliminar el usuario: ${errorData.message || "Error desconocido"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar el usuario");
    }
  };

  // Filtrar usuarios según búsqueda y rol
  const usuariosFiltrados = usuarios.filter((usuario: Usuario) => {
    const coincideBusqueda = usuario.nombre_usuario?.toLowerCase().includes(busquedaUsuario.toLowerCase()) ||
                            usuario.correo?.toLowerCase().includes(busquedaUsuario.toLowerCase());
    const coincideRol = filtroRol === "todos" || usuario.rol === filtroRol;
    return coincideBusqueda && coincideRol;
  });

  // Contar usuarios por rol para las estadísticas del filtro
  const contarUsuariosPorRol = (rol: string) => {
    const count = usuarios.filter((user: Usuario) => user.rol === rol).length;
    console.log(`Contando ${rol}: ${count}`);
    return count;
  };

  // Helper para mostrar estado activo como texto
  const getActivoText = (activo: boolean): string => {
    return activo ? "Activo" : "Inactivo";
  };

  // Helper para obtener clase CSS según estado activo
  const getActivoColor = (activo: boolean): string => {
    return activo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700";
  };

  // Helper para convertir boolean a string para formularios
  const booleanToString = (value: boolean): string => {
    return value ? "true" : "false";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h2>
        <button 
          onClick={() => setShowAddUsuarioModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Usuario
        </button>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-lg border border-blue-100/50 p-6 mb-6 relative overflow-hidden">
        {/* Elementos decorativos de fondo */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/10 to-purple-600/10 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-green-500/10 to-emerald-600/10 rounded-full translate-y-8 -translate-x-8"></div>
        
        <div className="flex flex-col md:flex-row gap-4 relative z-10">
          {/* Búsqueda por nombre */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar usuario</label>
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={busquedaUsuario}
                onChange={(e) => setBusquedaUsuario(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="Buscar por nombre..."
              />
            </div>
          </div>
          
          {/* Filtro por rol */}
          <div className="md:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por rol</label>
            <select
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            >
              <option value="todos">Todos los roles</option>
              <option value="Cliente">Clientes</option>
              <option value="Tecnico">Técnicos</option>
              <option value="Administrador">Administradores</option>
            </select>
          </div>
        </div>

        {/* Estadísticas de filtros */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-200 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Total:</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
              {usuarios.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Clientes:</span>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
              {contarUsuariosPorRol("Cliente")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Técnicos:</span>
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
              {contarUsuariosPorRol("Tecnico")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Administradores:</span>
            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
              {contarUsuariosPorRol("Administrador")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Mostrando:</span>
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
              {usuariosFiltrados.length} de {usuarios.length}
            </span>
          </div>
        </div>
      </div>

      {loadingUsuarios ? (
        <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-lg border border-blue-100/50 overflow-hidden relative">
          {/* Elementos decorativos de fondo */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-500/10 to-purple-600/10 rounded-full -translate-y-8 translate-x-8"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-green-500/10 to-emerald-600/10 rounded-full translate-y-8 -translate-x-8"></div>
          
          <div className="animate-pulse relative z-10">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border-b border-gray-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : usuarios.length === 0 ? (
        <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-lg border border-blue-100/50 p-12 text-center relative overflow-hidden">
          {/* Elementos decorativos de fondo */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-purple-600/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-500/10 to-emerald-600/10 rounded-full translate-y-12 -translate-x-12"></div>
          
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4 relative z-10" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2 relative z-10">No hay usuarios registrados</h3>
          <p className="text-gray-600 mb-6 relative z-10">Comienza agregando tu primer usuario al sistema</p>
          <button 
            onClick={() => setShowAddUsuarioModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium inline-flex items-center gap-2 relative z-10"
          >
            <Plus className="w-5 h-5" />
            Agregar Usuario
          </button>
        </div>
      ) : usuariosFiltrados.length === 0 ? (
        <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-lg border border-blue-100/50 p-12 text-center relative overflow-hidden">
          {/* Elementos decorativos de fondo */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-purple-600/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-500/10 to-red-600/10 rounded-full translate-y-12 -translate-x-12"></div>
          
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4 relative z-10" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2 relative z-10">No se encontraron usuarios</h3>
          <p className="text-gray-600 mb-6 relative z-10">No hay usuarios que coincidan con los filtros aplicados</p>
          <button 
            onClick={() => {
              setBusquedaUsuario("");
              setFiltroRol("todos");
            }}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium inline-flex items-center gap-2 relative z-10"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-lg border border-blue-100/50 overflow-hidden relative">
          {/* Elementos decorativos de fondo */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/10 to-purple-600/10 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-green-500/10 to-emerald-600/10 rounded-full translate-y-10 -translate-x-10"></div>
          
          <table className="w-full relative z-10">
            <thead className="bg-gradient-to-r from-gray-50 to-blue-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nombre</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Correo</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Rol</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Activo</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {usuariosFiltrados.map((user) => (
                <tr key={user.id} className="hover:bg-white/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.nombre_usuario?.charAt(0) || "U"}
                      </div>
                      <span className="font-medium text-gray-900">{user.nombre_usuario}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900">{user.correo}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                      user.rol === "administrador" ? "bg-orange-100 text-orange-700" :
                      user.rol === "tecnico" ? "bg-purple-100 text-purple-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {user.rol || ""}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getActivoColor(user.activo)}`}>
                      {getActivoText(user.activo)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { setSelectedUsuario(user); setShowDetailUsuarioModal(true); }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Ver
                      </button>
                      <button 
                        onClick={() => {
                          setUsuarioFormData({
                            nombre_usuario: user.nombre_usuario,
                            contraseña: user.contraseña,
                            correo: user.correo,
                            rol: user.rol,
                            activo: booleanToString(user.activo),
                          });
                          setSelectedUsuario(user);
                          setShowEditUsuarioModal(true);
                        }}
                        className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center gap-1"
                      >
                        <Edit2 className="w-4 h-4" />
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDeleteUsuario(user.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL DETALLE USUARIO */}
      {showDetailUsuarioModal && selectedUsuario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            {/* Elementos decorativos de fondo */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/10 to-purple-600/10 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-green-500/10 to-emerald-600/10 rounded-full translate-y-10 -translate-x-10"></div>
            
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between relative z-10">
              <h3 className="text-xl font-bold text-gray-900">Detalles del Usuario</h3>
              <button onClick={() => setShowDetailUsuarioModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 relative z-10">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                  {selectedUsuario.nombre_usuario?.charAt(0) || "U"}
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">{selectedUsuario.nombre_usuario}</h2>
              <div className="space-y-4">
                <div className="bg-white/50 rounded-lg p-4">
                  <label className="text-sm font-medium text-gray-600">ID</label>
                  <p className="text-gray-900 font-medium">{selectedUsuario.id}</p>
                </div>
                <div className="bg-white/50 rounded-lg p-4">
                  <label className="text-sm font-medium text-gray-600">Correo</label>
                  <p className="text-gray-900 font-medium">{selectedUsuario.correo}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/50 rounded-lg p-4">
                    <label className="text-sm font-medium text-gray-600">Rol</label>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mt-2 capitalize">
                      {selectedUsuario.rol || "Cliente"}
                    </span>
                  </div>
                  <div className="bg-white/50 rounded-lg p-4">
                    <label className="text-sm font-medium text-gray-600">Activo</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-2 ${getActivoColor(selectedUsuario.activo)}`}>
                      {getActivoText(selectedUsuario.activo)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowDetailUsuarioModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cerrar
                </button>
                <button 
                  onClick={() => {
                    setUsuarioFormData({
                      nombre_usuario: selectedUsuario.nombre_usuario,
                      contraseña: selectedUsuario.contraseña,
                      correo: selectedUsuario.correo,
                      rol: selectedUsuario.rol,
                      activo: booleanToString(selectedUsuario.activo),
                    });
                    setShowDetailUsuarioModal(false);
                    setShowEditUsuarioModal(true);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </button>
                <button 
                  onClick={() => {
                    setShowDetailUsuarioModal(false);
                    handleDeleteUsuario(selectedUsuario.id);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR USUARIO */}
      {showAddUsuarioModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            {/* Elementos decorativos de fondo */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-500/10 to-purple-600/10 rounded-full -translate-y-8 translate-x-8"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-green-500/10 to-emerald-600/10 rounded-full translate-y-8 -translate-x-8"></div>
            
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between relative z-10">
              <h3 className="text-xl font-bold text-gray-900">Nuevo Usuario</h3>
              <button onClick={() => setShowAddUsuarioModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddUsuario} className="p-6 space-y-4 relative z-10">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario *</label>
                <input
                  type="text"
                  required
                  value={usuarioFormData.nombre_usuario}
                  onChange={(e) => setUsuarioFormData({ ...usuarioFormData, nombre_usuario: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Nombre del usuario"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
                <input
                  type="text"
                  required
                  value={usuarioFormData.contraseña}
                  onChange={(e) => setUsuarioFormData({ ...usuarioFormData, contraseña: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Contraseña del usuario"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo *</label>
                <input
                  type="email"
                  required
                  value={usuarioFormData.correo}
                  onChange={(e) => setUsuarioFormData({ ...usuarioFormData, correo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="email@gmail.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
                <select
                  required
                  value={usuarioFormData.rol}
                  onChange={(e) => setUsuarioFormData({ ...usuarioFormData, rol: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="">Asignar rol</option>
                  <option value="Cliente">Cliente</option>
                  <option value="Tecnico">Técnico</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Activo *</label>
                <select
                  required
                  value={usuarioFormData.activo}
                  onChange={(e) => setUsuarioFormData({ ...usuarioFormData, activo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddUsuarioModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!isUsuarioFormValid()}
                  className={`flex-1 px-4 py-2 text-white rounded-lg hover:shadow-lg ${
                    isUsuarioFormValid() 
                      ? "bg-gradient-to-r from-blue-500 to-purple-600"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR USUARIO */}
      {showEditUsuarioModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            {/* Elementos decorativos de fondo */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-500/10 to-purple-600/10 rounded-full -translate-y-8 translate-x-8"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-green-500/10 to-emerald-600/10 rounded-full translate-y-8 -translate-x-8"></div>
            
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between relative z-10">
              <h3 className="text-xl font-bold text-gray-900">Editar Usuario</h3>
              <button onClick={() => setShowEditUsuarioModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleEditUsuario} className="p-6 space-y-4 relative z-10">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario *</label>
                <input
                  type="text"
                  required
                  value={usuarioFormData.nombre_usuario}
                  onChange={(e) => setUsuarioFormData({ ...usuarioFormData, nombre_usuario: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Nombre del usuario"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <input
                  type="text"
                  value={usuarioFormData.contraseña}
                  onChange={(e) => setUsuarioFormData({ ...usuarioFormData, contraseña: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Dejar vacío para no cambiar"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo *</label>
                <input
                  type="email"
                  required
                  value={usuarioFormData.correo}
                  onChange={(e) => setUsuarioFormData({ ...usuarioFormData, correo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="email@ejemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
                <select
                  required
                  value={usuarioFormData.rol}
                  onChange={(e) => setUsuarioFormData({ ...usuarioFormData, rol: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="Cliente">Cliente</option>
                  <option value="Tecnico">Técnico</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Activo *</label>
                <select
                  required
                  value={usuarioFormData.activo}
                  onChange={(e) => setUsuarioFormData({ ...usuarioFormData, activo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditUsuarioModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!isUsuarioFormValid()}
                  className={`flex-1 px-4 py-2 text-white rounded-lg hover:shadow-lg ${
                    isUsuarioFormValid() 
                      ? "bg-gradient-to-r from-blue-500 to-purple-600"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}