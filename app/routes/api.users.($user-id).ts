import { ActionFunctionArgs, json } from "@remix-run/node";
import { createUser, getUser } from "~/controllers/User.server";
import { User } from "~/models/User";

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const { userId } = params;
  
  switch (request.method) {
    case "GET":
      try {
        if (!userId) {
          throw json({ error: "ID do usuário não informado" }, { status: 400 });
        }
        const user = await getUser(userId);
        return json({ user });
      } catch (error) {
        throw error;
      }
    case "POST":
      try {
        if (userId) {
          throw json({ error: "Método inválido" }, { status: 400 });
        }

        const newUser = await request.json() as User;
        if (!newUser.cpf || newUser.cpf.length !== 11) throw json({ error: "CPF vazio ou inválido" }, { status: 400 });
        if (!newUser.email || !newUser.email.match(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/)) throw json({ error: "Email vazio ou inválido" }, { status: 400 });
        if (!newUser.name) throw json({ error: "Nome é obrigatório" }, { status: 400 });
        if (!newUser.password || newUser.password.length < 6) throw json({ error: "Senha vazia ou menor que 6 caracteres" }, { status: 400 });
        
        const user = await createUser(newUser);
        return json({ user });
      } catch (error) {
        throw error;
      }
    case "PUT":
      return json({ userId });
    case "DELETE":
      return json({ userId });
    default:
      return json({ userId });
  }
}