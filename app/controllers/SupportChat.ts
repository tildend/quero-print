import { ObjectId } from "mongodb";
import { db } from "~/drivers/mongodb";
import { Erro } from "~/models/Erro";
import { Message } from "~/models/Message";
import { ROLE, User } from "~/models/User";

export const getMessages = async (authorId: string, receiverId = authorId, skip = 0, limit = 10) => {
  if (!authorId)
    throw new Erro("Nenhum usuário informado");

  const messages = db.collection<Message>("messages");
  const messagesList = await messages.find({
    $or: [
      { authorId: new ObjectId(authorId), receiverId: new ObjectId(receiverId) },
      { authorId: new ObjectId(receiverId), receiverId: new ObjectId(authorId) }
    ],
  })
    .sort({ createdAt: -1 })
    .skip(skip).limit(limit).toArray();

  return messagesList;
}

export const createMessage = async (userId: string, receiverId: string, text: string) => {
  const messages = db.collection<Message>("messages");
  const newMessage = new Message(new ObjectId(userId), new ObjectId(receiverId), text);

  const insertedMsg = await messages.insertOne(newMessage);

  return insertedMsg.insertedId;
}

export const deleteMessage = async (messageId: string) => {
  const result = await db.collection<Message>("messages").updateOne({
    _id: new ObjectId(messageId)
  }, {
    $set: {
      status: "deleted"
    }
  });

  if (!result.modifiedCount) {
    throw new Erro("Mensagem não encontrada");
  }

  return result.modifiedCount;
}

// Get the ID of a random support user to receive messages
export const getSupportUserId = async () => {
  const user = await db.collection<User>("users").findOne({
    role: ROLE.SUPPORT
  }, {
    projection: {
      _id: 1
    }
  });

  if (!user) {
    throw new Erro("Nenhum usuário de suporte encontrado");
  }

  return user._id.toString();
}
