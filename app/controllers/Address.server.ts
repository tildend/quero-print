import { ObjectId } from "mongodb";
import { db } from "~/drivers/mongodb";
import { Address } from "~/models/User";

export const createAddress = async (address: Address) => {
  const addresses = db.collection<Address>("addresses");
  const newAddressID = await addresses.insertOne(address);
  
  return newAddressID.insertedId;
}

export const getAddress = async (addressId: string) => {
  const address = await db.collection<Address>("addresses").findOne({
    _id: new ObjectId(addressId)
  });

  if (!address) {
    throw new Error("Endereço não encontrado");
  }

  return address;
}

export const updateAddress = async (addressId: string, address: Address) => {
  const addresses = db.collection<Address>("addresses");
  return await addresses
    .updateOne({
      _id: new ObjectId(addressId)
    }, {
      $set: address
    });
}

export const deleteAddress = async (addressId: string) => {
  const addresses = db.collection<Address>("addresses");
  return await addresses.deleteOne({
    _id: new ObjectId(addressId)
  });
}

export const getUserAddresses = async (userId: string) => {
  return await db.collection<Address>("addresses").find({
    userId: new ObjectId(userId)
  }).toArray();
}