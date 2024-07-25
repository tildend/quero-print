import { Box, Button, TextInput, Checkbox, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconMapPinFilled } from "@tabler/icons-react";
import { APIProvider, AdvancedMarker, Map } from "@vis.gl/react-google-maps";
import { FC, useEffect, useState } from "react";
import { ViaCEPRes } from "~/models/ViaCEP";

type Props = {
  // Parent state setter
  setStep: (step: number | ((prev: number) => number)) => void;
  env: { GOOGLE_MAPS_API_KEY: string };
}

export const DeliveryPlace: FC<Props> = ({ setStep, env }) => {
  const [useLocation, setUseLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<GeolocationCoordinates>();
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
      city: (value) => {
        if (!value) return 'Cidade é obrigatória';
      },
      state: (value) => {
        if (!value) return 'Estado é obrigatório';
      },
      zip: (value) => {
        if (!value) return 'CEP é obrigatório';

        // Check if the zip code is valid
        const zipCode = value.replace(/\D/g, '');
        if (zipCode.length !== 8) return 'CEP inválido';

        // Fetch address from API
        fetch(`https://viacep.com.br/ws/${zipCode}/json/`)
          .then(response => response.json())
          .then((data: ViaCEPRes) => {
            console.log(data);

            if (data.erro) {
              return 'CEP não encontrado';
            }

            addrForm.setValues({
              street: data.logradouro,
              neighborhood: data.bairro,
              city: data.localidade,
              state: data.uf,
            });
          })
          .catch(err => {
            console.error(err);
            return 'Erro ao buscar CEP';
          });
      },
    }
  });

  return (
    <Box className="grid lg:grid-cols-[1fr_.5fr] gap-4 mt-12">
      <Box className="grid gap-4">
        <form onChange={() => addrForm.validate()} className="grid grid-cols-[1fr_auto_1fr] gap-4 p-8 items-center bg-white/25 rounded-lg">
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
            disabled={useLocation}
            required
          />
        </form>

        <Box className="grid grid-cols-2 gap-4">
          <TextInput
            {...addrForm.getInputProps('street')}
            type="text"
            placeholder="Rua"
            disabled={useLocation}
            required
          />
          <TextInput
            {...addrForm.getInputProps('number')}
            type="text"
            placeholder="Número"
            disabled={useLocation}
            required
          />
          <TextInput
            {...addrForm.getInputProps('complement')}
            type="text"
            placeholder="Complemento"
            disabled={useLocation}
          />
          <TextInput
            {...addrForm.getInputProps('neighborhood')}
            type="text"
            placeholder="Bairro"
            disabled={useLocation}
            required
          />
          <TextInput
            {...addrForm.getInputProps('city')}
            type="text"
            placeholder="Cidade"
            disabled={useLocation}
            required
          />
          <TextInput
            {...addrForm.getInputProps('state')}
            type="text"
            placeholder="Estado"
            disabled={useLocation}
            required
          />
          <Checkbox
            {...addrForm.getInputProps('saveAddr')}
            label="Salvar endereço"
          />
        </Box>

        <Textarea
          {...addrForm.getInputProps('observation')}
          minRows={5}
          autosize
          placeholder="Neste campo descreva detalhes sobre o local exato onde deseja que a entrega seja feita, ou qualquer outra informação relevante."
        />
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
    </Box>
  );
}