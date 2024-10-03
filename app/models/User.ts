import { ObjectId } from "mongodb";

export enum ROLE {
  USER = "user",
  ADMIN = "admin",
  SUPPORT = "support",
}

export type User = {
  name: string;
  email: string;
  password: string;
  phone: string;
  document: string;
  role: ROLE;
  birthDate?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type Address = {
  default: boolean;
  userId: ObjectId | string;
  name: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  observation: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}