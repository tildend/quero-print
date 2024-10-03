import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { commitSession, destroySession, getSession } from "./sessions";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request.headers.get('Cookie'));
  session.unset('userId');
  await destroySession(session);

  return redirect('/', { headers: { 'Set-Cookie': await commitSession(session) } });
}