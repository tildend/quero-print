import { Box, Table, Skeleton } from "@mantine/core";
import { WithId } from "mongodb";
import { dateFmt } from "~/helpers/dateFormatting";
import { numToMoney } from "~/helpers/numToMoney";
import { Order } from "~/models/Order";

type Props = {
  orders?: WithId<Order>[];
}

export default function OrdersTab({ orders }: Props) {
  return orders ? (
    <Box className="grid gap-4">
      <Box>
        <h3 className="text-xl font-semibold">Seus pedidos</h3>
        <p className="text-sm text-gray-500">
          {orders?.length ?? 0} pedidos
        </p>
      </Box>

      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Arquivos</Table.Th>
            <Table.Th>Páginas</Table.Th>
            <Table.Th>Frete</Table.Th>
            <Table.Th>Total</Table.Th>
            <Table.Th>Data</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {orders?.map(order => (
            <Table.Tr key={order._id.toString()}>
              <Table.Td>{order.files.length}</Table.Td>
              <Table.Td>{order.pages}</Table.Td>
              <Table.Td>{numToMoney(order.shippingTotal)}</Table.Td>
              <Table.Td>{numToMoney(order.orderTotal)}</Table.Td>
              <Table.Td>{dateFmt(order.createdAt)}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
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