import { Box, Title, ScrollArea, List, ThemeIcon, Text } from "@mantine/core";
import { FC } from "react";
import { numToSize } from "~/helpers/numToSize";

type Props = {
  env: {
    PRICE_PER_PAGE: number;
  };
  files: File[];
  totalPages: number;
  isFlex: boolean;

  shippingTotal?: number;
  orderTotal?: number;

  hidden?: boolean;
}

export const OrderResume: FC<Props> = ({ env, files, totalPages, isFlex, shippingTotal, orderTotal, hidden }) => {
  return (
    <Box className="hidden lg:flex flex-col gap-4 p-6 rounded-lg bg-white/25">
      <Title order={3}>Resumo do pedido</Title>
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
  );
}