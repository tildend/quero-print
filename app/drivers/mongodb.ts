import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

export const mongo = new MongoClient(process.env.MONGODB_URI);
export const db = mongo.db("quero-print");
