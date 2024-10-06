import { Box, Button, PasswordInput, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { authenticatedUser } from "~/controllers/User.server";
import { recaptchaIsHuman } from "~/helpers/recaptcha.server";
import { useRecaptcha } from "~/hooks/useRecaptcha";
import { Erro } from "~/models/Erro";
import { ResAPI, Resposta } from "~/models/Resposta";
import { commitSession, getSession } from "../sessions.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  if (!process.env.RECAPTCHA_SECRET) {
    console.error('Missing RECAPTCHA_SECRET');
    return new Resposta({ erro: 'Erro desconhecido, tente recarregar a página' }, { status: 400 });
  }

  const session = await getSession(request.headers.get('Cookie'));
  if (session.has('userId')) {
    // Redirect to profile
    return new Resposta({ message: 'Você já está logado' }, { status: 302, headers: { 'Location': '/perfil', 'Set-Cookie': await commitSession(session) } });
  }

  switch (request.method) {
    case 'POST':
      try {
        const body = await request.formData();
        const recaptchaToken = body.get('g-recaptcha-response')?.toString();
        if (!recaptchaToken) {
          throw new Erro('Recaptcha não foi iniciado');
        }

        if (!await recaptchaIsHuman(recaptchaToken)) {
          throw new Erro('Recaptcha inválido');
        }

        const email = body.get('email')?.toString();
        const password = body.get('password')?.toString();

        if (email && password) {
          const user = await authenticatedUser(email, password)
          if (user) {
            console.log(user);
            session.set('userId', user._id.toString());

            return redirect('/perfil', { headers: { 'Set-Cookie': await commitSession(session) } });
          }

          throw new Erro('Login ou senha incorretos');
        }

        throw new Erro('Email ou senha não foram informados');
      } catch (error) {
        if (error instanceof Erro) {
          return new Resposta({ erro: error.mensagem }, { status: 400 });
        }

        console.error(error, 'Login failed');
        return new Resposta({ erro: 'Login falhou' }, { status: 400 });
      }
      break;
    default:
      return new Resposta({ erro: 'Método não permitido' }, { status: 405 });
  }
}

export default function Login() {
  const { token, execute, loading: recaptchaLoading } = useRecaptcha();
  const loginFetcher = useFetcher<ResAPI>();
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    onValuesChange: () => {
      if (form.isValid()) {
        execute('formValidated');
      }
    },
    validate: {
      email: value => {
        if (!value) {
          return 'Email não foi preenchido';
        }
        if (!/^\S+@\S+\.\S+$/.test(value)) {
          return 'Email inválido';
        }
      },
      password: value => {
        if (!value) {
          return 'Senha não foi preenchida';
        }

        if (value.length < 4) {
          return 'Senha deve ter no mínimo 8 caracteres';
        }
      }
    }
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: typeof form.values) => {
    if (!token) {
      notifications.show({
        title: 'Erro',
        message: 'Recaptcha não foi carregado, tente recarregar a página',
        color: 'gray'
      });

      return;
    }
    loginFetcher.submit(
      { ...values, 'g-recaptcha-response': token },
      {
        method: 'post',
        encType: 'application/x-www-form-urlencoded'
      }
    );
  }

  useEffect(() => {
    if (!loginFetcher.data)
      return;

    const { erro } = loginFetcher.data;
    if (erro) {
      notifications.show({
        title: 'Erro',
        message: erro,
        color: 'red'
      });
    }
  }, [loginFetcher.data]);

  return (
    <Box className="w-full h-screen grid place-content-center">
      <loginFetcher.Form
        onSubmit={form.onSubmit(handleSubmit)}
        className="w-full lg:w-80 grid gap-4 p-6 rounded-lg bg-white/25"
      >
        <TextInput
          key={form.key('email')}
          type="email"
          label="Email"
          name="email"
          disabled={loading}
          required
          {...form.getInputProps('email')}
        />
        <PasswordInput
          key={form.key('password')}
          label="Senha"
          name="password"
          disabled={loading}
          required
          {...form.getInputProps('password')}
        />

        <Button
          type="submit"
          disabled={recaptchaLoading}
          loading={loading}
        >
          Login
        </Button>
      </loginFetcher.Form>
    </Box>
  );
}
