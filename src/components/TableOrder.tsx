import React, { useMemo, useState } from "react";
import { gql } from "@apollo/client";

export const GET_PRODUCTS = gql`
  query GetProducts($businessId: ID!) {
    products(businessId: $businessId) {
      id
      name
      price
      category
      description
    }
  }
`;

export const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
      orders {
      id
      status
      total
      createdAt
      tableId
      }
    }
  }
    `

    interface DraftOrderItem {
        productId: string;
        name: string;
        price: number;
        quantity: number;
      }
      
      interface TableOrderModalProps {
        open: boolean;
        onClose: () => void;
        tableId: string | undefined ;
        businessId: string | undefined ;
        userId: string | undefined;
       
      }
      
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";

import { useQuery, useMutation } from "@apollo/client";
import { AddCircleOutline } from "@mui/icons-material";
import { Trash } from "lucide-react";
import { GET_FLOORS } from "@/app/waiter/tables/page";
import { useApp } from "../context/AppContext";

const TableOrderModal = ({
  open,
  onClose,
  tableId,
  businessId,
  userId,

}: TableOrderModalProps) => {
  const { data, loading } = useQuery(GET_PRODUCTS, {
    variables: { businessId },
    skip: !open,
  });

  const {user} = useApp()

  const [createOrder, { loading: creating }] =
    useMutation(CREATE_ORDER, {
      refetchQueries: [
        { query: GET_FLOORS, variables: { businessId: user?.businessId } }
      ]
    });

  const [items, setItems] = useState<DraftOrderItem[]>([]);

  /* =========================
     ACCIONES
  ========================= */

  const addProduct = (product: any) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.productId === product.id,
      );
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i,
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

  const removeItem = (productId: string) => {
    setItems((prev) =>
      prev.filter((i) => i.productId !== productId),
    );
  };

  const total = useMemo(
    () =>
      items.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0,
      ),
    [items],
  );

  const handleCreateOrder = async () => {
    if (!items.length) return;

    await createOrder({
      variables: {
        input: {
          tableId,
          userId,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        },
      },
    });

    setItems([]);
    onClose();
  };

  /* =========================
     RENDER
  ========================= */

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Orden Mesa</DialogTitle>

      <DialogContent sx={{ display: "flex", gap: 3 }}>
        {/* PRODUCTOS */}
        <Box flex={1}>
          <Typography fontWeight="bold" mb={1}>
            Productos
          </Typography>

          {loading ? (
            <Typography>Cargando productos…</Typography>
          ) : (
            <List dense>
              {data?.products.map((p:any) => (
                <ListItem
                  key={p.id}
                  secondaryAction={
                    <IconButton onClick={() => addProduct(p)}>
                      <AddCircleOutline />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={`${p.name} – $${p.price}`}
                    secondary={p.category}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        {/* ORDEN */}
        <Box flex={1}>
          <Typography fontWeight="bold" mb={1}>
            Orden actual
          </Typography>

          {!items.length && (
            <Typography color="text.secondary">
              No hay productos agregados
            </Typography>
          )}

          <List dense>
            {items.map((i) => (
              <ListItem
                key={i.productId}
                secondaryAction={
                  <IconButton
                    color="error"
                    onClick={() =>
                      removeItem(i.productId)
                    }
                  >
                    <Trash/>
                  </IconButton>
                }
              >
                <ListItemText
                  primary={`${i.name} x${i.quantity}`}
                  secondary={`$${i.price * i.quantity}`}
                />
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 1 }} />

          <Typography fontWeight="bold">
            Total: ${total}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          disabled={!items.length || creating}
          onClick={handleCreateOrder}
        >
          Crear orden
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TableOrderModal