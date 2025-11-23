"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function VerifyPage() {
  const [codigo, setCodigo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [correo, setCorreo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const { login } = useAuth(); // Usamos la función login del contexto
  const router = useRouter();

  useEffect(() => {
    const correoGuardado = localStorage.getItem("correoLogin");
    if (correoGuardado) {
      setCorreo(correoGuardado);
    } else {
      setMensaje("No se encontró correo, vuelve a iniciar sesión");
    }
  }, []);

  // Countdown para reenviar código
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correo) return;
    
    setIsLoading(true);
    setMensaje("");

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const res = await fetch(`${backendUrl}/api/auth/login/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, codigo_login: codigo }),
      });

      const data = await res.json();

      if (res.ok) {
        // Usamos la función login del contexto para guardar usuario y token
        login(data.usuario, data.token);
        
        // Limpiar el correo temporal del localStorage
        localStorage.removeItem("correoLogin");
        
        setMensaje("¡Verificación exitosa! Redirigiendo...");
        
        setTimeout(() => {
          // Redirigir según el rol del usuario
          if (data.usuario.rol === "Administrador") {
            router.push("/admin/dashboard");
          } else if (data.usuario.rol === "Tecnico") {
            router.push("/tecnico/dashboard");
          } else if (data.usuario.rol === "Cliente") {
            router.push("/cliente/dashboard");
          } else if (data.usuario.rol === "SuperAdmin") {
            router.push("/SuperAdmin/dashboard");
          } else {
            // Rol no reconocido, redirigir a una página por defecto
            router.push("/");
          }
        }, 1500);
      } else {
        setMensaje(data.error || "Código inválido");
      }
    } catch (error) {
      setMensaje("Error de conexión con el servidor");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
  if (!canResend || !correo) return;
  
  setIsLoading(true);
  setMensaje("");

  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const res = await fetch(`${backendUrl}/api/auth/login/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo }), // Para reenvío, solo correo podría ser suficiente
    });

    if (res.ok) {
      setMensaje("Código reenviado exitosamente");
      setCanResend(false);
      setCountdown(60);
    } else {
      const data = await res.json();
      setMensaje(data.error || "Error al reenviar el código");
    }
  } catch (error) {
    setMensaje("Error de conexión");
    console.error(error);
  } finally {
    setIsLoading(false);
  }
};

  const maskEmail = (email: string) => {
    if (!email) return "";
    const [local, domain] = email.split("@");
    const maskedLocal = local.slice(0, 2) + "***" + local.slice(-1);
    return `${maskedLocal}@${domain}`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative bg-white/80 backdrop-blur-lg p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Verifica tu código
        </h1>
        
        {correo && (
          <p className="text-gray-600 text-center mb-8">
            Hemos enviado un código de verificación a<br />
            <span className="font-semibold text-gray-800">{maskEmail(correo)}</span>
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Code Input */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código de verificación
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="000000"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                maxLength={6}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/50 text-center text-2xl font-bold tracking-widest text-black"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Ingresa el código de 6 dígitos
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || codigo.length !== 6}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verificando...
              </span>
            ) : (
              "Verificar código"
            )}
          </button>
        </form>

        {/* Message */}
        {mensaje && (
          <div className={`mt-5 p-4 rounded-xl text-center text-sm font-medium ${
            mensaje.includes("exitosa") || mensaje.includes("reenviado")
              ? "bg-green-50 text-green-700 border border-green-200" 
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {mensaje}
          </div>
        )}

        {/* Resend Code */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-2">
            ¿No recibiste el código?
          </p>
          {canResend ? (
            <button
              onClick={handleResend}
              disabled={isLoading}
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm disabled:opacity-50"
            >
              Reenviar código
            </button>
          ) : (
            <p className="text-sm text-gray-500">
              Podrás reenviar el código en{" "}
              <span className="font-semibold text-gray-700">{countdown}s</span>
            </p>
          )}
        </div>

        {/* Back to login */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => router.push("/login")}
            className="w-full text-gray-600 hover:text-gray-800 font-medium text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al inicio de sesión
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}