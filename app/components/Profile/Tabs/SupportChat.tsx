import { Button, TextInput } from "@mantine/core"
import { useFetcher } from "@remix-run/react";
import type { WithId } from "mongodb";
import { useEffect, useState } from "react";
import { MessageItem } from "~/components/MessageItem";
import { Message } from "~/models/Message";

export const SupportChat = ({ userId }: { userId: string }) => {
  const [receiverId, setReceiverId] = useState<string>();
  const [messages, setMessages] = useState<WithId<Message>[]>([]);
  const messagesFetcher = useFetcher();

  useEffect(() => {
    const fetchInterval = setInterval(() => {
      messagesFetcher.load(`/api/support-chat/messages?authorId=${receiverId}`);
    }, 300);

    fetch(`/api/support-chat/receiver`)
      .then(res => res.json())
      .then(receiverId => setReceiverId(receiverId));

    return () => clearInterval(fetchInterval);
  }, []);

  useEffect(() => {
    if (messagesFetcher.data) {
      if (Array.isArray(messagesFetcher.data)) {
        setMessages(messagesFetcher.data);
      }
    }
  }, [messagesFetcher.data]);

  return (
    <section className="w-full p-4 bg-gradient-to-br from-metallic/15 to-ship-cove/15">
      <header className="py-2 flex gap-4 border-b border-daintree/25">
        <span className="text-lg font-bold">Suporte ao cliente</span>
      </header>

      <div role="list" className="grid gap-4 h-64 py-8 overflow-auto">
        {messages?.map(message => (
          <MessageItem key={message._id.toString()} message={message} myMsg={message.authorId.toString() === userId} />
        ))}
      </div>
      <messagesFetcher.Form
        className="flex gap-4 border-t border-daintree/25 p-4"
        method="POST"
        action="/api/support-chat/messages"
      >
        <input type="hidden" name="receiverId" value={receiverId} />
        <TextInput type="text" name="text" placeholder="Digite uma mensagem" className="grow" />
        <Button type="submit">Enviar</Button>
      </messagesFetcher.Form>
    </section>
  )
}