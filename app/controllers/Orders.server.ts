import { ObjectId } from "mongodb";
import { db } from "~/drivers/mongodb";
import type { Order, ORDER_STATUS } from "~/models/Order";

export const getOrders = async (userId?: string, status?: ORDER_STATUS, skip = 0, limit = 10) => {
  const orders = db.collection<Order>("orders");
  const userOrders = await orders.find({
    userId: new ObjectId(userId),
    ...(status && { status })
  }).skip(skip).limit(limit).toArray();

  return userOrders;
}

export const getOrder = async (orderId: string) => {
  const orders = db.collection<Order>("orders");
  return await orders.findOne({
    _id: new ObjectId(orderId)
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
    _id: new ObjectId(orderId)
  }, {
    $set: order
  });
  return order;
}

export const deleteOrder = async (orderId: string) => {
  const orders = db.collection<Order>("orders");
  await orders.deleteOne({
    _id: new ObjectId(orderId)
  });
}