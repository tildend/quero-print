import { Box, Title, Text } from "@mantine/core";
import { FC } from "react";

type Props = {
  env: {
    PRICE_PER_PAGE: number;
  };
  totalPages: number;
  isFlex: boolean;

  shippingTotal?: number;
  orderTotal?: number;
}

export const OrderResume: FC<Props> = ({ env, totalPages, isFlex, shippingTotal, orderTotal }) => {
  return (
    <Box data-sticky="48" className="h-fit flex flex-col justify-between p-6 rounded-lg bg-white/25">
      <Title order={3}>Resumo do pedido</Title>

      <span className="text-sm font-bold opacity-50">Impressão:</span>
      <Box mb="lg" className="grid grid-cols-[1fr_.75fr] gap-2">
        <Text className="w-full block">{totalPages} página{totalPages > 1 ? 's' : ''}</Text>
        <Text ta="end">{(totalPages * env.PRICE_PER_PAGE).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text>
      </Box>

      <Box mb="lg" className="grid grid-cols-[1fr_.75fr] items-end gap-2">
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