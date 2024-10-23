import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node";
import { WithId } from "mongodb";
import { createAddress } from "~/controllers/Address.server";
import { createOrder, getOrders } from "~/controllers/Orders.server";
import { createUser, getUser, getUserByDocument } from "~/controllers/User.server";
import { Erro } from "~/models/Erro";
import { ORDER_STATUS } from "~/models/Order";
import { ROLE, User } from "~/models/User";
import { theSession } from "~/sessions.server";

export const loader: LoaderFunction = async ({ request }) => {
  const session = await theSession(request);
  if (!session.isLoggedIn) {
    throw redirect("/");
  }

  if (session.user?.role === ROLE.USER) {
    throw redirect("/");
  }

  const url = new URL(request.url);
  const search = url.searchParams.get("s")?.toString() || '';
  const status = url.searchParams.get("status")?.toString() || undefined;
  const limit = url.searchParams.get("limit")?.toString() || '10';
  const skip = url.searchParams.get("skip")?.toString() || '0';

  const order_status = status && (Object.keys(ORDER_STATUS).includes(status) ? ORDER_STATUS[status as keyof typeof ORDER_STATUS] : undefined);

  try {
    const orders = await getOrders(undefined, order_status || undefined, search, Number(skip), Number(limit));
    return json(orders.orders, {
      headers: {
        'x-total': orders.countTotal.toString()
      }
    });
  } catch (error) {
    console.log('api.orders.ts', error);
    if (error instanceof Erro) {
      return json({ error: error.mensagem }, { status: 400 });
    }
    return json({ error: "Não foi possível obter seus pedidos." }, { status: 400 });
  }
}

export const action: ActionFunction = async ({ request }) => {
  switch (request.method) {
    case "POST":
      try {
        const body = await request.json();

        if (!body.payment.document) {
          return json({ error: "Documento não fornecido" }, { status: 400 });
        }

        let user: WithId<User> | null;
        try {
          if (body.userId) {
            user = await getUser(body.userId);
          } else if (body.payment.document) {
            user = await getUserByDocument(body.payment.document);
          } else {
            throw new Erro("Nenhum documento fornecido", 400);
          }
        } catch (error) {
          console.log("[api.orders][POST][catch] Novo usuário!! 🎉🎉🎉", error);

          user = await createUser({
            document: body.payment.document,
            email: body.payment.email,
            name: body.payment.fullName,
            role: ROLE.USER,
            password: Math.random().toString(36).substring(7),
            phone: body.payment.phone,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          if (!user) {
            console.error("[api.orders][POST][catch] Erro ao criar usuário", user);
            return json({ error: "Erro interno. Tente novamente" }, { status: 500 });
          }
        }

        const orderAddr = body.address;
        const addressID = await createAddress({
          userId: user._id,
          name: 'Primeiro endereço',
          street: orderAddr.street,
          number: orderAddr.number,
          neighborhood: orderAddr.neighborhood,
          city: orderAddr.city,
          state: orderAddr.state,
          zip: orderAddr.zip,
          country: 'BR',
          complement: orderAddr.complement,
          observation: orderAddr.observations,
          default: true
        });

        await createOrder({
          userId: user._id.toString(),
          addressId: addressID.toString(),
          status: ORDER_STATUS.PENDING,
          pages: body.totalPages,
          files: body.files,
          printTotal: body.printTotal,
          shippingTotal: body.shippingTotal,
          orderTotal: body.orderTotal,
          discount: body.discount || 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        return json({ message: "Pedido criado com sucesso" }, { status: 201 });
      } catch (error) {
        console.error('[api.orders][POST][catch] Erro ao criar pedido', error);
        return json({ error: "Erro ao criar pedido" }, { status: 500 });
      }
    default:
      return json({ error: "Método não permitido" }, { status: 405 });
  }
}