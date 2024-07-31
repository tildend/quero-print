import { db } from "~/drivers/mongodb"
import { getOrders } from "./Orders.server";
import { User } from "~/models/User";

export const userExists = async (userId: string) => {
  const user = await db.collection<User>("users").countDocuments({_id: userId});
  return user > 0;
}

export const getUser = async (userId: string) => {
  const user = await db.collection<User>("users").findOne({
    _id: userId
  });

  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  return user;
}

export const getUserOrders = async (userId: string) => {
  return (await getOrders(userId, undefined, 0, 1))[0];
}

export const createUser = async (user: User) => {
  const users = db.collection<User>("users");
  await users.insertOne(user);
  return user;
}

export const updateUser = async (userId: string, user: User) => {
  const users = db.collection<User>("users");
  return await users.updateOne({
    _id: userId
  }, {
    $set: user
  });
}

export const deleteUser = async (userId: string) => {
  const users = db.collection<User>("users");
  return await users.deleteOne({
    _id: userId
  });
}

export const getUserByEmail = async (email: string) => {
  const user = await db.collection<User>("users").findOne({
    email
  });

  if (!user) {
    throw new Error("Usuário não encontrado");
  }
  
  return user;
}

export const getUserByCpf = async (cpf: string) => {
  const user = await db.collection<User>("users").findOne({
    cpf
  });

  if (!user) {
    throw new Error("Usuário não encontrado");
  }
  
  return user;
}