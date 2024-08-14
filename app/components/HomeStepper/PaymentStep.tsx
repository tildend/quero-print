import { Box, Divider, Skeleton } from "@mantine/core";
import { ComponentProps, Dispatch, FC, SetStateAction, useEffect, useMemo, useState } from "react";

import { loadStripe } from "@stripe/stripe-js";
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
    STRIPE_PUBLISHABLE_KEY: string;
  }

  clientSecret?: string;
  payForm: ComponentProps<typeof PaymentForm>['payForm'];
  handleSubmitPurchase: (paymentTx: string) => void;

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

export const PaymentStep: FC<Props> = ({ env, clientSecret, payForm, handleSubmitPurchase, setStep, isFlex, files, totalPages, shippingTotal, orderTotal }) => {
  const stripePromise = useMemo(() => loadStripe(env.STRIPE_PUBLISHABLE_KEY || ''), [env.STRIPE_PUBLISHABLE_KEY]);

  return (
    <Box className="w-full flex flex-col-reverse lg:grid lg:grid-cols-[1fr_auto_.6fr] gap-8">
      {clientSecret ? (
        <Elements options={{ clientSecret }} stripe={stripePromise}>
          <PaymentForm payForm={payForm} clientSecret={clientSecret} handleSubmitPurchase={handleSubmitPurchase} />
        </Elements>
      ) : (
        <Box className="grid gap-3">
          <Skeleton height={40} />
          <Skeleton height={40} />
          <Skeleton height={40} />
          <Skeleton height={40} />
        </Box>
      )}

      <Divider orientation="vertical" className="hidden lg:block" />
      <Divider orientation="horizontal" className="lg:hidden" />

      <OrderResume
        env={env}
        setStep={setStep}
        files={files}
        totalPages={totalPages}
        shippingTotal={shippingTotal}
        orderTotal={orderTotal}
        isFlex={isFlex}
      />
    </Box>
  );
}
