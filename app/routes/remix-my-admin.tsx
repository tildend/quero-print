import { Box, Tabs } from "@mantine/core";
import { json, LoaderFunction } from "@remix-run/node";
import UsersPanel from "~/components/Admin/Users/Panel";
import { theSession } from "./sessions";
import { getUser } from "~/controllers/User.server";
import { ROLE } from "~/models/User";
import { AdminSupportPanel } from "~/components/Admin/Support/Panel";
import { useLoaderData } from "@remix-run/react";

export const loader: LoaderFunction = async ({ request }) => {
  const { userId } = await theSession(request, true);

  if (!userId) {
    throw new Response("Forbidden", { status: 403 });
  }

  const user = await getUser(userId);
  if (![ROLE.SUPPORT, ROLE.ADMIN].includes(user.role)) {
    throw new Response("Forbidden", { status: 403 });
  }

  return json({ userId });
}

export default function RemixMyAdmin() {
  const { userId } = useLoaderData<typeof loader>();

  return (
    <main className="flex flex-col items-center justify-center w-screen h-screen">
      <Box className="w-full max-w-2xl rounded-3xl bg-white p-10 shadow-md">
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
            <AdminSupportPanel userId={userId} />
          </Tabs.Panel>
        </Tabs>
      </Box>
    </main>
  );
}