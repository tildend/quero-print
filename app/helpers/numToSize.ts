// Function that receives an amount of bytes and returns a human-readable size string.
export const numToSize = (bytes: number): string => {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const suffix = sizes[i];

  const formatedSize = bytes / (Math.pow(1024, i));
  return `${formatedSize.toFixed(i <= 1 ? 0 : 2)} ${suffix}`;
};