"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, Home, Wrench, FileText, LogOut, Clipboard } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { usuario, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, href: "/cliente/dashboard" },
    { id: "maquinas", label: "Mis Máquinas", icon: Wrench, href: "/cliente/maquinas" },
    { id: "solicitudes", label: "Solicitudes", icon: Clipboard, href: "/cliente/solicitudes" },
    { id: "recibos", label: "Recibos", icon: FileText, href: "/cliente/recibos" },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const currentItem = menuItems.find(item => pathname.startsWith(item.href));
    setActiveSection(currentItem?.id || "dashboard");
  }, [pathname]);

  useEffect(() => {
    if (!mounted) return;

    const detectModal = () => {
      const modalSelectors = [
        '[role="dialog"]',
        '[aria-modal="true"]',
        '.modal',
        '.MuiModal-root',
        '.MuiDialog-root',
        '.chakra-modal',
        '.ant-modal',
        '.ReactModal__Content',
        '.ReactModal__Overlay'
      ];

      let found = false;

      modalSelectors.forEach(sel => {
        if (document.querySelector(sel)) {
          found = true;
        }
      });

      setModalOpen(found);
    };

    const observer = new MutationObserver(detectModal);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    });

    detectModal();

    return () => observer.disconnect();
  }, [mounted]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!mounted) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        <aside className="w-64 bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shadow-lg z-20">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 text-lg">Portal Cliente</h1>
                <p className="text-xs text-gray-500">Sistema de Gestión</p>
              </div>
            </div>
          </div>
        </aside>
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto relative">
            <div className="p-6">{children}</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* SIDEBAR MEJORADO */}
      {!modalOpen && (
        <aside
          className={`${sidebarOpen ? "w-64" : "w-20"} 
          bg-gradient-to-b from-white via-red-50/30 to-white
          border-r border-red-100/50 transition-all duration-300 flex flex-col shadow-xl z-20
          relative overflow-hidden`}
        >
          {/* Circulitos decorativos */}
          <div className="absolute top-4 -right-2 w-6 h-6 bg-gradient-to-br from-red-300 to-red-500 rounded-full opacity-60 blur-sm"></div>
          <div className="absolute top-16 -left-3 w-8 h-8 bg-gradient-to-br from-red-300 to-red-600 rounded-full opacity-40 blur-sm"></div>
          <div className="absolute bottom-20 -right-3 w-7 h-7 bg-gradient-to-br from-red-400 to-red-500 rounded-full opacity-50 blur-sm"></div>
          <div className="absolute bottom-10 left-4 w-5 h-5 bg-gradient-to-br from-red-400 to-red-300 rounded-full opacity-30 blur-sm"></div>
          
          {/* Efecto de patrón sutil */}
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(239,68,68,0.03)_25%,rgba(239,68,68,0.03)_50%,transparent_50%,transparent_75%,rgba(239,68,68,0.03)_75%)] bg-[length:8px_8px]"></div>
          
          {/* Brillo superior */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-200/50 to-transparent"></div>
          
          <div className="relative p-6 border-b border-red-100/50 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-xl 
                              flex items-center justify-center shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <Wrench className="w-5 h-5 text-white relative z-10" />
              </div>

              {sidebarOpen && (
                <div className="relative">
                  <h1 className="font-bold text-gray-900 text-lg relative z-10">
                    Portal Cliente
                  </h1>
                  <p className="text-xs text-gray-500 relative z-10">Sistema de Gestión</p>
                </div>
              )}
            </div>
          </div>

          <nav className="flex-1 p-4 overflow-y-auto relative z-10">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeSection === item.id;

                return (
                  <li key={item.id}>
                    <a
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        router.push(item.href);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden group ${
                        isActive
                          ? `bg-gradient-to-r from-red-400 to-red-600 text-white shadow-lg shadow-red-400/25`
                          : "text-gray-700 hover:bg-white/80 hover:shadow-md border border-transparent hover:border-red-100/50"
                      }`}
                    >
                      <IconComponent className={`w-5 h-5 relative z-10 ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-red-600'}`} />
                      {sidebarOpen && (
                        <span className={`font-medium text-sm relative z-10 ${isActive ? 'text-white' : 'text-gray-700 group-hover:text-gray-900'}`}>
                          {item.label}
                        </span>
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="relative p-4 border-t border-red-100/50 bg-white/80 backdrop-blur-sm z-10">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 
                         bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-xl 
                         hover:from-gray-100 hover:to-gray-200 transition-all duration-200
                         border border-gray-200/50 hover:border-gray-300/50 shadow-sm
                         relative overflow-hidden group"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              {sidebarOpen && <span className="text-sm font-medium">Ocultar</span>}
            </button>
          </div>
        </aside>
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER MEJORADO */}
        {!modalOpen && (
          <header className="bg-gradient-to-r from-white via-red-50/20 to-white
                          border-b border-red-100/50 sticky top-0 shadow-sm z-30
                          relative overflow-hidden">
            <div className="relative px-8 py-4 flex items-center justify-between backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-gradient-to-b from-red-400 to-red-600 rounded-full"></div>
                <div className="relative">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent relative z-10">
                    ProATS - Cliente
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <span className="text-sm text-gray-600 bg-white/80 px-3 py-1 rounded-full border border-red-100/50 relative">
                    Bienvenido {usuario?.nombre_usuario}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-gradient-to-r from-red-50 to-red-100 text-red-600 rounded-xl 
                             hover:from-red-100 hover:to-red-200 font-medium text-sm flex items-center gap-2 
                             transition-all duration-200 border border-red-200/50 hover:border-red-300/50
                             shadow-sm hover:shadow-md relative overflow-hidden group"
                >
                  <LogOut className="w-4 h-4 relative z-10" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          </header>
        )}

        <main className="flex-1 overflow-y-auto relative">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}