import { AppShell, Container, Text } from "@mantine/core";
import { WithId } from "mongodb";
import { FC, PropsWithChildren, useState } from "react";
import { Header } from "~/components/Header";
import { User } from "~/models/User";

type Props = {
  user?: WithId<User>;
}

export const PublicMenuLayout: FC<PropsWithChildren<Props>> = ({ children, user }) => {
  const [dealText, setDealText] = useState("😱 Ganhe 5 páginas <strong>Grátis</strong> na primeira compra");
  const height = 80 + (dealText ? 32 : 0);

  return (
    <AppShell
      header={{ height }}
      padding={{
        base: "sm",
        lg: "lg"
      }}
      bg={"transparent"}
      footer={{
        height: 48,
        collapsed: false,
        offset: true
      }}
    >
      <AppShell.Header
        color="print"
        className="shadow-md"
      >
        <Header dealText={dealText} user={user} />
      </AppShell.Header>

      <AppShell.Main>{children}</AppShell.Main>

      <AppShell.Footer p='md' className="shadow-md">
        <Container className="flex items-center justify-between">
          <Text className="text-xs font-bold">Quero Print &copy; 2024</Text>

          <Text className="italic text-xs">Impressão e envio arquivos na hora ⚡️</Text>
        </Container>
      </AppShell.Footer>
    </AppShell>
  );
}