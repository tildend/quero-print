import { Container, Tabs } from "@mantine/core";
import { json, LoaderFunction } from "@remix-run/node";
import UsersPanel from "~/components/Admin/Users/Panel";
import { theSession } from "../sessions.server";
import { getUser } from "~/controllers/User.server";
import { ROLE } from "~/models/User";
import { useLoaderData } from "@remix-run/react";
import { PublicMenuLayout } from "~/layouts/PublicMenu";
import { SupportChat } from "~/components/SupportChat";
import { useTabs } from "~/hooks/useTabs";
import OrdersPanel from "~/components/Admin/Orders/Panel";

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
  const { defaultValue, handleChangeTab } = useTabs(true, 'orders');

  return (
    <PublicMenuLayout user={user}>
      <Container className="rounded-lg bg-white/75 p-4 lg:p-10 shadow-md">
        <h1 className="text-3xl font-bold">
          Remix My Admin
        </h1>

        <Tabs
          defaultValue={defaultValue}
          onChange={handleChangeTab}
          className="mt-10"
        >
          <Tabs.List className="mb-8">
            <Tabs.Tab value="orders">Pedidos</Tabs.Tab>
            <Tabs.Tab value="users">Usuários</Tabs.Tab>
            <Tabs.Tab value="support">Suporte</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="orders">
            <OrdersPanel />
          </Tabs.Panel>
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