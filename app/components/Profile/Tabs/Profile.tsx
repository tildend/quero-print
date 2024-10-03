import { Box, Skeleton } from "@mantine/core";
import { User } from "~/models/User";

type Props = {
  user?: User;
}

export default function ProfileTab({ user }: Props) {
  return user ? (
    <Box>
      <h3 className="text-xl font-semibold">Bem vindo, {user.name}</h3>
      <p className="text-sm text-gray-500">{user.email}</p>
    </Box>
  ) : (
    <Box>
      <h3 className="text-xl font-semibold">
        <Skeleton height={20} className="rounded-lg" />
      </h3>
      <p className="text-sm text-gray-500">
        <Skeleton height={20} className="rounded-lg" />
      </p>
    </Box>
  );
}