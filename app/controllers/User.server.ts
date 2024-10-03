import { db } from "~/drivers/mongodb"
import { getOrders } from "./Orders.server";
import { ROLE, User } from "~/models/User";
import { ObjectId } from "mongodb";
import { compareTextAndHash, hash } from "~/helpers/crypto";
import { Erro } from "~/models/Erro";
import { Message } from "~/models/Message";

export const userExists = async (userId: string) => {
  const user = await db.collection<User>("users").countDocuments({ _id: new ObjectId(userId) });
  return user > 0;
}

export const getUser = async (userId: string) => {
  const user = await db.collection<User>("users").findOne({
    _id: new ObjectId(userId)
  });

  if (!user) {
    throw new Erro("Usuário não encontrado");
  }

  return user;
}

export const getUsers = async (search: string, limit: string, offset: string): Promise<{ users: User[], total: number }> => {
  const users = db.collection<User>("users");
  const total = await users.countDocuments({ name: { $regex: search, $options: "i" } });

  const usersList = await users.find({
    name: { $regex: search, $options: "i" }
  }).limit(parseInt(limit)).skip(parseInt(offset)).toArray();

  return { users: usersList, total };
}

export const getReceivedMessageUsers = async (receiverId: string) => {
  const messages = db.collection<Message>("messages");
  const receivedMsgUsers = await messages.distinct("authorId", { receiverId: new ObjectId(receiverId) });

  return receivedMsgUsers;
}

export const getUserRole = async (userId: string) => {
  const user = await db.collection<User>("users").findOne({
    _id: new ObjectId(userId)
  });

  if (!user) {
    throw new Erro("Usuário não encontrado");
  }

  return user.role;
}

export const getUserOrders = async (userId: string) => {
  return await getOrders(userId, undefined, 0, 1);
}

export const createUser = async (user: User) => {
  user.password = hash(user.password);
  const usersCollection = db.collection<User>("users");
  const newUserID = await usersCollection.insertOne(user);
  const newUser = await usersCollection.findOne({ _id: newUserID.insertedId });

  return newUser;
}

// Creates a temporary user for a non-logged user
export const createTempUser = async () => {
  const user = await createUser({
    name: '',
    email: '',
    document: '',
    role: ROLE.USER,
    password: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    phone: '',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  return user;
}

export const updateUser = async (userId: string, user: User) => {
  const users = db.collection<User>("users");

  const noId = user as Omit<User, 'password'> & { _id?: ObjectId, password?: string };
  delete noId._id;

  if (noId.password) {
    noId.password = hash(noId.password);
  } else {
    delete noId.password;
  }

  return await users.updateOne({
    _id: new ObjectId(userId)
  }, {
    $set: noId
  });
}

export const deleteUser = async (userId: string) => {
  const users = db.collection<User>("users");
  return await users.deleteOne({
    _id: new ObjectId(userId)
  });
}

export const getUserByEmail = async (email: string) => {
  const user = await db.collection<User>("users").findOne({
    email
  });

  if (!user) {
    throw new Erro("Usuário não encontrado");
  }

  return user;
}

export const getUserByDocument = async (document: string) => {
  const user = await db.collection<User>("users").findOne({
    document
  });

  if (!user) {
    throw new Erro("Usuário não encontrado");
  }

  return user;
}

export const authenticatedUser = async (email: string, password: string) => {
  const user = await db.collection<User>("users").findOne({
    email
  });

  if (!user) {
    throw new Erro("Usuário não encontrado");
  }

  console.log('user', user);
  console.log('password', password);

  return compareTextAndHash(password, user.password!) ? user : false;
}
