import { ActionFunctionArgs, json } from "@remix-run/node";
import { createOrder } from "~/controllers/Orders.server";
import { getUserOrders } from "~/controllers/User.server";
import { Order } from "~/models/Order";

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const { userId } = params;
  if (!userId) {
    throw json({ error: "ID do usuário não informado" }, { status: 400 });
  }
  
  switch (request.method) {
    case "GET":
      try {
        const orders = await getUserOrders(userId);
        return json({ orders });
      } catch (error) {
        throw error;
      }
    case "POST":
      try {
        const newOrder = await request.json() as Order;
        if (!newOrder.userId) throw json({ error: "Usuário não informado" }, { status: 400 });
        if (!newOrder.files || newOrder.files.length === 0) throw json({ error: "Arquivos não informados" }, { status: 400 });
        if (!newOrder.pages || newOrder.pages === 0) throw json({ error: "Páginas não informadas" }, { status: 400 });
        if (!newOrder.price || newOrder.price === 0) throw json({ error: "Preço não informado" }, { status: 400 });

        const order = await createOrder(newOrder);
        return json({ order });
      } catch (error) {
        throw error;
      }
    case "PUT":
      return json({ userId });
    case "DELETE":
      return json({ userId });
    default:
      return json({ userId });
  }
}