"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TecnicoDashboardPage() {
  const { usuario } = useAuth();
  const router = useRouter();

  // Redirección por seguridad extra (aunque ya lo hace el layout)
  useEffect(() => {
    if (!usuario) router.push("/login");
    else if (usuario.rol !== "Tecnico") router.push("/login");
  }, [usuario, router]);

  return (
    <div style={{ padding: "1rem" }}>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Bienvenido, {usuario?.nombre_usuario || "Tecnico"} 👋</h2>
      <p className="text-1xl font-bold text-gray-900 mb-2">
        Este es tu panel de control. Desde aquí podrás ver tus máquinas,
        ver las ordenes de trabajo y gestionar tu cuenta.
      </p>

      <section style={{ marginTop: "2rem" }}>
        <h3 className="text-1xl font-bold text-gray-900 mb-1">Accesos rápidos</h3>
        <ul className="text-1xl font-bold text-gray-900 mb-1">
          <li>
            <a href="/tecnicos/dashboard/maquinas">🔧 Mis Máquinas</a>
          </li>
          <li>
            <a href="/tecnicos/dashboard/ordenes">🧾 Ordenes</a>
          </li>
        </ul>
      </section>
    </div>
  );
}
