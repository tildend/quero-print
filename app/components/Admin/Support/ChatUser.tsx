import { useEffect, useState } from "react";
import type { WithId } from "mongodb";

import { User } from "~/models/User";

export const ChatUser = ({ userId }: { userId: string }) => {
  const [user, setUser] = useState<WithId<User>>();

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(user => setUser(user));
  }, [userId]);

  return (
    <div className="grid gap-2 items-center cursor-pointer text-daintree rounded-md border-b border-daintree/25 p-2 bg-white/25 hover:bg-white/50">
      <h2 className="text-sm font-bold">
        {user?.name}
      </h2>

      <span className="text-sm text-gray-400">
        {user?.email}
      </span>
    </div >
  );
}