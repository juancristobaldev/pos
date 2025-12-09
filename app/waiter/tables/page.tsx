"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useApp } from "@/src/context/AppContext";
import { GET_TABLES } from "@/src/graphql/queries";

export default function TablesPage() {
  const router = useRouter();
  const { user, setTableId, logout } = useApp();
  const [floorIdx, setFloorIdx] = useState(0);

  // Consulta poll cada 5 seg para ver estado de mesas
  const { data, loading, error } = useQuery(GET_TABLES, {
    variables: { id: user?.businessId },
    skip: !user?.businessId,
    pollInterval: 5000,
  });

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center text-blue-600 font-bold">
        Cargando salón...
      </div>
    );
  if (error)
    return (
      <div className="p-10 text-red-500 text-center">
        Error: {error.message}
      </div>
    );

  const floors = data?.business?.floors || [];
  const currentFloor = floors[floorIdx];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white p-4 flex justify-between items-center shadow-sm z-10 sticky top-0">
        <div>
          <h1 className="font-bold text-xl text-gray-900">{user?.role}</h1>
          <p className="text-xs text-gray-500">Selecciona una mesa</p>
        </div>
        <button
          onClick={logout}
          className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* Tabs de Pisos */}
      {floors.length > 0 ? (
        <>
          <div className="flex gap-3 p-4 overflow-x-auto bg-white border-b">
            {floors.map((f: any, idx: number) => (
              <button
                key={f.id}
                onClick={() => setFloorIdx(idx)}
                className={`px-5 py-2 rounded-full font-medium transition-all shadow-sm ${
                  idx === floorIdx
                    ? "bg-blue-600 text-white ring-2 ring-blue-300"
                    : "bg-white text-gray-600 border border-gray-200"
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>

          {/* Grid de Mesas */}
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 flex-1 content-start overflow-y-auto">
            {currentFloor?.tables?.map((t: any) => (
              <button
                key={t.id}
                onClick={() => {
                  setTableId(t.id);
                  router.push("/waiter/menu");
                }}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center shadow-md transition-transform active:scale-95 relative overflow-hidden ${
                  t.status === "OCCUPIED"
                    ? "bg-red-500 text-white"
                    : "bg-white border-2 border-green-400 text-gray-800"
                }`}
              >
                <span className="text-4xl font-black">
                  {t.name.replace("Mesa ", "")}
                </span>
                <span
                  className={`text-xs uppercase mt-2 font-bold px-2 py-1 rounded ${
                    t.status === "OCCUPIED"
                      ? "bg-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {t.status === "OCCUPIED" ? "Ocupada" : "Libre"}
                </span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="p-10 text-center text-gray-500">
          No hay pisos configurados en el sistema.
        </div>
      )}
    </div>
  );
}
