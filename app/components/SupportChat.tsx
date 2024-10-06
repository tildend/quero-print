import { ActionIcon, Box, Button, TextInput } from "@mantine/core"
import { useFetcher } from "@remix-run/react";
import { IconArrowDown } from "@tabler/icons-react";
import type { WithId } from "mongodb";
import { useEffect, useRef, useState } from "react";
import { ChatUser } from "~/components/Admin/Support/ChatUser";
import { MessageItem } from "~/components/MessageItem";
import { Message } from "~/models/Message";

type Props = {
  userId: string;
  enableMultiUser?: boolean;
}

export const SupportChat = ({ userId, enableMultiUser = false }: Props) => {
  const [error, setError] = useState(false);
  const [receiverId, setReceiverId] = useState<string>('');
  const [messages, setMessages] = useState<WithId<Message>[]>([]);

  const [usersId, setUsersId] = useState<string[]>([]);
  const usersFetcher = useFetcher();

  const messagesFetcher = useFetcher();
  const messageListRef = useRef<HTMLDivElement>(null);
  const scrollDownMsgList = () => {
    if (messageListRef.current) {
      messageListRef.current.scroll(0, messageListRef.current.scrollHeight);
    }
  }

  // Get the ID of the User to receive the messages
  useEffect(() => {
    if (enableMultiUser) {
      usersFetcher.load(`/api/support-chat/messages/users`);
    } else {
      const fetchInterval = setInterval(() => {
        fetch(`/api/support-chat/receiver`)
          .then(res => res.json())
          .then(receiverId => setReceiverId(receiverId))
          .catch((e) => {
            setError(true);
            console.log('Error getting support user', e);
          });
      }, 300);

      return () => clearInterval(fetchInterval);
    }
  }, []);

  // Get the messages from the receiver
  useEffect(() => {
    const fetchInterval = setInterval(() => {
      if (receiverId && !error)
        messagesFetcher.load(`/api/support-chat/messages?authorId=${receiverId}`);
    }, 300);

    return () => clearInterval(fetchInterval);
  }, [receiverId, error]);

  useEffect(() => {
    if (messagesFetcher.data) {
      if (Array.isArray(messagesFetcher.data)) {
        const messages = messagesFetcher.data.reverse();
        setMessages(messages);
      }
    }
  }, [messagesFetcher.data]);

  const msgInputRef = useRef<HTMLInputElement>(null);
  const messsagePost = useFetcher();
  useEffect(() => {
    if (messsagePost.data) {
      if (msgInputRef.current) {
        msgInputRef.current.value = '';
        scrollDownMsgList();
      }
    }
  }, [messsagePost.data, msgInputRef]);

  useEffect(() => {
    if (usersFetcher.data && Array.isArray(usersFetcher.data)) {
      setUsersId(usersFetcher.data);

      if (!receiverId && usersFetcher.data.length) {
        setReceiverId(usersFetcher.data[0]);
      }
    }
  }, [usersFetcher.data, receiverId]);

  return (
    <section className="relative w-full p-4 bg-gradient-to-br from-metallic/15 to-ship-cove/15">
      <header className="py-2 flex gap-4 border-b border-daintree/25">
        <span className="text-lg font-bold">Suporte ao cliente</span>
      </header>

      <div data-multi-user={enableMultiUser} className="w-full grid data-[multi-user=true]:grid-cols-[.15fr_1fr] gap-2">
        {enableMultiUser && (
          <div className="w-full flex flex-col gap-2 border-r border-daintree/25" role="list">
            {usersId.map(id => <ChatUser key={id} userId={id} />)}
          </div>
        )}

        <div role="list" className="w-full grid gap-4 h-64 overflow-auto py-4">
          {messages.map((message) => (
            <MessageItem key={message._id.toString()} message={message} myMsg={message.authorId.toString() === userId} />
          ))}
        </div>
      </div>

      <messsagePost.Form
        className="flex gap-4 border-t border-daintree/25 p-4"
        method="POST"
        action="/api/support-chat/messages"
      >
        <input type="hidden" name="receiverId" value={receiverId} />
        <TextInput type="text" name="text" ref={msgInputRef} placeholder="Digite uma mensagem" className="grow" />
        <Button type="submit">Enviar</Button>
      </messsagePost.Form>

      <ActionIcon
        onClick={scrollDownMsgList}
        radius="lg"
        size="lg"
        className="absolute right-3 top-4"
      >
        <IconArrowDown />
      </ActionIcon>

      {error && (
        <Box className="absolute top-0 left-0 right-0 bottom-0 px-12 flex items-center justify-center backdrop-blur-lg">
          <span className="text-2xl font-bold">Suporte temporariamente indisponível, tente novamente mais tarde.</span>
        </Box>
      )}
    </section>
  )
}