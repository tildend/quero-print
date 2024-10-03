import { FC, FormEvent, useEffect, useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import { Box, Button, TextInput, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import type { UseFormReturnType } from "@mantine/form";
import { modals } from "@mantine/modals";
import { Link } from "@remix-run/react";
import { getOrder } from "~/controllers/Orders.server";
import { useOrderID } from "~/hooks/useOrder";
import { maskMap, maskString } from "~/helpers/maskString";

type Props = {
  payForm: UseFormReturnType<{
    fullName: string;
    email: string;
    document: string;
    phone: string;
  }, (values: {
    fullName: string;
    email: string;
    document: string;
    phone: string;
  }) => {
    fullName: string;
    email: string;
    document: string;
    phone: string;
  }>
  clientSecret: string,
  handleSubmitPurchase: (paymentTx: string) => void;
}

export const PaymentForm: FC<Props> = ({ payForm, clientSecret, handleSubmitPurchase }) => {
  const stripe = useStripe();
  const elements = useElements();

  const { orderID } = useOrderID();

  const [message, setMessage] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      notifications.show({
        title: "Tente novamente",
        message: "Pagamento temporariamente indisponível",
        color: "yellow"
      });

      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        receipt_email: payForm.values.email,
        return_url: `${window.location.origin}/payment-complete`,
      },
    });

    if (error?.type === "card_error" || error?.type === "validation_error") {
      console.error(`😱PAYMENT ERROR: `, error);
      setMessage(error.message);
      setIsLoading(false);
      return;
    }

    // PAYMENT SUCCEEDED

    if (!stripe || !clientSecret || !orderID || !payForm.isValid()) {
      notifications.show({
        title: "Tente novamente",
        message: "Pagamento temporariamente indisponível",
        color: "yellow"
      });

      setIsLoading(false);
      return;
    }

    await stripe.retrievePaymentIntent(clientSecret).then(data => {
      console.log(`🔔PAYMENT DATA: `, data);
      switch (data.paymentIntent?.status) {
        case "succeeded":
          handleSubmitPurchase(data.paymentIntent.id);

          modals.open({
            title: "Pagamento concluído",
            children: (
              <Box className="grid gap-4">
                <Title order={2}>Pedido confirmado!</Title>
                <Button
                  component={Link}
                  to={`/perfil/#orders?id=${orderID}`}
                  variant="light"
                >
                  Acompanhar pedido
                </Button>
              </Box>
            )
          });
          break;
        case "processing":
          modals.open({
            title: "Processando pagamento",
            children: (
              <Box className="grid gap-4">
                <p>Seu pagamento está sendo processado.</p>
                <Button
                  component={Link}
                  to={`/orders?id=${orderID}`}
                  variant="light"
                >
                  Acompanhar pedido
                </Button>
              </Box>
            )
          });
          break;
        case "requires_payment_method":
          modals.open({
            title: "Erro no pagamento",
            children: (
              <Box className="grid gap-4">
                <p>Seu pagamento não foi processado.</p>
                <Button
                  variant="light"
                  onClick={() => modals.closeAll()}
                >
                  Tentar novamente
                </Button>
              </Box>
            )
          });
          break;
        default:
          modals.open({
            title: "Erro no pagamento",
            children: (
              <Box className="grid gap-4">
                <p>Seu pagamento não foi processado.</p>
                <Button
                  variant="light"
                  onClick={() => modals.closeAll()}
                >
                  Tentar novamente
                </Button>
              </Box>
            )
          });
          break;
      }
    });

    setIsLoading(false);
  };

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold">Informações de pagamento</h2>
      <TextInput
        placeholder="Nome e sobrenome"
        type="name"
        itemType="name"
        required
        {...payForm.getInputProps('fullName')}
      />
      <TextInput
        placeholder="E-mail"
        type="email"
        required
        {...payForm.getInputProps('email')}
      />

      <Box className="grid grid-cols-2 gap-4">
        <TextInput
          placeholder="CPF/CNPj"
          inputMode="numeric"
          required
          {...payForm.getInputProps('document')}
          value={maskString(payForm.values.document, payForm.values.document.length <= 11 ? maskMap.cpf : maskMap.cnpj)}
          onChange={(event) => {
            const { value } = event.currentTarget;
            payForm.setFieldValue('document', value.replace(/\D/g, ''));
          }}
        />
        <TextInput
          placeholder="Telefone"
          type="tel"
          inputMode="numeric"
          {...payForm.getInputProps('phone')}
          value={maskString(payForm.values.phone, maskMap.tel)}
          onChange={(event) => {
            const { value } = event.currentTarget;
            payForm.setFieldValue('phone', value.replace(/\D/g, ''));
          }}
          required
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
          type="submit"
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