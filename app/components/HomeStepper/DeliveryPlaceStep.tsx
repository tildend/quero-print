import { Box, Button, TextInput, Checkbox, Textarea, Loader, Title, List } from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconCircleFilled, IconMapPinFilled } from "@tabler/icons-react";
import { APIProvider, AdvancedMarker, Map } from "@vis.gl/react-google-maps";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import { maskMap, maskString } from "~/helpers/maskString";
import { AddressOfCoords } from "~/models/AddressOfCoords";
import { ViaCEPRes } from "~/models/ViaCEP";

type Props = {
  // Parent state setter
  setStep: (step: number | ((prev: number) => number)) => void;
  env: { GOOGLE_MAPS_API_KEY: string };

  loading: boolean;

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
    useLocation: boolean;
  }>>;

  handleConfirmAddress: () => void;
}

export const DeliveryPlace: FC<Props> = ({
  setStep,
  env,
  loading,
  useLocation, setUseLocation,
  currentLocation, setCurrentLocation,
  addrForm,
  handleConfirmAddress
}) => {
  const [addrLoading, setAddrLoading] = useState(false);

  useEffect(() => {
    if (navigator.geolocation && useLocation) {
      setAddrLoading(true);
      navigator.geolocation.getCurrentPosition(async (position) => {
        await updateAddrFromCoords(position.coords);
        setCurrentLocation(position.coords);
        setAddrLoading(false);
      }, err => {
        console.error(err);
        notifications.show({
          title: 'Erro',
          message: 'Não foi possível obter sua localização',
          color: 'red',
        });

        setUseLocation(false);
        setAddrLoading(false);
      }, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 5000
      });
    }
  }, [useLocation]);

  useEffect(() => {
    if (!useLocation && addrForm.isValid('zip')) {
      setAddrLoading(true);
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
        .finally(() => setAddrLoading(false));
    }
  }, [addrForm.values.zip]);

  const formDisabled = addrLoading || (!useLocation && !addrForm.isValid('zip')) || loading;

  const updateAddrFromCoords = async (coords = currentLocation) => {
    if (coords) {
      return await fetch(`/api/geo/address-from-coords?lat=${coords.latitude}&lon=${coords.longitude}`)
        .then(res => res.json())
        .then((data: AddressOfCoords) => {
          addrForm.setValues({
            street: data.street,
            number: data.number,
            neighborhood: data.neighborhood,
            city: data.city,
            state: data.state,
            zip: data.zip.replace(/\D/g, ''),
          });

          return data;
        })
    }

    return false;
  }

  const handleSubmit = async () => {
    setAddrLoading(true);

    let addrValues = addrForm.getValues();
    if (addrForm.values.useLocation && currentLocation) {
      const addrValid = await updateAddrFromCoords()
        .then(addrFromDB => {
          addrValues = {
            ...addrValues,
            ...addrFromDB,
            useLocation: true
          };

          return true;
        })
        .catch(err => {
          console.error(err);
          modals.openConfirmModal({
            title: 'Erro',
            children: 'Não foi possível obter o endereço',
            color: 'red'
          });

          return false;
        });

      setAddrLoading(false);
      if (!addrValid) return;
    }

    setAddrLoading(false);
    modals.openConfirmModal({
      title: 'Confirme o endereço',
      children: (
        <List
          spacing="md"
          icon={<IconCircleFilled className="text-slate-400" size={8} />}
        >
          <List.Item>
            <span className="font-semibold mr-2">Rua:</span>
            {addrValues.street}, {addrValues.number}
          </List.Item>
          <List.Item>
            <span className="font-semibold mr-2">Complemento:</span>
            {addrValues.complement || 'Sem complemento'}
          </List.Item>
          <List.Item>
            <span className="font-semibold mr-2">Bairro:</span>
            {addrValues.neighborhood}
          </List.Item>
          <List.Item>
            <span className="font-semibold mr-2">Estado:</span>
            {addrValues.city} - {addrValues.state}
          </List.Item>
          <List.Item>
            <span className="font-semibold mr-2">CEP:</span>
            {addrValues.zip}
          </List.Item>
          <List.Item>
            <span className="font-semibold mr-2">Detalhes:</span>
            {addrValues.observation || 'Sem detalhes'}
          </List.Item>
        </List>
      ),
      labels: {
        cancel: 'Cancelar',
        confirm: 'Confirmar'
      },
      onConfirm: handleConfirmAddress
    });
  }

  const handleUseLocation = async () => {
    addrForm.setFieldValue('useLocation', !useLocation);
    setUseLocation(curr => !curr);
  }

  return (
    <Box
      data-use-location={useLocation ? 'true' : 'false'}
      className="
        grid gap-4
        data-[use-location=true]:lg:grid-cols-[1fr_.5fr]
      "
    >
      <form onSubmit={addrForm.onSubmit(handleSubmit)} className="grid gap-4 order-2 lg:order-1 w-full max-w-xl mx-auto">
        <Box className="grid gap-4 items-center p-4 lg:p-8 grid-cols-[1fr_auto_1fr] bg-white/25 rounded-lg">
          <Button
            px="xs"
            className="rounded-l-lg"
            variant={useLocation ? 'filled' : 'light'}
            color={useLocation ? 'green' : undefined}
            onClick={handleUseLocation}
            loading={loading}
          >
            Usar&nbsp;<span className="hidden lg:inline">localização atual</span>
            <span className="lg:hidden">GPS</span>
            {useLocation ? <IconCheck color="green" className="ml-3" /> : <IconMapPinFilled className="ml-3" />}
          </Button>
          <span className="block">ou</span>
          <TextInput
            {...addrForm.getInputProps('zip')}
            type="text"
            placeholder="Digite o CEP"
            value={maskString(addrForm.values.zip, maskMap.cep)}
            onChange={(event) => {
              const { value } = event.currentTarget;
              addrForm.setFieldValue('zip', value.replace(/\D/g, ''));
            }}
            rightSection={addrLoading && <Loader size="sm" />}
            required={!useLocation}
          />
        </Box>

        <Box className="grid grid-cols-2 gap-4">
          <TextInput
            {...addrForm.getInputProps('street')}
            type="text"
            placeholder="Rua"
            disabled={formDisabled}
            required={!useLocation}
          />
          <TextInput
            {...addrForm.getInputProps('number')}
            type="text"
            placeholder="Número"
            disabled={formDisabled}
            required={!useLocation}
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
            required={!useLocation}
          />
          <TextInput
            {...addrForm.getInputProps('city')}
            type="text"
            placeholder="Cidade"
            disabled={formDisabled}
            required={!useLocation}
          />
          <TextInput
            {...addrForm.getInputProps('state')}
            type="text"
            placeholder="Estado"
            disabled={formDisabled}
            required={!useLocation}
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
          label="Detalhes para a entrega"
          placeholder="Ex: Portão branco | Ao lado esquerdo do mercadinho | Tocar o interfone | Cartório do lado esquerdo | Não dobrar | Imprimir em tamanho X, etc."
          minLength={4}
          required={useLocation}
        />

        <Box className="flex justify-between">
          <Button
            onClick={() => setStep(0)}
            variant="light"
            size="md"
            disabled={formDisabled}
          >
            Voltar
          </Button>

          <Button
            type="submit"
            color="green"
            size="md"
            loading={loading}
            disabled={formDisabled || (addrForm.isDirty() && Object.values(addrForm.isValid).some(valid => !valid))}
          >
            Continuar
          </Button>
        </Box>
      </form>

      {useLocation && (
        <Box className="order-1 lg:order-2 pointer-events-none">
          <APIProvider apiKey={env.GOOGLE_MAPS_API_KEY}>
            <Map
              className="w-full h-[200px] lg:h-[485px] shadow-md rounded-lg"
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
      )}
    </Box>
  );
}