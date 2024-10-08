import { Box, Title, ScrollArea, List, ThemeIcon, Text, Button, ActionIcon } from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";
import { Dispatch, FC, SetStateAction } from "react";
import { numToSize } from "~/helpers/numToSize";

type Props = {
  env: {
    PRICE_PER_PAGE: number;
  };
  setStep: Dispatch<SetStateAction<number>>;
  files: File[];
  totalPages: number;
  isFlex: boolean;

  shippingTotal?: number;
  orderTotal?: number;

  hidden?: boolean;
}

export const OrderResume: FC<Props> = ({ env, setStep, files, totalPages, isFlex, shippingTotal, orderTotal, hidden }) => {
  return (
    <Box className="flex flex-col justify-between gap-4 p-6 rounded-lg bg-white/25">
      <Box className="grid gap-4">
        <Title order={3}>Resumo do pedido <ActionIcon ml="sm" onClick={() => setStep(0)}><IconEdit /></ActionIcon></Title>
        <ScrollArea mah={286} className="grid gap-4">
          <List>
            {files.map((file, i) => (
              <List.Item
                key={i}
                icon={
                  <ThemeIcon color="transparent" size={24} radius="xl">
                    {file.type === 'application/pdf' ? '📄' : '📸'}
                  </ThemeIcon>
                }
              >
                <Box key={i} className="w-full grid grid-cols-[auto_auto] items-center gap-2">
                  <Text w="100%" maw="100%" truncate="end">{file.name}</Text>
                  <Text>{numToSize(file.size)}</Text>
                </Box>
              </List.Item>
            ))}
          </List>

        </ScrollArea>

        <Box className="grid grid-cols-[1fr_.75fr] gap-2">
          <Text className="w-full block">{totalPages} página{totalPages > 1 ? 's' : ''}</Text>
          <Text ta="end">{(totalPages * env.PRICE_PER_PAGE).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text>
        </Box>
      </Box>

      <Box className="grid gap-2">
        <Box className="grid grid-cols-[1fr_.75fr] items-end gap-2">
          <Text className="w-full">
            <span className="text-sm font-bold opacity-50">Envio:</span><br />
            {isFlex ? 'Até 24h ⚡️' : 'Até 3 dias 🚚'}
          </Text>
          <Text ta="end">{shippingTotal?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'Preencha o endereço'}</Text>
        </Box>

        <Box className="grid grid-cols-[1fr_.75fr] gap-2">
          <Text className="font-bold">Total</Text>
          <Text fw="bold" ta="end">
            {orderTotal?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ -,--'}
          </Text>
        </Box>
      </Box>
    </Box>
  );
}