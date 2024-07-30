import type { MetaFunction } from "@remix-run/node";
import { PublicMenuLayout } from "~/layouts/PublicMenu";

import { Container, Stepper } from "@mantine/core";
import { useRef, useState } from "react";
import { json, useLoaderData } from "@remix-run/react";
import { FilesUploadStep } from "~/components/HomeStepper/FilesUploadStep";
import { DeliveryPlace } from "~/components/HomeStepper/DeliveryPlaceStep";
import { useForm } from "@mantine/form";
import { PaymentStep } from "~/components/HomeStepper/PaymentStep";
import { allowFlex } from "~/helpers/allowFlex";
import { loadStripe } from "@stripe/stripe-js";

export const meta: MetaFunction = () => {
  return [
    { title: "Quero Print!" },
    { name: "description", content: "Impressão e envio de fotos e documentos a partir de 1h" },
    { name: "keywords", content: "fotos, impressão, documentos, envio" },
    { name: "author", content: "Quero Print!" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { name: "theme-color", content: "#2d4b81" },
    { name: "msapplication-TileColor", content: "#2d4b81" },
    { name: "apple-mobile-web-app-capable", content: "yes" },
    { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
    // Open Graph / Facebook
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://queroprint.com.br" },
    { property: "og:title", content: "Quero Print!" },
    { property: "og:description", content: "Impressão e envio de fotos e documentos a partir de 1h" },
    { property: "og:image", content: "/favicon/apple-touch-icon.png" },
    // Twitter
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:url", content: "https://queroprint.com.br" },
    { name: "twitter:title", content: "Quero Print!" },
    { name: "twitter:description", content: "Impressão e envio de fotos e documentos a partir de 1h" },
    { name: "twitter:image", content: "/favicon/apple-touch-icon.png" },
    { name: "twitter:creator", content: "@queroprint" },
    { name: "twitter:site", content: "@queroprint" }
  ];
};

export const loader = () => {
  if (!(
    process.env.GOOGLE_MAPS_API_KEY &&
    process.env.PRICE_PER_PAGE &&
    process.env.STRIPE_SECRET_KEY
  )) {
    console.error('Missing envs');
    throw new Error('Erro interno, tente novamente mais tarde');
  }

  return json({
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
    PRICE_PER_PAGE: Number(process.env.PRICE_PER_PAGE),
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
  });
}

export default function Index() {
  const env = useLoaderData<typeof loader>();
  const [step, setStep] = useState(0);

  const stripePromise = useRef(loadStripe(env.STRIPE_PUBLISHABLE_KEY || ''));

  const [useLocation, setUseLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<GeolocationCoordinates>();
  const addrForm = useForm({
    mode: 'controlled',
    initialValues: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zip: '',
      observation: '',
      saveAddr: false,
    },
    validate: {
      street: (value) => {
        if (!value) return 'Rua é obrigatória';
      },
      number: (value) => {
        if (!value) return 'Número é obrigatório';
      },
      neighborhood: (value) => {
        if (!value) return 'Bairro é obrigatório';
      },
      zip: (value) => {
        if (!value) return 'CEP é obrigatório';
        if (value.length !== 8) return 'CEP inválido';
      }
    }
  });

  const [droppedFiles, setDroppedFiles] = useState<File[]>();
  const [totalPages, setTotalPages] = useState(0);

  const isFlex = allowFlex(addrForm.values.city, addrForm.values.state);

  return (
    <PublicMenuLayout>
      <Container>
        <Stepper
          active={step}
          allowNextStepsSelect={true}
          onStepClick={setStep}
          classNames={{
            stepDescription: 'text-daintree',
          }}
        >
          <Stepper.Step label="Escolha os arquivos" description="Envie os arquivos para impressão">
            <FilesUploadStep
              droppedFiles={droppedFiles}
              setDroppedFiles={setDroppedFiles}
              totalPages={totalPages}
              setTotalPages={setTotalPages}
              setStep={setStep}
            />
          </Stepper.Step>

          <Stepper.Step label="Local de entrega" description="Informe o endereço de entrega">
            <DeliveryPlace
              env={env}
              setStep={setStep}

              useLocation={useLocation}
              setUseLocation={setUseLocation}

              currentLocation={currentLocation}
              setCurrentLocation={setCurrentLocation}

              addrForm={addrForm}
            />
          </Stepper.Step>

          <Stepper.Step label="Pagamento" description="Escolha a forma de pagamento">
            <PaymentStep stripePromise={stripePromise.current} totalPages={totalPages} setStep={setStep} />
          </Stepper.Step>
        </Stepper>
      </Container>
    </PublicMenuLayout>
  );
}
