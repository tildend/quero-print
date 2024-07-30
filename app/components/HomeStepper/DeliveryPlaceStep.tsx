import { Box, Button, TextInput, Checkbox, Textarea, Loader } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconMapPinFilled } from "@tabler/icons-react";
import { APIProvider, AdvancedMarker, Map } from "@vis.gl/react-google-maps";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import { maskMap, maskString } from "~/helpers/maskString";
import { ViaCEPRes } from "~/models/ViaCEP";

type Props = {
  // Parent state setter
  setStep: (step: number | ((prev: number) => number)) => void;
  env: { GOOGLE_MAPS_API_KEY: string };
  // Location state
  useLocation: boolean;
  setUseLocation: Dispatch<SetStateAction<boolean>>;

  currentLocation: GeolocationCoordinates | undefined;
  setCurrentLocation: Dispatch<SetStateAction<GeolocationCoordinates | undefined>>;

  // Address form
  addrForm: ReturnType<typeof useForm<{
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    zip: string;
    observation: string;
    saveAddr: boolean;
  }>>;
}

export const DeliveryPlace: FC<Props> = ({
  setStep,
  env,
  useLocation, setUseLocation,
  currentLocation, setCurrentLocation,
  addrForm
}) => {
  useEffect(() => {
    if (navigator.geolocation && useLocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCurrentLocation(position.coords);
      }, err => {
        console.error(err);
        notifications.show({
          title: 'Erro',
          message: 'Não foi possível obter sua localização',
          color: 'red',
        });
      }, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 5000
      });
    }
  }, [useLocation]);

  const [viaCEPLoading, setViaCEPLoading] = useState(false);
  useEffect(() => {
    if (addrForm.isValid('zip')) {
      setViaCEPLoading(true);
      fetch(`https://viacep.com.br/ws/${addrForm.values.zip}/json/`)
        .then(res => res.json())
        .then((data: ViaCEPRes) => {
          addrForm.setValues({
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf,
          });
        })
        .catch(console.error)
        .finally(() => setViaCEPLoading(false));
    }
  }, [addrForm.values.zip]);

  const formDisabled = viaCEPLoading || useLocation || !addrForm.isValid('zip');

  const handleFormSubmit = () => {
    if (addrForm.isValid())
      setStep(2);
  };

  return (
    <Box className="grid lg:grid-cols-[1fr_.5fr] gap-4 mt-12">
      <form onSubmit={addrForm.onSubmit(handleFormSubmit)} className="grid gap-4">
        <Box className="grid gap-4 items-center p-8 grid-cols-[1fr_auto_1fr] bg-white/25 rounded-lg">
          <Button
            px="xs"
            className="rounded-l-lg"
            variant={useLocation ? 'filled' : 'light'}
            color={useLocation ? 'green' : undefined}
            onClick={() => setUseLocation(using => !using)}
          >
            Usar localização atual {useLocation ? <IconCheck color="green" className="ml-3" /> : <IconMapPinFilled className="ml-3" />}
          </Button>
          {'ou'}
          <TextInput
            {...addrForm.getInputProps('zip')}
            type="text"
            placeholder="Digite o CEP"
            value={maskString(addrForm.values.zip, maskMap.cep)}
            onChange={(event) => {
              const { value } = event.currentTarget;
              addrForm.setFieldValue('zip', value.replace(/\D/g, ''));
            }}
            disabled={useLocation}
            rightSection={viaCEPLoading && <Loader size="sm" />}
            required
          />
        </Box>

        <Box className="grid grid-cols-2 gap-4">
          <TextInput
            {...addrForm.getInputProps('street')}
            type="text"
            placeholder="Rua"
            disabled={formDisabled}
            required
          />
          <TextInput
            {...addrForm.getInputProps('number')}
            type="text"
            placeholder="Número"
            disabled={formDisabled}
            required
          />
          <TextInput
            {...addrForm.getInputProps('complement')}
            type="text"
            placeholder="Complemento"
            disabled={formDisabled}
          />
          <TextInput
            {...addrForm.getInputProps('neighborhood')}
            type="text"
            placeholder="Bairro"
            disabled={formDisabled}
            required
          />
          <TextInput
            {...addrForm.getInputProps('city')}
            type="text"
            placeholder="Cidade"
            disabled={formDisabled}
            required
          />
          <TextInput
            {...addrForm.getInputProps('state')}
            type="text"
            placeholder="Estado"
            disabled={formDisabled}
            required
          />
          <Checkbox
            {...addrForm.getInputProps('saveAddr')}
            label="Salvar endereço"
            disabled={formDisabled}
          />
        </Box>

        <Textarea
          {...addrForm.getInputProps('observation')}
          minRows={4}
          autosize
          label="Observações"
          placeholder="Descreva detalhes sobre o local exato onde deseja que a entrega seja feita, ou qualquer outra informação relevante."
          minLength={6}
          required={useLocation}
        />

        <Box className="flex justify-between">
          <Button
            onClick={() => setStep(0)}
            variant="light"
          >
            Voltar
          </Button>

          <Button
            type="submit"
            disabled={Object.values(addrForm.isValid).some(valid => !valid)}
          >
            Continuar
          </Button>
        </Box>
      </form>

      <APIProvider apiKey={env.GOOGLE_MAPS_API_KEY}>
        <Map
          className="w-full h-[485px] shadow-md rounded-lg"
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
    </Box>
  );
}