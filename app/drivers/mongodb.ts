import { MongoClient } from "mongodb";
import { AddressOfCoords } from "~/models/AddressOfCoords";

if (!process.env.MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

const mongo = new MongoClient(process.env.MONGODB_URI);
const db = mongo.db("quero-print");

db.collection<AddressOfCoords>("AddressOfCoords").createIndex({ coordinates: 1 }, { unique: true });

export { db, mongo };
