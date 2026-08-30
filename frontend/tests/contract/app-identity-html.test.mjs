import { describe, expect, it } from "vitest";
import { transformAppIdentityHtml } from "../../scripts/app-identity-html.mjs";

const template =
  '<html lang="__VIREO_APP_LANGUAGE__"><head><title>__VIREO_APP_NAME__</title><meta name="description" content="__VIREO_APP_DESCRIPTION__"><meta name="theme-color" content="__VIREO_APP_THEME_COLOR__"><meta name="vireo-build-revision" content="__VIREO_BUILD_REVISION__"></head></html>';

describe("transformAppIdentityHtml", () => {
  it("HTML-escapes identity values and preserves literal replacement tokens", () => {
    const transformed = transformAppIdentityHtml(
      template,
      {
        name: "$& <Vireo>",
        description: '"quoted" & \"apostrophe\' <description>',
        language: "en' onload='unsafe",
        themeColor: "#0b0c0e",
      },
      "$& revision",
    );

    expect(transformed).toContain("$&amp; &lt;Vireo&gt;");
    expect(transformed).toContain("&quot;quoted&quot; &amp; &quot;apostrophe&#39; &lt;description&gt;");
    expect(transformed).toContain('lang="en&#39; onload=&#39;unsafe"');
    expect(transformed).toContain('content="$&amp; revision"');
  });
});
