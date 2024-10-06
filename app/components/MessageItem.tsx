import { WithId } from "mongodb";
import { useState, useEffect } from "react";
import { Message } from "~/models/Message";
import { User } from "~/models/User";

type Props = {
  message: WithId<Message>;
  myMsg: boolean;
}

export const MessageItem = ({ message, myMsg }: Props) => {
  const [author, setAuthor] = useState<User>();

  useEffect(() => {
    fetch(`/api/users/${message.authorId}`)
      .then(res => res.json())
      .then(author => setAuthor(author));
  }, [message.authorId]);

  return (
    <div role="listitem"
      data-my-msg={myMsg}
      className="
        w-fit
        grid
        gap-2
        p-2
        border
        border-gray-200
        bg-white/65
        rounded-lg
        data-[my-msg=true]:justify-self-end
        data-[my-msg=true]:bg-green-200
      "
    >
      <h2 className="text-sm font-bold">
        {author?.name}
      </h2>

      <p className="text-sm">
        {message.text}
      </p>
    </div>
  );
}