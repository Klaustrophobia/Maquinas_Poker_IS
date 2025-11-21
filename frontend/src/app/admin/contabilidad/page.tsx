"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Wrench, RefreshCw, Trash2, History, Search, Calendar, DollarSign, User, Filter } from "lucide-react";

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

export default function GenerarRecibo() {
  const router = useRouter();
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

  // ---------- Fetch de clientes ----------
  const fetchClientes = async () => {
    setError(null);
    try {
      console.log('Iniciando carga de datos...');
      
      const res = await fetch("http://localhost:3000/api/Usuario/Cliente");
      if (!res.ok) throw new Error(`Error ${res.status} al cargar clientes`);
      const data = await res.json();
      setClientes(data);

      console.log('Todos los datos cargados exitosamente.');

    } catch (err) {
      console.error("Error al cargar clientes:", err);
      setError(err instanceof Error ? err.message : "Error desconocido al cargar clientes");
    }
  };

  // ---------- Fetch de máquinas por cliente ----------
  const fetchMaquinasPorCliente = async (clienteId: number) => {
    if (!clienteId) return;
    try {
      console.log('Iniciando carga de datos...');

      const res = await fetch(`http://localhost:3000/api/Maquina-Cliente/listar?cliente_id=${clienteId}`);
      if (!res.ok) throw new Error(`Error ${res.status} al cargar máquinas`);
      const data = await res.json();
      
      const maquinasFormateadas = data.map((item: any) => ({
        id: item.maquina.id,
        nombre: item.maquina.nombre,
        ubicacion: item.maquina.ubicacion,
        codigo: `PM-${item.maquina.id.toString().padStart(3, '0')}`
      }));
      setMaquinasCliente(maquinasFormateadas);

      // AUTOMÁTICAMENTE agregar todas las máquinas al recibo
      const nuevasMaquinasRecibo: MaquinaRecibo[] = maquinasFormateadas.map((maquina: Maquina) => ({
        maquina_id: maquina.id,
        nombre: maquina.nombre,
        codigo: maquina.codigo,
        ingreso: "",
        egreso: "",
        total: "0.00"
      }));
      setMaquinasRecibo(nuevasMaquinasRecibo);

      console.log('Todos los datos cargados exitosamente.');

    } catch (err) {
      console.error("Error al cargar máquinas:", err);
      setMaquinasCliente([]);
      setMaquinasRecibo([]);
    }
  };

  // ---------- Fetch de recibos existentes ----------
  const fetchRecibosExistentes = async () => {
    setLoadingHistorial(true);
    try {
      const res = await fetch('http://localhost:3000/api/Recibo');
      if (!res.ok) throw new Error('Error al cargar el historial de recibos');
      
      const result = await res.json();
      if (result.success) {
        // Ordenar por ID más reciente primero (asumiendo que ID más alto = más reciente)
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

  // Filtrar recibos por cliente
  const filtrarRecibos = (clienteId: number | "") => {
    setFiltroCliente(clienteId);
    if (!clienteId) {
      setRecibosFiltrados(recibosExistentes);
    } else {
      const filtrados = recibosExistentes.filter(recibo => recibo.cliente.id === clienteId);
      setRecibosFiltrados(filtrados);
    }
  };

  // Remover máquina del recibo
  const removerMaquinaDelRecibo = (maquinaId: number) => {
    setMaquinasRecibo(maquinasRecibo.filter(m => m.maquina_id !== maquinaId));
  };

  // Actualizar valores de máquina
  const actualizarValorMaquina = (maquinaId: number, campo: keyof MaquinaRecibo, valor: string) => {
    setMaquinasRecibo(maquinasRecibo.map(maquina => {
      if (maquina.maquina_id === maquinaId) {
        const updated = { ...maquina, [campo]: valor };
        
        // Calcular total si se actualizan ingresos o egresos
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

  // Calcular totales
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

  // Generar recibo
  const generarRecibo = async () => {
    if (!selectedCliente || maquinasRecibo.length === 0) {
      setError("Seleccione un cliente y agregue al menos una máquina");
      return;
    }

    // Validar que todas las máquinas tengan valores
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

      console.log('Enviando datos:', reciboData);

      const response = await fetch('http://localhost:3000/api/Recibo', {
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
        // Limpiar formulario
        setMaquinasRecibo([]);
        setSelectedCliente(null);
        setClienteNombre("");
        setMaquinasCliente([]);
        // Recargar historial
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

  useEffect(() => {
    fetchClientes();

    // Generar fecha actual
    const ahora = new Date();
    const formato = ahora.toLocaleString("es-HN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    setFechaActual(formato);
    
  }, []);

  useEffect(() => {
    if (activeTab === "historial") {
      fetchRecibosExistentes();
    }
  }, [activeTab]);

  const totales = calcularTotales();
  const puedeGenerarRecibo = selectedCliente && maquinasRecibo.length > 0 && 
    maquinasRecibo.every(m => m.ingreso && m.egreso);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm sticky top-0 z-10">
        <div className="px-8 py-6 flex items-center justify-between">
          <button
            onClick={() => router.push("./dashboard")}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Volver</span>
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-fuchsia-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
             Sistema de Recibos
          </h1>
          <button
            onClick={fetchClientes}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>
      </header>

      {/* Tabs de Navegación - COLORES MULTICOLOR MEJORADOS */}
      <div className="max-w-7xl mx-auto px-8 pt-6">
        <div className="flex border-b border-slate-200/60 bg-white/50 backdrop-blur-sm rounded-t-2xl p-2 shadow-inner">
          <button
            onClick={() => setActiveTab("generar")}
            className={`flex items-center gap-3 px-8 py-4 font-bold rounded-xl transition-all duration-300 transform hover:scale-105 ${
              activeTab === "generar"
                ? "bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 text-white shadow-2xl"
                : "text-slate-500 hover:text-slate-700 hover:bg-white/80 border-2 border-transparent hover:border-emerald-200"
            }`}
          >
            <Wrench className="w-5 h-5" />
            Generar Recibo
          </button>
          <button
            onClick={() => setActiveTab("historial")}
            className={`flex items-center gap-3 px-8 py-4 font-bold rounded-xl transition-all duration-300 transform hover:scale-105 ${
              activeTab === "historial"
                ? "bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 text-white shadow-2xl"
                : "text-slate-500 hover:text-slate-700 hover:bg-white/80 border-2 border-transparent hover:border-pink-200"
            }`}
          >
            <History className="w-5 h-5" />
            Historial de Recibos
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-400 to-pink-500 text-white rounded-2xl shadow-lg animate-pulse">
            <p className="flex items-center gap-2 font-semibold">
              <span className="w-3 h-3 bg-white rounded-full animate-ping"></span>
              {error}
            </p>
          </div>
        )}

        {/* TAB: GENERAR RECIBO */}
        {activeTab === "generar" && (
          <>
            {/* Detalles del Cliente */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/60 mb-6 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/40 bg-gradient-to-r from-cyan-400 to-blue-500">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Detalles del Cliente
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Nombre del Cliente
                    </label>
                    <select
                      value={selectedCliente ?? ""}
                      className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-slate-900 bg-white/80 transition-all duration-200 hover:border-cyan-300"
                      onChange={(e) => {
                        const id = Number(e.target.value);
                        const nombre = clientes.find(c => c.id === id)?.nombre_usuario || "";
                        setSelectedCliente(id);
                        setClienteNombre(nombre);
                        fetchMaquinasPorCliente(id);
                      }}
                    >
                      <option value="" disabled>Seleccione un cliente</option>
                      {clientes.map((cliente) => (
                        <option key={cliente.id} value={cliente.id}>
                          {cliente.nombre_usuario}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Fecha del Recibo
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={fechaActual}
                        readOnly
                        className="w-full border-2 border-slate-200 bg-slate-100/80 text-slate-700 rounded-xl px-4 py-3 cursor-not-allowed pr-12 font-medium"
                      />
                      <Calendar className="w-5 h-5 text-cyan-500 absolute right-4 top-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mensaje cuando no hay máquinas */}
            {selectedCliente && maquinasCliente.length === 0 && (
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-6 mb-6 animate-fade-in shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Wrench className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Sin máquinas asignadas</h3>
                    <p className="text-white/90 text-sm mt-1">
                      El cliente seleccionado no tiene ninguna máquina asignada. 
                      Asigne máquinas al cliente antes de generar un recibo.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Desglose por Máquina */}
            {maquinasRecibo.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/60 mb-6 overflow-hidden">
                <div className="px-6 py-4 border-b border-white/40 bg-gradient-to-r from-emerald-400 to-green-500">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Wrench className="w-5 h-5" />
                    Desglose por Máquina
                  </h2>
                  <p className="text-white/90 text-sm mt-1">
                    Complete los ingresos y gastos para cada máquina del cliente
                  </p>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto rounded-xl border-2 border-white/40 shadow-inner">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-slate-50 to-white/80">
                        <tr>
                          <th className="text-left py-5 px-6 font-bold text-slate-700 border-b border-white/40">ID MÁQUINA</th>
                          <th className="text-left py-5 px-6 font-bold text-slate-700 border-b border-white/40">INGRESOS (LPS)</th>
                          <th className="text-left py-5 px-6 font-bold text-slate-700 border-b border-white/40">GASTOS (LPS)</th>
                          <th className="text-left py-5 px-6 font-bold text-slate-700 border-b border-white-40">TOTAL (LPS)</th>
                          <th className="text-left py-5 px-6 font-bold text-slate-700 border-b border-white/40">ACCIONES</th>
                        </tr>
                      </thead>
                      <tbody>
                        {maquinasRecibo.map((maquina) => (
                          <tr key={maquina.maquina_id} className="border-b border-white/40 hover:bg-cyan-50/50 transition-all duration-300">
                            <td className="py-5 px-6">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                                  <Wrench className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 text-lg">{maquina.codigo}</p>
                                  <p className="text-sm text-slate-600">{maquina.nombre}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-5 px-6">
                              <div className="relative">
                                <DollarSign className="w-5 h-5 text-emerald-500 absolute left-4 top-3" />
                                <input
                                  type="number"
                                  step="0.01"
                                  value={maquina.ingreso}
                                  onChange={(e) => actualizarValorMaquina(maquina.maquina_id, 'ingreso', e.target.value)}
                                  className="w-full border-2 border-emerald-200 rounded-xl pl-12 pr-4 py-3 text-right font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-white/80 transition-all duration-200"
                                  placeholder="0.00"
                                />
                              </div>
                            </td>
                            <td className="py-5 px-6">
                              <div className="relative">
                                <DollarSign className="w-5 h-5 text-red-500 absolute left-4 top-3" />
                                <input
                                  type="number"
                                  step="0.01"
                                  value={maquina.egreso}
                                  onChange={(e) => actualizarValorMaquina(maquina.maquina_id, 'egreso', e.target.value)}
                                  className="w-full border-2 border-red-200 rounded-xl pl-12 pr-4 py-3 text-right font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-slate-900 bg-white/80 transition-all duration-200"
                                  placeholder="0.00"
                                />
                              </div>
                            </td>
                            <td className="py-5 px-6">
                              <div className="text-right font-bold text-slate-900 bg-gradient-to-r from-slate-100 to-white py-3 px-4 rounded-xl border-2 border-slate-200 text-lg">
                                {parseFloat(maquina.total || '0').toLocaleString('es-ES', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                })} LPS
                              </div>
                            </td>
                            <td className="py-5 px-6">
                              <button
                                onClick={() => removerMaquinaDelRecibo(maquina.maquina_id)}
                                className="p-3 text-white bg-gradient-to-r from-red-400 to-pink-500 rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl"
                                title="Remover máquina"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Resumen Financiero */}
            {maquinasRecibo.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/60 mb-6 overflow-hidden">
                <div className="px-6 py-4 border-b border-white/40 bg-gradient-to-r from-purple-400 to-indigo-500">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Resumen Financiero
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Totales Básicos */}
                    <div className="bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl p-6 border-2 border-white/40 shadow-2xl">
                      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-4 h-4 text-white" />
                        </div>
                        Resumen de Totales
                      </h3>
                      <div className="space-y-5">
                        <div className="flex justify-between items-center py-4 border-b border-white/30">
                          <span className="text-white/90 font-semibold">Total Ingresos</span>
                          <span className="font-bold text-white text-xl">
                            {parseFloat(totales.totalIngresos).toLocaleString('es-ES', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })} LPS
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-4 border-b border-white/30">
                          <span className="text-white/90 font-semibold">Total Gastos</span>
                          <span className="font-bold text-white text-xl">
                            {parseFloat(totales.totalEgresos).toLocaleString('es-ES', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })} LPS
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-5 bg-white/20 rounded-xl px-6 border-2 border-white/30 backdrop-blur-sm">
                          <span className="text-xl font-bold text-white">Total Neto</span>
                          <span className="text-2xl font-black text-white">
                            {parseFloat(totales.totalNeto).toLocaleString('es-ES', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })} LPS
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* División de Ganancias */}
                    <div className="bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl p-6 border-2 border-white/40 shadow-2xl">
                      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        División de Ganancias
                      </h3>
                      <div className="space-y-5">
                        <div className="flex justify-between items-center py-4 border-b border-white/30">
                          <span className="text-white/90 font-semibold">Parte Propietario (60%)</span>
                          <span className="font-bold text-white text-xl">
                            {parseFloat(totales.parteEmpresa).toLocaleString('es-ES', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })} LPS
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-5 bg-white/20 rounded-xl px-6 border-2 border-white/30 backdrop-blur-sm">
                          <span className="text-lg font-bold text-white">Parte Cliente (40%)</span>
                          <span className="text-2xl font-black text-white">
                            {parseFloat(totales.parteCliente).toLocaleString('es-ES', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })} LPS
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Botón Crear Recibo */}
            {maquinasRecibo.length > 0 && (
              <div className="flex justify-center">
                <button
                  onClick={generarRecibo}
                  disabled={!puedeGenerarRecibo || loading}
                  className={`px-16 py-5 rounded-2xl font-black text-white transition-all duration-300 transform hover:scale-110 shadow-2xl ${
                    puedeGenerarRecibo && !loading
                      ? 'bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 hover:from-fuchsia-600 hover:via-purple-600 hover:to-indigo-600 shadow-2xl hover:shadow-3xl'
                      : 'bg-slate-400 cursor-not-allowed'
                  } flex items-center gap-4 text-lg`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      Creando Recibo...
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-white" />
                      </div>
                       Crear Recibo
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {/* TAB: HISTORIAL DE RECIBOS */}
        {activeTab === "historial" && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/60 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/40 bg-gradient-to-r from-orange-400 to-red-500">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Historial de Recibos
                  </h2>
                  <p className="text-white/90 text-sm mt-1">
                    {recibosFiltrados.length} {recibosFiltrados.length === 1 ? 'recibo encontrado' : 'recibos encontrados'}
                  </p>
                </div>
                
                {/* Filtro por Cliente */}
                <div className="flex items-center gap-3">
                  <Filter className="w-5 h-5 text-white" />
                  <select
                    value={filtroCliente}
                    onChange={(e) => filtrarRecibos(e.target.value ? Number(e.target.value) : "")}
                    className="border-2 border-white/40 bg-white/90 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900 font-semibold min-w-[200px] backdrop-blur-sm"
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
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-6"></div>
                  <p className="text-slate-600 font-semibold text-lg">Cargando recibos...</p>
                </div>
              ) : recibosFiltrados.length > 0 ? (
                <div className="space-y-8">
                  {recibosFiltrados.map((recibo, index) => (
                    <div 
                      key={recibo.lote_recibo} 
                      className="border-2 border-white/60 rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-slate-50/80 backdrop-blur-sm transform hover:scale-[1.02]"
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animation: 'fadeInUp 0.6s ease-out'
                      }}
                    >
                      {/* Header del Recibo */}
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-8 gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
                              <span className="text-white font-black text-lg">#{recibo.lote_recibo}</span>
                            </div>
                            <div>
                              <h3 className="text-2xl font-black text-slate-900 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                                {recibo.cliente.nombre}
                              </h3>
                              <p className="text-slate-600 flex items-center gap-2 font-semibold">
                                <Calendar className="w-4 h-4 text-cyan-500" />
                                {new Date(recibo.fecha_recibo).toLocaleDateString('es-ES', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-xl text-sm font-black shadow-lg">
                            <Wrench className="w-4 h-4" />
                            {recibo.maquinas.length} máquina(s)
                          </span>
                        </div>
                      </div>

                      {/* Máquinas del lote */}
                      <div className="mb-8">
                        <h4 className="font-black text-slate-800 mb-6 flex items-center gap-3 text-lg">
                          <Wrench className="w-5 h-5 text-orange-500" />
                          Máquinas incluidas
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {recibo.maquinas.map((maquina) => (
                            <div key={maquina.id} className="flex items-center justify-between p-4 bg-white/80 rounded-xl border-2 border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-md">
                                  <Wrench className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900">{maquina.codigo}</p>
                                  <p className="text-sm text-slate-600">{maquina.nombre}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-black text-slate-900 text-lg">
                                  {maquina.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })} LPS
                                </p>
                                <p className="text-xs text-slate-500 font-semibold">
                                  {maquina.ingreso.toLocaleString('es-ES', { minimumFractionDigits: 2 })} LPS - {maquina.egreso.toLocaleString('es-ES', { minimumFractionDigits: 2 })} LPS
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Resumen del lote */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t-2 border-slate-200/60">
                        <div className="text-center p-5 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl border-2 border-white/40 shadow-2xl">
                          <p className="text-white/90 font-semibold text-sm">Total Ingresos</p>
                          <p className="text-2xl font-black text-white">
                            {recibo.total_ingresos.toLocaleString('es-ES', { minimumFractionDigits: 2 })} LPS
                          </p>
                        </div>
                        <div className="text-center p-5 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl border-2 border-white/40 shadow-2xl">
                          <p className="text-white/90 font-semibold text-sm">Total Gastos</p>
                          <p className="text-2xl font-black text-white">
                            {recibo.total_egresos.toLocaleString('es-ES', { minimumFractionDigits: 2 })} LPS
                          </p>
                        </div>
                        <div className="text-center p-5 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl border-2 border-white/40 shadow-2xl">
                          <p className="text-white/90 font-semibold text-sm">Total Neto</p>
                          <p className="text-2xl font-black text-white">
                            {recibo.total_neto.toLocaleString('es-ES', { minimumFractionDigits: 2 })} LPS
                          </p>
                        </div>
                        <div className="text-center p-5 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl border-2 border-white/40 shadow-2xl">
                          <p className="text-white/90 font-semibold text-sm">Parte Cliente</p>
                          <p className="text-2xl font-black text-white">
                            {recibo.parte_cliente.toLocaleString('es-ES', { minimumFractionDigits: 2 })} LPS
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="w-32 h-32 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                    <History className="w-16 h-16 text-slate-400" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    No hay recibos generados
                  </h3>
                  <p className="text-slate-600 max-w-md mx-auto text-lg font-semibold">
                    {filtroCliente ? 
                      "No se encontraron recibos para el cliente seleccionado." : 
                      "Los recibos que generes aparecerán en esta sección."
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}