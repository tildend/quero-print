import { Container, Text, Title } from "@mantine/core";
import { PublicMenuContentLayout } from "~/layouts/PublicMenuContent";

export default function Contato() {
  return (
    <PublicMenuContentLayout>
      <Title order={2}>Contato</Title>
      <Text>Entre em contato conosco através do e-mail <a className="font-bold underline" href="mailto:contato@queroprint.com.br">contato@queroprint.com.br</a></Text>
    </PublicMenuContentLayout>
  );
}