import crypto from 'node:crypto';

export const hash = (text: string) => {
  if (!process.env.CIPHER_CONSTANT_KEY) {
    console.error('Missing CIPHER_CONSTANT_KEY');
    throw new Error('ENV is not defined');
  }

  const cipher = crypto.createHash('sha256');
  const hashedText = cipher.update(text).digest('hex');

  // Append a salt from a constant string to the hashed text
  const salt = getSaltFor(hashedText);
  return `${hashedText}.${salt}`;
}

const getSaltFor = (hash: string) => {
  if (!process.env.CIPHER_CONSTANT_KEY) {
    console.error('Missing CIPHER_CONSTANT_KEY');
    throw new Error('ENV is not defined');
  }

  // Create a decryptable hash from the constant string
  const cipher = crypto.createHash('sha256');
  cipher.update(process.env.CIPHER_CONSTANT_KEY + hash.substring(0) + hash.substring(1) + 'guilherme');
  const salt = cipher.digest('hex');
  return salt;
}

export const compareTextAndHash = (textToCompare: string, hashString: string) => {
  if (!process.env.CIPHER_CONSTANT_KEY) {
    console.error('Missing CIPHER_CONSTANT_KEY');
    throw new Error('ENV is not defined');
  }

  return hash(textToCompare) === hashString;
}

export const isHash = (hash: string) => {
  const salt = hash.split('.')[1];
  if (!salt) {
    return false;
  }

  const saltToCompare = getSaltFor(hash.split('.')[0]);

  return salt === saltToCompare;
}
