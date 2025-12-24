"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { useApp } from "@/src/context/AppContext";
import {
  LogOut,
  ChefHat,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";

// QUERY CORREGIDA PARA COINCIDIR CON TU RESOLVER
export const GET_ALL_ORDERS = gql`
  query getAllOrders($businessId: String!) {
    getAllOrders(businessId: $businessId) {
      id
      status
      total
      createdAt
      table {
        id
        name
      }
      user {
        name
      }
      items {
        id
        quantity
        unitPrice
        note
        product {
          name
          price
        }
      }
    }
  }
`;

export const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($input: UpdateOrderStatusInput!) {
    updateOrderStatus(input: $input) {
      id
      status
    }
  }
`;

export default function KitchenPage() {
  const { user, logout } = useApp();
  const router = useRouter();

  const { data, loading } = useQuery(GET_ALL_ORDERS, {
    variables: { businessId: user?.businessId },
    skip: !user?.businessId,
    pollInterval: 3000,
    fetchPolicy: "network-only",
  });

  const [updateStatus] = useMutation(UPDATE_ORDER_STATUS);

  // --- CORRECCIÓN CLAVE AQUÍ ---
  // 1. Accedemos a data?.getAllOrders (no ordersByBusiness)
  // 2. Normalizamos el status a mayúsculas para comparar (Pending -> PENDING)
  const activeOrders =
    data?.getAllOrders?.filter((o: any) => {
      const statusUpper = o.status?.toUpperCase();
      return statusUpper === "PENDING" || statusUpper === "IN_PROGRESS";
    }) || [];

  const handleMarkReady = async (orderId: string) => {
    try {
      await updateStatus({
        variables: {
          input: {
            id: orderId,
            newStatus: "READY",
            userId: user?.sub,
          },
        },
      });
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  if (!user) return <div className="p-10 text-white">Cargando acceso...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 font-sans">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 p-2 rounded-lg text-white">
            <ChefHat size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-wider text-white">
              COCINA
            </h1>
            <p className="text-gray-400 text-sm">
              {activeOrders.length} Pendientes
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="flex items-center gap-2 bg-red-900/50 text-red-300 px-4 py-2 rounded hover:bg-red-800 transition"
        >
          <LogOut size={18} />
        </button>
      </div>

      {/* MENSAJE VACÍO */}
      {activeOrders.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center h-[60vh] text-gray-600">
          <ChefHat size={64} className="mb-4 opacity-20" />
          <h2 className="text-2xl font-bold">Sin comandas</h2>
          <p>Esperando pedidos del salón...</p>
        </div>
      )}

      {/* GRID DE TICKETS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {activeOrders.map((order: any) => (
          <KitchenTicket
            key={order.id}
            order={order}
            onComplete={() => handleMarkReady(order.id)}
          />
        ))}
      </div>
    </div>
  );
}

// --- COMPONENTE VISUAL DEL TICKET ---
function KitchenTicket({
  order,
  onComplete,
}: {
  order: any;
  onComplete: () => void;
}) {
  const [elapsed, setElapsed] = useState("");
  const [isLate, setIsLate] = useState(false);

  useEffect(() => {
    const tick = () => {
      const diff = Math.floor(
        (new Date().getTime() - new Date(order.createdAt).getTime()) / 60000
      );
      setElapsed(`${diff} min`);
      setIsLate(diff > 15);
    };
    tick();
    const timer = setInterval(tick, 60000);
    return () => clearInterval(timer);
  }, [order.createdAt]);

  return (
    <div
      className={`relative flex flex-col rounded-xl overflow-hidden shadow-xl bg-white text-gray-900 ${
        isLate ? "ring-4 ring-red-500" : ""
      }`}
    >
      {/* Cabecera */}
      <div
        className={`p-3 flex justify-between items-center ${
          isLate ? "bg-red-600 text-white" : "bg-yellow-400 text-black"
        }`}
      >
        <div>
          {/* CORRECCIÓN: Fallback si table es null */}
          <h3 className="font-black text-xl uppercase">
            {order.table?.name || "Mesa ?"}
          </h3>
          <span className="text-xs font-bold opacity-75">
            #{order.id.slice(-4)}
          </span>
        </div>
        <div className="flex items-center gap-1 bg-black/10 px-2 py-1 rounded font-mono font-bold text-sm">
          <Clock size={14} /> {elapsed}
        </div>
      </div>

      {/* Lista Productos */}
      <div className="p-4 flex-1 space-y-3">
        {order.items.map((item: any) => (
          <div
            key={item.id}
            className="flex gap-3 border-b border-gray-100 pb-2 last:border-0"
          >
            <span className="font-black text-xl text-blue-600 bg-blue-50 w-8 h-8 flex items-center justify-center rounded-full">
              {item.quantity}
            </span>
            <div className="flex-1">
              {/* CORRECCIÓN: Fallback si product es null */}
              <p className="font-bold text-lg leading-tight">
                {item.product?.name || "Producto desconocido"}
              </p>
              {item.note && (
                <div className="flex items-center gap-1 mt-1 text-red-600 bg-red-50 p-1 rounded text-xs font-bold">
                  <AlertTriangle size={12} /> {item.note}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Botón */}
      <button
        onClick={onComplete}
        className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-black text-lg tracking-widest flex items-center justify-center gap-2"
      >
        <CheckCircle size={24} /> LISTO
      </button>
    </div>
  );
}
