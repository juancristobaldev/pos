import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ApolloWrapper } from "@/src/lib/apollo-wrapper";
import { AppProvider } from "@/src/context/AppContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "POS System",
  description: "Offline First POS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {/* ENVOLVER TODO AQUÍ */}
        <ApolloWrapper>
          <AppProvider>{children}</AppProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}
