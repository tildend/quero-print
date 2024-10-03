import { Box } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconStarFilled } from "@tabler/icons-react";
import { WithId } from "mongodb";
import { dateFmt } from "~/helpers/dateFormatting";
import { Address } from "~/models/User";
import { AddressModalInner } from "./Modal";

type Props = {
  address: WithId<Address>;
  i: number;
}

export function AddressItem({ address, i }: Props) {
  const onClick = () => {
    modals.open({
      title: "Editar endereço",
      children: <AddressModalInner userId={address.userId.toString()} address={address} mode="PUT" />
    })
  }

  return (
    <button
      data-default={address.default || undefined}
      onClick={onClick}
      className="
        grid gap-4 p-4
        text-start
        rounded-xl
        bg-white/75
        data-[default]:border data-[default]:border-gray-200
        data-[default]:shadow-lg
        hover:bg-gray-50
        transition-colors
      "
    >
      <Box data-no-name={!!address.name} className="w-full data-[no-name]:opacity-50 text-lg font-bold relative">
        {address.name || `Endereço ${i + 1}`}
        {address.default && <span className="absolute right-0 top-0 text-xs text-yellow-500"><IconStarFilled /></span>}
      </Box>
      <p>
        <span className="inline-block">{address.street}, {address.number}</span><br />
        <span className="inline-block">{address.neighborhood}</span>,&nbsp;
        <span className="inline-block">{address.city}</span>
      </p>
      <time title={`Data de criação: ${dateFmt(address.createdAt)}`} className="text-xs text-gray-500">
        {dateFmt(address.createdAt)}
      </time>
    </button>
  );
}

