import { Filter, ObjectId, WithId } from "mongodb";
import { db } from "~/drivers/mongodb";
import { Address } from "~/models/User";

export const createAddress = async (address: Omit<Address, '_id' | 'createdAt' | 'updatedAt'>) => {
  const addresses = db.collection<Address>("addresses");
  const newAddressID = await addresses.insertOne({
    ...address,
    createdAt: new Date(),
    updatedAt: new Date()
  });

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

export const getAddresses = async (userId: string, search = "", limit = "10", offset = "0") => {
  const addresses = db.collection<Address>("addresses");
  const filter: Filter<Address> = {
    userId: new ObjectId(userId)
  };
  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  const total = await addresses.countDocuments(filter);
  const addressesList = await addresses.find(filter).limit(parseInt(limit)).skip(parseInt(offset)).toArray();

  return { addresses: addressesList, total };
}

export const updateAddress = async (addressId: string | ObjectId, address: Address & WithId<Address>) => {
  const addressWOId = address as Omit<Address, '_id' | 'userId'> & { _id?: ObjectId, userId?: ObjectId };
  if (addressWOId._id)
    delete addressWOId._id;

  if (addressWOId.userId)
    delete addressWOId.userId;

  console.log('UPDATE ADDRESS: ', addressId, addressWOId);

  const addresses = db.collection<Address>("addresses");
  return await addresses
    .updateOne({
      _id: typeof addressId === "string" ? new ObjectId(addressId) : addressId
    }, {
      $set: addressWOId
    });
}

export const deleteAddress = async (addressId: string) => {
  const addresses = db.collection<Address>("addresses");
  return await addresses.deleteOne({
    _id: new ObjectId(addressId)
  });
}