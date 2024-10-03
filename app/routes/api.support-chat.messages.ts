import { LoaderFunction, redirect, json, ActionFunction } from "@remix-run/node";
import { theSession } from "./sessions";
import { createMessage, getMessages } from "~/controllers/SupportChat";
import { Erro } from "~/models/Erro";

export const loader: LoaderFunction = async ({ request }) => {
  const { userId } = await theSession(request, true);

  if (!userId) {
    throw new Response("Forbidden", { status: 403 });
  }

  const url = new URL(request.url);
  const authorId = url.searchParams.get("authorId");

  const messages = await getMessages(authorId || userId, userId);

  return json(messages);
}

export const action: ActionFunction = async ({ request }) => {
  const { userId } = await theSession(request, true);

  if (!userId) {
    throw redirect("/login");
  }

  switch (request.method) {
    case "POST":
      try {
        const body = await request.formData();
        const text = body.get("text");
        const receiverId = body.get("receiverId");

        if (!text) {
          throw new Erro("Mensagem vazia");
        }

        if (!receiverId) {
          throw new Erro("Destinatario não informado");
        }

        const messageId = await createMessage(userId, receiverId.toString(), text.toString());

        return new Response(
          JSON.stringify({ messageId }),
          {
            status: 201,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      } catch (error) {
        if (error instanceof Erro) {
          return new Response(JSON.stringify({ error: error.mensagem }), {
            status: 400,
            headers: {
              "Content-Type": "application/json",
            },
          });
        }

        return new Response(JSON.stringify({ error: "Ocorreu um erro" }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
    default:
      throw new Response("Method not allowed", { status: 405 });
  }
}