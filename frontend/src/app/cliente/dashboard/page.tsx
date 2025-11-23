"use client";
import React, { useState, useEffect } from "react";
import { Menu, X, Home, Wrench, FileText, LogOut, Plus, Eye, Search, Calendar, User, DollarSign, Package, Filter, Mail, Printer } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

// Interfaces
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

  useEffect(() => {
    const fetchClienteInfo = async () => {
      if (!lote || !lote.cliente_id) return;
      
      setCargandoCliente(true);
      setErrorCliente(null);
      try {
        const res = await fetch(`${backendUrl}/api/Usuario/${lote.cliente_id}`);
        
        if (res.ok) {
          const data = await res.json();
          setClienteInfo(data);
        } else {
          setErrorCliente(`Error: No se pudo cargar la información del cliente`);
          setClienteInfo(null);
        }
      } catch (error) {
        console.error('Error fetching cliente info:', error);
        setErrorCliente('Error de conexión');
        setClienteInfo(null);
      } finally {
        setCargandoCliente(false);
      }
    };

    if (isOpen && lote) {
      fetchClienteInfo();
    } else {
      setClienteInfo(null);
      setErrorCliente(null);
    }
  }, [isOpen, lote, backendUrl]);

  if (!isOpen || !lote) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
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
                {lote.recibos.map((recibo) => (
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
        </div>

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
  const [modalAbierto, setModalAbierto] = useState(false);
  const [loteSeleccionado, setLoteSeleccionado] = useState<LoteRecibo | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [filtroBusqueda, setFiltroBusqueda] = useState("");
  
  // Estados para imprimir
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [reciboParaImprimir, setReciboParaImprimir] = useState<LoteRecibo | null>(null);

  const { usuario, logout } = useAuth();
  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const menuItems: MenuItem[] = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "maquinas", label: "Mis Máquinas", icon: Wrench },
    { id: "solicitudes", label: "Solicitudes", icon: Wrench },
    { id: "recibos", label: "Recibos", icon: FileText },
  ];

  useEffect(() => {
    if (!usuario) {
      router.push("/login");
    } else if (usuario.rol !== "Cliente") {
      router.push("/login");
    }
  }, [usuario, router]);

  useEffect(() => {
    if (usuario?.id) {
      fetchMaquinas();
      fetchLotesRecibos();
      fetchSolicitudes();
    }
  }, [usuario]);

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
      }
    } catch (error) {
      console.error("Error:", error);
      setMaquinas([]);
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
        
        lotesData.sort((a, b) => b.id - a.id);
        setLotesRecibos(lotesData);
        setLotesRecibosFiltrados(lotesData);
        setStats(prev => ({ ...prev, recibosTotal: lotesData.length }));
      }
    } catch (error) {
      console.error("Error:", error);
      setLotesRecibos([]);
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

  const formatMoneda = (monto: number): string => {
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: 'HNL'
    }).format(monto);
  };

  // Función para abrir modal de impresión
  const handleImprimirRecibo = async (lote: LoteRecibo): Promise<void> => {
    setReciboParaImprimir(lote);
    
    if (!lote.recibos) {
      try {
        const res = await fetch(`${backendUrl}/api/Lote-Recibo/${lote.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setReciboParaImprimir(data.data);
          }
        }
      } catch (error) {
        console.error('Error al cargar detalle del lote:', error);
      }
    }
    
    setShowPrintModal(true);
  };

  // Función mejorada para imprimir recibo
  const imprimirRecibo = (): void => {
    const contenidoImprimir = document.getElementById('contenido-imprimir-cliente');
    
    if (contenidoImprimir && reciboParaImprimir) {
      const ventanaImpresion = window.open('', '_blank');
      
      if (!ventanaImpresion) {
        alert('Por favor permite las ventanas emergentes para imprimir el recibo');
        return;
      }
      
      ventanaImpresion.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Recibo #${reciboParaImprimir.id}</title>
            <style>
              @page {
                size: A4;
                margin: 1cm;
              }
              body {
                font-family: Arial, sans-serif;
                color: black;
                font-weight: bold;
                background: white;
                margin: 0;
                padding: 15px;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 15px 0;
              }
              th, td {
                border: 1px solid black;
                padding: 6px 10px;
                text-align: left;
              }
              th {
                background-color: #f0f0f0;
                font-weight: bold;
              }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .text-left { text-align: left; }
              .font-bold { font-weight: bold; }
              .border-b-2 { border-bottom: 2px solid black; }
              .border-t-2 { border-top: 2px solid black; }
              .border-t-4 { border-top: 4px solid black; }
              .mb-2 { margin-bottom: 0.5rem; }
              .mb-3 { margin-bottom: 0.75rem; }
              .mb-4 { margin-bottom: 1rem; }
              .mb-6 { margin-bottom: 1.5rem; }
              .mt-2 { margin-top: 0.5rem; }
              .mt-4 { margin-top: 1rem; }
              .mt-6 { margin-top: 1.5rem; }
              .pb-2 { padding-bottom: 0.5rem; }
              .pb-4 { padding-bottom: 1rem; }
              .pt-2 { padding-top: 0.5rem; }
              .pt-4 { padding-top: 1rem; }
              .px-4 { padding-left: 1rem; padding-right: 1rem; }
              .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
              .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
              .grid { display: grid; }
              .grid-cols-2 { grid-template-columns: 1fr 1fr; }
              .gap-6 { gap: 1.5rem; }
              .gap-8 { gap: 2rem; }
              .space-y-2 > * + * { margin-top: 0.5rem; }
              .space-y-3 > * + * { margin-top: 0.75rem; }
              
              /* Colores para impresión */
              .bg-gray-100 { background-color: #f7fafc; }
              .bg-gray-200 { background-color: #edf2f7; }
              .text-red-600 { color: #dc2626; }
              .text-green-600 { color: #16a34a; }
              .text-blue-600 { color: #2563eb; }
              .text-purple-600 { color: #9333ea; }
              .bg-blue-50 { background-color: #dbeafe; }
              .bg-red-50 { background-color: #fee2e2; }
              .bg-green-50 { background-color: #dcfce7; }
              .bg-purple-50 { background-color: #f3e8ff; }
              
              /* Estilos específicos para el recibo compacto */
              .encabezado-recibo {
                text-align: center;
                margin-bottom: 1rem;
                padding-bottom: 0.5rem;
              }
              .titulo-principal {
                font-size: 24px;
                margin-bottom: 0.25rem;
              }
              .subtitulo {
                font-size: 16px;
                margin-bottom: 0.25rem;
              }
              .numero-recibo {
                font-size: 14px;
                margin-top: 0.25rem;
              }
              .seccion {
                margin-bottom: 1rem;
              }
              .firmas {
                margin-top: 1.5rem;
              }
            </style>
          </head>
          <body>
            ${contenidoImprimir.innerHTML}
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 1000);
              };
            </script>
          </body>
        </html>
      `);
      ventanaImpresion.document.close();
    } else {
      window.print();
    }
  };

  const handleVerDetalle = async (lote: LoteRecibo): Promise<void> => {
    setCargandoDetalle(true);
    setLoteSeleccionado(lote);
    
    try {
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

  const cerrarModal = (): void => {
    setModalAbierto(false);
    setLoteSeleccionado(null);
  };

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
                    : 'Los recibos aparecerán aquí cuando se generen'
                  }
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Recibos</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Fecha</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Total Neto</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Máquinas</th>
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
                            <span className="font-bold text-gray-900">#{lote.id}</span>
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
                            Tu parte: {formatMoneda(lote.parte_cliente)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 font-bold">
                            {lote.cantidad_recibos} Máquina(s)
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => handleVerDetalle(lote)}
                              disabled={cargandoDetalle}
                              className="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
                            >
                              <Eye className="w-4 h-4" />
                              Ver
                            </button>
                            <button 
                              onClick={() => handleImprimirRecibo(lote)}
                              className="px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all font-bold flex items-center gap-1"
                            >
                              <Printer className="w-4 h-4" />
                              Imprimir
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
                { title: "Mis Máquinas", value: stats.totalMaquinas, bgColor: "bg-blue-100", textColor: "text-blue-600", icon: Wrench },
                { title: "Solicitudes Pendientes", value: stats.solicitudesPendientes, bgColor: "bg-red-100", textColor: "text-red-600", icon: Wrench },
                { title: "Total Recibos", value: stats.recibosTotal, bgColor: "bg-purple-100", textColor: "text-purple-600", icon: FileText },
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
          </div>
        );
    }
  };

  if (!usuario) return null;

  return (
    <>
      <div className="flex h-screen bg-gradient-to-br from-blue-50 to-red-50 overflow-hidden print:hidden">
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

      <ModalDetalleLote
        lote={loteSeleccionado}
        isOpen={modalAbierto}
        onClose={cerrarModal}
        formatFecha={formatFecha}
        formatMoneda={formatMoneda}
      />

      {/* MODAL DE VISTA PREVIA PARA IMPRIMIR */}
      {showPrintModal && reciboParaImprimir && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 print:hidden">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Botones de acción - Solo visible en pantalla */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Vista Previa del Recibo</h3>
              <div className="flex gap-3">
                <button
                  onClick={imprimirRecibo}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all font-medium flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Contenido del Recibo para Imprimir */}
            <div id="contenido-imprimir-cliente" className="p-4 bg-white">
              {/* Encabezado Compacto */}
              <div className="encabezado-recibo border-b-2 border-black">
                <h1 className="titulo-principal font-bold text-black">RECIBO DE MÁQUINAS</h1>
                <p className="subtitulo font-bold text-black">Sistema de Gestión PokerMGMT</p>
                <p className="numero-recibo font-bold text-black">Recibo #{reciboParaImprimir.id}</p>
              </div>

              {/* Información del Cliente y Fecha */}
              <div className="grid grid-cols-2 gap-6 mb-4 seccion">
                <div>
                  <h3 className="text-sm font-semibold text-black mb-1 font-bold">CLIENTE:</h3>
                  <p className="text-lg font-bold text-black">{reciboParaImprimir.cliente?.nombre_usuario || usuario?.nombre_usuario}</p>
                </div>
                <div className="text-right">
                  <h3 className="text-sm font-semibold text-black mb-1 font-bold">FECHA:</h3>
                  <p className="text-lg font-bold text-black">
                    {formatFecha(reciboParaImprimir.fecha_recibo)}
                  </p>
                </div>
              </div>

              {/* Tabla de Máquinas */}
              {reciboParaImprimir.recibos && reciboParaImprimir.recibos.length > 0 && (
                <div className="mb-4 seccion">
                  <h3 className="text-md font-bold text-black mb-2">DETALLE DE MÁQUINAS</h3>
                  <table className="w-full border-collapse border-2 border-black">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="border-2 border-black px-3 py-2 text-left text-sm font-bold text-black">Máquina</th>
                        <th className="border-2 border-black px-3 py-2 text-right text-sm font-bold text-black">Ingresos (LPS)</th>
                        <th className="border-2 border-black px-3 py-2 text-right text-sm font-bold text-black">Egresos (LPS)</th>
                        <th className="border-2 border-black px-3 py-2 text-right text-sm font-bold text-black">Total (LPS)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reciboParaImprimir.recibos.map((recibo, index) => {
                        const esNegativo = recibo.total < 0;
                        return (
                          <tr key={recibo.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}>
                            <td className="border border-black px-3 py-2 font-bold text-black">{recibo.maquina.nombre}</td>
                            <td className="border border-black px-3 py-2 text-right font-bold text-black">{recibo.ingreso.toFixed(2)}</td>
                            <td className="border border-black px-3 py-2 text-right font-bold text-black">{recibo.egreso.toFixed(2)}</td>
                            <td className={`border border-black px-3 py-2 text-right font-bold ${esNegativo ? 'text-red-600' : 'text-black'}`}>
                              {recibo.total.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Resumen Financiero */}
              <div className="grid grid-cols-2 gap-6 mb-4 seccion">
                <div className="space-y-2">
                  <h3 className="text-md font-bold text-black mb-2">RESUMEN TOTAL</h3>
                  <div className="flex justify-between border-b border-black pb-1">
                    <span className="text-black font-bold text-sm">Total Ingresos:</span>
                    <span className="font-bold text-black text-sm">{formatMoneda(reciboParaImprimir.ingreso)}</span>
                  </div>
                  <div className="flex justify-between border-b border-black pb-1">
                    <span className="text-black font-bold text-sm">Total Egresos:</span>
                    <span className="font-bold text-black text-sm">{formatMoneda(reciboParaImprimir.egreso)}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-md font-bold text-black">Total Neto:</span>
                    <span className="text-md font-bold text-black">{formatMoneda(reciboParaImprimir.total)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-md font-bold text-black mb-2">DISTRIBUCIÓN</h3>
                  <div className="flex justify-between border-b border-black pb-1">
                    <span className="text-black font-bold text-sm">Empresa (60%):</span>
                    <span className="font-bold text-black text-sm">{formatMoneda(reciboParaImprimir.parte_empresa)}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-md font-bold text-black">Cliente (40%):</span>
                    <span className="text-md font-bold text-black">{formatMoneda(reciboParaImprimir.parte_cliente)}</span>
                  </div>
                </div>
              </div>

              {/* Pie del Recibo */}
              <div className="border-t-2 border-black pt-4 mt-4 firmas">
                <div className="grid grid-cols-2 gap-6 mb-4">
                  <div>
                    <p className="text-sm text-black mb-2 font-bold">Firma del Cliente:</p>
                    <div className="border-b border-black w-full h-12 mb-1"></div>
                  </div>
                  <div>
                    <p className="text-sm text-black mb-2 font-bold">Firma del Propietario:</p>
                    <div className="border-b border-black w-full h-12 mb-1"></div>
                  </div>
                </div>
                <p className="text-xs text-center text-black mt-4 font-bold">
                  Este documento es un recibo oficial generado por el Sistema de Gestión PokerMGMT
                </p>
                <p className="text-xs text-center text-black font-bold">
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