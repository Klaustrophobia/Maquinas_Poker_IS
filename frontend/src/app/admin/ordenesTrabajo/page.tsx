"use client";
import React, { useState, useEffect } from "react";
import { Search, Filter, Eye, Clock, AlertCircle, CheckCircle, X, User, Calendar, Info, Package, Wrench, FileText, History, Plus, Users, MapPin, Bell } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

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
  maquina?: {
    id: number;
    nombre: string;
    tipo: string;
  };
  cliente?: {
    id: number;
    nombre_usuario: string;
  };
  tecnico_asignado?: {
    id: number;
    nombre_usuario: string;
  };
}

interface SolicitudDetalles extends Solicitud {
  maquina?: {
    id: number;
    nombre: string;
    tipo: string;
    estado: string;
  };
  cliente?: {
    id: number;
    nombre_usuario: string;
    correo: string;
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

interface Tecnico {
  tecnico_id: number;
  nombre_tecnico: string;
  correo_tecnico: string;
  especialidad?: string;
  telefono?: string;
  ubicacion?: string;
}

interface AsignacionTecnico {
  tecnico_id: number;
  fecha_hora_reparacion: string;
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
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [tecnicosFiltrados, setTecnicosFiltrados] = useState<Tecnico[]>([]);
  const [solicitudesFiltradas, setSolicitudesFiltradas] = useState<Solicitud[]>([]);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [loadingDetalles, setLoadingDetalles] = useState(false);
  const [loadingNotificaciones, setLoadingNotificaciones] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTecnico, setSearchTecnico] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [modalAsignacion, setModalAsignacion] = useState(false);
  const [modalDetalles, setModalDetalles] = useState(false);
  const [modalNotificaciones, setModalNotificaciones] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<SolicitudDetalles | null>(null);
  const [asignacion, setAsignacion] = useState<AsignacionTecnico>({
    tecnico_id: 0,
    fecha_hora_reparacion: ""
  });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"ordenes" | "historial">("ordenes");
  const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState<Tecnico | null>(null);

  const { usuario } = useAuth();
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    if (usuario?.id) {
      fetchSolicitudes();
      fetchTecnicos();
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

  useEffect(() => {
    aplicarFiltros();
  }, [solicitudes, searchTerm, activeTab]);

  useEffect(() => {
    filtrarTecnicos();
  }, [tecnicos, searchTecnico]);

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

  const fetchSolicitudes = async (): Promise<void> => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  const fetchTecnicos = async (): Promise<void> => {
    try {
      const response = await fetch(`${backendUrl}/api/SolicitudReparacion/tecnicos`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      let tecnicosData = [];
      
      if (data.success && data.data) {
        tecnicosData = data.data;
      } else if (Array.isArray(data)) {
        tecnicosData = data;
      } else if (data.tecnicos) {
        tecnicosData = data.tecnicos;
      }
      
      const tecnicosMapeados = tecnicosData.map((tecnico: any, index: number) => {
        return {
          tecnico_id: tecnico.tecnico_id || tecnico.id || tecnico.user_id || index + 1,
          nombre_tecnico: tecnico.nombre_tecnico || tecnico.nombre || tecnico.nombre_usuario || tecnico.username || `Técnico ${index + 1}`,
          correo_tecnico: tecnico.correo_tecnico || tecnico.correo || tecnico.email || '',
          especialidad: tecnico.especialidad || tecnico.area_especializacion || 'General',
          telefono: tecnico.telefono || tecnico.phone || 'No disponible',
          ubicacion: tecnico.ubicacion || tecnico.location || 'Ciudad'
        };
      });
      
      setTecnicos(tecnicosMapeados);
      
    } catch (error) {
      console.error("Error fetching técnicos:", error);
      setTecnicos([]);
    }
  };

  const filtrarTecnicos = () => {
    if (!searchTecnico) {
      setTecnicosFiltrados(tecnicos);
      return;
    }

    const filtered = tecnicos.filter(tecnico =>
      tecnico.nombre_tecnico.toLowerCase().includes(searchTecnico.toLowerCase()) ||
      tecnico.especialidad?.toLowerCase().includes(searchTecnico.toLowerCase()) ||
      tecnico.ubicacion?.toLowerCase().includes(searchTecnico.toLowerCase())
    );
    setTecnicosFiltrados(filtered);
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
          maquina: solicitud.maquina ? {
            ...solicitud.maquina,
            estado: "Desconocido"
          } : undefined,
          cliente: solicitud.cliente ? {
            ...solicitud.cliente,
            correo: "No disponible"
          } : undefined,
          tecnico_asignado: solicitud.tecnico_asignado ? {
            ...solicitud.tecnico_asignado,
            correo: "No disponible"
          } : undefined,
          repuestos_utilizados: []
        };
        setSolicitudSeleccionada(detallesBasicos);
        setModalDetalles(true);
      }
    } catch (error) {
      console.error("Error al abrir modal:", error);
      const detallesBasicos: SolicitudDetalles = {
        ...solicitud,
        maquina: solicitud.maquina ? {
          ...solicitud.maquina,
          estado: "Desconocido"
        } : undefined,
        cliente: solicitud.cliente ? {
          ...solicitud.cliente,
          correo: "No disponible"
        } : undefined,
        tecnico_asignado: solicitud.tecnico_asignado ? {
          ...solicitud.tecnico_asignado,
          correo: "No disponible"
        } : undefined,
        repuestos_utilizados: []
      };
      setSolicitudSeleccionada(detallesBasicos);
      setModalDetalles(true);
    } finally {
      setLoadingDetalles(false);
    }
  };

  const abrirModalAsignacion = (solicitud: Solicitud): void => {
    const solicitudBasica: SolicitudDetalles = {
      ...solicitud,
      maquina: solicitud.maquina ? {
        ...solicitud.maquina,
        estado: "Desconocido"
      } : undefined,
      cliente: solicitud.cliente ? {
        ...solicitud.cliente,
        correo: "No disponible"
      } : undefined,
      tecnico_asignado: solicitud.tecnico_asignado ? {
        ...solicitud.tecnico_asignado,
        correo: "No disponible"
      } : undefined,
      repuestos_utilizados: []
    };
    setSolicitudSeleccionada(solicitudBasica);
    setAsignacion({
      tecnico_id: 0,
      fecha_hora_reparacion: ""
    });
    setTecnicoSeleccionado(null);
    setSearchTecnico("");
    setModalAsignacion(true);
  };

  const seleccionarTecnico = (tecnico: Tecnico) => {
    setAsignacion({ ...asignacion, tecnico_id: tecnico.tecnico_id });
    setTecnicoSeleccionado(tecnico);
    setSearchTecnico("");
  };

  // Función para notificar al técnico
  const notificarTecnico = async (tecnicoId: number, solicitudId: number, fechaHoraReparacion: string): Promise<boolean> => {
    try {
      const response = await fetch(`${backendUrl}/api/notificaciones/asignacion-tecnico`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tecnico_id: tecnicoId,
          solicitud_id: solicitudId,
          fecha_hora_reparacion: fechaHoraReparacion,
          cliente_nombre: solicitudSeleccionada?.cliente?.nombre_usuario || 'Cliente',
          maquina_nombre: solicitudSeleccionada?.maquina?.nombre || 'Máquina',
          descripcion_falla: solicitudSeleccionada?.descripcion_falla || 'Sin descripción'
        }),
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error("Error al notificar técnico:", error);
      return false;
    }
  };

  const asignarTecnico = async (): Promise<void> => {
    if (!asignacion.tecnico_id || !asignacion.fecha_hora_reparacion) {
      alert('Por favor complete todos los campos');
      return;
    }

    setEnviando(true);
    try {
      // 1. Primero asignar el técnico a la solicitud
      const endpoint = `${backendUrl}/api/SolicitudReparacion/asignar-tecnico`;
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          solicitud_id: solicitudSeleccionada?.id,
          tecnico_id: asignacion.tecnico_id,
          fecha_hora_reparacion: asignacion.fecha_hora_reparacion
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Error ${response.status} al asignar técnico`);
      }
      
      if (data.success) {
        // 2. Notificar al técnico
        const notificacionEnviada = await notificarTecnico(
          asignacion.tecnico_id, 
          solicitudSeleccionada!.id, 
          asignacion.fecha_hora_reparacion
        );

        let mensaje = 'Técnico asignado exitosamente. ';
        mensaje += notificacionEnviada 
          ? 'Se han enviado notificaciones al cliente y al técnico.' 
          : 'Técnico asignado pero hubo un error al enviar la notificación al técnico.';

        setSuccessMessage(mensaje);
        setModalAsignacion(false);
        setAsignacion({ tecnico_id: 0, fecha_hora_reparacion: "" });
        setTecnicoSeleccionado(null);
        fetchSolicitudes();
        fetchNotificaciones(); // Actualizar notificaciones
        
        // Ocultar mensaje de éxito después de 5 segundos
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        throw new Error(data.message || 'Error al asignar técnico');
      }
    } catch (error) {
      console.error("Error al asignar técnico:", error);
      alert('Error al asignar técnico: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    } finally {
      setEnviando(false);
    }
  };

  const aplicarFiltros = (): void => {
    let filtered = [...solicitudes];

    if (searchTerm) {
      filtered = filtered.filter(solicitud => {
        const busquedaLower = searchTerm.toLowerCase();
        const nombreMaquina = getNombreMaquina(solicitud).toLowerCase();
        const nombreCliente = getNombreCliente(solicitud).toLowerCase();
        const idSolicitud = solicitud.id.toString();
        
        return (
          nombreMaquina.includes(busquedaLower) ||
          nombreCliente.includes(busquedaLower) ||
          idSolicitud.includes(busquedaLower) ||
          (solicitud.descripcion_falla?.toLowerCase() || '').includes(busquedaLower) ||
          (solicitud.estado?.toLowerCase() || '').includes(busquedaLower) ||
          (getNombreTecnico(solicitud)?.toLowerCase() || '').includes(busquedaLower)
        );
      });
    }

    if (activeTab === "ordenes") {
      filtered = filtered.filter(solicitud => 
        solicitud.estado !== 'finalizada'
      );
    } else if (activeTab === "historial") {
      filtered = filtered.filter(solicitud => 
        solicitud.estado === 'finalizada'
      );
    }

    setSolicitudesFiltradas(filtered);
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
        return "Técnico Asignado";
      case "prefinalizada":
        return "Reparación Completada";
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

  const getNombreCliente = (solicitud: Solicitud): string => {
    return solicitud.cliente?.nombre_usuario || `Cliente #${solicitud.cliente_id}`;
  };

  const getNombreTecnico = (solicitud: Solicitud): string => {
    return solicitud.tecnico_asignado?.nombre_usuario || "No asignado";
  };

  const estadisticas = {
    total: solicitudes.length,
    pendientes: solicitudes.filter(s => s.estado?.toLowerCase() === "pendiente").length,
    tecnicoAsignado: solicitudes.filter(s => s.estado?.toLowerCase() === "tecnico_asignado").length,
    prefinalizadas: solicitudes.filter(s => s.estado?.toLowerCase() === "prefinalizada").length,
    finalizadas: solicitudes.filter(s => s.estado?.toLowerCase() === "finalizada").length,
  };

  return (
    <div className="space-y-8">
      {/* Modal de detalles */}
      {modalDetalles && solicitudSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-bl from-blue-500/40 to-red-600/40">
            <div className="flex items-center justify-between mb-6 ">
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
                          {solicitudSeleccionada.maquina?.nombre || getNombreMaquina(solicitudSeleccionada)}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 font-bold">Tipo:</span>
                        <p className="text-gray-900 font-bold">
                          {solicitudSeleccionada.maquina?.tipo || getTipoMaquina(solicitudSeleccionada)}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 font-bold">Cliente:</span>
                        <p className="text-gray-900 font-bold">
                          {solicitudSeleccionada.cliente?.nombre_usuario || getNombreCliente(solicitudSeleccionada)}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 font-bold">Estado:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getEstadoStyles(solicitudSeleccionada.estado)}`}>
                          {getEstadoTexto(solicitudSeleccionada.estado)}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 font-bold">Gravedad:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getGravedadStyles(solicitudSeleccionada.gravedad)}`}>
                          {getGravedadTexto(solicitudSeleccionada.gravedad)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 rounded-lg p-4">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      Descripción de la Falla
                    </h4>
                    <p className="text-gray-700">{solicitudSeleccionada.descripcion_falla}</p>
                  </div>

                  {/* Sección de Repuestos Utilizados */}
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

                <div className="space-y-4">
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

                  {solicitudSeleccionada.tecnico_asignado && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <User className="w-5 h-5 text-green-600" />
                        Técnico Asignado
                      </h4>
                      <p className="text-gray-900 font-bold">{solicitudSeleccionada.tecnico_asignado.nombre_usuario}</p>
                      {solicitudSeleccionada.tecnico_asignado.correo && (
                        <p className="text-sm text-gray-600">{solicitudSeleccionada.tecnico_asignado.correo}</p>
                      )}
                    </div>
                  )}

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
          </div>
        </div>
      )}

      {/* Modal de asignación de técnico */}
      {modalAsignacion && solicitudSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-bl from-blue-500/40 to-red-600/40">
            <div className="flex items-center justify-between mb-6 ">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Asignar Técnico</h3>
                <p className="text-gray-600 mt-1">Solicitud #{solicitudSeleccionada.id} - {getNombreMaquina(solicitudSeleccionada)}</p>
              </div>
              <button
                onClick={() => setModalAsignacion(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Seleccionar Técnico
                  </h4>
                  
                  <div className="relative mb-3">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar técnico por nombre, especialidad..."
                      value={searchTecnico}
                      onChange={(e) => setSearchTecnico(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
                    />
                  </div>

                  {tecnicoSeleccionado && (
                    <div className="bg-white rounded-lg p-4 border border-green-200 mb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{tecnicoSeleccionado.nombre_tecnico}</p>
                            <p className="text-sm text-gray-600">{tecnicoSeleccionado.especialidad}</p>
                          </div>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {tecnicosFiltrados.length > 0 ? (
                      tecnicosFiltrados.map((tecnico) => (
                        <div
                          key={`tecnico-${tecnico.tecnico_id}`}
                          onClick={() => seleccionarTecnico(tecnico)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                            tecnicoSeleccionado?.tecnico_id === tecnico.tecnico_id
                              ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500 ring-opacity-20'
                              : 'bg-white border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{tecnico.nombre_tecnico}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-600 mt-1">
                                <span className="flex items-center gap-1">
                                  <Wrench className="w-3 h-3" />
                                  {tecnico.especialidad}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {tecnico.ubicacion}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No se encontraron técnicos</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-600" />
                    Programar Reparación
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Fecha y Hora de Reparación
                      </label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                          type="datetime-local"
                          value={asignacion.fecha_hora_reparacion}
                          onChange={(e) => setAsignacion({...asignacion, fecha_hora_reparacion: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-black bg-white font-medium"
                          required
                        />
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h5 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <Info className="w-4 h-4 text-gray-600" />
                        Resumen de la Solicitud
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Máquina:</span>
                          <span className="font-semibold">{getNombreMaquina(solicitudSeleccionada)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cliente:</span>
                          <span className="font-semibold">{getNombreCliente(solicitudSeleccionada)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Gravedad:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getGravedadStyles(solicitudSeleccionada.gravedad)}`}>
                            {getGravedadTexto(solicitudSeleccionada.gravedad)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setModalAsignacion(false)}
                    className="flex-1 px-4 py-3 border border-red-300 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-bold flex items-center justify-center gap-2"
                    disabled={enviando}
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                  <button
                    onClick={asignarTecnico}
                    disabled={enviando || !asignacion.tecnico_id || !asignacion.fecha_hora_reparacion}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-900 text-white rounded-lg hover:shadow-lg transition-all font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {enviando ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Asignando...
                      </>
                    ) : (
                      <>
                        <User className="w-4 h-4" />
                        Asignar Técnico
                      </>
                    )}
                  </button>
                </div>
              </div>
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
                fetchTecnicos();
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
      <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-lg border border-blue-100/50 p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/30 to-purple-600/30 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-blue-500/30 to-purple-600/30 rounded-full translate-y-8 -translate-x-8"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Gestión de Órdenes de Trabajo</h2>
              <p className="text-gray-600 font-bold">
                Administra y asigna solicitudes de reparación del sistema
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
                <Wrench className="w-8 h-8 text-blue-600" />
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
                <User className="w-8 h-8 text-blue-600" />
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
            onClick={() => setActiveTab("ordenes")}
            className={`px-6 py-3 font-medium transition-all duration-300 rounded-t-lg ${
              activeTab === "ordenes"
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105"
                : "text-gray-600 hover:text-blue-600 hover:bg-blue-50/80"
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Órdenes Activas
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
              Historial Completo
            </div>
          </button>
        </div>
      </div>

      {/* Contenido de las Tabs */}
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
                  placeholder="Buscar por cliente, máquina, ID de solicitud..."
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
                </div>
              ))}
            </div>
          ) : solicitudesFiltradas.length === 0 ? (
            <div className="p-12 text-center">
              <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {solicitudes.length === 0 ? 'No hay órdenes de trabajo' : 'No se encontraron órdenes'}
              </h3>
              <p className="text-gray-600 mb-6">
                {solicitudes.length === 0 
                  ? 'Las órdenes de trabajo aparecerán aquí cuando los clientes creen solicitudes' 
                  : 'Intenta con otros términos de búsqueda'
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-bold inline-flex items-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Limpiar búsqueda
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4 p-6">
              {solicitudesFiltradas.map((solicitud) => (
                <div key={solicitud.id} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all p-6 border-l-4 border-blue-500">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">Solicitud #{solicitud.id}</h3>
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
                        
                        {solicitud.tecnico_asignado && (
                          <div>
                            <span className="text-gray-500 font-bold">Técnico Asignado:</span>
                            <p className="text-gray-900 font-bold">{getNombreTecnico(solicitud)}</p>
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
                      
                      {solicitud.estado === 'pendiente' && (
                        <button 
                          onClick={() => abrirModalAsignacion(solicitud)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold flex items-center gap-2"
                        >
                          <User className="w-4 h-4" />
                          Asignar Técnico
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