import { ObjectId } from "mongodb";

export type ORDER_STATUS = "pending" | "approved" | "printing" | "delivered" | "canceled";

export type Order = {
  userId: string | ObjectId;
  addressId: string | ObjectId;
  status: ORDER_STATUS;
  pages: number;
  files: string[];
  printTotal: number;
  shippingTotal: number;
  orderTotal: number;
  discount: number;
  createdAt: Date;
  updatedAt: Date;
}