export type ORDER_STATUS = "pending" | "approved" | "printing" | "delivered" | "canceled";

export type Order = {
  _id: string;
  userId: string;
  addressId: number;
  status: ORDER_STATUS;
  pages: number;
  files: string[];
  price: number;
  discount: number;
  createdAt: Date;
  updatedAt: Date;
}