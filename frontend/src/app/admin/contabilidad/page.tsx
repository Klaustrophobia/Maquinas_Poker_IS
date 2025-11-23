"use client";
import { useState, useEffect } from "react";
import { Menu, X, Home, Users, Package, Wrench, Truck, LogOut, FileText, Clipboard, Trash2, Plus, Calendar, DollarSign, User, Filter, History, Printer, ArrowLeft } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

// Interfaces
interface Cliente {
  id: number;
  nombre_usuario: string;
}

interface Maquina {
  id: number;
  nombre: string;
  ubicacion: string;
  codigo: string;
}

interface MaquinaRecibo {
  maquina_id: number;
  nombre: string;
  codigo: string;
  ingreso: string;
  egreso: string;
  total: string;
}

interface ReciboExistente {
  id: number;
  lote_recibo: number;
  cliente: {
    id: number;
    nombre: string;
  };
  fecha_recibo: string;
  total_ingresos: number;
  total_egresos: number;
  total_neto: number;
  parte_empresa: number;
  parte_cliente: number;
  maquinas: Array<{
    id: number;
    nombre: string;
    codigo: string;
    ingreso: number;
    egreso: number;
    total: number;
  }>;
  fecha_creacion?: string;
}

export default function ContabilidadPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { usuario, logout } = useAuth();
  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  // Estados
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<number | null>(null);
  const [clienteNombre, setClienteNombre] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [maquinasCliente, setMaquinasCliente] = useState<Maquina[]>([]);
  const [fechaActual, setFechaActual] = useState("");
  const [maquinasRecibo, setMaquinasRecibo] = useState<MaquinaRecibo[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"generar" | "historial">("generar");
  const [recibosExistentes, setRecibosExistentes] = useState<ReciboExistente[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [filtroCliente, setFiltroCliente] = useState<number | "">("");
  const [recibosFiltrados, setRecibosFiltrados] = useState<ReciboExistente[]>([]);
  const [reciboParaImprimir, setReciboParaImprimir] = useState<ReciboExistente | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, href: "/admin/dashboard" },
    { id: "maquinas", label: "Máquinas", icon: Wrench, href: "/admin/dashboard" },
    { id: "usuarios", label: "Usuarios", icon: Users, href: "/admin/dashboard" },
    { id: "proveedores", label: "Proveedores", icon: Truck, href: "/admin/dashboard" },
    { id: "repuestos", label: "Repuestos", icon: Package, href: "/admin/dashboard" },
    { id: "recibos", label: "Recibos", icon: FileText, href: "/admin/contabilidad" },
    { id: "ordenesTrabajo", label: "Órdenes de Trabajo", icon: Clipboard, href: "/admin/ordenesTrabajo" },
  ];

  useEffect(() => {
    fetchClientes();
    const today = new Date().toISOString().split('T')[0];
    setFechaActual(today);
  }, []);

  useEffect(() => {
    if (selectedCliente) {
      fetchMaquinasPorCliente(selectedCliente);
    } else {
      setMaquinasCliente([]);
      setMaquinasRecibo([]);
    }
  }, [selectedCliente]);

  useEffect(() => {
    if (activeTab === "historial") {
      fetchRecibosExistentes();
    }
  }, [activeTab]);

  const fetchClientes = async () => {
    setError(null);
    try {
      const res = await fetch(`${backendUrl}/api/Usuario/Cliente`);
      if (!res.ok) throw new Error(`Error ${res.status} al cargar clientes`);
      const data = await res.json();
      setClientes(data);
    } catch (err) {
      console.error("Error al cargar clientes:", err);
      setError(err instanceof Error ? err.message : "Error desconocido al cargar clientes");
    }
  };

  const fetchMaquinasPorCliente = async (clienteId: number) => {
    if (!clienteId) return;
    try {
      const res = await fetch(`${backendUrl}/api/Maquina-Cliente/listar?cliente_id=${clienteId}`);
      if (!res.ok) throw new Error(`Error ${res.status} al cargar máquinas`);
      const data = await res.json();
      
      const maquinasFormateadas = data.map((item: any) => ({
        id: item.maquina.id,
        nombre: item.maquina.nombre,
        ubicacion: item.maquina.ubicacion,
        codigo: `PM-${item.maquina.id.toString().padStart(3, '0')}`
      }));
      setMaquinasCliente(maquinasFormateadas);

      const nuevasMaquinasRecibo: MaquinaRecibo[] = maquinasFormateadas.map((maquina: Maquina) => ({
        maquina_id: maquina.id,
        nombre: maquina.nombre,
        codigo: maquina.codigo,
        ingreso: "",
        egreso: "",
        total: "0.00"
      }));
      setMaquinasRecibo(nuevasMaquinasRecibo);
    } catch (err) {
      console.error("Error al cargar máquinas:", err);
      setMaquinasCliente([]);
      setMaquinasRecibo([]);
    }
  };

  const fetchRecibosExistentes = async () => {
    setLoadingHistorial(true);
    try {
      const res = await fetch(`${backendUrl}/api/Recibo`);
      if (!res.ok) throw new Error('Error al cargar el historial de recibos');
      
      const result = await res.json();
      if (result.success) {
        const recibosOrdenados = result.data.sort((a: ReciboExistente, b: ReciboExistente) => 
          b.id - a.id
        );
        setRecibosExistentes(recibosOrdenados);
        setRecibosFiltrados(recibosOrdenados);
      } else {
        throw new Error(result.error || 'Error al cargar recibos');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar historial');
    } finally {
      setLoadingHistorial(false);
    }
  };

  const filtrarRecibos = (clienteId: number | "") => {
    setFiltroCliente(clienteId);
    if (!clienteId) {
      setRecibosFiltrados(recibosExistentes);
    } else {
      const filtrados = recibosExistentes.filter(recibo => recibo.cliente.id === clienteId);
      setRecibosFiltrados(filtrados);
    }
  };

  const removerMaquinaDelRecibo = (maquinaId: number) => {
    setMaquinasRecibo(maquinasRecibo.filter(m => m.maquina_id !== maquinaId));
  };

  const actualizarValorMaquina = (maquinaId: number, campo: keyof MaquinaRecibo, valor: string) => {
    
    let n = parseFloat(valor);
    if (isNaN(n) || n < 0) n = 0;
    valor = n.toString();
    
    setMaquinasRecibo(maquinasRecibo.map(maquina => {
      if (maquina.maquina_id === maquinaId) {
        const updated = { ...maquina, [campo]: valor };
        
        if (campo === 'ingreso' || campo === 'egreso') {
          const ingreso = campo === 'ingreso' ? parseFloat(valor) || 0 : parseFloat(maquina.ingreso) || 0;
          const egreso = campo === 'egreso' ? parseFloat(valor) || 0 : parseFloat(maquina.egreso) || 0;
          updated.total = (ingreso - egreso).toFixed(2);
        }
        
        return updated;
      }
      return maquina;
    }));
  };

  const calcularTotales = () => {
    const totalIngresos = maquinasRecibo.reduce((sum, maquina) => sum + (parseFloat(maquina.ingreso) || 0), 0);
    const totalEgresos = maquinasRecibo.reduce((sum, maquina) => sum + (parseFloat(maquina.egreso) || 0), 0);
    const totalNeto = totalIngresos - totalEgresos;
    const parteEmpresa = totalNeto * 0.6;
    const parteCliente = totalNeto * 0.4;

    return {
      totalIngresos: totalIngresos.toFixed(2),
      totalEgresos: totalEgresos.toFixed(2),
      totalNeto: totalNeto.toFixed(2),
      parteEmpresa: parteEmpresa.toFixed(2),
      parteCliente: parteCliente.toFixed(2)
    };
  };

  const generarRecibo = async () => {
    if (!selectedCliente || maquinasRecibo.length === 0) {
      setError("Seleccione un cliente y agregue al menos una máquina");
      return;
    }

    const maquinasIncompletas = maquinasRecibo.filter(m => !m.ingreso || !m.egreso);
    if (maquinasIncompletas.length > 0) {
      setError("Complete los ingresos y gastos para todas las máquinas");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const reciboData = {
        cliente_id: selectedCliente,
        fecha_recibo: new Date().toISOString().split('T')[0],
        maquinas: maquinasRecibo.map(maquina => ({
          maquina_id: maquina.maquina_id,
          ingreso: parseFloat(maquina.ingreso),
          egreso: parseFloat(maquina.egreso),
          total: parseFloat(maquina.total)
        }))
      };

      const response = await fetch(`${backendUrl}/api/Recibo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reciboData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || `Error ${response.status} al generar el recibo`);
      }

      if (result.success) {
        alert('Recibo generado exitosamente');
        setMaquinasRecibo([]);
        setSelectedCliente(null);
        setClienteNombre("");
        setMaquinasCliente([]);
        fetchRecibosExistentes();
      } else {
        throw new Error(result.error || 'Error al generar el recibo');
      }

    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Error al generar el recibo');
    } finally {
      setLoading(false);
    }
  };

  const abrirVistaPrevia = (recibo: ReciboExistente) => {
    setReciboParaImprimir(recibo);
    setShowPrintModal(true);
  };

  const imprimirRecibo = () => {
  const contenidoImprimir = document.getElementById('contenido-imprimir');
  
  if (contenidoImprimir && reciboParaImprimir) {
    const ventanaImpresion = window.open('', '_blank');
    
    // Verificar si la ventana se abrió correctamente
    if (!ventanaImpresion) {
      alert('Por favor permite las ventanas emergentes para imprimir el recibo');
      return;
    }
    
    ventanaImpresion.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Recibo #${reciboParaImprimir.lote_recibo}</title>
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
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
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
              background-color: #f0f0f0 !important;
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
            .bg-gray-100 { background-color: #f7fafc !important; }
            .bg-gray-200 { background-color: #edf2f7 !important; }
            .text-red-600 { color: #dc2626 !important; }
            .text-green-600 { color: #16a34a !important; }
            .text-blue-600 { color: #2563eb !important; }
            .text-purple-600 { color: #9333ea !important; }
            .bg-blue-50 { background-color: #dbeafe !important; }
            .bg-red-50 { background-color: #fee2e2 !important; }
            .bg-green-50 { background-color: #dcfce7 !important; }
            .bg-purple-50 { background-color: #f3e8ff !important; }
            
            /* Estilos específicos para el recibo compacto */
            .encabezado-recibo {
              text-align: center;
              margin-bottom: 1rem !important;
              padding-bottom: 0.5rem !important;
            }
            .titulo-principal {
              font-size: 24px;
              margin-bottom: 0.25rem !important;
            }
            .subtitulo {
              font-size: 16px;
              margin-bottom: 0.25rem !important;
            }
            .numero-recibo {
              font-size: 14px;
              margin-top: 0.25rem !important;
            }
            .seccion {
              margin-bottom: 1rem !important;
            }
            .firmas {
              margin-top: 1.5rem !important;
            }
            
            /* Ocultar elementos del navegador en impresión */
            @media print {
              @page {
                margin: 0.5cm;
              }
              body {
                margin: 0.5cm;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
                padding: 10px;
              }
              /* Forzar colores en impresión */
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
            }
          </style>
        </head>
        <body>
          ${contenidoImprimir.innerHTML}
          <script>
            // Configurar antes de imprimir
            function configurarImpresion() {
              // Ocultar elementos del navegador
              document.title = "Recibo #${reciboParaImprimir.lote_recibo}";
              
              // Configurar para imprimir a color
              const style = document.createElement('style');
              style.innerHTML = \`
                @media print {
                  * {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    color-adjust: exact !important;
                  }
                }
              \`;
              document.head.appendChild(style);
              
              // Configurar eventos de impresión
              window.onafterprint = function() {
                setTimeout(function() {
                  window.close();
                }, 500);
              };
              
              // Imprimir inmediatamente
              setTimeout(function() {
                window.print();
              }, 500);
            }
            
            // Ejecutar cuando la ventana esté lista
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', configurarImpresion);
            } else {
              configurarImpresion();
            }
          </script>
        </body>
      </html>
    `);
    ventanaImpresion.document.close();
  } else {
    // Fallback: imprimir normalmente con ajustes de color
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
      }
    `;
    document.head.appendChild(style);
    window.print();
  }
};

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const totales = calcularTotales();
  const puedeGenerarRecibo = selectedCliente && maquinasRecibo.length > 0 && 
    maquinasRecibo.every(m => m.ingreso && m.egreso);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* SIDEBAR */}
      <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shadow-lg print:hidden`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Package className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-gray-900 text-lg">Admin Panel</h1>
                <p className="text-xs text-gray-500">Sistema de Gestión</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = item.id === "recibos";
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      if (item.href) {
                        router.push(item.href);
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <IconComponent className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors mb-2"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            {sidebarOpen && <span className="text-sm font-medium">Ocultar</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm print:hidden">
          <div className="px-8 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sistema de Recibos</h1>
              <p className="text-sm text-gray-600">Gestión de recibos y facturación</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Bienvenido, {usuario?.nombre_usuario}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-8 print:hidden">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("generar")}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === "generar"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Generar Recibo
              </div>
            </button>
            <button
              onClick={() => setActiveTab("historial")}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === "historial"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <History className="w-4 h-4" />
                Historial de Recibos
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* TAB: GENERAR RECIBO */}
          {activeTab === "generar" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Columna Izquierda */}
              <div className="lg:col-span-2 space-y-6">
                {/* Detalles del Cliente */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Detalles del Cliente</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del Cliente
                      </label>
                      <select
                        value={selectedCliente ?? ""}
                        onChange={(e) => {
                          const id = Number(e.target.value);
                          const nombre = clientes.find(c => c.id === id)?.nombre_usuario || "";
                          setSelectedCliente(id);
                          setClienteNombre(nombre);
                          fetchMaquinasPorCliente(id);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                      >
                        <option value="">Seleccione un cliente</option>
                        {clientes.map((cliente) => (
                          <option key={cliente.id} value={cliente.id}>
                            {cliente.nombre_usuario}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Mensaje cuando no hay máquinas */}
                {selectedCliente && maquinasCliente.length === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                    <div className="flex items-center gap-4">
                      <Wrench className="w-8 h-8 text-yellow-600" />
                      <div>
                        <h3 className="font-bold text-yellow-900 text-lg">Sin máquinas asignadas</h3>
                        <p className="text-yellow-700 text-sm mt-1">
                          El cliente seleccionado no tiene ninguna máquina asignada.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Desglose por Máquina */}
                {maquinasRecibo.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Desglose por Máquina</h2>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID Máquina</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ingresos (LPS)</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Egresos (LPS)</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total (LPS)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {maquinasRecibo.map((maquina) => {
                            const total = parseFloat(maquina.total || '0');
                            const esNegativo = total < 0;
                            
                            return (
                              <tr key={maquina.maquina_id} className="hover:bg-gray-50">
                                <td className="px-4 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                      <Wrench className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-900">{maquina.codigo}</p>
                                      <p className="text-xs text-gray-500">{maquina.nombre}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-4">
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={maquina.ingreso}
                                    onChange={(e) => actualizarValorMaquina(maquina.maquina_id, 'ingreso', e.target.value)}
                                    className="w-32 px-3 py-2 border-2 border-green-500 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-700"
                                    placeholder="0.00"
                                  />
                                </td>
                                <td className="px-4 py-4">
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={maquina.egreso}
                                    onChange={(e) => actualizarValorMaquina(maquina.maquina_id, 'egreso', e.target.value)}
                                    className="w-32 px-3 py-2 border-2 border-red-500 rounded-lg focus:ring-2 focus:ring-red-500 text-gray-700"
                                    placeholder="0.00"
                                  />
                                </td>
                                <td className="px-4 py-4">
                                  <span className={`font-semibold ${esNegativo ? 'text-red-600' : 'text-gray-900'}`}>
                                    {total.toFixed(2)} LPS
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Columna Derecha - Resumen */}
              {maquinasRecibo.length > 0 && (
                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Resumen Financiero</h2>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Ingresos</span>
                        <span className="text-lg font-semibold text-gray-900">
                          {parseFloat(totales.totalIngresos).toFixed(2)} LPS
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Egresos</span>
                        <span className="text-lg font-semibold text-gray-900">
                          {parseFloat(totales.totalEgresos).toFixed(2)} LPS
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4 mb-6">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-lg font-semibold text-gray-900">Total Neto</span>
                        <span className="text-2xl font-bold text-gray-900">
                          {parseFloat(totales.totalNeto).toFixed(2)} LPS
                        </span>
                      </div>

                      <div className="space-y-4 bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">División de Ganancias</h3>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Parte Propietario (60%)</span>
                          <span className="text-lg font-bold text-green-600">
                            {parseFloat(totales.parteEmpresa).toFixed(2)} LPS
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Parte Cliente (40%)</span>
                          <span className="text-lg font-bold text-blue-600">
                            {parseFloat(totales.parteCliente).toFixed(2)} LPS
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={generarRecibo}
                      disabled={!puedeGenerarRecibo || loading}
                      className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Creando...
                        </>
                      ) : (
                        <>
                          <FileText className="w-5 h-5" />
                          Crear Recibo
                        </>
                      )}
                    </button>
                    
                    <p className="text-xs text-gray-500 text-center mt-3">
                      Complete todos los campos para generar el recibo
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: HISTORIAL */}
          {activeTab === "historial" && (
            <div className="bg-white rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Historial de Recibos</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {recibosFiltrados.length} {recibosFiltrados.length === 1 ? 'recibo encontrado' : 'recibos encontrados'}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Filter className="w-5 h-5 text-gray-600" />
                    <select
                      value={filtroCliente}
                      onChange={(e) => filtrarRecibos(e.target.value ? Number(e.target.value) : "")}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-700"
                    >
                      <option value="">Todos los clientes</option>
                      {clientes.map((cliente) => (
                        <option key={cliente.id} value={cliente.id}>
                          {cliente.nombre_usuario}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {loadingHistorial ? (
                  <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-6"></div>
                    <p className="text-gray-600 font-medium">Cargando recibos...</p>
                  </div>
                ) : recibosFiltrados.length > 0 ? (
                  <div className="space-y-6">
                    {recibosFiltrados.map((recibo) => (
                      <div 
                        key={recibo.id}
                        className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all"
                      >
                        {/* Header del Recibo */}
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6 gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                                <span className="text-white font-bold">#{recibo.lote_recibo}</span>
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-gray-900">
                                  {recibo.cliente.nombre}
                                </h3>
                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(recibo.fecha_recibo).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold">
                              <Wrench className="w-4 h-4" />
                              {recibo.maquinas.length} máquina(s)
                            </span>
                            <button
                              onClick={() => abrirVistaPrevia(recibo)}
                              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all font-medium flex items-center gap-2"
                            >
                              <Printer className="w-4 h-4" />
                              Imprimir
                            </button>
                          </div>
                        </div>

                        {/* Máquinas del recibo */}
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Wrench className="w-5 h-5 text-blue-500" />
                            Máquinas incluidas
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {recibo.maquinas.map((maquina) => (
                              <div key={maquina.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Wrench className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{maquina.codigo}</p>
                                    <p className="text-xs text-gray-600">{maquina.nombre}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-gray-900">
                                    {maquina.total.toFixed(2)} LPS
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {maquina.ingreso.toFixed(2)} - {maquina.egreso.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Resumen financiero */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-xs text-blue-600 font-medium">Total Ingresos</p>
                            <p className="text-lg font-bold text-blue-700">
                              {recibo.total_ingresos.toFixed(2)} LPS
                            </p>
                          </div>
                          <div className="text-center p-3 bg-red-50 rounded-lg">
                            <p className="text-xs text-red-600 font-medium">Total Egresos</p>
                            <p className="text-lg font-bold text-red-700">
                              {recibo.total_egresos.toFixed(2)} LPS
                            </p>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <p className="text-xs text-green-600 font-medium">Total Neto</p>
                            <p className="text-lg font-bold text-green-700">
                              {recibo.total_neto.toFixed(2)} LPS
                            </p>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <p className="text-xs text-purple-600 font-medium">Parte Cliente</p>
                            <p className="text-lg font-bold text-purple-700">
                              {recibo.parte_cliente.toFixed(2)} LPS
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No hay recibos generados</h3>
                    <p className="text-gray-600">
                      {filtroCliente ? 
                        "No se encontraron recibos para el cliente seleccionado." : 
                        "Los recibos que generes aparecerán aquí."
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

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

            {/* Contenido del Recibo para Imprimir - ESTE ES EL QUE SE IMPRIME */}
<div id="contenido-imprimir" className="p-4 bg-white">
  {/* Encabezado Compacto */}
  <div className="encabezado-recibo border-b-2 border-black">
    <h1 className="titulo-principal font-bold text-black">RECIBO DE MÁQUINAS</h1>
    <p className="subtitulo font-bold text-black">Sistema de Gestión PokerMGMT</p>
    <p className="numero-recibo font-bold text-black">Recibo #{reciboParaImprimir.lote_recibo}</p>
  </div>

  {/* Información del Cliente y Fecha */}
  <div className="grid grid-cols-2 gap-6 mb-4 seccion">
    <div>
      <h3 className="text-sm font-semibold text-black mb-1 font-bold">CLIENTE:</h3>
      <p className="text-lg font-bold text-black">{reciboParaImprimir.cliente.nombre}</p>
    </div>
    <div className="text-right">
      <h3 className="text-sm font-semibold text-black mb-1 font-bold">FECHA:</h3>
      <p className="text-lg font-bold text-black">
        {new Date(reciboParaImprimir.fecha_recibo).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </p>
    </div>
  </div>

  {/* Tabla de Máquinas */}
  <div className="mb-4 seccion">
    <h3 className="text-md font-bold text-black mb-2">DETALLE DE MÁQUINAS</h3>
    <table className="w-full border-collapse border-2 border-black">
      <thead className="bg-gray-200">
        <tr>
          <th className="border-2 border-black px-3 py-2 text-left text-sm font-bold text-black">Código</th>
          <th className="border-2 border-black px-3 py-2 text-left text-sm font-bold text-black">Nombre Máquina</th>
          <th className="border-2 border-black px-3 py-2 text-right text-sm font-bold text-black">Ingresos (LPS)</th>
          <th className="border-2 border-black px-3 py-2 text-right text-sm font-bold text-black">Gastos (LPS)</th>
          <th className="border-2 border-black px-3 py-2 text-right text-sm font-bold text-black">Total (LPS)</th>
        </tr>
      </thead>
      <tbody>
        {reciboParaImprimir.maquinas.map((maquina, index) => {
          const esNegativo = maquina.total < 0;
          return (
            <tr key={maquina.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}>
              <td className="border border-black px-3 py-2 font-bold text-black">{maquina.codigo}</td>
              <td className="border border-black px-3 py-2 font-bold text-black">{maquina.nombre}</td>
              <td className="border border-black px-3 py-2 text-right font-bold text-black">{maquina.ingreso.toFixed(2)}</td>
              <td className="border border-black px-3 py-2 text-right font-bold text-black">{maquina.egreso.toFixed(2)}</td>
              <td className={`border border-black px-3 py-2 text-right font-bold ${esNegativo ? 'text-red-600' : 'text-black'}`}>
                {maquina.total.toFixed(2)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>

  {/* Resumen Financiero */}
  <div className="grid grid-cols-2 gap-6 mb-4 seccion">
    <div className="space-y-2">
      <h3 className="text-md font-bold text-black mb-2">RESUMEN TOTAL</h3>
      <div className="flex justify-between border-b border-black pb-1">
        <span className="text-black font-bold text-sm">Total Ingresos:</span>
        <span className="font-bold text-black text-sm">{reciboParaImprimir.total_ingresos.toFixed(2)} LPS</span>
      </div>
      <div className="flex justify-between border-b border-black pb-1">
        <span className="text-black font-bold text-sm">Total Gastos:</span>
        <span className="font-bold text-black text-sm">{reciboParaImprimir.total_egresos.toFixed(2)} LPS</span>
      </div>
      <div className="flex justify-between pt-1">
        <span className="text-md font-bold text-black">Total Neto:</span>
        <span className="text-md font-bold text-black">{reciboParaImprimir.total_neto.toFixed(2)} LPS</span>
      </div>
    </div>

    <div className="space-y-2">
      <h3 className="text-md font-bold text-black mb-2">DISTRIBUCIÓN</h3>
      <div className="flex justify-between border-b border-black pb-1">
        <span className="text-black font-bold text-sm">Parte Propietario (60%):</span>
        <span className="font-bold text-black text-sm">{reciboParaImprimir.parte_empresa.toFixed(2)} LPS</span>
      </div>
      <div className="flex justify-between pt-1">
        <span className="text-md font-bold text-black">Parte Cliente (40%):</span>
        <span className="text-md font-bold text-black">{reciboParaImprimir.parte_cliente.toFixed(2)} LPS</span>
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
    </div>
  );
}