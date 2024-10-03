import type { ObjectId } from "mongodb";

export class Message {
  authorId: ObjectId | string;
  receiverId: ObjectId | string;
  text: string;
  status: "pending" | "sent" | "received" | "viewed" | "deleted" | "error";
  createdAt: Date | string;
  updatedAt: Date | string;

  constructor(authorId: ObjectId | string, receiverId: ObjectId | string, text: string) {
    this.authorId = authorId;
    this.receiverId = receiverId;
    this.text = text;
    this.status = "pending";

    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}
