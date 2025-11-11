"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useEffect, useState } from "react";
import { LogOut, User, Wrench, FileText, Home } from "lucide-react";

export default function TecnicoLayout({ children }: { children: React.ReactNode }) {
  const { usuario, logout, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!loading && !usuario) {
      router.push("/login");
    } else if (!loading && usuario && usuario.rol !== "Tecnico") {
      router.push("/login");
    }
  }, [usuario, loading, router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Mostrar loading mientras verifica la autenticación
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado o no es cliente, no renderizar children
  if (!usuario || usuario.rol !== "Tecnico") {
    return null;
  }

  const menuItems = [
    { id: "dashboard", label: "Inicio", icon: Home, href: "/tecnico" },
    { id: "maquinas", label: "Mis Máquinas", icon: Wrench, href: "/tecnico/maquinas" },
    { id: "ordenes", label: "ordenes", icon: FileText, href: "/tecnico/ordenes" },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* SIDEBAR */}
      <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shadow-lg`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-gray-900 text-lg">Panel Tecnico</h1>
                <p className="text-xs text-gray-500">Bienvenido</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <li key={item.id}>
                  <a
                    href={item.href}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  >
                    <IconComponent className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          {sidebarOpen && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900">{usuario.nombre_usuario}</p>
              <p className="text-xs text-gray-500">{usuario.correo}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}