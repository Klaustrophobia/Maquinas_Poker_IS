"use client";
import React, { useState, useEffect } from "react";
import { 
  Wrench, Plus, Eye, Search, Clock, CheckCircle, XCircle, AlertCircle, 
  FileText, History, User, Calendar, Package, X, Info, Bell
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

// Interfaces basadas en el backend
interface Maquina {
  id: number;
  nombre: string;
  tipo: string;
  estado: string;
}

interface Solicitud {
  id: number;
  cliente_id: number;
  maquina_id: number;
  descripcion_falla: string;
  gravedad: 'leve' | 'moderada' | 'grave';
  estado: 'pendiente' | 'tecnico_asignado' | 'prefinalizada' | 'finalizada';
  tecnico_asignado_id?: number;
  fecha_hora_reparacion?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  observaciones_tecnico?: string;
  fecha_reparacion_terminada?: string;
  fecha_finalizada?: string;
}

interface SolicitudDetalles extends Solicitud {
  maquina?: {
    id: number;
    nombre: string;
    tipo: string;
    estado: string;
  };
  tecnico_asignado?: {
    id: number;
    nombre_usuario: string;
    correo: string;
  };
  repuestos_utilizados?: Array<{
    id: number;
    repuesto: {
      id: number;
      nombre: string;
    };
    cantidad_utilizada: number;
  }>;
}

interface NuevaSolicitud {
  maquina_id: number;
  descripcion_falla: string;
  gravedad: 'leve' | 'moderada' | 'grave';
}

// Interfaces para notificaciones
interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  tipo: string;
  leida: boolean;
  fecha_creacion: string;
  relacion_id?: number;
  usuario: {
    id: number;
    nombre_usuario: string;
    correo: string;
  };
}

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState<number>(0);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);
  const [loadingMaquinas, setLoadingMaquinas] = useState(false);
  const [loadingDetalles, setLoadingDetalles] = useState(false);
  const [loadingNotificaciones, setLoadingNotificaciones] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalDetalles, setModalDetalles] = useState(false);
  const [modalNotificaciones, setModalNotificaciones] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<SolicitudDetalles | null>(null);
  const [nuevaSolicitud, setNuevaSolicitud] = useState<NuevaSolicitud>({
    maquina_id: 0,
    descripcion_falla: "",
    gravedad: "leve"
  });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"nueva" | "historial">("nueva");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { usuario } = useAuth();
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  // Efecto principal para cargar datos
  useEffect(() => {
    if (usuario?.id) {
      fetchSolicitudes();
      fetchMaquinasCliente();
      fetchNotificaciones();
      startPolling();
    }
  }, [usuario]);

  // Polling para notificaciones en tiempo real
  const startPolling = () => {
    const interval = setInterval(() => {
      if (usuario?.id) {
        fetchNotificaciones();
      }
    }, 30000); // Actualizar cada 30 segundos

    return () => clearInterval(interval);
  };

  // Fetch de notificaciones - CORREGIDO
  const fetchNotificaciones = async (): Promise<void> => {
    if (!usuario?.id) return;

    setLoadingNotificaciones(true);
    try {
      const response = await fetch(`${backendUrl}/api/notificaciones/usuario/${usuario.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setNotificaciones(data.data);
          const noLeidas = data.data.filter((n: Notificacion) => !n.leida).length;
          setNotificacionesNoLeidas(noLeidas);
        }
      } else {
        console.warn("No se pudieron cargar las notificaciones:", response.status);
      }
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
      // No mostramos error al usuario para no interrumpir la experiencia
    } finally {
      setLoadingNotificaciones(false);
    }
  };

  // Marcar notificación como leída - CORREGIDO
  const marcarNotificacionLeida = async (notificacionId: number): Promise<void> => {
    try {
      const response = await fetch(`${backendUrl}/api/notificaciones/${notificacionId}/leer`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Actualizar estado local
        setNotificaciones(prev => 
          prev.map(n => n.id === notificacionId ? { ...n, leida: true } : n)
        );
        setNotificacionesNoLeidas(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error);
    }
  };

  // Marcar todas las notificaciones como leídas - CORREGIDO
  const marcarTodasNotificacionesLeidas = async (): Promise<void> => {
    try {
      const response = await fetch(`${backendUrl}/api/notificaciones/usuario/${usuario?.id}/marcar-todas-leidas`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Actualizar estado local
        setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
        setNotificacionesNoLeidas(0);
        setModalNotificaciones(false);
      }
    } catch (error) {
      console.error("Error al marcar todas las notificaciones como leídas:", error);
    }
  };


  const fetchSolicitudes = async (): Promise<void> => {
    setLoadingSolicitudes(true);
    setError(null);
    try {
      const response = await fetch(`${backendUrl}/api/SolicitudReparacion`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status} al cargar solicitudes`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        setSolicitudes(data.data);
      } else {
        setSolicitudes([]);
      }
    } catch (error) {
      console.error("Error al cargar solicitudes:", error);
      setError(error instanceof Error ? error.message : "Error al cargar solicitudes");
      setSolicitudes([]);
    } finally {
      setLoadingSolicitudes(false);
    }
  };

  const fetchMaquinasCliente = async (): Promise<void> => {
    setLoadingMaquinas(true);
    setError(null);
    try {
      const response = await fetch(`${backendUrl}/api/Maquina-Cliente/listarTodas`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status} al cargar máquinas`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const maquinasCliente = data
          .filter((item: any) => item.cliente?.id === usuario?.id)
          .map((item: any) => item.maquina);
        setMaquinas(maquinasCliente);
      } else {
        setMaquinas([]);
      }
    } catch (error) {
      console.error("Error al cargar máquinas:", error);
      setError(error instanceof Error ? error.message : "Error al cargar máquinas");
      setMaquinas([]);
    } finally {
      setLoadingMaquinas(false);
    }
  };

  const fetchSolicitudDetalles = async (solicitudId: number): Promise<SolicitudDetalles | null> => {
    try {
      const response = await fetch(`${backendUrl}/api/SolicitudReparacion/${solicitudId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status} al cargar detalles`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        // Cargar repuestos utilizados
        try {
          const repuestosResponse = await fetch(`${backendUrl}/api/SolicitudReparacion/${solicitudId}/repuestos`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (repuestosResponse.ok) {
            const repuestosData = await repuestosResponse.json();
            if (repuestosData.success && repuestosData.data) {
              return {
                ...data.data,
                repuestos_utilizados: repuestosData.data
              };
            }
          }
        } catch (repuestosError) {
          console.error(`Error al cargar repuestos para solicitud ${solicitudId}:`, repuestosError);
        }
        
        return data.data;
      } else {
        throw new Error(data.message || 'Error al cargar detalles');
      }
    } catch (error) {
      console.error("Error al cargar detalles:", error);
      return null;
    }
  };

  // FUNCIÓN MEJORADA: Usar el nuevo endpoint específico
  const crearSolicitud = async (): Promise<void> => {
    if (!nuevaSolicitud.maquina_id || !nuevaSolicitud.descripcion_falla) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    setEnviando(true);
    setError(null);
    try {
      // 1. Crear la solicitud de reparación
      const response = await fetch(`${backendUrl}/api/SolicitudReparacion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cliente_id: usuario?.id,
          maquina_id: nuevaSolicitud.maquina_id,
          descripcion_falla: nuevaSolicitud.descripcion_falla,
          gravedad: nuevaSolicitud.gravedad
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status} al crear solicitud`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        const solicitudCreada = data.data;
        
        // 2. Obtener información de la máquina para la notificación
        const maquinaSeleccionada = maquinas.find(m => m.id === nuevaSolicitud.maquina_id);
        const nombreMaquina = maquinaSeleccionada?.nombre || `Máquina #${nuevaSolicitud.maquina_id}`;
        
        // 3. Notificar a todos los administradores usando el nuevo endpoint
        try {
          const notificacionResponse = await fetch(`${backendUrl}/api/notificaciones/nueva-solicitud`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              titulo: "Nueva Solicitud de Reparación",
              mensaje: `El cliente ${usuario?.nombre_usuario} ha creado una nueva solicitud de reparación para la máquina "${nombreMaquina}". Descripción: ${nuevaSolicitud.descripcion_falla}`,
              solicitud_id: solicitudCreada.id,
              cliente_nombre: usuario?.nombre_usuario,
              maquina_nombre: nombreMaquina
            }),
          });

          if (notificacionResponse.ok) {
            const notificacionData = await notificacionResponse.json();
            console.log("✅ Notificaciones enviadas a administradores:", notificacionData);
          } else {
            console.warn("⚠️ No se pudieron enviar notificaciones, pero la solicitud se creó correctamente");
          }
        } catch (notificacionError) {
          console.error("Error enviando notificaciones:", notificacionError);
          // No bloqueamos el flujo si falla la notificación
        }

        setSuccessMessage('Solicitud creada exitosamente. Se han enviado notificaciones al equipo técnico.');
        setModalAbierto(false);
        setNuevaSolicitud({
          maquina_id: 0,
          descripcion_falla: "",
          gravedad: "leve"
        });
        
        // 4. Actualizar datos
        fetchSolicitudes();
        fetchMaquinasCliente();
        fetchNotificaciones();
        setActiveTab("historial");
        
        // Ocultar mensaje de éxito después de 5 segundos
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        throw new Error(data.message || 'Error al crear solicitud');
      }
    } catch (error) {
      console.error("Error al crear solicitud:", error);
      alert('Error al crear solicitud: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    } finally {
      setEnviando(false);
    }
  };

  // Función para notificar a administradores sobre reparación finalizada
const notificarReparacionFinalizada = async (
  solicitudId: number,
  clienteNombre: string,
  maquinaNombre: string,
  tecnicoNombre?: string
): Promise<boolean> => {
  try {
    console.log("🔔 Intentando notificar a administradores sobre reparación finalizada...");

    const payload = {
      solicitud_id: Number(solicitudId),
      cliente_nombre: clienteNombre,
      maquina_nombre: maquinaNombre,
      tecnico_nombre: tecnicoNombre || 'No asignado'
    };

    console.log("📤 Enviando payload a administradores:", payload);

    const response = await fetch(`${backendUrl}/api/notificaciones/reparacion-finalizada`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log("📥 Respuesta del servidor (admin):", response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Error del servidor al notificar administradores:", errorData);
      return false;
    }

    const data = await response.json();
    console.log("✅ Notificación enviada a administradores exitosamente:", data);
    
    return data.success === true;

  } catch (error) {
    console.error("❌ Error al notificar administradores:", error);
    return false;
  }
};

// FUNCIÓN MODIFICADA: Finalizar solicitud y notificar a administradores
const finalizarSolicitud = async (solicitudId: number): Promise<void> => {
  try {
    console.log("🔄 Iniciando proceso de finalización para solicitud:", solicitudId);

    // 1. Primero obtener los detalles actualizados de la solicitud
    const detallesResponse = await fetch(`${backendUrl}/api/SolicitudReparacion/${solicitudId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!detallesResponse.ok) {
      throw new Error(`Error ${detallesResponse.status} al obtener detalles de la solicitud`);
    }
    
    const detallesData = await detallesResponse.json();
    
    if (!detallesData.success || !detallesData.data) {
      throw new Error('No se pudieron obtener los detalles de la solicitud');
    }

    const solicitudDetalles = detallesData.data;
    const nombreMaquina = solicitudDetalles.maquina?.nombre || getNombreMaquina(solicitudDetalles.maquina_id);
    const nombreTecnico = solicitudDetalles.tecnico_asignado?.nombre_usuario;

    // 2. Marcar como finalizada en el backend
    const response = await fetch(`${backendUrl}/api/SolicitudReparacion/${solicitudId}/finalizar`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status} al finalizar solicitud`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      // 3. Notificar a los administradores
      const notificacionEnviada = await notificarReparacionFinalizada(
        solicitudId,
        usuario?.nombre_usuario || 'Cliente',
        nombreMaquina,
        nombreTecnico
      );

      let mensaje = 'Reparación verificada y finalizada exitosamente. ';
      mensaje += notificacionEnviada 
        ? 'Se han enviado notificaciones al equipo administrativo.' 
        : 'Reparación finalizada pero hubo un error al notificar al equipo administrativo.';
      
      setSuccessMessage(mensaje);
      fetchSolicitudes();
      fetchNotificaciones(); // Actualizar notificaciones
      setModalDetalles(false);
      
      // Ocultar mensaje de éxito después de 5 segundos
      setTimeout(() => setSuccessMessage(null), 5000);
    } else {
      throw new Error(data.message || 'Error al finalizar solicitud');
    }
  } catch (error) {
    console.error("Error al finalizar solicitud:", error);
    alert('Error al finalizar solicitud: ' + (error instanceof Error ? error.message : 'Error desconocido'));
  }
};

  const abrirModalDetalles = async (solicitud: Solicitud): Promise<void> => {
    setLoadingDetalles(true);
    try {
      const detalles = await fetchSolicitudDetalles(solicitud.id);
      if (detalles) {
        setSolicitudSeleccionada(detalles);
        setModalDetalles(true);
      } else {
        // Si no podemos cargar los detalles, mostramos los datos básicos
        const detallesBasicos: SolicitudDetalles = {
          ...solicitud,
          maquina: maquinas.find(m => m.id === solicitud.maquina_id),
          repuestos_utilizados: []
        };
        setSolicitudSeleccionada(detallesBasicos);
        setModalDetalles(true);
      }
    } catch (error) {
      console.error("Error al abrir modal:", error);
      // Mostramos los datos básicos aunque falle la carga de detalles
      const detallesBasicos: SolicitudDetalles = {
        ...solicitud,
        maquina: maquinas.find(m => m.id === solicitud.maquina_id),
        repuestos_utilizados: []
      };
      setSolicitudSeleccionada(detallesBasicos);
      setModalDetalles(true);
    } finally {
      setLoadingDetalles(false);
    }
  };

  const formatFecha = (fechaString: string): string => {
    if (!fechaString) return "N/A";
    try {
      return new Date(fechaString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "Fecha inválida";
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case "pendiente":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "tecnico_asignado":
        return <Wrench className="w-4 h-4 text-blue-600" />;
      case "prefinalizada":
        return <CheckCircle className="w-4 h-4 text-orange-600" />;
      case "finalizada":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "tecnico_asignado":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "prefinalizada":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "finalizada":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case "pendiente":
        return "Pendiente";
      case "tecnico_asignado":
        return "Técnico Asignado";
      case "prefinalizada":
        return "Reparación Completada";
      case "finalizada":
        return "Finalizada";
      default:
        return estado || "Desconocido";
    }
  };

  const getGravedadColor = (gravedad: string) => {
    switch (gravedad?.toLowerCase()) {
      case "leve":
        return "bg-green-100 text-green-700 border-green-200";
      case "moderada":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "grave":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getGravedadTexto = (gravedad: string) => {
    switch (gravedad?.toLowerCase()) {
      case "leve":
        return "Leve";
      case "moderada":
        return "Moderada";
      case "grave":
        return "Grave";
      default:
        return gravedad || "No especificada";
    }
  };

  // Función para obtener el nombre de la máquina
  const getNombreMaquina = (maquinaId: number): string => {
    const maquina = maquinas.find(m => m.id === maquinaId);
    return maquina?.nombre || `Solicitud #${maquinaId}`;
  };

  // Función para obtener el tipo de máquina
  const getTipoMaquina = (maquinaId: number): string => {
    const maquina = maquinas.find(m => m.id === maquinaId);
    return maquina?.tipo || "Tipo no especificado";
  };

  // Función segura para filtrar solicitudes
  const solicitudesFiltradas = solicitudes.filter(solicitud => {
    const busquedaLower = busqueda.toLowerCase();
    const nombreMaquina = getNombreMaquina(solicitud.maquina_id).toLowerCase();
    
    return (
      nombreMaquina.includes(busquedaLower) ||
      (solicitud.descripcion_falla?.toLowerCase() || '').includes(busquedaLower) ||
      (solicitud.estado?.toLowerCase() || '').includes(busquedaLower)
    );
  });

  const maquinasFuncionando = maquinas.filter(m => m.estado === 'Funcionando');

  const estadisticas = {
    total: solicitudes.length,
    pendientes: solicitudes.filter(s => s.estado?.toLowerCase() === "pendiente").length,
    tecnicoAsignado: solicitudes.filter(s => s.estado?.toLowerCase() === "tecnico_asignado").length,
    prefinalizadas: solicitudes.filter(s => s.estado?.toLowerCase() === "prefinalizada").length,
    finalizadas: solicitudes.filter(s => s.estado?.toLowerCase() === "finalizada").length,
  };

  return (
    <div className="space-y-8">
      {/* Modal para nueva solicitud */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reportar Falla</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Máquina</label>
                <select
                  value={nuevaSolicitud.maquina_id}
                  onChange={(e) => setNuevaSolicitud({...nuevaSolicitud, maquina_id: parseInt(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-black bg-white"
                  required
                >
                  <option value={0}>Seleccionar máquina</option>
                  {maquinasFuncionando.map(maquina => (
                    <option key={maquina.id} value={maquina.id}>
                      {maquina.nombre} - {maquina.tipo}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-600 mt-1">
                  {maquinasFuncionando.length} máquina(s) disponible(s)
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Gravedad de la Falla</label>
                <select
                  value={nuevaSolicitud.gravedad}
                  onChange={(e) => setNuevaSolicitud({...nuevaSolicitud, gravedad: e.target.value as any})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-black bg-white"
                >
                  <option value="leve">Leve</option>
                  <option value="moderada">Moderada</option>
                  <option value="grave">Grave</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Descripción de la Falla</label>
                <textarea
                  value={nuevaSolicitud.descripcion_falla}
                  onChange={(e) => setNuevaSolicitud({...nuevaSolicitud, descripcion_falla: e.target.value})}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-black bg-white"
                  placeholder="Describa en detalle la falla que está presentando la máquina..."
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setModalAbierto(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-bold"
                disabled={enviando}
              >
                Cancelar
              </button>
              <button
                onClick={crearSolicitud}
                disabled={enviando}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all font-bold flex items-center gap-2 disabled:opacity-50"
              >
                {enviando ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creando...
                  </>
                ) : (
                  'Crear Solicitud'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de detalles */}
      {modalDetalles && solicitudSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Detalles de la Solicitud #{solicitudSeleccionada.id}
              </h3>
              <button
                onClick={() => setModalDetalles(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>


            {loadingDetalles ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Información Principal */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Info className="w-5 h-5 text-blue-600" />
                      Información General
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-600 font-bold">Máquina:</span>
                        <p className="text-gray-900 font-bold">
                          {solicitudSeleccionada.maquina?.nombre || getNombreMaquina(solicitudSeleccionada.maquina_id)}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 font-bold">Tipo:</span>
                        <p className="text-gray-900 font-bold">
                          {solicitudSeleccionada.maquina?.tipo || getTipoMaquina(solicitudSeleccionada.maquina_id)}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 font-bold">Estado:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getEstadoColor(solicitudSeleccionada.estado)}`}>
                          {getEstadoTexto(solicitudSeleccionada.estado)}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 font-bold">Gravedad:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getGravedadColor(solicitudSeleccionada.gravedad)}`}>
                          {getGravedadTexto(solicitudSeleccionada.gravedad)}
                        </span>
                      </div>
                    </div>
                  </div>


                  {/* Descripción de la Falla */}
                  <div className="bg-red-50 rounded-lg p-4">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      Descripción de la Falla
                    </h4>
                    <p className="text-gray-700">{solicitudSeleccionada.descripcion_falla}</p>
                  </div>


                  {/* Repuestos Utilizados */}
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Package className="w-5 h-5 text-purple-600" />
                      Repuestos Utilizados
                    </h4>
                    {solicitudSeleccionada.repuestos_utilizados && solicitudSeleccionada.repuestos_utilizados.length > 0 ? (
                      <div className="space-y-3">
                        {solicitudSeleccionada.repuestos_utilizados.map((repuesto, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-3 bg-white rounded-lg border border-purple-200 shadow-sm"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                                <Package className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{repuesto.repuesto.nombre}</p>
                                <p className="text-xs text-gray-600">ID: {repuesto.repuesto.id}</p>
                              </div>
                            </div>
                            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-bold">
                              {repuesto.cantidad_utilizada} unidad{repuesto.cantidad_utilizada !== 1 ? 'es' : ''}
                            </span>
                          </div>
                        ))}
                        <div className="pt-2 border-t border-purple-200">
                          <p className="text-sm text-purple-700 font-bold text-center">
                            Total: {solicitudSeleccionada.repuestos_utilizados.length}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-white rounded-lg border-2 border-dashed border-purple-300">
                        <Package className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                        <p className="text-purple-600 font-semibold">No se utilizaron repuestos</p>
                        <p className="text-sm text-purple-500 mt-1">No hay repuestos registrados para esta reparación</p>
                      </div>
                    )}
                  </div>
                </div>


                {/* Información de Seguimiento */}
                <div className="space-y-4">
                  {/* Fechas */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      Fechas Importantes
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600 font-bold">Creación:</span>
                        <p className="text-gray-900">{formatFecha(solicitudSeleccionada.fecha_creacion)}</p>
                      </div>
                      {solicitudSeleccionada.fecha_hora_reparacion && (
                        <div>
                          <span className="text-gray-600 font-bold">Reparación Programada:</span>
                          <p className="text-gray-900">{formatFecha(solicitudSeleccionada.fecha_hora_reparacion)}</p>
                        </div>
                      )}
                      {solicitudSeleccionada.fecha_reparacion_terminada && (
                        <div>
                          <span className="text-gray-600 font-bold">Reparación Terminada:</span>
                          <p className="text-gray-900">{formatFecha(solicitudSeleccionada.fecha_reparacion_terminada)}</p>
                        </div>
                      )}
                      {solicitudSeleccionada.fecha_finalizada && (
                        <div>
                          <span className="text-gray-600 font-bold">Finalizada:</span>
                          <p className="text-gray-900">{formatFecha(solicitudSeleccionada.fecha_finalizada)}</p>
                        </div>
                      )}
                    </div>
                  </div>


                  {/* Técnico Asignado */}
                  {solicitudSeleccionada.tecnico_asignado && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <User className="w-5 h-5 text-green-600" />
                        Técnico Asignado
                      </h4>
                      <p className="text-gray-900 font-bold">{solicitudSeleccionada.tecnico_asignado.nombre_usuario}</p>
                      <p className="text-sm text-gray-600">{solicitudSeleccionada.tecnico_asignado.correo}</p>
                    </div>
                  )}


                  {/* Observaciones del Técnico */}
                  {solicitudSeleccionada.observaciones_tecnico && (
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Wrench className="w-5 h-5 text-orange-600" />
                        Observaciones del Técnico
                      </h4>
                      <p className="text-gray-700">{solicitudSeleccionada.observaciones_tecnico}</p>
                    </div>
                  )}
                </div>
              </div>
            )}


            {/* Botón de acción */}
            <div className="mt-6 flex justify-end">
              {solicitudSeleccionada.estado === 'prefinalizada' && (
                <button
                  onClick={() => finalizarSolicitud(solicitudSeleccionada.id)}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold flex items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Verificar y Finalizar Reparación
                </button>
              )}
            </div>
          </div>
        </div>
      )}


      {/* Modal de Notificaciones */}
      {modalNotificaciones && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Bell className="w-6 h-6 text-blue-600" />
                Mis Notificaciones
                {notificacionesNoLeidas > 0 && (
                  <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                    {notificacionesNoLeidas} nuevas
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-2">
                {notificacionesNoLeidas > 0 && (
                  <button
                    onClick={marcarTodasNotificacionesLeidas}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                  >
                    Marcar todas como leídas
                  </button>
                )}
                <button
                    onClick={() => setModalNotificaciones(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>


              <div className="space-y-4">
                {notificaciones.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-semibold">No tienes notificaciones</p>
                    <p className="text-sm text-gray-400 mt-1">Las notificaciones aparecerán aquí</p>
                  </div>
                ) : (
                  notificaciones.map((notificacion) => (
                    <div
                      key={notificacion.id}
                      className={`p-4 rounded-lg border transition-all cursor-pointer ${
                        notificacion.leida
                          ? 'bg-gray-50 border-gray-200'
                          : 'bg-blue-50 border-blue-200 shadow-sm'
                      } hover:shadow-md`}
                      onClick={() => marcarNotificacionLeida(notificacion.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className={`font-bold ${
                              notificacion.leida ? 'text-gray-700' : 'text-gray-900'
                            }`}>
                              {notificacion.titulo}
                            </h4>
                            {!notificacion.leida && (
                              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                Nuevo
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{notificacion.mensaje}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span className="capitalize">{notificacion.tipo.replace('_', ' ')}</span>
                            <span>{formatFecha(notificacion.fecha_creacion)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}


        {/* Mensaje de error */}
        {error && (
          <div className="bg-gradient-to-br from-white to-red-50/30 rounded-2xl shadow-lg border border-red-100/50 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-red-500/10 to-pink-600/10 rounded-full -translate-y-4 translate-x-4"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-red-800 mb-2">
                <span className="font-medium">Error:</span>
                <span>{error}</span>
              </div>
              <button
                onClick={() => {
                  fetchSolicitudes();
                  fetchMaquinasCliente();
                  fetchNotificaciones();
                }}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors"
              >
                Reintentar carga de datos
              </button>
            </div>
          </div>
        )}


        {/* Mensaje de éxito */}
        {successMessage && (
          <div className="bg-gradient-to-br from-white to-green-50/30 rounded-2xl shadow-lg border border-green-100/50 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-green-500/10 to-emerald-600/10 rounded-full -translate-y-4 translate-x-4"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">{successMessage}</span>
              </div>
            </div>
          </div>
        )}


        {/* Encabezado con fondo decorativo */}
        <div className="bg-gradient-to-br from-white to-red-50/30 rounded-2xl shadow-lg border border-red-100/50 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/30 to-purple-600/30 rounded-full -translate-y-8 translate-x-8"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-blue-500/30 to-purple-600/30 rounded-full translate-y-8 -translate-x-8"></div>
         
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Mis Solicitudes de Reparación</h2>
                <p className="text-gray-600 font-bold">
                  Gestiona y da seguimiento a tus solicitudes de servicio
                </p>
              </div>
             
              {/* Botón de notificaciones */}
              <button
                onClick={() => setModalNotificaciones(true)}
                className="relative p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100"
              >
                <Bell className="w-6 h-6 text-gray-600" />
                {notificacionesNoLeidas > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {notificacionesNoLeidas}
                  </span>
                )}
              </button>
            </div>


            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{estadisticas.total}</p>
                  </div>
                  <Wrench className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pendientes</p>
                    <p className="text-2xl font-bold text-gray-900">{estadisticas.pendientes}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Técnico Asignado</p>
                    <p className="text-2xl font-bold text-gray-900">{estadisticas.tecnicoAsignado}</p>
                  </div>
                  <Wrench className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Por Verificar</p>
                    <p className="text-2xl font-bold text-gray-900">{estadisticas.prefinalizadas}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-orange-600" />
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Finalizadas</p>
                    <p className="text-2xl font-bold text-gray-900">{estadisticas.finalizadas}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Tabs */}
        <div className="mt-8 backdrop-blur-sm border-b border-gray-200/50 px-8">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("nueva")}
              className={`px-6 py-3 font-medium transition-all duration-300 rounded-t-lg ${
                activeTab === "nueva"
                  ? "bg-gradient-to-r from-blue-500 to-red-600 text-white shadow-lg transform scale-105"
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50/80"
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Crear Orden Nueva
              </div>
            </button>
            <button
              onClick={() => setActiveTab("historial")}
              className={`px-6 py-3 font-medium transition-all duration-300 rounded-t-lg ${
                activeTab === "historial"
                  ? "bg-gradient-to-r from-orange-500 to-purple-600 text-white shadow-lg transform scale-105"
                  : "text-gray-600 hover:text-orange-600 hover:bg-orange-50/80"
              }`}
            >
              <div className="flex items-center gap-2">
                <History className="w-4 h-4" />
                Historial de Órdenes
              </div>
            </button>
          </div>
        </div>


        {/* Contenido de las Tabs */}
        {activeTab === "nueva" && (
          <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-lg border border-blue-100/50 p-8">
            <div className="text-center py-12">
              <Wrench className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Crear Nueva Orden de Reparación</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Reporta una falla en una de tus máquinas para que nuestro equipo técnico pueda ayudarte.
              </p>
              <button
                onClick={() => setModalAbierto(true)}
                disabled={maquinasFuncionando.length === 0}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-all font-bold flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
                Crear Nueva Solicitud
              </button>
              {maquinasFuncionando.length === 0 && (
                <p className="text-sm text-gray-500 mt-4">
                  No tienes máquinas disponibles para reportar fallas.
                </p>
              )}
            </div>
          </div>
        )}


        {activeTab === "historial" && (
          <div className="bg-gradient-to-br from-white to-orange-50/30 rounded-2xl shadow-lg border border-orange-100/50 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-orange-500/30 to-purple-600/30 rounded-full -translate-y-4 translate-x-4"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-orange-500/30 to-purple-600/30 rounded-full translate-y-4 -translate-x-4"></div>


            {/* Buscador */}
            <div className="p-6 border-b border-orange-100 bg-white/50 relative z-10">
              <div className="relative max-w-md">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-black bg-white"
                  placeholder="Buscar por máquina, descripción o estado..."
                />
              </div>
            </div>


            <div className="relative z-10">
              {loadingSolicitudes ? (
                <div className="space-y-4 p-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 animate-pulse border border-gray-100">
                      <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    </div>
                  ))}
                </div>
              ) : solicitudesFiltradas.length === 0 ? (
                <div className="p-12 text-center">
                  <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {solicitudes.length === 0 ? 'No tienes solicitudes' : 'No se encontraron solicitudes'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {solicitudes.length === 0
                      ? 'Crea una nueva solicitud de reparación'
                      : 'Intenta con otros términos de búsqueda'
                    }
                  </p>
                  <button
                    onClick={() => setActiveTab("nueva")}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-bold inline-flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Crear Nueva Solicitud
                  </button>
                </div>
              ) : (
                <div className="space-y-4 p-6">
                  {solicitudesFiltradas.map((s) => (
                    <div key={s.id} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all p-6 border-l-4 border-orange-500">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Wrench className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{getNombreMaquina(s.id)}</h3>
                            <p className="text-sm text-gray-600">Solicitud #{s.id} • {formatFecha(s.fecha_creacion)}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getEstadoColor(s.estado)}`}>
                                {getEstadoTexto(s.estado)}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getGravedadColor(s.gravedad)}`}>
                                {getGravedadTexto(s.gravedad)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getEstadoIcon(s.estado)}
                        </div>
                      </div>
                      <p className="text-gray-700 mb-4 line-clamp-2">{s.descripcion_falla || 'Sin descripción'}</p>
                     
                      {s.fecha_hora_reparacion && (
                        <p className="text-sm text-gray-600 mb-4">
                          <strong>Fecha de reparación:</strong> {formatFecha(s.fecha_hora_reparacion)}
                        </p>
                      )}


                      <div className="flex gap-2">
                        <button
                          onClick={() => abrirModalDetalles(s)}
                          className="flex-1 bg-orange-50 text-orange-600 py-2 rounded-lg hover:bg-orange-100 transition-colors text-sm font-bold flex items-center justify-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Ver Detalles
                        </button>
                       
                        {s.estado === 'prefinalizada' && (
                          <button
                            onClick={() => finalizarSolicitud(s.id)}
                            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-bold flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Verificar Reparación
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
