/**
 * Clears an object removing every 0, null and undefined value. And any key that is not in the reference object.
 * 
 * @param obj The object to clear.
 * @param reference The reference object.
 * @returns The cleared object.
 */
export const clearObject = (obj: Record<string, object | string | number | boolean | null | undefined>, reference: string[] = []) => {
  const newObj = { ...obj };
  Object.keys(newObj).forEach(key => {
    if (newObj[key] === 0 || newObj[key] === null || newObj[key] === undefined || (reference && !reference.includes(key))) {
      delete newObj[key];
    }
  });
  return newObj;
}