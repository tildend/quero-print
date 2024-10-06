import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { PublicMenuLayout } from "~/layouts/PublicMenu";

import { Box, Button, Container, Divider, Text } from "@mantine/core";
import { useEffect, useMemo, useRef, useState } from "react";
import { json, Link, useLoaderData } from "@remix-run/react";
import { FilesUploadStep } from "~/components/HomeStepper/FilesUploadStep";
import { DeliveryPlace } from "~/components/HomeStepper/DeliveryPlaceStep";
import { useForm } from "@mantine/form";
import { PaymentStep } from "~/components/HomeStepper/PaymentStep";
import { allowFlex } from "~/helpers/allowFlex";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperInstance from "swiper";
import { IconCheck } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import { useOrderID } from "~/hooks/useOrder";
import { theSession } from "../sessions.server";

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

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { userId, user } = await theSession(request);

  if (!(
    process.env.GOOGLE_MAPS_API_KEY &&
    process.env.PRICE_PER_PAGE &&
    process.env.STRIPE_PUBLISHABLE_KEY &&

    process.env.PRICE_PER_PAGE &&
    process.env.PRICE_FLEX &&
    process.env.PRICE_SEDEX_BASE &&
    process.env.PRICE_FLEX_PER_KM &&

    process.env.BASE_LAT &&
    process.env.BASE_LON &&

    process.env.GEOAPIFI_KEY
  )) {
    console.error('Missing envs');
    throw new Error('Erro interno, tente novamente mais tarde');
  }

  return json({
    user,
    userId,
    env: {
      GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
      PRICE_PER_PAGE: Number(process.env.PRICE_PER_PAGE),
      STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,

      PRICE_FLEX: Number(process.env.PRICE_FLEX),
      PRICE_SEDEX_BASE: Number(process.env.PRICE_SEDEX_BASE),
      PRICE_FLEX_PER_KM: Number(process.env.PRICE_FLEX_PER_KM),

      BASE_LAT: Number(process.env.BASE_LAT),
      BASE_LON: Number(process.env.BASE_LON),

      GEOAPIFI_KEY: process.env.GEOAPIFI_KEY
    }
  });
}

export default function Index() {
  const { env, userId, user } = useLoaderData<typeof loader>();

  const { orderID, clearOrderID } = useOrderID();

  const stepSwiper = useRef<SwiperInstance>();
  const stepCompSwiper = useRef<SwiperInstance>();
  const [step, setStep] = useState(0);
  useEffect(() => {
    window.location.hash = `step-${step}`;

    if (stepSwiper.current && stepCompSwiper.current) {
      stepSwiper.current.slideTo(step);
      stepCompSwiper.current.slideTo(step);
    }
  }, [stepSwiper.current, stepCompSwiper.current, step]);

  const [loading, setLoading] = useState(false);

  const [useLocation, setUseLocation] = useState(false);
  const [coordinates, setCoordinates] = useState<GeolocationCoordinates>();
  const addrForm = useForm({
    mode: 'controlled',
    initialValues: {
      useLocation: false,
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zip: '',
      observation: '',
      saveAddr: false
    },
    validate: {
      street: (value) => {
        if (addrForm.values.useLocation) return;

        if (!value) return 'Rua é obrigatória';
      },
      number: (value) => {
        if (addrForm.values.useLocation) return;

        if (!value) return 'Número é obrigatório';
      },
      neighborhood: (value) => {
        if (addrForm.values.useLocation) return;

        if (!value) return 'Bairro é obrigatório';
      },
      zip: (value) => {
        if (addrForm.values.useLocation) return;

        if (!value) return 'CEP é obrigatório';
        if (value.length !== 8) return 'CEP inválido';
      }
    }
  });

  const payForm = useForm({
    mode: 'controlled',
    initialValues: {
      fullName: user?.name || '',
      email: user?.email || '',
      document: user?.document || '',
      phone: user?.phone || '',
    },
    validate: {
      fullName: (value) => {
        if (!value) return 'Nome completo é obrigatório';
      },
      email: (value) => {
        if (!value) return 'E-mail é obrigatório';
        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) return 'E-mail inválido';
      },
      document: (value) => {
        if (!value) return 'Documento é obrigatório';
        if (value.length !== 11) return 'Documento inválido';
      },
      phone: (value) => {
        if (value && value.length < 10) return 'Telefone inválido';
      },
    }
  });

  const [droppedFiles, setDroppedFiles] = useState<File[]>();
  const [totalPages, setTotalPages] = useState(0);

  const printTotal = totalPages * env.PRICE_PER_PAGE;
  const shippingDistance = useMemo(() => {
    // Distance from base to destination
    if (coordinates?.latitude) {
      const deg = Math.sqrt(
        Math.pow(coordinates.latitude - env.BASE_LAT, 2) +
        Math.pow(coordinates.longitude - env.BASE_LON, 2)
      );

      // Return distance in meters
      return deg * 60 * 60 * 400;
    }
    return undefined;
  }, [addrForm.values.useLocation, coordinates]);

  const isFlex = allowFlex(addrForm.values.city, addrForm.values.state) || (shippingDistance || 9999999) < 20_000;
  const shippingTotal = shippingDistance ? (
    isFlex ? (
      env.PRICE_FLEX + ((shippingDistance / 1000) * env.PRICE_FLEX_PER_KM)
    ) : env.PRICE_SEDEX_BASE
  ) : (isFlex ? Number(env.PRICE_FLEX) * 2.5 : Number(env.PRICE_SEDEX_BASE));

  const orderTotal = shippingTotal && printTotal + shippingTotal;

  const [clientSecret, setClientSecret] = useState('');
  const handleConfirmAddress = async () => {
    if (!orderTotal) {
      return;
    }

    const response = await fetch('/api/payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(orderTotal * 100),
        currency: 'brl',
      })
    });

    const data = await response.json();

    if (data.clientSecret) {
      setClientSecret(data.clientSecret);
      setStep(2);
    }
  }

  const handleSubmitPurchase = async (paymentTx: string) => {
    setLoading(true);

    // Send order to backend
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        orderID,
        paymentTx,
        files: droppedFiles,
        totalPages,
        printTotal,
        shippingTotal,
        orderTotal,
        isFlex,
        address: {
          useLocation: addrForm.values.useLocation,
          street: addrForm.values.street,
          number: addrForm.values.number,
          complement: addrForm.values.complement,
          neighborhood: addrForm.values.neighborhood,
          city: addrForm.values.city,
          state: addrForm.values.state,
          zip: addrForm.values.zip,
          observation: addrForm.values.observation,
          saveAddr: addrForm.values.saveAddr
        },
        payment: {
          fullName: payForm.values.fullName,
          email: payForm.values.email,
          document: payForm.values.document,
          phone: payForm.values.phone
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      modals.open({
        title: 'Pedido realizado',
        children: (
          <Box className="grid gap-4">
            <Text>Seu pedido foi realizado com sucesso! #<Text fw="bold">{data.orderID}</Text></Text>
            <Text>Em breve você receberá um e-mail com as informações do seu pedido.</Text>
            <Button
              component={Link}
              to="/perfil/#orders"
              fullWidth
              onClick={clearOrderID}
            >
              Ver meus pedidos
            </Button>
          </Box>
        )
      });
    } else {
      console.error(response);
    }

    setLoading(false);
  }

  const stepsWithFunctionComponent = [
    {
      label: 'Escolha os arquivos',
      description: 'Envie os arquivos para impressão',
      FC: () => (
        <FilesUploadStep
          droppedFiles={droppedFiles}
          setDroppedFiles={setDroppedFiles}
          totalPages={totalPages}
          setTotalPages={setTotalPages}
          setStep={setStep}
        />
      )
    },
    {
      label: 'Local de entrega',
      description: 'Informe o endereço de entrega',
      FC: () => (
        <DeliveryPlace
          env={env}
          setStep={setStep}

          useLocation={useLocation}
          setUseLocation={setUseLocation}

          currentLocation={coordinates}
          setCurrentLocation={setCoordinates}

          addrForm={addrForm}
          handleConfirmAddress={handleConfirmAddress}

          loading={loading}
        />
      )
    },
    {
      label: 'Pagamento',
      description: 'Escolha a forma de pagamento',
      FC: () => (
        <PaymentStep
          totalPages={totalPages}
          files={droppedFiles || []}
          isFlex={isFlex}
          setStep={setStep}
          orderTotal={orderTotal}
          shippingTotal={shippingTotal}
          payForm={payForm}
          handleSubmitPurchase={handleSubmitPurchase}
          clientSecret={clientSecret}
          env={env}
        />
      )
    }
  ];

  useEffect(() => {
    if (window.location.hash) {
      const step = Number(window.location.hash.replace('#step-', ''));
      if (step >= 0 && step < stepsWithFunctionComponent.length) {
        setStep(step);
      }
    } else {
      setStep(0);
    }
  }, []);

  return (
    <PublicMenuLayout userId={userId}>
      <Container className="pb-16">
        <Swiper
          slidesPerView="auto"
          spaceBetween={32}
          centerInsufficientSlides
          onSwiper={swiperInstance => stepSwiper.current = swiperInstance}
          allowTouchMove={false}
          className="
            relative
            left-1/2 -translate-x-1/2
            w-screen lg:w-full
            px-8 lg:px-0
            mb-8
          "
        >
          {stepsWithFunctionComponent.map(({ label, description }, index) => (
            <SwiperSlide key={index} className="w-fit">
              <Box
                data-done={index < step}
                data-current={index === step}
                className="group flex items-center gap-2"
              >
                <Box
                  className="
                    w-8 h-8
                    flex items-center justify-center
                    rounded-full
                    border border-transparent
                    bg-white/30
                    duration-300
                    group-data-[current=true]:border-green-400
                    group-data-[current=true]:bg-white
                    group-data-[done=true]:border-green-400
                    group-data-[done=true]:bg-green-400
                    group-data-[done=true]:text-white
                  "
                >
                  {index >= step ? index + 1 : <IconCheck />}
                </Box>
                <Box>
                  <Box className="w-fit text-lg font-semibold text-daintree">{label}</Box>
                  <Box className="w-fit text-sm text-daintree">{description}</Box>
                </Box>
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
        <Divider className="my-8" />
        <Swiper
          slidesPerView={1}
          spaceBetween={24}
          onSwiper={swiperInstance => stepCompSwiper.current = swiperInstance}
          allowTouchMove={false}
          className="relative left-1/2 -translate-x-1/2 w-[95vw] lg:w-auto"
        >
          <SwiperSlide>
            {stepsWithFunctionComponent[0].FC()}
          </SwiperSlide>
          <SwiperSlide>
            {stepsWithFunctionComponent[1].FC()}
          </SwiperSlide>
          <SwiperSlide>
            {stepsWithFunctionComponent[2].FC()}
          </SwiperSlide>
        </Swiper>
      </Container>
    </PublicMenuLayout>
  );
}
