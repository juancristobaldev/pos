"use client";

import { useState } from "react";
import { useMutation, gql } from "@apollo/client"; // Importamos 'gql' directamente
import { useApp } from "@/src/context/AppContext";

// 1. DEFINICIÓN DE LA MUTACIÓN GraphQL INLINE
const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $password: String!) {
    loginUser(input: { email: $email, password: $password }) {
      accessToken
    }
  }
`;

export default function LoginPage() {
  const { login } = useApp();
  const [email, setEmail] = useState("mesero@demo.com"); // Valor por defecto para pruebas
  const [password, setPassword] = useState("123456");

  // Usamos la mutación definida arriba
  const [loginFn, { loading, error }] = useMutation(LOGIN_USER);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await loginFn({ variables: { email, password } });
      if (data?.loginUser?.accessToken) login(data.loginUser.accessToken);
    } catch (err) {
      // Manejo de error de red o de Apollo (ya mostrado por 'error' en el render)
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <h1 className="text-3xl font-extrabold text-blue-600 mb-2 text-center">
          POS Login
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Ingresa para gestionar pedidos
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo
            </label>
            <input
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center">
              Credenciales incorrectas (o error de conexión)
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md disabled:opacity-70"
          >
            {loading ? "Validando..." : "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}
