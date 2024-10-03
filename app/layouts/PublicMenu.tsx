import { AppShell, Container, Text } from "@mantine/core";
import { FC, PropsWithChildren, useState } from "react";
import { Header } from "~/components/Header";

type Props = {
  userId?: string;
}

export const PublicMenuLayout: FC<PropsWithChildren<Props>> = ({ children, userId }) => {
  const [dealText, setDealText] = useState("😱 Ganhe 5 páginas <strong>Grátis</strong> na primeira compra");
  const height = 80 + (dealText ? 32 : 0);

  return (
    <AppShell
      header={{ height }}
      padding={"xl"}
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
        <Header dealText={dealText} userId={userId} />
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