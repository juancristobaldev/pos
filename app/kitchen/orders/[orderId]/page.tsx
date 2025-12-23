"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Button,
  Avatar,
  CircularProgress,
} from "@mui/material";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useApp } from "@/src/context/AppContext";

const GET_ORDER = gql`
  query Order($id: ID!) {
    order(id: $id) {
      id
      tableId
      status
      items {
        id
        quantity
        total
        product {
          name
         
        }
      }
    }
  }
`;

const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($input: UpdateOrderStatusInput!) {
    updateOrderStatus(input: $input) {
      id
      status
    }
  }
`;

export default function KitchenOrderDetailPage() {
  const { orderId } = useParams();
  const { user } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data, loading } = useQuery(GET_ORDER, {
    skip: !mounted,
    variables: { id: orderId },
    pollInterval: 5000,
  });

  const [updateStatus] = useMutation(UPDATE_ORDER_STATUS, {
    refetchQueries: ["Order"],
  });

  if (!mounted || loading) {
    return (
      <Box p={4} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  const order = data?.order;

  if (!order) {
    return (
      <Box p={4} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h6" mb={2}>
        Cocina – Productos
      </Typography>

      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between">
            <Typography fontWeight={600}>
              Mesa {order.tableId}
            </Typography>

            <Chip
              label={order.status}
              color={order.status === "COMPLETED" ? "success" : "warning"}
            />
          </Stack>
        </CardContent>
      </Card>

      <Stack spacing={2}>
        {order.items.map((item: any) => (
          <Card key={item.id} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  src={item.product?.image ?? ""}
                  variant="rounded"
                  sx={{ width: 56, height: 56 }}
                />

                <Box flex={1}>
                  <Typography fontWeight={600}>
                    {item.quantity} x {item.product?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ${item.total.toLocaleString()}
                  </Typography>
                </Box>

                <Chip
                  size="small"
                  label={
                    order.status === "COMPLETED" ? "Completed" : "Pending"
                  }
                  color={
                    order.status === "COMPLETED" ? "success" : "warning"
                  }
                />
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {order.status !== "COMPLETED" && (
        <Button
          fullWidth
          variant="contained"
          color="success"
          sx={{ mt: 3, borderRadius: 3 }}
          onClick={() =>
            updateStatus({
              variables: {
                input: {
                  id: order.id,
                  newStatus: "COMPLETED",
                  userId: user?.id,
                },
              },
            })
          }
        >
          Marcar pedido como completado
        </Button>
      )}
    </Box>
  );
}
