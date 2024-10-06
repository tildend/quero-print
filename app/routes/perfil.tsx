import { Box, Container, Skeleton, Tabs } from "@mantine/core";
import { LoaderFunction, redirect } from "@remix-run/node";
import { PublicMenuLayout } from "~/layouts/PublicMenu";
import { theSession } from "./sessions";
import { useLoaderData } from "@remix-run/react";
import { useTabs } from "~/hooks/useTabs";

import ProfileTab from "~/components/Profile/Tabs/Profile";
import AddressesTab from "~/components/Profile/Tabs/Addresses/Addresses";
import OrdersTab from "~/components/Profile/Tabs/Orders";

import { getUser } from "~/controllers/User.server";
import { getOrders } from "~/controllers/Orders.server";
import { getAddresses } from "~/controllers/Address.server";
import { SupportChat } from "~/components/SupportChat";
import { useViewportSize } from "@mantine/hooks";

export const loader: LoaderFunction = async ({ request }) => {
  const { userId } = await theSession(request, true);

  if (!userId) {
    redirect("/login");
    return;
  }

  console.log('userId', userId);

  const user = await getUser(userId);
  const orders = await getOrders(userId);
  const addresses = await getAddresses(userId);

  return {
    userId,
    user,
    orders,
    addresses: addresses.addresses
  };
}

export default function Perfil() {
  const { userId, user, orders, addresses } = useLoaderData<typeof loader>();
  const { defaultValue, handleChangeTab } = useTabs(true, 'perfil');

  const { width } = useViewportSize();

  return <PublicMenuLayout user={user}>
    <Container className="relative">
      <Box className="
        relative
        w-screen lg:w-full
        left-1/2 lg:left-auto
        -translate-x-1/2 lg:-translate-x-0
        p-8 rounded-lg bg-white/75 shadow-md
      ">
        {user ? (<>
          <h2 className="text-2xl font-semibold">Bem vindo {user.name}</h2>

          <Box className="mt-4 w-full">
            <Tabs orientation={width > 1024 ? 'vertical' : 'horizontal'} defaultValue={defaultValue} className="gap-8" onChange={handleChangeTab}>
              <Tabs.List mb={width > 1024 ? 0 : 16}>
                <Tabs.Tab value="perfil">Perfil</Tabs.Tab>
                <Tabs.Tab value="enderecos">Endereços</Tabs.Tab>
                <Tabs.Tab value="pedidos">Pedidos</Tabs.Tab>
                <Tabs.Tab value="suporte">Suporte</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="perfil">
                <ProfileTab user={user} />
              </Tabs.Panel>

              <Tabs.Panel value="enderecos">
                <AddressesTab addresses={addresses} userId={userId} />
              </Tabs.Panel>

              <Tabs.Panel value="pedidos">
                <OrdersTab orders={orders} />
              </Tabs.Panel>
              <Tabs.Panel value="suporte">
                <SupportChat userId={userId} />
              </Tabs.Panel>
            </Tabs>
          </Box>
        </>
        ) : (
          <Skeleton height={100} className="rounded-lg" />
        )}

      </Box>
    </Container>
  </PublicMenuLayout>
}