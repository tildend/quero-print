import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { createOrder } from "~/controllers/Orders.server";
import { getUserOrders } from "~/controllers/User.server";
import { Erro } from "~/models/Erro";
import { Order } from "~/models/Order";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { userId } = params;
  if (!userId) {
    throw json({ error: "ID do usuário não informado" }, { status: 400 });
  }

  try {
    const orders = await getUserOrders(userId);
    return json(orders);
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
    throw json({ error: "ID do usuário não informado" }, { status: 400 });
  }

  switch (request.method) {
    case "POST":
      try {
        const newOrder = await request.json() as Order;
        if (!newOrder.userId) throw json({ error: "Usuário não informado" }, { status: 400 });
        if (!newOrder.files || newOrder.files.length === 0) throw json({ error: "Arquivos não informados" }, { status: 400 });
        if (!newOrder.pages || newOrder.pages === 0) throw json({ error: "Páginas não informadas" }, { status: 400 });
        if (!newOrder.orderTotal || newOrder.orderTotal === 0) throw json({ error: "Total não informado" }, { status: 400 });

        const order = await createOrder(newOrder);
        return json({ order });
      } catch (error) {
        console.log('api.orders.($userId).ts', error);
        if (error instanceof Erro) {
          return json({ error: error.mensagem }, { status: 400 });
        }

        return json({ error: "Não foi possível criar a encomenda." }, { status: 400 });
      }
    case "PUT":
      return json({ userId });
    case "DELETE":
      return json({ userId });
    default:
      return json({ userId });
  }
}