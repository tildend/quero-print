import { ActionIcon, Box, Skeleton, Tooltip } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconPlus } from "@tabler/icons-react";
import { ObjectId, WithId } from "mongodb";
import { Address } from "~/models/User";
import { AddressItem } from "./AddressItem";
import { AddressModalInner } from "./Modal";

type Props = {
  addresses?: WithId<Address>[];
  userId?: string;
}
export default function AddressesTab({ addresses, userId }: Props) {
  return addresses ? (
    <Box className="relative w-full">
      <p className="text-sm text-gray-500">
        Sua conta possui {addresses.length} endereços
      </p>

      <Box className="mt-4 w-full grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {addresses?.map((address, i) => <AddressItem key={address._id.toString()} address={address} i={i} />)}
      </Box>

      <Tooltip label="Novo endereço" position="right">
        <ActionIcon
          size="xl"
          radius="xl"
          className="absolute bottom-0 right-0"
          onClick={() => modals.open({
            title: "Novo endereço",
            children: <AddressModalInner userId={userId} address={{} as WithId<Address>} mode="POST" />
          })}
        >
          <IconPlus />
        </ActionIcon>
      </Tooltip>
    </Box>
  ) : (
    <Box>
      <p className="text-sm text-gray-500">
        <Skeleton height={20} className="rounded-lg" />
      </p>

      <Box className="mt-4 flex gap-4">
        {Array(3).fill(null).map((_, i) => (
          <Box key={i} className="flex gap-4">
            <Box className="flex-1">
              <Skeleton height={20} className="rounded-lg" />
            </Box>
            <Box className="flex-1">
              <Skeleton height={20} className="rounded-lg" />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}