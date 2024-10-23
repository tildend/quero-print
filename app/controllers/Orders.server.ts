import { Filter, ObjectId } from "mongodb";
import { db } from "~/drivers/mongodb";
import type { Order, ORDER_STATUS } from "~/models/Order";

export const getOrders = async (userId?: string, status?: ORDER_STATUS, search = '', skip = 0, limit = 10) => {
  const collection = db.collection<Order>("orders");
  const filter: Filter<Order> = {
    ...(userId && { userId: new ObjectId(userId) }),
    ...(status && { status }),
    ...(search && { $text: { $search: search } })
  };

  const userOrders = await collection.find(filter).skip(skip).limit(limit).toArray();
  const countTotal = await collection.countDocuments(filter);

  return { orders: userOrders, countTotal };
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