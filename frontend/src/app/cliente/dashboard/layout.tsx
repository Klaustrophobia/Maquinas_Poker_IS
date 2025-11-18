"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useEffect } from "react";

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  const { usuario, logout, loading } = useAuth();
  const router = useRouter();

  // Redirección por seguridad
  useEffect(() => {
    if (!loading) {
      if (!usuario || usuario.rol !== "Cliente") {
        router.push("/login");
      }
    }
  }, [usuario, loading, router]);

  // Mostrar mientras se verifica autenticación
  if (loading) {
    return <p>Verificando autenticación...</p>;
  }

  // Si no hay usuario o no es cliente, no renderizar nada
  if (!usuario || usuario.rol !== "Cliente") {
    return null;
  }

  // Si pasa la validación, renderiza el contenido
  return <>{children}</>;
}
