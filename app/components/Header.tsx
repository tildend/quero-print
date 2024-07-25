import { Box, Title, Group, Divider, Text, Container } from "@mantine/core";
import { Link } from "@remix-run/react";
import { FC } from "react";

type Props = {
  dealText?: string;
}

export const Header: FC<Props> = ({ dealText }) => {
  return <>
    {!!dealText && <Box className="h-8 bg-yellow-400">
      <Container>
        <Text className="py-2 text-center text-sm font-bold" dangerouslySetInnerHTML={{ __html: dealText }} />
      </Container>
    </Box>}
    <Container className="h-20 flex items-center justify-between">
      <Link to="/">
        <Title order={1} className="relative w-fit text-4xl leading-[0.5]" c="print" ta="right">
          Quero<br />
          <span className="text-xl font-black italic text-daintree leading-[0.5]">Print!</span>
        </Title>
      </Link>

      <Group gap='md'>
        <Link to='/contato'>Contato</Link>
        <Divider orientation="vertical" />
        <Link to='/login'>Login</Link>
      </Group>
    </Container>
  </>;
}