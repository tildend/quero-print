import { Box, Select, Table, TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { WithId } from "mongodb";
import { useEffect, useState } from "react";
import { dateFmt } from "~/helpers/dateFormatting";
import { numToMoney } from "~/helpers/numToMoney";
import { Order, ORDER_STATUS } from "~/models/Order";

export default function OrdersPanel() {
  const [orders, setOrders] = useState<WithId<Order>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ORDER_STATUS>();

  const [limit, setLimit] = useState(10);
  const [skip, setSkip] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const url = new URL('/api/orders', window.location.href);
    url.searchParams.set('s', search);
    url.searchParams.set('status', status || '');
    url.searchParams.set('limit', limit.toString());
    url.searchParams.set('skip', skip.toString());

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [search, status, limit, skip]);

  return (
    <Box component="section" className="w-full grid gap-4">
      <fieldset className="w-full flex gap-4">
        <TextInput
          placeholder="Pesquisar"
          rightSection={<IconSearch />}
          className="grow"
          value={search}
          onChange={e => setSearch(e.currentTarget.value)}
        />

        <Select
          placeholder="Status"
          data={Object.keys(ORDER_STATUS).map(key => ({ value: key, label: ORDER_STATUS[key as keyof typeof ORDER_STATUS] }))}
          value={status}
          onChange={value => {
            setStatus(value as ORDER_STATUS || undefined);
          }}
        />
      </fieldset>

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
  );
}