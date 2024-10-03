import { Box, TextInput, Button, Group, Text, PasswordInput, Select } from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useRevalidator } from "@remix-run/react";
import { WithId } from "mongodb";
import { useState } from "react";
import { maskMap, maskString } from "~/helpers/maskString";
import { Erro } from "~/models/Erro";
import { ROLE, User } from "~/models/User";

export default function UserModal({ user }: { user?: WithId<User> }) {
  const { revalidate } = useRevalidator();

  const [loading, setLoading] = useState(false);
  const { values, onSubmit, getInputProps } = useForm({
    initialValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      document: user?.document ?? "",
      role: user?.role ?? ROLE.USER,
      phone: user?.phone ?? "",
      password: ""
    },
  });

  const handleSave = async () => {
    setLoading(true);
    if (user) {
      try {
        await fetch(`/api/users/${user._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }).then((res) => res.json());

        revalidate();
        modals.closeAll();
      } catch (error) {
        console.log('UserModal.tsx', error);
        notifications.show({
          title: "Erro",
          message: "Erro ao atualizar o usuário. Por favor, tente novamente.",
          color: "red"
        });
      }

      setLoading(false);
      return;
    }


    const res = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    }).then((res) => res.json())
      .catch((error) => {
        console.log('UserModal.tsx', error);
        notifications.show({
          title: "Erro",
          message: "Erro ao criar o usuário. Por favor, tente novamente.",
          color: "red",
        });
      }).finally(() => setLoading(false));

    if (res.error) {
      notifications.show({
        title: "Erro",
        message: res.error,
        color: "red",
      });
      return;
    }

    revalidate();
    modals.closeAll();

    setLoading(false);
  };

  return (
    <form onSubmit={onSubmit(handleSave)} className="flex flex-col gap-4">
      <TextInput
        label="Nome"
        placeholder="Nome"
        {...getInputProps("name")}
        required
      />

      <TextInput
        label="Email"
        placeholder="Email"
        {...getInputProps("email")}
        required
      />

      <PasswordInput
        label="Nova senha"
        placeholder="Nova senha"
        {...getInputProps("password")}
        type="password"
      />


      <Group gap="md" className="w-full">
        <TextInput
          label="CPF"
          placeholder="CPF"
          {...getInputProps("document")}
          value={maskString(values.document, maskMap.cpf)}
          inputMode="numeric"
          className="grow"
        />
        <Select
          label="Função"
          placeholder="Função"
          data={Object.entries(ROLE).map(([key, value]) => ({ value, label: key }))}
          {...getInputProps("role")}
        />
      </Group>

      <TextInput
        label="Telefone"
        placeholder="Telefone"
        {...getInputProps("phone")}
        value={maskString(values.phone, maskMap.tel)}
        type="tel"
      />

      <Group justify="right">
        <Button type="submit" loading={loading} disabled={loading}>
          Salvar
        </Button>
      </Group>

      <Text size="xs" c="dimmed">
        * Campos obrigatórios
      </Text>
    </form>
  );
}