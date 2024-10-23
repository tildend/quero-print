import { ActionFunction, json } from '@remix-run/node';
import { uploadMedia } from '~/controllers/MediaController.server';
import { Erro } from '~/models/Erro';
import { theSession } from '~/sessions.server';

export const action: ActionFunction = async ({ request }) => {
  const { user } = await theSession(request);

  try {
    if (!user) {
      console.log('Unauthorized');
      throw new Erro('Não logado, boa tentativa', 401);
    }

    const mediaFile = await request.arrayBuffer();
    if (!mediaFile) {
      console.log('No file');
      throw new Erro('Nenhum arquivo enviado', 400);
    }

    // If the file is too big, throw an error
    if (mediaFile.byteLength > 1024 * 1024 * 500) {
      console.log('File too big');
      throw new Erro('Arquivo muito grande', 400);
    }

    const contentType = request.headers.get('Content-Type');
    if (!contentType) {
      console.log('No content type');
      throw new Erro('Nenhum content type detectado', 400);
    }

    const mediaType = contentType.split('/')[0];
    if (!mediaType) {
      console.log('No media type');
      throw new Erro('Nenhum media type detectado', 400);
    }

    // Image or PDF extension
    const fileExt = mediaType === 'image' ? 'jpg' : (mediaType === 'application' ? 'pdf' : '');
    if (!fileExt) {
      console.log('Invalid media type');
      throw new Erro('Tipo de arquivo inválido', 400);
    }

    const searchParams = new URLSearchParams(request.url.split('?')[1]);
    const path = searchParams.get('path');
    if (!path) {
      console.log('No path');
      throw new Erro('Nenhum path detectado', 400);
    }

    const fileName = searchParams.get('fileName') || (Math.random().toString(36).substring(7) + Date.now().toString());

    const mediaURI = await uploadMedia(path, Buffer.from(mediaFile), fileName, fileExt);
    if (!mediaURI) {
      console.log('Upload video failed');
      throw new Erro('Falha ao fazer upload do arquivo', 500);
    }

    return json(mediaURI,
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    if (error instanceof Erro) {
      return json({ error: error.mensagem },
        { status: typeof error.contexto === 'number' ? error.contexto : 500 }
      );
    }

    return json({ error: 'Erro interno, tente novamente mais tarde' },
      { status: 500 }
    );
  }
};