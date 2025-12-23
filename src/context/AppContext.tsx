
"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { gql, useLazyQuery } from "@apollo/client";

export const GET_USER = gql`
  query GetUser($userId: String!) {
    getUser(userId: $userId) {
      success
      errors
      user {
        id
        email
        role
        businessId
      }
    }
  }
`;





interface User {
  id: string;
  email: string;
  role: string;
  businessId: string;
}

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface AppContextType {
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
  tableId: string | null;
  setTableId: (id: string) => void;
  cart: CartItem[];
  addToCart: (product: any) => void;
  clearCart: () => void;
  total: number;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [tableId, setTableId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  const [getUser] = useLazyQuery(GET_USER, {
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      if (data?.getUser?.success) {
        setUser(data.getUser.user);
      } else {
        logout();
      }
    },
  });

  // 🔁 Rehidratar sesión
  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) return;

    try {
      const decoded: any = jwtDecode(token);

      console.log(decoded)
      if (decoded) {
        getUser({ variables: { userId: decoded.id } });
      }
    } catch {
      logout();
    }
  }, []);

  const login = (token: string) => {
    Cookies.set("token", token);
    const decoded: any = jwtDecode(token);
    getUser({ variables: { userId: decoded.id } });
    router.push("/waiter/tables");
  };

  const logout = () => {
    Cookies.remove("token");
    setUser(null);
    router.push("/login");
  };

  const addToCart = (product: any) => {
    setCart((prev) => {
      const exists = prev.find((p) => p.productId === product.id);
      if (exists) {
        return prev.map((p) =>
          p.productId === product.id
            ? { ...p, quantity: p.quantity + 1 }
            : p
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ];
    });
  };

  const clearCart = () => {
    setCart([]);
    setTableId(null);
  };

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        logout,
        tableId,
        setTableId,
        cart,
        addToCart,
        clearCart,
        total,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
