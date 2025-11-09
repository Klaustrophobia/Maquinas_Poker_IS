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

  // Ya no hay header ni navegación visible
  return <>{children}</>;
}
