"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Usuario {
  id: number;
  nombre_usuario: string;
  rol: "Administrador" | "Tecnico" | "Cliente" | "SuperAdmin";
  correo: string;
}

interface AuthContextType {
  usuario: Usuario | null;
  setUsuario: (usuario: Usuario | null) => void;
  token: string | null;
  setToken: (token: string | null) => void;
  isAuthenticated: boolean;
  login: (userData: Usuario, authToken: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Cargar datos de autenticación al iniciar
  useEffect(() => {
    const loadAuthData = () => {
      try {
        const storedUsuario = localStorage.getItem("usuario");
        const storedToken = localStorage.getItem("token");
        
        if (storedUsuario && storedToken) {
          setUsuario(JSON.parse(storedUsuario));
          setToken(storedToken);
        }
      } catch (error) {
        console.error("Error cargando datos de autenticación:", error);
        // Limpiar datos corruptos
        localStorage.removeItem("usuario");
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    loadAuthData();
  }, []);

  const login = (userData: Usuario, authToken: string) => {
    setUsuario(userData);
    setToken(authToken);
    
    // Guardar en localStorage para persistencia
    localStorage.setItem("usuario", JSON.stringify(userData));
    localStorage.setItem("token", authToken);
  };

  const logout = () => {
    setUsuario(null);
    setToken(null);
    setLoading(false);
    
    // Limpiar localStorage
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    localStorage.removeItem("correoLogin"); // Limpiar también el correo temporal
    
    router.push("/login");
  };

  // Función para actualizar solo el usuario
  const updateUsuario = (userData: Usuario | null) => {
    setUsuario(userData);
    if (userData) {
      localStorage.setItem("usuario", JSON.stringify(userData));
    } else {
      localStorage.removeItem("usuario");
    }
  };

  // Función para actualizar solo el token
  const updateToken = (authToken: string | null) => {
    setToken(authToken);
    if (authToken) {
      localStorage.setItem("token", authToken);
    } else {
      localStorage.removeItem("token");
    }
  };

  const value: AuthContextType = {
    usuario,
    setUsuario: updateUsuario,
    token,
    setToken: updateToken,
    isAuthenticated: !!usuario && !!token,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};