type StringOrNumberKey<T extends object> = {
  [K in keyof T]-?: T[K] extends string | number ? K : never;
}[keyof T];

export function omitKeys<T extends object, const K extends readonly (keyof T)[]>(
  value: T,
  keys: K,
): Omit<T, K[number]> {
  const omitted = new Set<keyof T>(keys);

  return Object.fromEntries(Object.entries(value).filter(([key]) => !omitted.has(key as keyof T))) as Omit<
    T,
    K[number]
  >;
}

export function withId<T extends object, K extends StringOrNumberKey<T>>(
  value: T,
  key: K,
  id: T[K],
): Omit<T, K> & Pick<T, K>;
export function withId<T extends object, K extends StringOrNumberKey<T>>(
  value: T,
  key: K,
  id?: null | undefined,
): Omit<T, K>;
export function withId<T extends object, K extends StringOrNumberKey<T>>(
  value: T,
  key: K,
  id: T[K] | null | undefined,
): Omit<T, K> | (Omit<T, K> & Pick<T, K>);
export function withId<T extends object, K extends StringOrNumberKey<T>>(
  value: T,
  key: K,
  id?: T[K] | null,
): Omit<T, K> | (Omit<T, K> & Pick<T, K>) {
  const withoutId = omitKeys(value, [key] as const);

  return id == null ? withoutId : ({ ...withoutId, [key]: id } as Omit<T, K> & Pick<T, K>);
}
