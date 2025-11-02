"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { usuario } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!usuario) router.push("/login");
    else if (usuario.rol !== "Administrador") router.push("/login");
  }, [usuario, router]);

  return (
    <div>
      <header>
        <h1>Administrador Dashboard</h1>
        <nav>
          <a href="/admin/dashboard">Inicio</a>
          <a href="/admin/dashboard/usuarios">Usuarios</a>
          <a href="/admin/dashboard/reportes">Reportes</a>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
