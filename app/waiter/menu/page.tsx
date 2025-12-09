"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_PRODUCTS, CREATE_ORDER } from "@/src/graphql/queries";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus } from "lucide-react";
import { useApp } from "@/src/context/AppContext";

const CATS = ["Todos", "Sandwichs", "Pizzas", "Bebidas", "Postres"];

export default function MenuPage() {
  const router = useRouter();
  const { user, tableId, addToCart, cart, total, clearCart } = useApp();
  const [cat, setCat] = useState("Todos");

  const { data, loading } = useQuery(GET_PRODUCTS, {
    variables: { businessId: user?.businessId },
    skip: !user?.businessId,
  });

  const [createOrder, { loading: sending }] = useMutation(CREATE_ORDER);

  const handleOrder = async () => {
    if (!tableId || !user?.sub) return;
    try {
      await createOrder({
        variables: {
          input: {
            tableId,
            userId: user.sub,
            items: cart.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
            })),
          },
        },
      });
      alert("✅ ¡Pedido enviado a Cocina!");
      clearCart();
      router.push("/waiter/tables");
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  const products = data?.products || [];
  const filtered = products.filter(
    (p: any) => cat === "Todos" || p.category === cat
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Topbar */}
      <div className="bg-white sticky top-0 z-20 shadow-sm border-b">
        <div className="p-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-lg text-gray-900">Tomando Orden</h1>
            <p className="text-xs text-blue-600 font-medium">Mesa Activa</p>
          </div>
        </div>

        {/* Categorías */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-4 scrollbar-hide">
          {CATS.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                cat === c
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Lista Productos */}
      <div className="p-4 space-y-3">
        {loading ? (
          <p className="text-center mt-10 text-gray-500">Cargando menú...</p>
        ) : (
          filtered.map((p: any) => (
            <div
              key={p.id}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-shadow"
            >
              <div>
                <h3 className="font-bold text-gray-800">{p.name}</h3>
                <p className="text-xs text-gray-500 line-clamp-1 mb-1">
                  {p.description}
                </p>
                <p className="text-blue-600 font-bold text-lg">${p.price}</p>
              </div>
              <button
                onClick={() => addToCart(p)}
                className="bg-blue-50 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center transition-colors active:bg-blue-200 hover:bg-blue-100"
              >
                <Plus size={24} strokeWidth={3} />
              </button>
            </div>
          ))
        )}
        {filtered.length === 0 && !loading && (
          <div className="text-center py-10 text-gray-400">
            No hay productos en esta categoría
          </div>
        )}
      </div>

      {/* Footer Total Flotante */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-30">
          <div className="max-w-md mx-auto flex items-center justify-between mb-3">
            <span className="text-gray-500 font-medium">
              {cart.reduce((a, b) => a + b.quantity, 0)} items
            </span>
            <span className="text-2xl font-bold text-gray-900">
              ${total.toLocaleString()}
            </span>
          </div>
          <button
            onClick={handleOrder}
            disabled={sending}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-[0.98]"
          >
            {sending ? "Enviando a Cocina..." : "CONFIRMAR PEDIDO"}
          </button>
        </div>
      )}
    </div>
  );
}
