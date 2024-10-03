import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { createUser, deleteUser, getUser, getUsers, updateUser } from "~/controllers/User.server";
import { Erro } from "~/models/Erro";
import { ROLE, User } from "~/models/User";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const { userId } = params;
  const url = new URL(request.url);

  try {
    if (userId) {
      const user = await getUser(userId);
      return json(user);
    }

    const search = url.searchParams.get("search") ?? "";
    const limit = url.searchParams.get("limit") ?? "10";
    const offset = url.searchParams.get("offset") ?? "0";

    const { users, total } = await getUsers(search, limit, offset);
    return json(
      users,
      {
        headers: {
          "x-total": total.toString()
        }
      }
    );
  } catch (error) {
    console.log('api.users.($user-id).ts', error);

    if (error instanceof Erro) {
      return json({ error: error.mensagem }, { status: 400 });
    }

    return json({ error: "Não foi possível obter o usuário." }, { status: 400 });
  }
}

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const { userId } = params;

  switch (request.method) {
    case "POST":
      try {
        if (userId) {
          throw json({ error: "Método inválido" }, { status: 400 });
        }

        const newUser = await request.json() as User;
        if ((!newUser.document || newUser.document.length !== 11) && newUser.role === ROLE.USER)
          throw new Erro("CPF vazio ou inválido");

        if (!newUser.email || !newUser.email.match(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/))
          throw new Erro("Email vazio ou inválido");

        if (!newUser.name)
          throw new Erro("Nome é obrigatório");

        if (!newUser.password || newUser.password.length < 6)
          throw new Erro("Senha vazia ou menor que 6 caracteres");

        const user = await createUser(newUser);
        return json({ user });
      } catch (error) {
        console.log('api.users.($user-id).ts', error);
        if (error instanceof Erro) {
          return json({ error: error.mensagem }, { status: 400 });
        }

        return json({ error: "Não foi possível criar o usuário." }, { status: 400 });
      }
    case "PUT":
      try {
        if (!userId) {
          throw new Erro("ID do usuário não informado");
        }

        const user = await getUser(userId);
        if (!user) {
          throw new Erro("Usuário não encontrado");
        }

        const newUser = await request.json() as User;
        return json(await updateUser(userId, newUser));
      } catch (error) {
        console.log('api.users.($user-id).ts', error);
        if (error instanceof Erro) {
          return json({ error: error.mensagem }, { status: 400 });
        }

        return json({ error: "Não foi possível atualizar o usuário." }, { status: 400 });
      }
    case "DELETE":
      try {
        if (!userId) {
          throw new Erro("ID do usuário não informado");
        }

        const user = await getUser(userId);
        if (!user) {
          throw new Erro("Usuário não encontrado");
        }

        return json(await deleteUser(userId));
      } catch (error) {
        console.log('api.users.($user-id).ts', error);
        if (error instanceof Erro) {
          return json({ error: error.mensagem }, { status: 400 });
        }

        return json({ error: "Não foi possível excluir o usuário." }, { status: 400 });
      }
    default:
      // Wrong method
      return json({ error: "Método inválido" }, { status: 405 });
  }
}