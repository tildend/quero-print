import { Box, Title, Group, Divider, Text, Container } from "@mantine/core";
import { Link } from "@remix-run/react";
import { FC } from "react";

type Props = {
  dealText?: string;
  userId?: string;
}

export const Header: FC<Props> = ({ dealText, userId }) => {
  return <>
    <Box className="h-8 bg-yellow-400" hidden={!dealText}>
      <Container>
        <Text className="py-2 text-center text-sm font-bold" dangerouslySetInnerHTML={{ __html: dealText! }} />
      </Container>
    </Box>
    <Container className="h-20 flex items-center justify-between">
      <Link to="/" reloadDocument>
        <Title order={1} className="relative w-fit text-4xl leading-[0.5]" c="print" ta="right">
          Quero<br />
          <span className="text-xl font-black italic text-daintree leading-[0.5]">Print!</span>
        </Title>
      </Link>

      <Group gap='md'>
        <Link to='/perfil' style={{ display: userId ? 'block' : 'none' }}>Perfil</Link>
        <Divider orientation="vertical" hidden={!userId} />
        <Link hidden={!userId} color="red" to='/logout'>Logout</Link>
        <Link to='/login' style={{ display: userId ? 'none' : 'block' }}>Login</Link>
      </Group>
    </Container>
  </>;
}