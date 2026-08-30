import type { Namespace, TFunction } from "i18next";
import type { z } from "zod";

export type ValidatedSchemaFactory<T, TNamespace extends Namespace = Namespace, TContext = void> = [TContext] extends [
  void,
]
  ? (t: TFunction<TNamespace>) => z.ZodType<T, T>
  : (t: TFunction<TNamespace>, context: TContext) => z.ZodType<T, T>;
