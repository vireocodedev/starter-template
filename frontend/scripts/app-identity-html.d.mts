export type HtmlAppIdentity = Readonly<{
  name: string;
  description: string;
  themeColor: string;
  language: string;
}>;

export declare function transformAppIdentityHtml(
  html: string,
  identity: HtmlAppIdentity,
  buildRevision: string,
): string;
