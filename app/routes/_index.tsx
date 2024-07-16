import type { LinksFunction, LoaderFunction, MetaFunction } from "@remix-run/node";
import { PublicMenuLayout } from "~/layouts/PublicMenu";

import { Box, Container, Divider, List, Stepper, Text, Title, Tooltip } from "@mantine/core";
import { useEffect, useState } from "react";
import { Dropzone } from "@mantine/dropzone";
import { IconCloudUpload } from "@tabler/icons-react";
import { useColors } from "tailwind.config";
import { AdvancedMarker, APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { json, useLoaderData } from "@remix-run/react";

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
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    throw new Error('Missing GOOGLE_MAPS_API_KEY');
  }

  return json({
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY
  });
}

export default function Index() {
  const env = useLoaderData<typeof loader>();
  const colors = useColors();

  const [step, setStep] = useState(0);
  const nextStep = () => setStep((current) => current + 1);
  const prevStep = () => setStep((current) => current - 1);

  const [droppedFiles, setDroppedFiles] = useState<File[]>();
  const onDrop = (files: File[]) => {
    setDroppedFiles(files);
    nextStep();
  };

  const [useLocation, setUseLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<GeolocationCoordinates>();
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCurrentLocation(position.coords);
      });
    }
  }, []);

  return (
    <PublicMenuLayout>
      <Container>
        <Stepper
          active={step}
          allowNextStepsSelect={true}
          onStepClick={setStep}
          classNames={{
            step: 'p-2 backdrop-brightness-105 rounded-lg',
            stepDescription: 'text-daintree',
          }}
        >
          <Stepper.Step label="Escolha os arquivos" description="Envie os arquivos para impressão">
            <Dropzone
              multiple
              onDrop={onDrop}
              accept={['image/*', 'application/pdf']}
              classNames={{
                root: 'bg-white/75 shadow-md',
              }}
            >
              <Box
                h="48vh"
                mih="480px"
              >
                {droppedFiles ? (
                  <div>
                    {droppedFiles.map((file) => (
                      <div key={file.name}>{file.name}</div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-[1fr_auto_0.75fr] h-full z-[1] pointer-events-auto">
                    <div className="flex flex-col gap-4 items-center justify-center">
                      <IconCloudUpload size={128} color={colors.metallic} />
                      <Text size="xl" ta="center">Arraste e solte os arquivos aqui</Text>
                      <Text size="sm" ta="center">ou clique para procurar</Text>
                    </div>
                    <Divider orientation="vertical" mx="lg" />
                    <Box className="flex flex-col">
                      <Box className="p-6 bg-white shadow-md rounded-lg">
                        <Title order={3} className="mb-8 text-5xl text-amber-400">Promoção!</Title>
                        <List>
                          <List.Item className="mb-4 text-lg leading-tight"><span className="font-bold text-metallic">🚀 Frete Grátis</span> à partir de 30 folhas</List.Item>
                          <List.Item className="mb-4 text-lg leading-tight">🤫 <span className="font-bold">Ganhe 5 páginas</span> na primeira compra</List.Item>
                        </List>
                      </Box>

                      <List className="mt-8" spacing="lg">
                        <List.Item className="text-lg leading-tight">📷 <span className="font-bold">Fotos</span> - <Tooltip label="ou jpeg"><span>JPG</span></Tooltip>, PNG</List.Item>
                        <List.Item className="text-lg leading-tight">📄 <span className="font-bold">Documentos</span> - PDF</List.Item>
                        <List.Item className="text-lg leading-tight">📏 <span className="font-bold">Dimensão máxima:</span> - A4</List.Item>
                        <List.Item className="text-lg leading-tight">📦 <span className="font-bold">Tamanho máximo:</span> - 10MB</List.Item>
                      </List>
                    </Box>
                  </div>
                )}
              </Box>
            </Dropzone>
          </Stepper.Step>

          <Stepper.Step label="Local de entrega" description="Informe o endereço de entrega">
            <Box className="flex flex-col gap-4">
              <Box className="flex gap-4">
                <button onClick={() => setUseLocation(true)} className="p-4 bg-metallic text-zircon rounded-lg">Sim</button>
                <button onClick={() => setUseLocation(false)} className="p-4 bg-zircon text-metallic rounded-lg">Não</button>
              </Box>
            </Box>
            <APIProvider apiKey={env.GOOGLE_MAPS_API_KEY}>
              <Map
                className="w-full h-[480px] shadow-md rounded-lg"
                center={{ lat: currentLocation?.latitude || -23.5505, lng: currentLocation?.longitude || -46.6333 }}
                zoom={18}
                gestureHandling=""
                disableDefaultUI={true}
                mapId="e7c6fd1bdf3b30ca"
                controlled
                reuseMaps
              >
                {currentLocation && <AdvancedMarker position={{ lat: currentLocation.latitude, lng: currentLocation.longitude }} />}
              </Map>
            </APIProvider>
          </Stepper.Step>
        </Stepper>
      </Container>
    </PublicMenuLayout>
  );
}
