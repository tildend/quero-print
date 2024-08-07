import { FormEvent, useEffect, useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import { Box, Button, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";

export const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();

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

  const [message, setMessage] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(data => {
      switch (data.paymentIntent?.status) {
        case "succeeded":
          setMessage("Payment succeeded!");
          break;
        case "processing":
          setMessage("Your payment is processing.");
          break;
        case "requires_payment_method":
          setMessage("Your payment was not successful, please try again.");
          break;
        default:
          setMessage("Something went wrong.");
          break;
      }
    });
  }, [stripe]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      notifications.show({
        title: "Tente novamente",
        message: "Pagamento temporariamente indisponível",
        color: "yellow"
      })
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: `${window.location.origin}/payment-complete`,
      },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error?.type === "card_error" || error?.type === "validation_error") {
      setMessage(error.message);
    } else {
      setMessage("An unexpected error occurred.");
    }

    setIsLoading(false);
  };

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
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
        <PaymentElement
          id="payment-element"
          options={{
            layout: "accordion"
          }}
        />
        <Button
          id="submit"
          color="green"
          loading={isLoading}
          className="mt-4"
          disabled={isLoading || !stripe || !elements}
        >
          Finalizar
        </Button>
        {/* Show any error or success messages */}
        {message && <div id="payment-message">{message}</div>}
      </Box>
    </form>
  );
}