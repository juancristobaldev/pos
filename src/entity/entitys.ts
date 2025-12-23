export type TableStatus =
  | "AVAILABLE"
  | "OCCUPIED"
  | "RESERVED"
  | "DISABLED";

export type ShapeType =
  | "square"
  | "circle"
  | "rectangle-v"
  | "rectangle-h"
  | "wall";

  export interface OrderItem {
    id: string | undefined;
    orderId: string | undefined;
    name: string | undefined;
    product:Product;
    productId: string | undefined;
    quantity: number | undefined;
    unitPrice: number | undefined;
    total: number | undefined;
    note?: string | undefined;
  }
  
  export interface Order {
    id: string | undefined;
    tableId?: string | undefined;       // nullable en DB
    userId: string | undefined;
    status: string | undefined;
    subtotal: number | undefined;
    tax: number | undefined;
    discount: number | undefined;
    tip: number | undefined;
    total: number | undefined;
    clientEmail?: string | undefined;   // nullable en DB
    saleId?: string | undefined;        // nullable en DB
    items?: OrderItem[] | undefined;
    createdAt: string | undefined;      // Date en DB → string en TS
    updatedAt: string | undefined;
  }

  export interface Product {
    id: string | undefined;
   name:string | undefined;
   price:number | undefined;
  }

  
export interface Table {
  id: string  | undefined;
  name: string | undefined;
  status: TableStatus;
  capacity?: number | undefined;
  shape: ShapeType ;
  coordX: number | undefined;
  coordY: number | undefined;
  orders: Order[] | undefined;
  hasActiveOrder?: boolean | undefined ;
}

