"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useEffect } from "react";

export default function TecnicoLayout({ children }: { children: React.ReactNode }) {
  const { usuario } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!usuario) router.push("/login");
    else if (usuario.rol !== "Tecnico") router.push("/login");
  }, [usuario, router]);

  return (
    <div>
      <header>
        <h1>Técnico Dashboard</h1>
        <nav>
          <a href="/tecnico/dashboard">Inicio</a>
          <a href="/tecnico/dashboard/ordenes">Órdenes</a>
          <a href="/tecnico/dashboard/repuestos">Repuestos</a>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
