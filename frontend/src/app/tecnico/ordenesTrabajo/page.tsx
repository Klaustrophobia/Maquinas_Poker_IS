"use client";
import React, { useState, useEffect, useMemo } from "react";
import { 
  Search, Filter, Eye, Clock, AlertCircle, CheckCircle, X, 
  Wrench, Package, User, Calendar, Info, FileText, 
  MapPin, Plus, Loader2, Bell
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

// Interfaces actualizadas
interface Maquina {
  id: number;
  nombre: string;
  tipo: string;
  estado?: string;
}

interface Usuario {
  id: number;
  nombre_usuario: string;
  correo: string;
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
  maquina?: Maquina;
  cliente?: Usuario;
  tecnico_asignado?: Usuario;
}

interface SolicitudDetalles extends Solicitud {
  repuestos_utilizados?: Array<{
    id: number;
    repuesto: {
      id: number;
      nombre: string;
    };
    cantidad_utilizada: number;
  }>;
}

interface Repuesto {
  id: number;
  nombre: string;
  cantidad: number;
  proveedor?: string;
}

interface RepuestoUtilizado {
  repuesto_id: number;
  cantidad_utilizada: number;
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

export default function OrdenesTrabajoPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [loadingDetalles, setLoadingDetalles] = useState(false);
  const [loadingNotificaciones, setLoadingNotificaciones] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [modalReparacion, setModalReparacion] = useState(false);
  const [modalDetalles, setModalDetalles] = useState(false);
  const [modalNotificaciones, setModalNotificaciones] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<SolicitudDetalles | null>(null);
  const [observaciones, setObservaciones] = useState("");
  const [repuestosUtilizados, setRepuestosUtilizados] = useState<RepuestoUtilizado[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { usuario } = useAuth();
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  // Cargar datos iniciales
  useEffect(() => {
    if (usuario?.id) {
      fetchSolicitudesTecnico();
      fetchRepuestos();
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

  // Fetch de notificaciones
  const fetchNotificaciones = async (): Promise<void> => {
    if (!usuario?.id) return;

    try {
      const response = await fetch(`${backendUrl}/api/notificaciones`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': usuario.id.toString()
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setNotificaciones(data.data);
          const noLeidas = data.data.filter((n: Notificacion) => !n.leida).length;
          setNotificacionesNoLeidas(noLeidas);
        }
      }
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
    }
  };

  // Marcar notificación como leída
  const marcarNotificacionLeida = async (notificacionId: number): Promise<void> => {
    try {
      const response = await fetch(`${backendUrl}/api/notificaciones/${notificacionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': usuario?.id?.toString() || ''
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

  // Marcar todas las notificaciones como leídas
  const marcarTodasNotificacionesLeidas = async (): Promise<void> => {
    try {
      const response = await fetch(`${backendUrl}/api/notificaciones`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': usuario?.id?.toString() || ''
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

  // Función para notificar al cliente
  // Función para notificar al cliente - VERSIÓN SIMPLIFICADA
// Función para notificar al cliente - CORREGIDA
const notificarCliente = async (
  solicitudId: number, 
  maquinaNombre: string,
  observaciones: string
): Promise<boolean> => {
  try {
    console.log("🔔 Intentando notificar al cliente...");

    // Primero obtener los detalles de la solicitud para obtener el cliente_id
    const solicitudResponse = await fetch(`${backendUrl}/api/SolicitudReparacion/${solicitudId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!solicitudResponse.ok) {
      console.error("❌ Error al obtener detalles de la solicitud");
      return false;
    }

    const solicitudData = await solicitudResponse.json();
    
    if (!solicitudData.success || !solicitudData.data) {
      console.error("❌ No se pudieron obtener los datos de la solicitud");
      return false;
    }

    const solicitudDetalles = solicitudData.data;
    const clienteId = solicitudDetalles.cliente_id || solicitudDetalles.cliente?.id;

    if (!clienteId) {
      console.error("❌ No se pudo obtener el cliente_id de la solicitud");
      return false;
    }

    console.log("✅ Cliente ID obtenido:", clienteId);

    const payload = {
      cliente_id: Number(clienteId),
      solicitud_id: Number(solicitudId),
      maquina_nombre: maquinaNombre,
      tecnico_nombre: usuario?.nombre_usuario || 'Técnico',
      observaciones: observaciones || 'Sin observaciones adicionales'
    };

    console.log("📤 Enviando payload:", payload);

    const response = await fetch(`${backendUrl}/api/notificaciones/verificacion-cliente`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log("📥 Respuesta del servidor:", response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Error del servidor:", errorData);
      return false;
    }

    const data = await response.json();
    console.log("✅ Notificación enviada exitosamente:", data);
    
    return data.success === true;

  } catch (error) {
    console.error("❌ Error al notificar cliente:", error);
    return false;
  }
};

  // Memoizar solicitudes filtradas para mejor rendimiento
  const solicitudesFiltradas = useMemo(() => {
    let filtered = solicitudes.filter(solicitud => solicitud.estado !== 'finalizada');

    if (searchTerm) {
      const busquedaLower = searchTerm.toLowerCase();
      filtered = filtered.filter(solicitud => {
        const nombreMaquina = getNombreMaquina(solicitud).toLowerCase();
        const nombreCliente = getNombreCliente(solicitud).toLowerCase();
        const idSolicitud = solicitud.id.toString();
        
        return (
          nombreMaquina.includes(busquedaLower) ||
          nombreCliente.includes(busquedaLower) ||
          idSolicitud.includes(busquedaLower) ||
          (solicitud.descripcion_falla?.toLowerCase() || '').includes(busquedaLower) ||
          (solicitud.estado?.toLowerCase() || '').includes(busquedaLower)
        );
      });
    }

    return filtered;
  }, [solicitudes, searchTerm]);

  const fetchSolicitudesTecnico = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL(`${backendUrl}/api/SolicitudReparacion`);
      if (usuario?.id) {
        url.searchParams.append('tecnico_id', usuario.id.toString());
      }
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache'
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
      setLoading(false);
    }
  };

  const fetchRepuestos = async (): Promise<void> => {
    try {
      const response = await fetch(`${backendUrl}/api/repuestos`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache'
      });
      
      const data = await response.json();
      
      if (data.success && data.data) {
        setRepuestos(data.data);
      } else if (Array.isArray(data)) {
        setRepuestos(data);
      } else {
        setRepuestos([]);
      }
    } catch (error) {
      console.error("Error al cargar repuestos:", error);
      setRepuestos([]);
    }
  };

  const fetchSolicitudDetalles = async (solicitudId: number): Promise<SolicitudDetalles | null> => {
    try {
      const response = await fetch(`${backendUrl}/api/SolicitudReparacion/${solicitudId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status} al cargar detalles`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        return data.data;
      } else {
        throw new Error(data.message || 'Error al cargar detalles');
      }
    } catch (error) {
      console.error("Error al cargar detalles:", error);
      return null;
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
        const detallesBasicos: SolicitudDetalles = {
          ...solicitud,
          repuestos_utilizados: []
        };
        setSolicitudSeleccionada(detallesBasicos);
        setModalDetalles(true);
      }
    } catch (error) {
      console.error("Error al abrir modal:", error);
      const detallesBasicos: SolicitudDetalles = {
        ...solicitud,
        repuestos_utilizados: []
      };
      setSolicitudSeleccionada(detallesBasicos);
      setModalDetalles(true);
    } finally {
      setLoadingDetalles(false);
    }
  };

  const abrirModalReparacion = (solicitud: Solicitud): void => {
    const solicitudBasica: SolicitudDetalles = {
      ...solicitud,
      repuestos_utilizados: []
    };
    setSolicitudSeleccionada(solicitudBasica);
    setObservaciones("");
    setRepuestosUtilizados([]);
    setModalReparacion(true);
  };

  const agregarRepuesto = (): void => {
    setRepuestosUtilizados([...repuestosUtilizados, { repuesto_id: 0, cantidad_utilizada: 1 }]);
  };

  const actualizarRepuesto = (index: number, campo: string, valor: any): void => {
    const nuevosRepuestos = [...repuestosUtilizados];
    nuevosRepuestos[index] = { ...nuevosRepuestos[index], [campo]: valor };
    setRepuestosUtilizados(nuevosRepuestos);
  };

  const eliminarRepuesto = (index: number): void => {
    const nuevosRepuestos = repuestosUtilizados.filter((_, i) => i !== index);
    setRepuestosUtilizados(nuevosRepuestos);
  };

  const marcarReparacionTerminada = async (): Promise<void> => {
  if (!observaciones.trim()) {
    alert('Por favor agregue observaciones de la reparación');
    return;
  }

  // Validar repuestos
  for (const repuesto of repuestosUtilizados) {
    if (repuesto.repuesto_id === 0) {
      alert('Por favor seleccione un repuesto válido para todos los items');
      return;
    }
    if (repuesto.cantidad_utilizada <= 0) {
      alert('La cantidad de repuestos debe ser mayor a 0');
      return;
    }
    
    const repuestoInfo = repuestos.find(r => r.id === repuesto.repuesto_id);
    if (repuestoInfo && repuestoInfo.cantidad < repuesto.cantidad_utilizada) {
      alert(`Stock insuficiente para ${repuestoInfo.nombre}. Stock disponible: ${repuestoInfo.cantidad}`);
      return;
    }
  }

  setEnviando(true);
  try {
    // 1. Primero marcar como prefinalizada en la solicitud
    const response = await fetch(`${backendUrl}/api/SolicitudReparacion/${solicitudSeleccionada?.id}/marcar-terminada`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        observaciones_tecnico: observaciones 
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `Error ${response.status} al marcar reparación`);
    }
    
    if (data.success) {
      // 2. Agregar repuestos si existen
      if (repuestosUtilizados.length > 0) {
        for (const repuesto of repuestosUtilizados) {
          if (repuesto.repuesto_id > 0 && repuesto.cantidad_utilizada > 0) {
            await fetch(`${backendUrl}/api/SolicitudReparacion/${solicitudSeleccionada?.id}/repuestos`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(repuesto),
            });
          }
        }
      }

      // En la función marcarReparacionTerminada, cambia esta parte:
// 3. Notificar al cliente para verificación (SOLO si el estado cambió a prefinalizada)
if (data.data && data.data.estado === 'prefinalizada') {
  const notificacionEnviada = await notificarCliente(
    solicitudSeleccionada!.id, // Solo pasamos el ID de la solicitud
    getNombreMaquina(solicitudSeleccionada!),
    observaciones
  );

  let mensaje = 'Reparación marcada como terminada exitosamente. ';
  mensaje += notificacionEnviada 
    ? 'Se ha notificado al cliente para verificación.' 
    : 'Reparación terminada pero hubo un error al notificar al cliente.';
  
  setSuccessMessage(mensaje);
} else {
  setSuccessMessage('Reparación marcada como terminada exitosamente. Estado actualizado correctamente.');
}
      
      setModalReparacion(false);
      fetchSolicitudesTecnico();
      fetchNotificaciones(); // Actualizar notificaciones
      
      // Ocultar mensaje de éxito después de 5 segundos
      setTimeout(() => setSuccessMessage(null), 5000);
    } else {
      throw new Error(data.message || 'Error al marcar reparación');
    }
  } catch (error) {
    console.error("Error al marcar reparación:", error);
    alert('Error al marcar reparación: ' + (error instanceof Error ? error.message : 'Error desconocido'));
  } finally {
    setEnviando(false);
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
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getEstadoStyles = (estado: string) => {
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
        return "Asignada";
      case "prefinalizada":
        return "Completada";
      case "finalizada":
        return "Finalizada";
      default:
        return estado || "Desconocido";
    }
  };

  const getGravedadStyles = (gravedad: string) => {
    switch (gravedad?.toLowerCase()) {
      case "grave":
        return "bg-red-100 text-red-700 border-red-200";
      case "moderada":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "leve":
        return "bg-green-100 text-green-700 border-green-200";
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

  const getNombreMaquina = (solicitud: Solicitud): string => {
    return solicitud.maquina?.nombre || `Máquina #${solicitud.maquina_id}`;
  };

  const getTipoMaquina = (solicitud: Solicitud): string => {
    return solicitud.maquina?.tipo || "Tipo no especificado";
  };

  const getEstadoMaquina = (solicitud: Solicitud): string => {
    return solicitud.maquina?.estado || "Estado no disponible";
  };

  const getNombreCliente = (solicitud: Solicitud): string => {
    return solicitud.cliente?.nombre_usuario || `Cliente #${solicitud.cliente_id}`;
  };

  const estadisticas = {
    total: solicitudes.length,
    activas: solicitudes.filter(s => s.estado !== 'finalizada').length,
    finalizadas: solicitudes.filter(s => s.estado === 'finalizada').length,
    tecnicoAsignado: solicitudes.filter(s => s.estado === 'tecnico_asignado').length,
    prefinalizadas: solicitudes.filter(s => s.estado === 'prefinalizada').length,
  };

  return (
    <div className="space-y-8">
      {/* Modal de detalles - MEJORADO */}
      {modalDetalles && solicitudSeleccionada && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Info className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Detalles de la Orden #{solicitudSeleccionada.id}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {getNombreMaquina(solicitudSeleccionada)} • {getNombreCliente(solicitudSeleccionada)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalDetalles(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingDetalles ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Columna izquierda */}
                  <div className="space-y-6">
                    {/* Información General */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                        <User className="w-5 h-5 text-blue-600" />
                        Información General
                      </h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-600">Máquina:</span>
                          <span className="text-sm font-semibold text-gray-900">{getNombreMaquina(solicitudSeleccionada)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-600">Tipo:</span>
                          <span className="text-sm font-semibold text-gray-900">{getTipoMaquina(solicitudSeleccionada)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-600">Estado Máquina:</span>
                          <span className="text-sm font-semibold text-gray-900">{getEstadoMaquina(solicitudSeleccionada)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-600">Cliente:</span>
                          <span className="text-sm font-semibold text-gray-900">{getNombreCliente(solicitudSeleccionada)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-600">Estado Orden:</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoStyles(solicitudSeleccionada.estado)}`}>
                            {getEstadoTexto(solicitudSeleccionada.estado)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm font-medium text-gray-600">Gravedad:</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getGravedadStyles(solicitudSeleccionada.gravedad)}`}>
                            {getGravedadTexto(solicitudSeleccionada.gravedad)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Descripción de la Falla */}
                    <div className="bg-white border border-red-100 rounded-xl p-5 shadow-sm">
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        Descripción de la Falla
                      </h4>
                      <p className="text-gray-700 leading-relaxed bg-red-50 p-4 rounded-lg border border-red-100">
                        {solicitudSeleccionada.descripcion_falla}
                      </p>
                    </div>
                  </div>

                  {/* Columna derecha */}
                  <div className="space-y-6">
                    {/* Fechas Importantes */}
                    <div className="bg-white border border-blue-100 rounded-xl p-5 shadow-sm">
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        Fechas Importantes
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-600">Creación:</span>
                          <span className="text-sm font-semibold text-gray-900">{formatFecha(solicitudSeleccionada.fecha_creacion)}</span>
                        </div>
                        {solicitudSeleccionada.fecha_hora_reparacion && (
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm font-medium text-gray-600">Reparación Programada:</span>
                            <span className="text-sm font-semibold text-gray-900">{formatFecha(solicitudSeleccionada.fecha_hora_reparacion)}</span>
                          </div>
                        )}
                        {solicitudSeleccionada.fecha_reparacion_terminada && (
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm font-medium text-gray-600">Reparación Terminada:</span>
                            <span className="text-sm font-semibold text-gray-900">{formatFecha(solicitudSeleccionada.fecha_reparacion_terminada)}</span>
                          </div>
                        )}
                        {solicitudSeleccionada.fecha_finalizada && (
                          <div className="flex justify-between items-center py-2">
                            <span className="text-sm font-medium text-gray-600">Finalizada:</span>
                            <span className="text-sm font-semibold text-gray-900">{formatFecha(solicitudSeleccionada.fecha_finalizada)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Observaciones del Técnico */}
                    {solicitudSeleccionada.observaciones_tecnico && (
                      <div className="bg-white border border-orange-100 rounded-xl p-5 shadow-sm">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                          <Wrench className="w-5 h-5 text-orange-600" />
                          Observaciones del Técnico
                        </h4>
                        <p className="text-gray-700 leading-relaxed bg-orange-50 p-4 rounded-lg border border-orange-100">
                          {solicitudSeleccionada.observaciones_tecnico}
                        </p>
                      </div>
                    )}

                    {/* Repuestos Utilizados - MEJORADO */}
                    {solicitudSeleccionada.repuestos_utilizados && solicitudSeleccionada.repuestos_utilizados.length > 0 && (
                      <div className="bg-white border border-purple-100 rounded-xl p-5 shadow-sm">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                          <Package className="w-5 h-5 text-purple-600" />
                          Repuestos Utilizados
                        </h4>
                        <div className="space-y-3">
                          {solicitudSeleccionada.repuestos_utilizados.map((repuesto, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100">
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <span className="font-medium text-gray-900">{repuesto.repuesto.nombre}</span>
                              </div>
                              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-bold">
                                {repuesto.cantidad_utilizada} unidad{repuesto.cantidad_utilizada !== 1 ? 'es' : ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer del modal */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex justify-end">
                <button
                  onClick={() => setModalDetalles(false)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de finalización de reparación - MEJORADO */}
      {modalReparacion && solicitudSeleccionada && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Wrench className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Finalizar Reparación
                  </h3>
                  <p className="text-sm text-gray-600">
                    {getNombreMaquina(solicitudSeleccionada)} • Orden #{solicitudSeleccionada.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalReparacion(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Información de la Orden */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-600" />
                    Información de la Orden
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600 font-medium">Cliente:</span>
                      <p className="text-gray-900 font-semibold">{getNombreCliente(solicitudSeleccionada)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Máquina:</span>
                      <p className="text-gray-900 font-semibold">{getNombreMaquina(solicitudSeleccionada)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Gravedad:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getGravedadStyles(solicitudSeleccionada.gravedad)}`}>
                        {getGravedadTexto(solicitudSeleccionada.gravedad)}
                      </span>
                    </div>
                    {solicitudSeleccionada.fecha_hora_reparacion && (
                      <div>
                        <span className="text-gray-600 font-medium">Fecha Programada:</span>
                        <p className="text-gray-900 font-semibold">{formatFecha(solicitudSeleccionada.fecha_hora_reparacion)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Observaciones */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Observaciones de la Reparación *
                  </label>
                  <textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black bg-white transition-colors duration-200"
                    placeholder="Describa el trabajo realizado, problemas encontrados, solución aplicada, pruebas realizadas..."
                    required
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Esta información será visible para el cliente y administradores
                  </p>
                </div>

                {/* Repuestos Utilizados - MEJORADO */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-bold text-gray-700">Repuestos Utilizados</label>
                    <button
                      onClick={agregarRepuesto}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-bold flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar Repuesto
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {repuestosUtilizados.map((repuesto, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <select
                          value={repuesto.repuesto_id}
                          onChange={(e) => actualizarRepuesto(index, 'repuesto_id', parseInt(e.target.value))}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
                        >
                          <option value={0}>Seleccionar repuesto</option>
                          {repuestos.map(r => (
                            <option key={r.id} value={r.id} disabled={r.cantidad === 0}>
                              {r.nombre} - Stock: {r.cantidad}
                            </option>
                          ))}
                        </select>
                        
                        <input
                          type="number"
                          min="1"
                          value={repuesto.cantidad_utilizada}
                          onChange={(e) => actualizarRepuesto(index, 'cantidad_utilizada', parseInt(e.target.value) || 1)}
                          className="w-20 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white text-center"
                          placeholder="Cant."
                        />
                        
                        <button
                          onClick={() => eliminarRepuesto(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          type="button"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    
                    {repuestosUtilizados.length === 0 && (
                      <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">
                          No se han agregado repuestos. Si no se utilizaron repuestos, puede continuar.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer del modal */}
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setModalReparacion(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-bold"
                  disabled={enviando}
                >
                  Cancelar
                </button>
                <button
                  onClick={marcarReparacionTerminada}
                  disabled={enviando || !observaciones.trim()}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enviando ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Marcar como Terminada
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Notificaciones */}
      {modalNotificaciones && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
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
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
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
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="bg-gradient-to-br from-white to-red-50/30 rounded-2xl shadow-lg border border-red-100/50 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-red-500/10 to-pink-600/10 rounded-full -translate-y-4 translate-x-4"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-red-800 mb-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
            <button 
              onClick={() => {
                fetchSolicitudesTecnico();
                fetchRepuestos();
                fetchNotificaciones();
              }}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors font-bold"
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

      {/* Encabezado con estadísticas */}
      <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-lg border border-blue-100/50 p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/30 to-purple-600/30 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-blue-500/30 to-purple-600/30 rounded-full translate-y-8 -translate-x-8"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Mis Órdenes de Trabajo</h2>
              <p className="text-gray-600 font-bold">
                Gestiona las reparaciones asignadas a ti
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Asignadas</p>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.total}</p>
                </div>
                <Wrench className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Órdenes Activas</p>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.activas}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Por Completar</p>
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

      {/* Contenido principal */}
      <div className="bg-gradient-to-br from-white to-orange-50/30 rounded-2xl shadow-lg border border-orange-100/50 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-orange-500/30 to-purple-600/30 rounded-full -translate-y-4 translate-x-4"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-orange-500/30 to-purple-600/30 rounded-full translate-y-4 -translate-x-4"></div>

        {/* Buscador y Filtros */}
        <div className="p-6 border-b border-blue-100 bg-white/50 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1">
              <div className="relative max-w-md">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por cliente, máquina, ID de orden..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white font-bold"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-bold flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filtros
              </button>
            </div>
          </div>

          {/* Filtros Avanzados */}
          {mostrarFiltros && (
            <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 font-bold">
                  {solicitudesFiltradas.length} de {solicitudes.length} órdenes mostradas
                </span>
                
                <button
                  onClick={() => setSearchTerm("")}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-bold flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Limpiar búsqueda
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="relative z-10">
          {loading ? (
            <div className="space-y-4 p-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 animate-pulse border border-gray-100">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : solicitudesFiltradas.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {solicitudes.length === 0 ? 'No tienes órdenes asignadas' : 'No se encontraron órdenes activas'}
              </h3>
              <p className="text-gray-600 mb-6">
                {solicitudes.length === 0 
                  ? 'Las órdenes asignadas a ti aparecerán aquí' 
                  : 'Intenta con otros términos de búsqueda'
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-bold inline-flex items-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Limpiar búsqueda
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4 p-6">
              {solicitudesFiltradas.map((solicitud) => (
                <div key={solicitud.id} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all p-6 border-l-4 border-yellow-500">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">Orden #{solicitud.id}</h3>
                          <p className="text-lg text-gray-700 font-bold mb-2">{getNombreMaquina(solicitud)}</p>
                          <p className="text-gray-600 font-bold">Cliente: {getNombreCliente(solicitud)}</p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getEstadoStyles(solicitud.estado)} flex items-center gap-1`}>
                            {getEstadoIcon(solicitud.estado)}
                            {getEstadoTexto(solicitud.estado)}
                          </span>
                          
                          <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getGravedadStyles(solicitud.gravedad)}`}>
                            {getGravedadTexto(solicitud.gravedad)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4 font-bold">{solicitud.descripcion_falla}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 font-bold">Fecha Solicitud:</span>
                          <p className="text-gray-900 font-bold">{formatFecha(solicitud.fecha_creacion)}</p>
                        </div>
                        
                        {solicitud.fecha_hora_reparacion && (
                          <div>
                            <span className="text-gray-500 font-bold">Fecha Reparación:</span>
                            <p className="text-gray-900 font-bold">{formatFecha(solicitud.fecha_hora_reparacion)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex lg:flex-col gap-2">
                      <button 
                        onClick={() => abrirModalDetalles(solicitud)}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-bold flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Ver Detalles
                      </button>
                      
                      {solicitud.estado === 'tecnico_asignado' && (
                        <button 
                          onClick={() => abrirModalReparacion(solicitud)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold flex items-center gap-2"
                        >
                          <Wrench className="w-4 h-4" />
                          Marcar Terminada
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}