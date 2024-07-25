import { AppShell, Container, Text } from "@mantine/core";
import { FC, PropsWithChildren, useState } from "react";
import { Header } from "~/components/Header";

export const PublicMenuLayout: FC<PropsWithChildren> = ({ children }) => {
  const [dealText, setDealText] = useState("😱 Ganhe 5 páginas <strong>Grátis</strong> na primeira compra");
  const height = 80 + (dealText ? 32 : 0);

  return (
    <AppShell
      header={{ height }}
      padding={"xl"}
      bg={"transparent"}
    >
      <AppShell.Header
        color="print"
        className="shadow-md"
      >
        <Header dealText={dealText} />
      </AppShell.Header>

      <AppShell.Main>{children}</AppShell.Main>

      <AppShell.Footer p='md' className="shadow-md">
        <Container className="flex items-center justify-between">
          <Text className="text-xs font-bold">Quero Print &copy; 2024</Text>

          <Text className="italic" size="sm">Impressão e envio de fotos e documentos a partir de 1h</Text>
        </Container>
      </AppShell.Footer>
    </AppShell>
  );
}