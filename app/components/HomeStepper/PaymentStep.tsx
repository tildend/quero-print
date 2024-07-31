import { Box, Divider, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";

import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { PaymentForm } from "./PaymentStep/PaymentForm";
import { OrderResume } from "./PaymentStep/OrderResume";

type Props = {
  // env
  env: {
    PRICE_PER_PAGE: number;
    PRICE_FLEX: number;
    PRICE_SEDEX_BASE: number;
    PRICE_FLEX_PER_KM: number;
  }
  // Stripe
  stripePromise: ReturnType<typeof loadStripe>;

  // Is Flex
  isFlex: boolean;

  // Parent state setter
  setStep: Dispatch<SetStateAction<number>>;

  // Files
  files: File[];
  totalPages: number;

  shippingTotal?: number;
  orderTotal?: number;
}

export const PaymentStep: FC<Props> = ({ env, isFlex, files, totalPages, stripePromise, shippingTotal, orderTotal }) => {
  const payForm = useForm({
    initialValues: {
      fullName: '',
      email: '',
      cpf: '',
      phone: '',
    },
    validate: {
      fullName: (value) => {
        if (!value) return 'Nome completo é obrigatório';
      },
      email: (value) => {
        if (!value) return 'E-mail é obrigatório';
        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) return 'E-mail inválido';
      },
      cpf: (value) => {
        if (!value) return 'CPF é obrigatório';
        if (value.length !== 11) return 'CPF inválido';
      },
      phone: (value) => {
        if (value && value.length < 10) return 'Telefone inválido';
      },
    }
  });

  const [clientSecret, setClientSecret] = useState('');
  useEffect(() => {
    const fetchClientSecret = async () => {
      const response = await fetch('/api/payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 10000,
          currency: 'brl',
        }),
      });

      const data = await response.json();
      setClientSecret(data.clientSecret);
    };

    fetchClientSecret();
  }, []);

  const options: StripeElementsOptions = {
    clientSecret
  };

  return (
    <Box className="w-full flex flex-col-reverse lg:grid lg:grid-cols-[1fr_auto_.6fr] gap-8 mt-6 lg:mt-12">
      <form className="grid gap-3">
        <h2 className="text-2xl font-bold">Informações de pagamento</h2>
        <TextInput
          placeholder="Nome e sobrenome"
          required
          {...payForm.getInputProps('fullName')}
        />
        <TextInput
          placeholder="E-mail"
          required
          {...payForm.getInputProps('email')}
        />

        <Box className="grid grid-cols-2 gap-4">
          <TextInput
            placeholder="CPF"
            required
            {...payForm.getInputProps('cpf')}
          />
          <TextInput
            placeholder="Telefone"
            {...payForm.getInputProps('phone')}
          />
        </Box>

        <Box>
          {clientSecret ? (
            <Elements options={options} stripe={stripePromise}>
              <PaymentForm />
            </Elements>
          ) : (
            <Box>Carregando...</Box>
          )}
        </Box>
      </form>

      <Divider orientation="vertical" className="hidden lg:block" />
      <Divider orientation="horizontal" className="lg:hidden" />

      <OrderResume
        env={env}
        files={files}
        totalPages={totalPages}
        shippingTotal={shippingTotal}
        orderTotal={orderTotal}
        isFlex={isFlex}
      />
    </Box>
  );
}
