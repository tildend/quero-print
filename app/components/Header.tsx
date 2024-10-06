import { Box, Title, Group, Divider, Text, Container, Menu, Button } from "@mantine/core";
import { Link } from "@remix-run/react";
import { IconArrowDown, IconCaretDown, IconChevronDown, IconLogin, IconLogout, IconUser, IconUserFilled } from "@tabler/icons-react";
import { WithId } from "mongodb";
import { FC } from "react";
import { User } from "~/models/User";

type Props = {
  dealText?: string;
  user?: WithId<User>;
}

export const Header: FC<Props> = ({ dealText, user }) => {
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

      {user ? <Menu classNames={{ item: 'text-daintree/75' }}>
        <Menu.Target>
          <Button variant="subtle" rightSection={<IconChevronDown size={18} stroke={2} />}>{user?.name}</Button>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Item component={Link} to="/perfil" leftSection={<IconUserFilled size={18} />}>
            Perfil
          </Menu.Item>

          <Menu.Item component={Link} to="/logout" leftSection={<IconLogout size={18} />}>
            Sair
          </Menu.Item>
        </Menu.Dropdown>
      </Menu> : (
        <Button variant="subtle" component={Link} to="/login">
          Login
        </Button>
      )}
    </Container>
  </>;
}