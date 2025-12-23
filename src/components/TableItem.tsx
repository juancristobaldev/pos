// src/components/FloorPlan/TableItem.tsx
import React, { useRef } from "react";
import Draggable from "react-draggable";
import { Box, Typography } from "@mui/material";
import { gql } from "@apollo/client";
import { Table } from "../entity/entitys";

export const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
      status
      total
    }
  }
`;


// Tipos de forma
export type ShapeType =
  | "square"
  | "circle"
  | "rectangle-v"
  | "rectangle-h"
  | "wall";

// Estados de mesa
export type TableStatus =
  | "AVAILABLE"
  | "PAID"
  | "OCCUPIED"
  | "RESERVED"
  | "DISABLED";

interface TableItemProps {
  table:Table
  id: string | undefined;
  name: string | undefined; 
  x: number | undefined;
  y: number | undefined;
  shape: ShapeType | string;
  status: TableStatus;
  readOnly?: boolean;
  onSelectTable: (table:Table) => void;
}

const TableItem = ({
  id,
  table,
  name,
  x,
  y,
  shape,
  status,
  readOnly = false,
  onSelectTable
}: TableItemProps) => {


  
  const nodeRef = useRef<HTMLDivElement | null>(null);

  // 🎨 Color según estado
  const getColorByStatus = () => {
    switch (status) {
      case "AVAILABLE":
        return "#22c55e"; // verde
      case "OCCUPIED":
        return "#ef4444"; // rojo
      case "RESERVED":
        return "#f59e0b"; // amarillo
      case "DISABLED":
        return "#9ca3af"; // gris
      default:
        return "#e5e7eb";
    }
  };

  // 📐 Tamaño según forma
  const getShapeStyles = () => {
    switch (shape) {
      case "square":
        return { width: 80, height: 80, borderRadius: 2 };
      case "circle":
        return { width: 60, height: 60, borderRadius: "50%" };
      case "rectangle-v":
        return { width: 80, height: 160, borderRadius: 2 };
      case "rectangle-h":
        return { width: 160, height: 80, borderRadius: 2 };
      case "wall":
        return { width: 40, height: 300, borderRadius: 4 };
      default:
        return { width: 80, height: 80, borderRadius: 2 };
    }
  };

  const styles = getShapeStyles();
  const backgroundColor = shape === "wall" ? "#9ca3af" : getColorByStatus();

  return (
    <Draggable
    nodeRef={nodeRef}
    position={{ x: x ?? 0, y: y ?? 0 }}
    disabled={readOnly || shape === "wall"}
    bounds="parent"
    grid={[10, 10]}
  >
      <Box
        onClick={() => onSelectTable(table)}
        ref={nodeRef}
        sx={{
          ...styles,
          position: "absolute",
          backgroundColor,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor:
            readOnly || shape === "wall" ? "default" : "pointer",
          boxShadow: shape === "wall" ? 0 : 4,
          transition: "all 0.2s ease",
          "&:hover": {
            boxShadow: readOnly ? 4 : 8,
            zIndex: 10,
          },
          color: "#111827",
          fontWeight: "bold",
          userSelect: "none",
        }}
      >
        {/* No mostrar texto en paredes */}
        {shape !== "wall" && (
          <Typography variant="h6" fontWeight="bold">
            {name}
          </Typography>
        )}
      </Box>
    </Draggable>
  );
};

export default TableItem;
