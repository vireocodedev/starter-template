import type { Namespace, TFunction } from "i18next";
import type { z } from "zod";

export type ValidatedSchemaFactory<T, TNamespace extends Namespace = Namespace> = (
  t: TFunction<TNamespace>,
) => z.ZodType<T, T>;
