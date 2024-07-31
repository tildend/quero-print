import { Box, Divider, Title, List, Tooltip, Text, Group, Button, ScrollArea } from "@mantine/core";
import { IconCloudUpload } from "@tabler/icons-react";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import { useColors } from "tailwind.config";
import { Dropzone } from "@mantine/dropzone";
import { FileComponent } from "./FilesUploadStep/FileComponent";
import { modals } from "@mantine/modals";
import { numToSize } from "~/helpers/numToSize";
import scrollareaGradientStyles from "./FilesUploadStep/scrollarea-gradient.module.css";

type Props = {
  droppedFiles: File[] | undefined;
  setDroppedFiles: Dispatch<SetStateAction<File[] | undefined>>;
  totalPages: number;
  setTotalPages: Dispatch<SetStateAction<number>>;
  setStep: Dispatch<SetStateAction<number>>;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024;

export const FilesUploadStep: FC<Props> = ({ droppedFiles, setDroppedFiles, setStep, totalPages, setTotalPages }) => {
  const [filesPages, setFilesPages] = useState<Record<number, number>>({});
  const onDrop = (files: File[]) => {
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        modals.open({
          title: <Title order={3}>Arquivo muito grande</Title>,
          children: (
            <Box>
              <Text>
                O arquivo <strong>{file.name.slice(0, 32)}</strong> excede o tamanho máximo de 10MB.
              </Text>

              <Divider className="my-4" />
              <Group>
                <Button onClick={() => modals.closeAll()}>Ok</Button>
              </Group>
            </Box>
          ),
        })
        return;
      }

      if (droppedFiles?.some(f => f.name === file.name)) {
        modals.open({
          title: <Title order={3}>Arquivo duplicado</Title>,
          children: (
            <Box>
              <Text>
                O arquivo <strong>{file.name.slice(0, 32)}</strong> já foi adicionado.
              </Text>

              <Divider className="my-4" />
              <Group>
                <Button onClick={() => modals.closeAll()}>Ok</Button>
              </Group>
            </Box>
          ),
        })
        return;
      }
    }

    setDroppedFiles(currOnes => [...(currOnes || []), ...files]);
  };

  const colors = useColors();

  useEffect(() => {
    setTotalPages(() => Object.values(filesPages).reduce((acc, curr) => acc + curr, 0));
  }, [filesPages]);

  const [scrollPosition, onScrollPositionChange] = useState({ x: 0, y: 0 });

  return (
    <Dropzone
      multiple
      onDrop={onDrop}
      accept={['image/png', 'image/jpeg', 'image/jpg', 'application/pdf']}
      maxSize={MAX_FILE_SIZE}
      classNames={{
        root: `
          relative
          left-1/2 lg:left-auto
          w-screen lg:w-full
          group
          bg-gradient-to-b from-[#F3F6FB] to-[#D5DDEC]
          lg:bg-white/75
          shadow-md
          -translate-x-1/2 lg:-translate-x-0
        `,
      }}
    >
      <Box className="lg:h-[480px]">
        <div
          className="
            grid
            grid-rows-[1fr_auto_auto]
            lg:grid-cols-[1fr_auto_0.6fr]
            h-full
            z-[1]
            pointer-events-auto
          "
        >
          <div className="max-w-full flex flex-col gap-4 items-center justify-center">
            <IconCloudUpload size={128} color={colors.metallic} />
            <Text size="xl" ta="center">Arraste e solte os arquivos aqui</Text>
            <Text size="sm" ta="center">ou clique para procurar</Text>
          </div>

          <Divider orientation="vertical" mx="lg" className="hidden lg:block" />
          <Divider orientation="horizontal" my="lg" className="lg:hidden" />

          <Box className="w-full flex flex-col justify-between opacity-85 pointer-events-auto z-[1]">
            <List className="w-full text-sm h-[410px] mb-8" spacing="lg">
              <ScrollArea
                data-has-files={!!droppedFiles?.length}
                data-scroll-at-bottom={!!droppedFiles && scrollPosition.y >= (droppedFiles?.length * 35) - 440}
                onScrollPositionChange={onScrollPositionChange}
                classNames={scrollareaGradientStyles}
                className="
                  group-hover:after:from-[#D8E0EF]
                  lg:group-hover:after:from-[#f8f9fa]
                "
              >
                {droppedFiles ? droppedFiles.map((file, i) => (
                  <List.Item key={file.name + file.lastModified + file.size} mt="xs" classNames={{ itemWrapper: 'w-full', itemLabel: 'w-full' }}>
                    <FileComponent
                      i={i}
                      file={file}
                      setDroppedFiles={setDroppedFiles}
                      setTotalPages={setFilesPages}
                    />
                  </List.Item>
                )) : (
                  <>
                    <List.Item className="leading-tight">📷 Fotos: <span className="font-bold"><Tooltip label="ou jpeg"><span>JPG</span></Tooltip>, PNG</span></List.Item>
                    <List.Item className="leading-tight">📄 Documentos: <span className="font-bold">PDF</span></List.Item>
                    <List.Item className="leading-tight">📦 Tamanho máximo <span className="font-bold">{numToSize(MAX_FILE_SIZE)}</span></List.Item>
                    <List.Item className="leading-tight">📏 Dimensão máxima <span className="font-bold">A4</span></List.Item>
                  </>
                )}
              </ScrollArea>
            </List>

            <Box className="flex justify-between items-center">
              <Text size="lg" c="gray" hidden={!totalPages}>{totalPages} página{totalPages > 1 ? 's' : ''}</Text>
              <Text size="sm" c="gray" hidden={!!totalPages}>
                Envie seus arquivos para começar
              </Text>
              <Button
                onClick={e => {
                  e.stopPropagation();
                  setStep(1);
                }}
                color="green"
                size="md"
                disabled={!totalPages}
              >
                Continuar
              </Button>
            </Box>
          </Box>
        </div>
      </Box >
    </Dropzone >
  );
}