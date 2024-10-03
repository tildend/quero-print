import { LoaderFunction, json } from "@remix-run/node";
import { theSession } from "./sessions";
import { getSupportUserId } from "~/controllers/SupportChat";

export const loader: LoaderFunction = async ({ request }) => {
  const { userId } = await theSession(request, true);

  if (!userId) {
    throw new Response("Forbidden", { status: 403 });
  }

  const receiverId = await getSupportUserId();

  return json(receiverId);
}