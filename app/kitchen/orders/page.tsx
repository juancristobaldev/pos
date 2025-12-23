"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  CircularProgress,
} from "@mui/material";
import StoreIcon from "@mui/icons-material/Store";
import { gql, useQuery } from "@apollo/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useApp } from "@/src/context/AppContext";

const GET_ORDERS = gql`
  query AllOrders($businessId: ID!) {
    allOrders(businessId: $businessId) {
      id
      tableId
      status
      createdAt
      items {
        id
      }
    }
  }
`;

const statusColor = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "success";
    default:
      return "warning";
  }
};

export default function KitchenOrdersPage() {
  const router = useRouter();
  const { user } = useApp();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data, loading } = useQuery(GET_ORDERS, {
    skip: !user?.businessId || !mounted,
    variables: { businessId: user?.businessId },
    pollInterval: 5000,
  });

  if (!mounted || loading) {
    return (
      <Box p={4} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h6" mb={2}>
        Cocina – Pedidos
      </Typography>

      <Stack spacing={2}>
        {data?.allOrders?.map((order: any) => (
          <Card
            key={order.id}
            onClick={() => router.push(`/kitchen/orders/${order.id}`)}
            sx={{
              cursor: "pointer",
              borderRadius: 3,
              boxShadow: 2,
              "&:hover": { boxShadow: 6 },
            }}
          >
            <CardContent>
              <Stack direction="row" justifyContent="space-between">
                <Stack direction="row" spacing={1} alignItems="center">
                  <StoreIcon color="primary" />
                  <Typography fontWeight={600}>
                    Mesa {order.tableId ?? "-"}
                  </Typography>
                </Stack>

                <Chip
                  size="small"
                  label={order.status}
                  color={statusColor(order.status)}
                />
              </Stack>

              <Typography variant="body2" mt={1} color="text.secondary">
                Orden de {order.items?.length ?? 0} productos
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
