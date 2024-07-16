import { AppShell, Container, Group, Text, Title } from "@mantine/core";
import { Link } from "@remix-run/react";
import { FC, PropsWithChildren } from "react";

export const PublicMenuLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <AppShell
      color="print"
      header={{ height: 82 }}
      padding={"xl"}
      bg={"transparent"}
    >
      <AppShell.Header color="print" className="shadow-md">
        <Container className="flex items-center justify-between h-full">
          <Title order={1} className="relative w-fit text-4xl leading-[0.5]" c="print" ta="right">
            Quero<br />
            <span className="text-xl font-black italic text-daintree leading-[0.5]">Print!</span>
          </Title>

          <Group gap='md'>
            <Link to='/login'>Login</Link>
            <Link to='/register'>Cadastro</Link>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main>{children}</AppShell.Main>

      <AppShell.Footer p='md' className="shadow-md">
        <Container className="flex items-center justify-between">
          <Text className="text-xs font-bold">Quero Print &copy; 2024</Text>

          <Text className="italic">Impressão e envio de fotos e documentos a partir de 1h</Text>
        </Container>
      </AppShell.Footer>
    </AppShell>
  );
}