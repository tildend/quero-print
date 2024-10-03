import { Box, TextInput, Group, Select, Checkbox, Button } from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useRevalidator } from "@remix-run/react";
import { WithId } from "mongodb";
import { useState } from "react";
import { maskString, maskMap } from "~/helpers/maskString";
import { states } from "~/models/States";
import { Address } from "~/models/User";

type Props = {
  address: WithId<Address>;
  userId?: string;
  mode: 'PUT' | 'POST';
}

// const mockAddress = {
//   street: "Rua",
//   number: "123",
//   complement: "Apto 1",
//   neighborhood: "Centro",
//   city: "São Paulo",
//   state: "SP",
//   zip: "01234567",
//   observation: "Observação",
//   name: "Endereço 1",
//   default: true
// }

export const AddressModalInner = ({ address, userId, mode = 'PUT' }: Props) => {
  const revalidator = useRevalidator();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    mode: 'controlled',
    initialValues: {
      name: address.name || "",
      street: address.street || "",
      number: address.number || "",
      neighborhood: address.neighborhood || "",
      city: address.city || "",
      state: address.state || "",
      zip: address.zip || "",
      complement: address.complement || "",
      observations: address.observation || "",
      default: !!address.default
    },
    validate: {
      name: (value) => (!value && "Nome é obrigatório"),
      street: (value) => (!value && "Rua é obrigatória"),
      number: (value) => (!value && "Número é obrigatório"),
      neighborhood: (value) => (!value && "Bairro é obrigatório"),
      city: (value) => (!value && "Cidade é obrigatório"),
      state: (value) => (!value && "Estado é obrigatório"),
      zip: (value) => (!value && "CEP é obrigatório")
    }
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);

    if (!userId) {
      notifications.show({
        title: "Erro interno",
        message: "Tente novamente",
        color: "gray"
      });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/users/${userId}/addresses`, {
        method: mode,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...address,
          ...values
        })
      });

      if (res.ok) {
        revalidator.revalidate();
        setLoading(false);
        modals.closeAll();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Box className="flex flex-col gap-4">
        <TextInput
          placeholder="Nome do endereço"
          {...form.getInputProps("name")}
          disabled={loading}
          classNames={{
            input: "px-0 py-0 border-none text-3xl font-bold",
          }}
        />

        <Group gap="md">
          <TextInput
            label="Rua"
            placeholder="Rua"
            {...form.getInputProps("street")}
            disabled={loading}
            className="grow"
          />
          <TextInput
            label="Número"
            placeholder="Número"
            {...form.getInputProps("number")}
            disabled={loading}
            w={112}
          />
        </Group>

        <Group gap="md">
          <TextInput
            label="Bairro"
            placeholder="Bairro"
            {...form.getInputProps("neighborhood")}
            disabled={loading}
            className="grow"
          />
          <TextInput
            label="CEP"
            placeholder="CEP"
            {...form.getInputProps("zip")}
            value={maskString(form.values.zip, maskMap.cep)}
            disabled={loading}
            w={112}
          />
        </Group>

        <Group gap="md">
          <TextInput
            label="Cidade"
            placeholder="Cidade"
            {...form.getInputProps("city")}
            disabled={loading}
            className="grow"
          />
          <Select
            label="Estado"
            placeholder="Estado"
            data={states}
            {...form.getInputProps("state")}
            disabled={loading}
            w={112}
          />
        </Group>

        <TextInput
          label="Complemento"
          placeholder="Complemento"
          {...form.getInputProps("complement")}
          disabled={loading}
        />
        <TextInput
          label="Observações"
          placeholder="Observações"
          {...form.getInputProps("observations")}
          disabled={loading}
        />
        <Checkbox
          label="Padrão"
          {...form.getInputProps("default")}
          checked={form.values.default}
          disabled={loading}
        />
      </Box>
      <Group justify="end">
        <Button type="submit" loading={loading} disabled={loading}>
          Salvar
        </Button>
      </Group>
    </form>
  );
}