import { Box, Container, Tabs } from "@mantine/core";
import { json, LoaderFunction } from "@remix-run/node";
import UsersPanel from "~/components/Admin/Users/Panel";
import { theSession } from "./sessions";
import { getUser } from "~/controllers/User.server";
import { ROLE } from "~/models/User";
import { AdminSupportPanel } from "~/components/Admin/Support/Panel";
import { useLoaderData } from "@remix-run/react";
import { PublicMenuLayout } from "~/layouts/PublicMenu";
import { SupportChat } from "~/components/SupportChat";

export const loader: LoaderFunction = async ({ request }) => {
  const { userId } = await theSession(request, true);

  if (!userId) {
    throw new Response("Forbidden", { status: 403 });
  }

  const user = await getUser(userId);
  if (![ROLE.SUPPORT, ROLE.ADMIN].includes(user.role)) {
    throw new Response("Forbidden", { status: 403 });
  }

  return json({ userId, user });
}

export default function RemixMyAdmin() {
  const { userId, user } = useLoaderData<typeof loader>();

  return (
    <PublicMenuLayout user={user}>
      <Container className="rounded-lg bg-white/75 p-4 lg:p-10 shadow-md">
        <h1 className="text-3xl font-bold">
          Remix My Admin
        </h1>

        <Tabs defaultValue="users" className="mt-10">
          <Tabs.List className="mb-8">
            <Tabs.Tab value="users">Usuários</Tabs.Tab>
            <Tabs.Tab value="support">Suporte</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="users">
            <UsersPanel />
          </Tabs.Panel>
          <Tabs.Panel value="support">
            <SupportChat userId={userId} enableMultiUser />
          </Tabs.Panel>
        </Tabs>
      </Container>
    </PublicMenuLayout>
  );
}