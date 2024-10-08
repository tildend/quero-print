import { ActionFunction, json } from "@remix-run/node";
import { WithId } from "mongodb";
import { createAddress } from "~/controllers/Address.server";
import { createOrder } from "~/controllers/Orders.server";
import { createUser, getUser, getUserByDocument } from "~/controllers/User.server";
import { Order } from "~/models/Order";
import { Address, User } from "~/models/User";

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
          } else {
            user = await getUserByDocument(body.payment.document);
          }
        } catch (error) {
          console.log("[api.orders][POST][catch] Novo usuário!! 🎉🎉🎉", error);

          user = await createUser({
            document: body.payment.document,
            email: body.payment.email,
            name: body.payment.fullName,

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
          userId: user._id,
          addressId: addressID,
          status: "pending",
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