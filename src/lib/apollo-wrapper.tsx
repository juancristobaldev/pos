"use client";

import { ApolloLink, HttpLink } from "@apollo/client";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import Cookies from "js-cookie";
import React from "react";

// 1. Configurar enlace HTTP a tu Backend NestJS
const httpLink = new HttpLink({
  uri: "http://localhost:4000/graphql",
});

// 2. Middleware para inyectar el Token JWT
const authLink = setContext((_, { headers }) => {
  const token = Cookies.get("@token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// 3. Crear Cliente (Instancia única para el cliente)
function makeClient() {
  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });
}

// 4. Componente Wrapper para envolver la App
export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  // Usamos ref o state para asegurar una sola instancia, pero para este caso simple basta así:
  const client = makeClient();
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
