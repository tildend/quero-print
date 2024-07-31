import { db } from "~/drivers/mongodb";
import type { Order, ORDER_STATUS } from "~/models/Order";

export const getOrders = async (userId?: string, status?: ORDER_STATUS, skip = 0, limit = 10) => {
  const orders = db.collection<Order>("orders");
  return await orders.find({
    _id: userId,
    status
  }).skip(skip).limit(limit).toArray();
}

export const getOrder = async (orderId: string) => {
  const orders = db.collection<Order>("orders");
  return await orders.findOne({
    _id: orderId
  });
}

export const createOrder = async (order: Order) => {
  const orders = db.collection<Order>("orders");
  await orders.insertOne(order);
  return order;
}

export const updateOrder = async (orderId: string, order: Order) => {
  const orders = db.collection<Order>("orders");
  await orders.updateOne({
    _id: orderId
  }, {
    $set: order
  });
  return order;
}

export const deleteOrder = async (orderId: string) => {
  const orders = db.collection<Order>("orders");
  await orders.deleteOne({
    _id: orderId
  });
}