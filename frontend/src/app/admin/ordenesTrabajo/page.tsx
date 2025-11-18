"use client";

export default function OrdenesTrabajoPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Órdenes de Trabajo</h1>
        <p className="text-gray-600">Gestión de reparaciones y mantenimiento</p>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Aquí irán las Órdenes de Trabajo
          </h2>
          <p className="text-gray-600">
            Esta sección estará disponible próximamente para crear, asignar y 
            dar seguimiento a órdenes de reparación.
          </p>
        </div>
      </div>
    </div>
  );
}