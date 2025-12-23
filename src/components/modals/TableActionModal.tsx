"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Chip,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  TextField,
} from "@mui/material";
import { Edit, Delete } from "lucide-react";
import { useMutation, gql } from "@apollo/client";
import { TableStatus } from "../TableItem";
import { Order, OrderItem } from "@/src/entity/entitys";

/** Mutations GraphQL */
export const UPDATE_ORDER_ITEMS = gql`
  mutation UpdateOrderItems($orderId: ID!, $items: [OrderItemUpdateInput!]!) {
    updateOrderItems(orderId: $orderId, items: $items) {
      id
      total
      items {
        id
        productId
        name
        quantity
        unitPrice
        total
      }
    }
  }
`;

export const DELETE_ORDER = gql`
  mutation DeleteOrder($input: DeleteOrderInput!) {
    deleteOrder(input: $input)
  }
`;

export const CREATE_SALE_TABLE = gql`
  mutation CreateSaleFromTable($tableId: ID!, $businessId: ID!, $userId: ID!) {
    createSaleFromTableOrders(tableId: $tableId, businessId: $businessId, userId: $userId) {
      id
      status
    }
  }
`;

interface TableActionModalProps {
  open: boolean;
  tableId?: string;
  tableName?: string;
  status: TableStatus;
  hasOrder?: boolean;
  orders: Order[];
  businessId?: string;
  userId?: string;
  onClose: () => void;
  onChangeStatus: (status: TableStatus) => void;
  onTakeOrder: () => void;
}

const statusLabel: Record<TableStatus, string> = {
  AVAILABLE: "Disponible",
  PAID: "Pagada",
  OCCUPIED: "Ocupada",
  RESERVED: "Reservada",
  DISABLED: "Deshabilitada",
};

const statusColor: Record<TableStatus, "success" | "error" | "warning" | "default"> = {
  AVAILABLE: "success",
  PAID: "success",
  OCCUPIED: "error",
  RESERVED: "warning",
  DISABLED: "default",
};

const TableActionModal = ({
  open,
  tableId,
  tableName,
  status,
  hasOrder,
  orders,
  businessId,
  userId,
  onClose,
  onChangeStatus,
  onTakeOrder,
}: TableActionModalProps) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editing, setEditing] = useState(false);

  const [updateOrderItems] = useMutation(UPDATE_ORDER_ITEMS);
  const [deleteOrder] = useMutation(DELETE_ORDER);
  const [createSale] = useMutation(CREATE_SALE_TABLE);

  // Estados de botones
  const canChangeToOccupied = status === "AVAILABLE";
  const canChangeToAvailable = (status === "OCCUPIED" && !hasOrder) || status === "PAID";
  const canPay = status === "OCCUPIED" && hasOrder;

  /** Abrir submodal de edición de orden */
  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setEditing(true);
  };

  /** Eliminar orden completa */
  const handleDeleteOrder = async (orderId?: string) => {
    if (!orderId || !confirm("¿Seguro quieres eliminar esta orden?")) return;
    await deleteOrder({ variables: { input: { id: orderId } } });
    setSelectedOrder(null);
  };

  /** Guardar cambios de items */
  const handleSaveItems = async (items: OrderItem[]) => {
    if (!selectedOrder) return;
    await updateOrderItems({
      variables: {
        orderId: selectedOrder.id,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.unitPrice,
        })),
      },
    });
    setEditing(false);
    setSelectedOrder(null);
  };

  /** Cambiar cantidad de item */
  const handleQuantityChange = (itemId?: string, newQty?: number) => {
    if (!selectedOrder) return;
    const updatedItems = selectedOrder.items?.map((item) =>
      item.id === itemId ? { ...item, quantity: newQty } : item
    ) ?? [];
    setSelectedOrder({ ...selectedOrder, items: updatedItems });
  };

  /** Eliminar un item de la orden */
  const handleDeleteItem = (itemId?: string) => {
    if (!selectedOrder) return;
    const updatedItems = selectedOrder.items?.filter((item) => item.id !== itemId) ?? [];
    setSelectedOrder({ ...selectedOrder, items: updatedItems });
  };

  /** Generar venta de todas las órdenes */
  const handleCreateSale = async () => {
    if (!tableId || !businessId || !userId) return;
    await createSale({ variables: { tableId, businessId, userId } });
    onClose();
  };

  return (
    <>
      {/* Modal principal */}
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Mesa {tableName}</DialogTitle>
        <DialogContent>
          <Stack spacing={3}>
            {/* Estado de la mesa */}
            <div>
              <Typography variant="body2" color="text.secondary">
                Estado actual

              </Typography>
              <Chip label={statusLabel[status]} color={statusColor[status]} sx={{ mt: 1 }} />
            </div>

            {/* Acciones */}
            <Stack spacing={1}>
              {canChangeToOccupied && (
                <Button variant="contained" color="error" onClick={() => onChangeStatus("OCCUPIED")}>
                  Marcar como ocupada
                </Button>
              )}
              {status === "OCCUPIED" && (
                <Button variant="outlined" onClick={onTakeOrder}>
                  Tomar orden
                </Button>
              )}
              {canChangeToAvailable && (
                <Button variant="outlined" color="success" onClick={() => onChangeStatus("AVAILABLE")}>
                  Liberar mesa
                </Button>
              )}
              {canPay && (
                <Button variant="contained" color="success" onClick={handleCreateSale}>
                  Generar venta (todas las órdenes)
                </Button>
              )}
              {!hasOrder && status === "OCCUPIED" && (
                <Typography variant="caption" color="error">
                  No se puede pagar sin una orden
                </Typography>
              )}
            </Stack>

            {/* Lista de órdenes */}
            {orders.length > 0 && (
              <List sx={{ maxHeight: 300, overflowY: "auto", border: "1px solid #ddd", borderRadius: 1 }}>
                {orders.map((order,key) => (
                  <div key={order.id}>
                    <ListItem
                      secondaryAction={
                        <Stack direction="row" spacing={1}>
                          <IconButton onClick={() => handleEditOrder(order)}>
                            <Edit size={18} />
                          </IconButton>
                          <IconButton onClick={() => handleDeleteOrder(order.id)}>
                            <Delete size={18} />
                          </IconButton>
                        </Stack>
                      }
                    >
                      <ListItemText primary={`Orden ${key} - Total: $${order.total}`} />
                    </ListItem>
                    <Divider />
                  </div>
                ))}
              </List>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Submodal: Editar items de la orden */}
      <Dialog open={editing && !!selectedOrder} onClose={() => setEditing(false)} fullWidth maxWidth="sm">
        <DialogTitle>Editar Orden {selectedOrder?.id}</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            {selectedOrder?.items?.length ? (
              selectedOrder.items.map((item) => (
                <Stack
                  direction="row"
                  spacing={2}
                  key={item.id}
                  alignItems="center"
                  sx={{ p: 1, borderRadius: 1, border: "1px solid #eee" }}
                >
                  <Typography sx={{ flex: 1 }}>{item?.product?.name}</Typography>
                  <TextField
                    type="number"
                    label="Cantidad"
                    size="small"
                    variant="outlined"
                    InputProps={{ inputProps: { min: 0 } }}
                    value={item.quantity ?? 0}
                    onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
                    sx={{ width: 80 }}
                  />
                  <IconButton color="error" onClick={() => handleDeleteItem(item.id)}>
                    <Delete />
                  </IconButton>
                </Stack>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" textAlign="center">
                No hay productos en esta orden
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(false)}>Cancelar</Button>
          <Button onClick={() => handleSaveItems(selectedOrder?.items ?? [])} variant="contained" color="primary">
            Guardar cambios
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TableActionModal;
