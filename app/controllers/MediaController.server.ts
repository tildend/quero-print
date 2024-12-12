import { PutObjectCommand } from '@aws-sdk/client-s3';
import type { StreamingBlobPayloadInputTypes } from '@smithy/types/dist-types/streaming-payload/streaming-blob-payload-input-types';

import fs from 'node:fs';
import { execSync } from 'node:child_process';
import { S3, S3_BUCKET } from '~/drivers/S3';

export const encodeMedia = async (buffer: Buffer, contentTypeHeader: string) => {
  const inputType = contentTypeHeader.split('/')[0];
  let inputExt = contentTypeHeader.split('/')[1];
  switch (inputExt) {
    case 'jpeg':
      inputExt = 'jpg';
      break;
    case 'quicktime':
      inputExt = 'mov';
      break;
  }

  let inputName = Math.random().toString(36).substring(7);
  inputName += `${new Date().getTime()}.${inputExt}`;

  fs.writeFileSync(`./tmp/${inputName}`, buffer);

  // Execute the video conversion command in shell
  let outputName = Math.random().toString(36).substring(7);
  if (inputType === 'video') {
    console.log('Transcoding video');
    outputName += '.mp4';
    execSync(`ffmpeg -i ./tmp/${inputName} \
      -c:v libx265 \
      -crf 26 \
      -preset faster \
      -c:a aac \
      -b:a 128k \
      -movflags +faststart \
      -vf scale=-2:1080 \
      ./tmp/${outputName} \
      -y
    `);
    console.log('Transcoded video');
  } else if (inputType === 'image') {
    console.log('Transcoding image');
    outputName += '.jpg';
    execSync(`ffmpeg \
      -i ./tmp/${inputName} \
      -q:v 4 \
      ./tmp/${outputName} \
      -y
    `);
    console.log('Transcoded image');
  }

  // Read the transcoded file
  console.log('Reading transcoded file');
  const encodedMediaFile = fs.readFileSync(`./tmp/${outputName}`);

  // Remove the temporary files
  fs.unlinkSync(`./tmp/${inputName}`);
  fs.unlinkSync(`./tmp/${outputName}`);

  return encodedMediaFile;
}

export const uploadMedia = async (path: string, media: StreamingBlobPayloadInputTypes, fileName = Date.now().toString() + Math.random().toString(36).substring(7), fileExt: string) => {
  if (!S3 || !S3_BUCKET) {
    console.log('S3 not found');
    return undefined;
  }

  console.log('Uploading media', path, fileName, fileExt);

  const fileFullPath = `filesToPrint/${path}/${fileName}.${fileExt}`;

  console.log('File full path', fileFullPath);
  console.log('bucket', S3_BUCKET);
  const uploadRes = await S3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: fileFullPath,
      Body: media,
      ACL: 'public-read'
    })
  );

  if (uploadRes.$metadata?.httpStatusCode === 200) {
    return fileFullPath;
  } else {
    return undefined;
  }
};

