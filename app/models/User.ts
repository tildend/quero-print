export type User = {
  _id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  cpf: string;
  birthDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type Address = {
  _id: number;
  default: boolean;
  userId: number;
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