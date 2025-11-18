"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useEffect } from "react";

export default function TecnicoLayout({ children }: { children: React.ReactNode }) {
  const { usuario, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!usuario || usuario.rol !== "Tecnico") {
        router.push("/login");
      }
    }
  }, [usuario, loading, router]);

  // Mientras carga la autenticación
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Verificando autenticación...</p>
      </div>
    );
  }

  // Si no está autorizado no renderiza nada
  if (!usuario || usuario.rol !== "Tecnico") {
    return null;
  }

  return <>{children}</>;
}
