"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useEffect } from "react";

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  const { usuario } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!usuario) router.push("/login");
    else if (usuario.rol !== "Cliente") router.push("/login");
  }, [usuario, router]);

  return (
    <div>
      <header>
        <h1>Cliente Dashboard</h1>
        <nav>
          <a href="/cliente/dashboard">Inicio</a>
          <a href="/cliente/dashboard/maquinas">Mis Máquinas</a>
          <a href="/cliente/dashboard/recibos">Recibos</a>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
