import { LoaderFunction, json } from "@remix-run/node";
import { theSession } from "../sessions.server";
import { getReceivedMessageUsers } from "~/controllers/User.server";

export const loader: LoaderFunction = async ({ request }) => {
  const { userId } = await theSession(request, true);

  if (!userId) {
    throw new Response("Forbidden", { status: 403 });
  }

  const receivedMsgUsers = await getReceivedMessageUsers(userId);

  return json(receivedMsgUsers);
}