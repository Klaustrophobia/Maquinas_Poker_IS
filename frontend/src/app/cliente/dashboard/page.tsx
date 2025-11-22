"use client";
import React, { useState, useEffect } from "react";
import { Menu, X, Home, Wrench, FileText, LogOut, Plus, Eye, Search, Download, Calendar, User, DollarSign, Package, Clock, Building, Users, Filter, Mail } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

// Interfaces para tipado
interface Maquina {
  id: number;
  nombre: string;
  tipo: string;
  ubicacion: string;
  estado: string;
  fecha_asignacion?: string;
  estado_asignacion?: string;
}

interface Solicitud {
  id: number;
  maquina: string;
  fecha: string;
  estado: string;
  descripcion: string;
}

interface LoteRecibo {
  id: number;
  cliente_id: number;
  fecha_recibo: string;
  ingreso: number;
  egreso: number;
  total: number;
  parte_empresa: number;
  parte_cliente: number;
  fecha_creacion: string;
  cantidad_recibos: number;
  cliente?: {
    id: number;
    nombre_usuario: string;
    correo: string;
  };
  recibos?: ReciboDetalle[];
}

interface ReciboDetalle {
  id: number;
  maquina: {
    id: number;
    nombre: string;
  };
  ingreso: number;
  egreso: number;
  total: number;
  fecha_recibo: string;
}

interface Stats {
  totalMaquinas: number;
  solicitudesPendientes: number;
  recibosTotal: number;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

// Interface para el usuario completo desde la API
interface UsuarioCompleto {
  id: number;
  nombre_usuario: string;
  correo: string;
  rol: string;
}

// Modal de Detalle
const ModalDetalleLote: React.FC<{
  lote: LoteRecibo | null;
  isOpen: boolean;
  onClose: () => void;
  formatFecha: (fecha: string) => string;
  formatMoneda: (monto: number) => string;
}> = ({ lote, isOpen, onClose, formatFecha, formatMoneda }) => {
  const [clienteInfo, setClienteInfo] = useState<UsuarioCompleto | null>(null);
  const [cargandoCliente, setCargandoCliente] = useState(false);
  const [errorCliente, setErrorCliente] = useState<string | null>(null);
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  // Efecto para cargar la información del cliente cuando se abre el modal
  useEffect(() => {
    const fetchClienteInfo = async () => {
      if (!lote || !lote.cliente_id) {
        console.log('No hay lote o cliente_id:', lote);
        return;
      }
      
      setCargandoCliente(true);
      setErrorCliente(null);
      try {
        console.log('Buscando cliente con ID:', lote.cliente_id);
        const res = await fetch(`${backendUrl}/api/Usuario/${lote.cliente_id}`);
        
        console.log('Respuesta de la API:', res.status, res.statusText);
        
        if (res.ok) {
          const data = await res.json();
          console.log('Datos del cliente recibidos:', data);
          setClienteInfo(data);
        } else {
          const errorText = await res.text();
          console.error('Error en respuesta de API:', res.status, errorText);
          setErrorCliente(`Error ${res.status}: No se pudo cargar la información del cliente`);
          setClienteInfo(null);
        }
      } catch (error) {
        console.error('Error fetching cliente info:', error);
        setErrorCliente('Error de conexión al cargar información del cliente');
        setClienteInfo(null);
      } finally {
        setCargandoCliente(false);
      }
    };

    if (isOpen && lote) {
      fetchClienteInfo();
    } else {
      // Resetear cuando se cierra el modal
      setClienteInfo(null);
      setErrorCliente(null);
    }
  }, [isOpen, lote, backendUrl]);

  if (!isOpen || !lote) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header del Modal */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-red-500 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Detalle del Recibo #{lote.id}</h2>
                <p className="text-indigo-100">Información completa del recibo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido del Modal */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Información General */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Información General</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-bold">Fecha del Recibo:</span>
                  <span className="font-bold text-gray-900">{formatFecha(lote.fecha_recibo)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-bold">Fecha de Creación:</span>
                  <span className="font-bold text-gray-900">{formatFecha(lote.fecha_creacion)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-bold">Total de Maquinas:</span>
                  <span className="font-bold text-blue-600 text-lg">{lote.cantidad_recibos}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Información del Cliente</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-bold">Cliente:</span>
                  {cargandoCliente ? (
                    <div className="animate-pulse bg-gray-200 h-4 w-24 rounded"></div>
                  ) : errorCliente ? (
                    <span className="text-red-500 text-sm">{errorCliente}</span>
                  ) : (
                    <span className="font-bold text-gray-900">
                      {clienteInfo?.nombre_usuario || lote.cliente?.nombre_usuario || "No disponible"}
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-bold">Correo:</span>
                  {cargandoCliente ? (
                    <div className="animate-pulse bg-gray-200 h-4 w-32 rounded"></div>
                  ) : errorCliente ? (
                    <span className="text-red-500 text-sm">{errorCliente}</span>
                  ) : (
                    <span className="font-bold text-gray-900 flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {clienteInfo?.correo || lote.cliente?.correo || "No disponible"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Resumen Financiero */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-8 border border-purple-200 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              Resumen Financiero
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                <div className="text-2xl font-bold text-blue-600">{formatMoneda(lote.ingreso)}</div>
                <div className="text-sm text-gray-600 font-bold">Total Ingresos</div>
              </div>
              <div className="text-center bg-white rounded-lg p-4 shadow-sm border border-red-100">
                <div className="text-2xl font-bold text-red-600">{formatMoneda(lote.egreso)}</div>
                <div className="text-sm text-gray-600 font-bold">Total Egresos</div>
              </div>
              <div className="text-center bg-white rounded-lg p-4 shadow-sm border border-green-100">
                <div className="text-2xl font-bold text-green-600">{formatMoneda(lote.total)}</div>
                <div className="text-sm text-gray-600 font-bold">Total Neto</div>
              </div>
              <div className="text-center bg-white rounded-lg p-4 shadow-sm border border-purple-100">
                <div className="text-2xl font-bold text-purple-600">{lote.cantidad_recibos}</div>
                <div className="text-sm text-gray-600 font-bold">Maquinas</div>
              </div>
            </div>
          </div>

          {/* Distribución */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Parte de la Empresa</h3>
                  <p className="text-sm text-gray-600 font-bold">60% del Total Neto</p>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">{formatMoneda(lote.parte_empresa)}</div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-amber-500 h-3 rounded-full" 
                    style={{ width: '60%' }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Parte del Cliente</h3>
                  <p className="text-sm text-gray-600 font-bold">40% del Total Neto</p>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-600 mb-2">{formatMoneda(lote.parte_cliente)}</div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full" 
                    style={{ width: '40%' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recibos Individuales */}
          {lote.recibos && lote.recibos.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Package className="w-4 h-4 text-white" />
                  </div>
                  Recibos Individuales por Maquina ({lote.recibos.length})
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {lote.recibos.map((recibo, index) => (
                  <div key={recibo.id} className="p-6 hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Wrench className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg">{recibo.maquina.nombre}</h4>
                          <p className="text-sm text-gray-500 font-bold">Recibo #{recibo.id}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500 font-bold bg-gray-100 px-3 py-1 rounded-full">
                        {formatFecha(recibo.fecha_recibo)}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center bg-green-50 rounded-lg p-3 border border-green-200">
                        <div className="text-sm text-gray-600 font-bold">Ingreso</div>
                        <div className="font-bold text-green-600 text-lg">{formatMoneda(recibo.ingreso)}</div>
                      </div>
                      <div className="text-center bg-red-50 rounded-lg p-3 border border-red-200">
                        <div className="text-sm text-gray-600 font-bold">Egreso</div>
                        <div className="font-bold text-red-600 text-lg">{formatMoneda(recibo.egreso)}</div>
                      </div>
                      <div className="text-center bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="text-sm text-gray-600 font-bold">Total</div>
                        <div className="font-bold text-blue-600 text-lg">{formatMoneda(recibo.total)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!lote.recibos || lote.recibos.length === 0) && (
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-8 text-center shadow-sm">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-bold text-yellow-800 text-lg mb-2">Detalle de Recibos No Disponible</h4>
              <p className="text-yellow-700 font-bold">
                Este lote contiene {lote.cantidad_recibos} recibo(s) individual(es)
              </p>
            </div>
          )}
        </div>

        {/* Footer del Modal */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 font-bold shadow-sm hover:shadow-md"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ClienteDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [stats, setStats] = useState<Stats>({
    totalMaquinas: 0,
    solicitudesPendientes: 0,
    recibosTotal: 0,
  });
  
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [loadingMaquinas, setLoadingMaquinas] = useState(false);
  const [lotesRecibos, setLotesRecibos] = useState<LoteRecibo[]>([]);
  const [lotesRecibosFiltrados, setLotesRecibosFiltrados] = useState<LoteRecibo[]>([]);
  const [loadingLotesRecibos, setLoadingLotesRecibos] = useState(false);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);

  // Estado para el modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [loteSeleccionado, setLoteSeleccionado] = useState<LoteRecibo | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  // Estado para el filtro
  const [filtroBusqueda, setFiltroBusqueda] = useState("");
  
  // Estados para descarga de PDF
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [reciboParaDescargar, setReciboParaDescargar] = useState<LoteRecibo | null>(null);
  const [descargandoPDF, setDescargandoPDF] = useState(false);

  const { usuario, logout } = useAuth();
  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  // Redirección por seguridad
  useEffect(() => {
    if (!usuario) {
      router.push("/login");
    } else if (usuario.rol !== "Cliente") {
      router.push("/login");
    }
  }, [usuario, router]);

  const menuItems: MenuItem[] = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "maquinas", label: "Mis Máquinas", icon: Wrench },
    { id: "solicitudes", label: "Solicitudes", icon: Wrench },
    { id: "recibos", label: "Recibos", icon: FileText },
  ];

  useEffect(() => {
    if (usuario?.id) {
      fetchMaquinas();
      fetchLotesRecibos();
      fetchSolicitudes();
    }
  }, [usuario]);

  // Aplicar filtro cuando cambie el texto o los lotes
  useEffect(() => {
    if (filtroBusqueda.trim() === "") {
      setLotesRecibosFiltrados(lotesRecibos);
    } else {
      const filtered = lotesRecibos.filter(lote => 
        lote.id.toString().includes(filtroBusqueda.trim()) ||
        formatFecha(lote.fecha_recibo).toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
        formatFecha(lote.fecha_creacion).toLowerCase().includes(filtroBusqueda.toLowerCase())
      );
      setLotesRecibosFiltrados(filtered);
    }
  }, [filtroBusqueda, lotesRecibos]);

  const fetchMaquinas = async (): Promise<void> => {
    setLoadingMaquinas(true);
    try {
      const res = await fetch(`${backendUrl}/api/Maquina-Cliente/listar?cliente_id=${usuario?.id}`);
      if (res.ok) {
        const data = await res.json();
        
        const misMaquinas: Maquina[] = Array.isArray(data) 
          ? data.map((asignacion: any) => ({
              ...asignacion.maquina,
              fecha_asignacion: asignacion.fecha_asignacion,
              estado_asignacion: asignacion.estado
            }))
          : [];
        
        setMaquinas(misMaquinas);
        setStats(prev => ({ ...prev, totalMaquinas: misMaquinas.length }));
      } else {
        throw new Error("Error al cargar máquinas");
      }
    } catch (error) {
      console.error("Error:", error);
      setMaquinas([]);
      setStats(prev => ({ ...prev, totalMaquinas: 0 }));
    } finally {
      setLoadingMaquinas(false);
    }
  };

  const fetchLotesRecibos = async (): Promise<void> => {
    setLoadingLotesRecibos(true);
    try {
      const res = await fetch(`${backendUrl}/api/Lote-Recibo?cliente_id=${usuario?.id}`);
      
      if (res.ok) {
        const data = await res.json();
        
        let lotesData: LoteRecibo[] = [];
        
        if (data.success && Array.isArray(data.data)) {
          lotesData = data.data;
        } else if (Array.isArray(data)) {
          lotesData = data;
        }
        
        // ✅ ORDENAR por ID DESCENDENTE (lote más reciente primero)
        lotesData.sort((a, b) => b.id - a.id);
        
        console.log('Lotes de recibos cargados:', lotesData);
        
        setLotesRecibos(lotesData);
        setLotesRecibosFiltrados(lotesData);
        setStats(prev => ({ ...prev, recibosTotal: lotesData.length }));
      } else {
        console.warn('API de lotes-recibos no disponible, usando datos de prueba');
        // Datos de prueba desde la tabla LoteRecibo
        const lotesSimulados: LoteRecibo[] = [
          { 
            id: 1008,
            cliente_id: usuario?.id || 1,
            fecha_recibo: "2025-03-10T00:00:00.000Z", 
            ingreso: 1420.00,
            egreso: 120.00,
            total: 1300.00,
            parte_empresa: 780.00,
            parte_cliente: 520.00,
            fecha_creacion: "2025-03-10T14:20:00.000Z",
            cantidad_recibos: 2,
            cliente: {
              id: usuario?.id || 1,
              nombre_usuario: usuario?.nombre_usuario || "cliente1",
              correo: usuario?.correo || "cliente1@example.com"
            }
          },
          { 
            id: 1005,
            cliente_id: usuario?.id || 1,
            fecha_recibo: "2025-02-05T00:00:00.000Z", 
            ingreso: 980.50,
            egreso: 75.25,
            total: 905.25,
            parte_empresa: 543.15,
            parte_cliente: 362.10,
            fecha_creacion: "2025-02-05T09:15:00.000Z",
            cantidad_recibos: 1,
            cliente: {
              id: usuario?.id || 1,
              nombre_usuario: usuario?.nombre_usuario || "cliente1",
              correo: usuario?.correo || "cliente1@example.com"
            }
          },
        ];
        
        setLotesRecibos(lotesSimulados);
        setLotesRecibosFiltrados(lotesSimulados);
        setStats(prev => ({ ...prev, recibosTotal: lotesSimulados.length }));
      }
    } catch (error) {
      console.error("Error fetching lotes de recibos:", error);
      setLotesRecibos([]);
      setLotesRecibosFiltrados([]);
      setStats(prev => ({ ...prev, recibosTotal: 0 }));
    } finally {
      setLoadingLotesRecibos(false);
    }
  };

  const fetchSolicitudes = async (): Promise<void> => {
    setLoadingSolicitudes(true);
    try {
      setTimeout(() => {
        const solicitudesSimuladas: Solicitud[] = [
          { id: 1, maquina: "Compresor Industrial", fecha: "2025-03-10", estado: "En proceso", descripcion: "Falla en el motor" },
          { id: 2, maquina: "Generador 500W", fecha: "2025-03-08", estado: "Pendiente", descripcion: "No enciende" },
        ];
        setSolicitudes(solicitudesSimuladas);
        const pendientes = solicitudesSimuladas.filter(s => s.estado === "Pendiente").length;
        setStats(prev => ({ ...prev, solicitudesPendientes: pendientes }));
        setLoadingSolicitudes(false);
      }, 500);
    } catch (error) {
      console.error("Error:", error);
      setSolicitudes([]);
      setLoadingSolicitudes(false);
    }
  };

  const handleLogout = (): void => {
    logout();
    router.push("/login");
  };

  // Función para formatear fecha
  const formatFecha = (fechaString: string): string => {
    if (!fechaString) return "N/A";
    try {
      return new Date(fechaString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return "Fecha inválida";
    }
  };

  // Función para formatear moneda
  const formatMoneda = (monto: number): string => {
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: 'HNL'
    }).format(monto);
  };

  // Función para abrir vista previa de descarga
  const handleDescargarRecibo = async (lote: LoteRecibo): Promise<void> => {
    setReciboParaDescargar(lote);
    setShowPDFPreview(true);
    
    if (!lote.recibos) {
      try {
        const res = await fetch(`${backendUrl}/api/Lote-Recibo/${lote.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setReciboParaDescargar(data.data);
          }
        }
      } catch (error) {
        console.error('Error al cargar detalle del lote:', error);
      }
    }
  };

  // Función para cargar scripts de CDN
  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  };

  // Función para descargar PDF
  const descargarPDF = async (): Promise<void> => {
    if (!reciboParaDescargar) return;
    
    setDescargandoPDF(true);
    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      
      const element = document.getElementById('pdf-content');
      if (!element) {
        throw new Error('Elemento de contenido no encontrado');
      }
      
      const canvas = await (window as any).html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        allowTaint: true,
        logging: false,
        imageTimeout: 0
      });
      
      const imgData = canvas.toDataURL('image/png');
      const jsPDFModule = (window as any).jspdf;
      const pdf = new jsPDFModule.jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`recibo-${reciboParaDescargar.id}.pdf`);
      setShowPDFPreview(false);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor intenta nuevamente.');
    } finally {
      setDescargandoPDF(false);
    }
  };

  // ✅ FUNCIÓN MEJORADA: Abrir modal con detalle del lote
  const handleVerDetalle = async (lote: LoteRecibo): Promise<void> => {
    setCargandoDetalle(true);
    setLoteSeleccionado(lote);
    
    try {
      // Obtener el detalle completo del lote con sus recibos
      const res = await fetch(`${backendUrl}/api/Lote-Recibo/${lote.id}`);
      
      if (res.ok) {
        const data = await res.json();
        
        if (data.success && data.data) {
          setLoteSeleccionado(data.data);
        }
      }
    } catch (error) {
      console.error('Error al obtener detalle del lote:', error);
    } finally {
      setCargandoDetalle(false);
      setModalAbierto(true);
    }
  };

  // Función para cerrar el modal
  const cerrarModal = (): void => {
    setModalAbierto(false);
    setLoteSeleccionado(null);
  };

  // Función para limpiar filtro
  const limpiarFiltro = (): void => {
    setFiltroBusqueda("");
  };

  const renderContent = (): React.ReactNode => {
    switch (activeSection) {
      case "maquinas":
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Mis Máquinas</h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar máquina..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {loadingMaquinas ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                    <div className="h-12 bg-gray-200 rounded mb-4"></div>
                  </div>
                ))}
              </div>
            ) : maquinas.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No tienes máquinas asignadas</h3>
                <p className="text-gray-600">Contacta con el administrador para asignarte máquinas</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {maquinas.map((m, i) => (
                  <div key={m.id || i} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 group border-l-4 border-blue-500">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-red-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Wrench className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{m.nombre || `Máquina #${i + 1}`}</h3>
                    <p className="text-sm text-gray-600 mb-1">Tipo: {m.tipo || "N/A"}</p>
                    <p className="text-sm text-gray-600 mb-1">Ubicación: {m.ubicacion || "N/A"}</p>
                    <p className="text-sm text-gray-600 mb-4">
                      Asignada desde: {formatFecha(m.fecha_asignacion || "")}
                    </p>
                    <button className="w-full bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-bold flex items-center justify-center gap-2">
                      <Eye className="w-4 h-4" />
                      Ver detalles
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "solicitudes":
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Mis Solicitudes de Reparación</h2>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-red-500 text-white rounded-lg hover:shadow-lg transition-all font-bold flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Nueva Solicitud
              </button>
            </div>

            {loadingSolicitudes ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  </div>
                ))}
              </div>
            ) : solicitudes.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No tienes solicitudes</h3>
                <p className="text-gray-600 mb-6">Crea una nueva solicitud de reparación</p>
                <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-red-500 text-white rounded-lg hover:shadow-lg transition-all font-bold inline-flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Nueva Solicitud
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {solicitudes.map((s) => (
                  <div key={s.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border-l-4 border-red-500">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-blue-500 rounded-lg flex items-center justify-center">
                          <Wrench className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{s.maquina}</h3>
                          <p className="text-sm text-gray-600">Solicitud #{s.id} • {s.fecha}</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">{s.descripcion}</p>
                    <button className="w-full bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm font-bold flex items-center justify-center gap-2">
                      <Eye className="w-4 h-4" />
                      Ver detalles
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "recibos":
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Mis Recibos</h2>
              <div className="flex items-center gap-4">
                {/* Buscador unificado por ID y fecha */}
                <div className="relative">
                 <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Buscar por ID o fecha..."
                    value={filtroBusqueda}
                    onChange={(e) => setFiltroBusqueda(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 font-bold text-gray-900"
                  />
                {filtroBusqueda && (
                  <button
                    onClick={limpiarFiltro}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              </div>
            </div>

            {/* Información del filtro */}
            {filtroBusqueda && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-800 font-bold">
                      Mostrando {lotesRecibosFiltrados.length} de {lotesRecibos.length} lotes
                    </span>
                  </div>
                  <button
                    onClick={limpiarFiltro}
                    className="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Limpiar filtro
                  </button>
                </div>
                {lotesRecibosFiltrados.length === 0 && (
                  <p className="text-blue-700 text-sm mt-2">
                    No se encontraron Recibos con: {filtroBusqueda}
                  </p>
                )}
              </div>
            )}

            {loadingLotesRecibos ? (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 animate-pulse">
                  <div className="h-8 bg-gray-200 rounded mb-4"></div>
                </div>
              </div>
            ) : !Array.isArray(lotesRecibosFiltrados) || lotesRecibosFiltrados.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {filtroBusqueda ? 'No se encontraron Recibos' : 'No tienes lotes de recibos'}
                </h3>
                <p className="text-gray-600">
                  {filtroBusqueda 
                    ? `No hay Recibos que coincidan con: ${filtroBusqueda}`
                    : 'Los recibos aparecerán aquí cuando se haga el recibo'
                  }
                </p>
                {filtroBusqueda && (
                  <button
                    onClick={limpiarFiltro}
                    className="mt-4 px-6 py-2 bg-blue-500 text white rounded-lg hover:bg-blue-600 transition-colors font-bold"
                  >
                    Ver todos los Recibos
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Recibos</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Fecha</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Total Neto</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Maquinas</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {lotesRecibosFiltrados.map((lote) => (
                      <tr key={lote.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-red-500 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <span className="font-bold text-gray-900 block">{lote.id}</span>
                              <span className="text-xs text-gray-400 block mt-1">
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 font-bold">{formatFecha(lote.fecha_recibo)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-green-600">
                            {formatMoneda(lote.total)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 font-bold">
                            Empresa: {formatMoneda(lote.parte_empresa)}
                          </div>
                          <div className="text-xs text-gray-500 font-bold">
                            Cliente: {formatMoneda(lote.parte_cliente)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 font-bold">
                            {lote.cantidad_recibos} Maquina(s)
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-6">
                            <button 
                              onClick={() => handleVerDetalle(lote)}
                              disabled={cargandoDetalle}
                              className="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center gap-1 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors border border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Eye className="w-4 h-4" />
                              {cargandoDetalle ? "Cargando..." : "Ver Detalle"}
                            </button>
                            <button 
                              onClick={() => handleDescargarRecibo(lote)}
                              className="bg-green-500 hover:bg-green-600 text-white text-sm font-bold flex items-center gap-1 px-4 py-2 rounded-lg transition-colors shadow-sm hover:shadow-md border border-green-600"
                            >
                              <Download className="w-4 h-4" />
                              Descargar PDF
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Bienvenido, {usuario?.nombre_usuario}
              </h2>
              <p className="text-gray-600 font-bold">
                Este es tu panel de control. Gestiona tus máquinas, solicitudes y recibos.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { title: "Mis Máquinas", value: stats.totalMaquinas, bgColor: "bg-blue-100", textColor: "text-blue-600", icon: Wrench, gradient: "from-blue-500 to-blue-600" },
                { title: "Solicitudes Pendientes", value: stats.solicitudesPendientes, bgColor: "bg-red-100", textColor: "text-red-600", icon: Wrench, gradient: "from-red-500 to-red-600" },
                { title: "Total Lotes", value: stats.recibosTotal, bgColor: "bg-purple-100", textColor: "text-purple-600", icon: FileText, gradient: "from-purple-500 to-purple-600" },
              ].map((card, index) => {
                const IconComponent = card.icon;
                return (
                  <div key={index} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6">
                    <div className={`${card.bgColor} ${card.textColor} p-3 rounded-lg inline-block mb-4`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">{card.value}</h3>
                    <p className="text-sm text-gray-600 font-bold">{card.title}</p>
                  </div>
                );
              })}
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Accesos Rápidos</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: "Ver Máquinas", desc: "Consulta el estado de tus equipos", icon: Wrench, action: () => setActiveSection("maquinas") },
                  { title: "Nueva Solicitud", desc: "Solicita reparación de máquina", icon: Wrench, action: () => setActiveSection("solicitudes") },
                  { title: "Mis Recibos", desc: "Consulta tu historial de pagos", icon: FileText, action: () => setActiveSection("recibos") },
                ].map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <button 
                      key={index} 
                      onClick={action.action}
                      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 text-left group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-br from-blue-500 to-red-500 text-white p-3 rounded-lg group-hover:scale-110 transition-transform">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                            {action.title}
                          </h4>
                          <p className="text-sm text-gray-600 font-bold">{action.desc}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Actividad Reciente</h3>
              <div className="space-y-4">
                {[
                  { action: "Solicitud de reparación creada", item: "Compresor Industrial", time: "Hace 2 días", icon: "🔧" },
                  { action: "Lote de recibos generado", item: "LOTE-1008", time: "Hace 5 días", icon: "🧾" },
                  { action: "Máquina actualizada", item: "Generador 500W", time: "Hace 1 semana", icon: "⚙️" },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border-l-4 border-blue-500">
                    <div className="text-2xl">{activity.icon}</div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600 font-bold">{activity.item}</p>
                    </div>
                    <span className="text-xs text-gray-500 font-bold">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  if (!usuario) return null;

  return (
    <>
      <div className="flex h-screen bg-gradient-to-br from-blue-50 to-red-50 overflow-hidden">
        <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shadow-lg`}>
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              {sidebarOpen && (
                <div>
                  <h1 className="font-bold text-gray-900 text-lg">Mi Panel</h1>
                  <p className="text-xs text-gray-500">Portal Cliente</p>
                </div>
              )}
            </div>
          </div>

          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive ? "bg-gradient-to-r from-blue-500 to-red-500 text-white shadow-md" : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <IconComponent className="w-5 h-5 flex-shrink-0" />
                      {sidebarOpen && <span className="font-bold text-sm">{item.label}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              {sidebarOpen && <span className="text-sm font-bold">Ocultar</span>}
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
            <div className="px-8 py-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {menuItems.find(item => item.id === activeSection)?.label || "Dashboard"}
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 font-bold">Bienvenido, {usuario?.nombre_usuario}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-bold text-sm flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          </header>
          <div className="p-8">{renderContent()}</div>
        </main>
      </div>

      {/* Modal de Detalle */}
      <ModalDetalleLote
        lote={loteSeleccionado}
        isOpen={modalAbierto}
        onClose={cerrarModal}
        formatFecha={formatFecha}
        formatMoneda={formatMoneda}
      />

      {/* MODAL DE VISTA PREVIA PARA DESCARGAR PDF */}
      {showPDFPreview && reciboParaDescargar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Botones de acción */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-900">Vista Previa del Recibo</h3>
              <div className="flex gap-3">
                <button
                  onClick={descargarPDF}
                  disabled={descargandoPDF}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  {descargandoPDF ? "Descargando..." : "Descargar PDF"}
                </button>
                <button
                  onClick={() => setShowPDFPreview(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Contenido del Recibo */}
            <div id="pdf-content" className="p-8">
              {/* Encabezado */}
              <div className="text-center mb-8 border-b-2 border-gray-300 pb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">RECIBO DE MÁQUINAS</h1>
                <p className="text-lg text-gray-600">Sistema de Gestión PokerMGMT</p>
                <p className="text-sm text-gray-500 mt-2">Recibo #{reciboParaDescargar.id}</p>
              </div>

              {/* Información del Cliente y Fecha */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">CLIENTE:</h3>
                  <p className="text-xl font-bold text-gray-900">{reciboParaDescargar.cliente?.nombre_usuario || "N/A"}</p>
                  <p className="text-sm text-gray-600">ID Cliente: {reciboParaDescargar.cliente_id}</p>
                </div>
                <div className="text-right">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">FECHA:</h3>
                  <p className="text-xl font-bold text-gray-900">
                    {formatFecha(reciboParaDescargar.fecha_recibo)}
                  </p>
                </div>
              </div>

              {/* Tabla de Máquinas */}
              {reciboParaDescargar.recibos && reciboParaDescargar.recibos.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">DETALLE DE MÁQUINAS</h3>
                  <table className="w-full border-collapse border border-gray-300">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">Máquina</th>
                        <th className="border border-gray-300 px-4 py-3 text-right text-sm font-semibold">Ingresos (HNL)</th>
                        <th className="border border-gray-300 px-4 py-3 text-right text-sm font-semibold">Gastos (HNL)</th>
                        <th className="border border-gray-300 px-4 py-3 text-right text-sm font-semibold">Total (HNL)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reciboParaDescargar.recibos.map((recibo, index) => (
                        <tr key={recibo.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-300 px-4 py-3 font-medium">{recibo.maquina.nombre}</td>
                          <td className="border border-gray-300 px-4 py-3 text-right">{recibo.ingreso.toFixed(2)}</td>
                          <td className="border border-gray-300 px-4 py-3 text-right">{recibo.egreso.toFixed(2)}</td>
                          <td className="border border-gray-300 px-4 py-3 text-right font-bold">{recibo.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Resumen Financiero */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">RESUMEN TOTAL</h3>
                  <div className="flex justify-between border-b border-gray-300 pb-2">
                    <span className="text-gray-700">Total Ingresos:</span>
                    <span className="font-bold">{formatMoneda(reciboParaDescargar.ingreso)}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-300 pb-2">
                    <span className="text-gray-700">Total Gastos:</span>
                    <span className="font-bold">{formatMoneda(reciboParaDescargar.egreso)}</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-lg font-bold">Total Neto:</span>
                    <span className="text-lg font-bold text-green-600">{formatMoneda(reciboParaDescargar.total)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">DISTRIBUCIÓN</h3>
                  <div className="flex justify-between border-b border-gray-300 pb-2">
                    <span className="text-gray-700">Parte Empresa (60%):</span>
                    <span className="font-bold">{formatMoneda(reciboParaDescargar.parte_empresa)}</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-lg font-bold">Parte Cliente (40%):</span>
                    <span className="text-lg font-bold text-blue-600">{formatMoneda(reciboParaDescargar.parte_cliente)}</span>
                  </div>
                </div>
              </div>

              {/* Pie del Recibo */}
              <div className="border-t-2 border-gray-300 pt-6 mt-8">
                <p className="text-xs text-center text-gray-500 mt-6">
                  Este documento es un recibo oficial generado por el Sistema de Gestión PokerMGMT
                </p>
                <p className="text-xs text-center text-gray-500">
                  Fecha de emisión: {new Date().toLocaleString('es-ES')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}