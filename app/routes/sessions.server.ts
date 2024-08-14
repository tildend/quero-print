import { createCookieSessionStorage } from "@remix-run/node";

const { getSession, commitSession, destroySession } = createCookieSessionStorage({
  cookie: {
    name: "__session",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET || "not-so-secret"],
  }
});

const isLoggedIn = (req: Request) => {
  const cookies = req.headers.get("Cookie");
  if (!cookies) return false;

  return getSession(cookies);
}

export { isLoggedIn, getSession, commitSession, destroySession };