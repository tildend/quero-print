import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { ObjectId, WithId } from "mongodb";
import { createAddress, getAddresses, updateAddress } from "~/controllers/Address.server";
import { createOrder } from "~/controllers/Orders.server";
import { Erro } from "~/models/Erro";
import { Order } from "~/models/Order";
import { Address } from "~/models/User";
import { theSession } from "../sessions.server";
import { clearObject } from "~/helpers/clearObject";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { userId } = params;
  if (!userId) {
    throw json({ error: "ID do usuário não informado" }, { status: 400 });
  }

  try {
    const url = new URL(request.url);
    const sp = url.searchParams;
    const search = sp.get("search") ?? "";
    const limit = sp.get("limit") ?? "10";
    const offset = sp.get("offset") ?? "0";

    const addresses = await getAddresses(userId, search, limit, offset);
    return json(addresses);
  } catch (error) {
    console.log('api.orders.($userId).ts', error);
    if (error instanceof Erro) {
      return json({ error: error.mensagem }, { status: 400 });
    }

    return json({ error: "Não foi possível obter seus pedidos." }, { status: 400 });
  }
}

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const { userId } = params;
  if (!userId) {
    console.error('User ID não informado');
    throw json({ error: "ID do usuário não informado" }, { status: 400 });
  }

  const { isLoggedIn } = await theSession(request, false);
  if (!isLoggedIn) {
    console.error('Usuário não logado');
    throw json({ error: "Usuário não logado" }, { status: 400 });
  }

  switch (request.method) {
    case "POST":
      try {
        const newAddress = await request.json() as Address;
        newAddress.userId = new ObjectId(userId);
        const address = await createAddress(newAddress);
        console.log('api.users.($userId).addresses.ts', address);
        if (!address) {
          throw new Erro("Erro ao salvar o endereço");
        }

        return json({ address });
      } catch (error) {
        console.log('api.users.($userId).addresses.ts', error);
        if (error instanceof Erro) {
          return json({ error: error.mensagem }, { status: 400 });
        }

        return json({ error: "Não foi possível salvar o endereço." }, { status: 400 });
      }
    case "PUT":
      try {
        const updatedAddress = await request.json() as WithId<Address>;

        clearObject(updatedAddress, ["userId", "_id", "default", "name", "street", "number", "complement", "neighborhood", "city", "state", "zip", "country", "observation", "createdAt", "updatedAt"]);
        const address = await updateAddress(updatedAddress._id.toString(), updatedAddress);
        return json({ address });
      } catch (error) {
        console.log('api.orders.($userId).ts', error);
        if (error instanceof Erro) {
          return json({ error: error.mensagem }, { status: 400 });
        }

        return json({ error: "Não foi possível atualizar o endereço." }, { status: 400 });
      }
    case "DELETE":
      return json({ userId });
    default:
      return json({ userId });
  }
}