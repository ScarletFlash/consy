export function isKeyInObject<T extends object, K extends string | number | symbol>(
  key: K,
  object: T
): object is T & Record<K, unknown> {
  return key in object;
}
