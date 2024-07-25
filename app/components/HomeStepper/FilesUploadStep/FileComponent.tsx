import { ActionIcon, Box, Group, Menu, Text, Tooltip } from "@mantine/core";
import { IconCamera, IconCameraFilled, IconDotsVertical, IconX } from "@tabler/icons-react";
import { FC, useState, useEffect, Dispatch, SetStateAction } from "react";
import { numToSize } from "~/helpers/numToSize";

type Props = {
  i: number;
  file: File;
  setDroppedFiles: Dispatch<SetStateAction<File[] | undefined>>;
  setTotalPages: Dispatch<SetStateAction<Record<number, number>>>;
};

export const FileComponent: FC<Props> = ({ i, file, setDroppedFiles, setTotalPages }) => {
  const [isImage, setIsImage] = useState<boolean>(false);
  const [pages, setPages] = useState<number>(1);
  useEffect(() => {
    const updatePages = async () => {
      if (file.type === 'application/pdf') {
        const { getDocument, GlobalWorkerOptions, version } = await import('pdfjs-dist');
        GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.mjs`;

        getDocument(URL.createObjectURL(file))?.promise
          .then(pdf => {
            setPages(pdf.numPages);
          })
          .catch(console.error);
      } else if (file.type.includes('image')) {
        setPages(3);
        setIsImage(true);
      }
    };

    updatePages();
  }, [file]);

  useEffect(() => {
    setTotalPages(prev => ({ ...prev, [i]: pages }));

    return () => {
      setTotalPages(prev => {
        const { [i]: _, ...rest } = prev;
        return rest;
      });
    };
  }, [pages]);

  const onRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDroppedFiles(prev => prev ? prev.filter((_, index) => index !== i) : undefined);
  };

  const [menuOpened, setMenuOpened] = useState(false);

  return (
    <Box
      className="
          relative
          grid grid-cols-[1fr_auto_auto] gap-4 items-center
          pr-6
          duration-500
          group/file
        "
    >
      <Box className="flex items-center gap-2">
        <Tooltip label={'Imagens valem 3 páginas'} disabled={!isImage}>
          <span>
            {isImage ? '📷 ' : '📄 '}
          </span>
        </Tooltip>
        <Tooltip label={file.name}>
          <Text truncate="end" className="w-[160px]">
            {file.name}
          </Text>
        </Tooltip>
      </Box>

      <Text size="xs" className="w-[60px]" c="gray">
        {numToSize(file.size)}
      </Text>
      <Tooltip label={'Imagens valem 3 páginas'} disabled={!isImage}>
        <Text size="xs" c="gray" className="min-w-16">
          {pages} página{pages > 1 ? 's' : ''}<br />
        </Text>
      </Tooltip>

      <Menu shadow="md" opened={menuOpened} onClose={() => setMenuOpened(false)}>
        <Menu.Target>
          <ActionIcon
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpened(prev => !prev);
            }}
            aria-label="Mais opções"
            variant="light"
            className="
              absolute right-0
              duration-300
              opacity-0
              group-hover/file:opacity-100
            "
          >
            <IconDotsVertical size={16} />
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Item leftSection={<IconX size={16} />} color="red" onClick={onRemove}>
            Remover
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Box>
  );
}