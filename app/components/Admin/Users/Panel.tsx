import { ActionIcon, Box, Group, Text, TextInput } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { User } from "~/models/User";
import UserModal from "./UserModal";
import { WithId } from "mongodb";

export default function UsersPanel() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<WithId<User>[]>([]);
  const [total, setTotal] = useState(0);

  const updateUsers = async (search: string, limit: number, offset: number) => {
    const usersUrl = new URL("/api/users", window.location.origin);
    usersUrl.searchParams.append("search", search);
    usersUrl.searchParams.append("limit", limit.toString());
    usersUrl.searchParams.append("offset", offset.toString());

    const { users, total } = await fetch(usersUrl.toString()).then(async (res) => ({
      users: await res.json(),
      total: res.headers.get("x-total")
    }));
    setUsers(users);
    setTotal(parseInt(total ?? "0"));
  };

  const handleNewUser = () => {
    modals.open({
      title: "New User",
      children: <UserModal />,
    });
  };

  const handleEditUser = (user: WithId<User>) => {
    modals.open({
      title: "Edit User",
      children: <UserModal user={user} />,
    });
  };

  const handleDeleteUser = (user: WithId<User>) => {
    modals.openConfirmModal({
      title: "Delete User",
      children: (
        <Text>
          Are you sure you want to delete the user <b>{user.name}</b>?
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        await fetch(`/api/users/${user._id}`, {
          method: "DELETE",
        });

        updateUsers(search, 10, 0);
      },
    });
  };

  useEffect(() => {
    updateUsers(search, 10, 0);
  }, [search]);

  return (
    <Box className="grid gap-8">
      <Group gap={"md"} className="w-full">
        <TextInput
          value={search}
          placeholder="Search users"
          className="flex-grow"
          onChange={(e) => setSearch(e.currentTarget.value)}
        />

        <ActionIcon size={"lg"} onClick={handleNewUser}>
          <IconPlus />
        </ActionIcon>
      </Group>

      <Box className="grid gap-4">
        {users?.map((user) => (
          <Box key={user.email} className="w-full flex gap-4 items-center rounded-md border border-gray-200 p-4">
            <div className="flex flex-col flex-grow">
              <Text size="sm" fw={500}>
                {user.name}
              </Text>

              <Text size="xs" c="dimmed">
                {user.email}
              </Text>
            </div>

            <Group justify="right" className="flex gap-2">
              <ActionIcon size="lg" onClick={() => handleEditUser(user)} variant="light">
                <IconPencil />
              </ActionIcon>

              <ActionIcon size="lg" color="red" onClick={() => handleDeleteUser(user)} variant="light">
                <IconTrash />
              </ActionIcon>
            </Group>
          </Box>
        ))}
      </Box>
    </Box>
  );
}