import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { getUser } from "~/controllers/User.server";

type SessionData = {
  userId: string;
};

type SessionFlashData = {
  error: string;
};

const { getSession, commitSession, destroySession } = createCookieSessionStorage<SessionData, SessionFlashData>({
  cookie: {
    name: "__session",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET || "not-so-secret"],
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30 * 1000, // 30 days
  }
});

const theSession = async (req: Request, autoRedirect = false) => {
  const cookies = req.headers.get("Cookie");

  const session = await getSession(cookies);
  const userId = session.get("userId");
  if (!userId && autoRedirect)
    throw redirect('/login');

  const user = userId ? await getUser(userId) : undefined;

  return { isLoggedIn: !!userId, userId, user, session };
}

export { theSession, getSession, commitSession, destroySession };