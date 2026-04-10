export const wait = <T>(ms: number, value?: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value as T), ms));
