import { ObjectId } from "mongodb";

export enum ORDER_STATUS {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  PROCESSING = "processing",
  PRINTING = "printing",
  DELIVERED = "delivered",
  CANCELED = "canceled",
}

export type Order = {
  userId: string | ObjectId;
  addressId: string | ObjectId;
  status: ORDER_STATUS;
  pages: number;
  files: { name: string, uploadedAt: string, URL: string }[];
  printTotal: number;
  shippingTotal: number;
  orderTotal: number;
  discount: number;
  createdAt: Date;
  updatedAt: Date;
}