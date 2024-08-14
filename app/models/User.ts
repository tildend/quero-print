import { ObjectId } from "mongodb";

export type User = {
  name: string;
  email: string;
  password: string;
  phone: string;
  document: string;
  birthDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type Address = {
  default: boolean;
  userId: ObjectId;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
  observation: string;
  createdAt: Date;
  updatedAt: Date;
}