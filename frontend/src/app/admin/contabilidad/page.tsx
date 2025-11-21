"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, Wrench, UserPlus, X, RefreshCw, UserCheck } from "lucide-react";

// Interfaces
interface Cliente {
  id: number;
  nombre_usuario: string;
}

interface Maquina {
  id: number;
  nombre: string;
  ubicacion: string;
}

export default function listarMaquinas() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [maquinasCliente, setMaquinasCliente] = useState<Maquina[]>([]);
  const [fechaActual, setFechaActual] = useState("");

  // ---------- Fetch de clientes ----------
  const fetchClientes = async () => {
    setError(null);
    try {
      console.log('Iniciando carga de datos...');
      
      // Usuarios con rol de Clientes
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

      // Maquinas Asiganadas al Cliente
      const res = await fetch(`http://localhost:3000/api/Maquina-Cliente/listar?cliente_id=${clienteId}`);
      if (!res.ok) throw new Error(`Error ${res.status} al cargar máquinas`);
      const data = await res.json();
      
      // Adaptamos los datos a la interfaz Maquina
      const maquinasFormateadas = data.map((item: any) => ({
        id: item.maquina.id,
        nombre: item.maquina.nombre,
        ubicacion: item.maquina.ubicacion,
      }));
      setMaquinasCliente(maquinasFormateadas);

      console.log('Todos los datos cargados exitosamente.');

    } catch (err) {
      console.error("Error al cargar máquinas:", err);
      setMaquinasCliente([]);
    }
  };

  useEffect(() => {
    fetchClientes();

    // Generar fecha y hora actual
    const ahora = new Date();
    const formato = ahora.toLocaleString("es-HN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    setFechaActual(formato);
    
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="px-8 py-6 flex items-center justify-between">
          <button
          onClick={() => router.push("./dashboard")}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Volver</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Generar Nuevo Recibo</h1> 
          <button
          onClick={fetchClientes}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          > 
            Actualizar 
          </button>
        </div>
      </header>

      
      <div className="flex items-center gap-4 m-5 p-4 rounded-lg bg-white shadow-sm">
        
        {/* Seleccionar un cliente*/}
        <div className="w-4/6">
          <label htmlFor="cliente-select" className="block text-gray-700 font-medium mb-2">
            Seleccione un Cliente
          </label>
          <select id="cliente-select" value={selectedCliente ?? ""}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          onChange={(e) => {
            const id = Number(e.target.value);
            setSelectedCliente(id);
            fetchMaquinasPorCliente(id);
          }}
          >
            <option value="" disabled>-- Selecciona un cliente --</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombre_usuario}
              </option>
            ))}
          </select>
        </div>

        {/* Fecha y hora Actual*/}
        <div className="w-2/6">
          <label className="block text-gray-700 font-medium mb-2">
            Fecha y Hora
          </label>
          <input type="text" value={fechaActual} readOnly
            className="w-full border border-gray-300 bg-gray-100 text-gray-700 rounded-lg px-3 py-2 cursor-not-allowed"
          />
        </div>
      </div>

      {/* Máquinas del cliente */}
      <div className="m-5 p-4 bg-white rounded-lg shadow-sm">
        {!selectedCliente ? (
          <p className="text-gray-500">Seleccione un cliente para ver sus máquinas asignadas.</p>
        ) : maquinasCliente.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {maquinasCliente.map((maquina) => (
              <li key={maquina.id} className="py-3 flex items-center gap-3"> 
                <Wrench className="w-5 h-5 text-orange-600" />
                <span className="text-gray-800 font-medium">
                  {maquina.nombre} (📍{maquina.ubicacion})
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Este cliente no tiene máquinas asignadas.</p>
        )}
      </div>
      
    </div>
  );
}
