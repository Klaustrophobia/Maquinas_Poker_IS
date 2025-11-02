"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ClienteDashboardPage() {
  const { usuario } = useAuth();
  const router = useRouter();

  // Redirección por seguridad extra (aunque ya lo hace el layout)
  useEffect(() => {
    if (!usuario) router.push("/login");
    else if (usuario.rol !== "Cliente") router.push("/login");
  }, [usuario, router]);

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Bienvenido, {usuario?.nombre_usuario || "Cliente"} 👋</h2>
      <p>
        Este es tu panel de control. Desde aquí podrás ver tus máquinas,
        descargar recibos y gestionar tu cuenta.
      </p>

      <section style={{ marginTop: "2rem" }}>
        <h3>Accesos rápidos</h3>
        <ul>
          <li>
            <a href="/cliente/dashboard/maquinas">🔧 Mis Máquinas</a>
          </li>
          <li>
            <a href="/cliente/dashboard/recibos">🧾 Recibos</a>
          </li>
        </ul>
      </section>
    </div>
  );
}
