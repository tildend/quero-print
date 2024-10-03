import { TextInput, Button } from "@mantine/core";
import { useFetcher } from "@remix-run/react";
import { useState, useEffect } from "react";
import { ChatUser } from "./ChatUser";
import { WithId } from "mongodb";
import { MessageItem } from "~/components/MessageItem";
import { Message } from "~/models/Message";

export const AdminSupportPanel = ({ userId }: { userId: string }) => {
  const [selectedUser, setSelectedUser] = useState<string>();
  const [usersId, setUsersId] = useState<string[]>([]);

  const [messages, setMessages] = useState<WithId<Message>[]>([]);

  const messagesFetcher = useFetcher();
  const usersFetcher = useFetcher();

  useEffect(() => {
    const fetchInterval = setInterval(() => {
      usersFetcher.load(`/api/support-chat/messages/users`);
    }, 10_000);

    usersFetcher.load(`/api/support-chat/messages/users`);
    return () => clearInterval(fetchInterval);
  }, []);

  useEffect(() => {
    const fetchInterval = setInterval(() => {
      if (selectedUser)
        messagesFetcher.load(`/api/support-chat/messages?authorId=${selectedUser}&receiverId=${userId}`);
    }, 500);

    if (selectedUser)
      messagesFetcher.load(`/api/support-chat/messages?authorId=${selectedUser}&receiverId=${userId}`);
    return () => clearInterval(fetchInterval);
  }, [selectedUser]);

  useEffect(() => {
    console.log('ARRAY DE MESSAGE', messagesFetcher.data);
    if (messagesFetcher.data && Array.isArray(messagesFetcher.data)) {
      setMessages(messagesFetcher.data as WithId<Message>[]);
    }
  }, [messagesFetcher.data]);

  useEffect(() => {
    if (usersFetcher.data && Array.isArray(usersFetcher.data)) {
      setUsersId(usersFetcher.data);

      if (!selectedUser && usersFetcher.data.length) {
        setSelectedUser(usersFetcher.data[0]);
      }
    }
  }, [usersFetcher.data, selectedUser]);

  return (
    <section className="w-full p-4 bg-gradient-to-br from-metallic/15 to-ship-cove/15">
      <header className="py-2 flex gap-4 border-b border-daintree/25">
        <span className="text-lg font-bold">Suporte ao cliente</span>
      </header>

      <div className="w-full grid grid-cols-[.15fr_1fr] gap-2">
        <div className="w-full grid gap-2 border-r border-daintree/25" role="list">
          {usersId.map(id => <ChatUser key={id} userId={id} />)}
        </div>

        <div role="list" className="w-full grid gap-4 h-64 overflow-auto py-4">
          {messages.map((message) => (
            <MessageItem key={message._id.toString()} message={message} myMsg={message.authorId.toString() === userId} />
          ))}
        </div>
      </div>
      <messagesFetcher.Form
        className="flex gap-4 border-t border-daintree/25 p-4"
        method="POST"
        action="/api/support-chat/messages"
      >
        <input type="hidden" name="receiverId" value={selectedUser} />
        <TextInput type="text" name="text" placeholder="Digite uma mensagem" className="grow" />
        <Button type="submit">Enviar</Button>
      </messagesFetcher.Form>
    </section >
  )
}