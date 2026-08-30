const HTML_ATTRIBUTE_ESCAPES = Object.freeze({
  '"': "&quot;",
  "&": "&amp;",
  "'": "&#39;",
  "<": "&lt;",
  ">": "&gt;",
});

function escapeHtmlAttribute(value) {
  return String(value).replace(/[&<>"']/gu, character => HTML_ATTRIBUTE_ESCAPES[character]);
}

function replaceToken(html, token, value) {
  const escaped = escapeHtmlAttribute(value);
  return html.replaceAll(token, () => escaped);
}

/** Replaces build-time identity tokens without treating product text as a replacement pattern. */
export function transformAppIdentityHtml(html, identity, buildRevision) {
  return replaceToken(
    replaceToken(
      replaceToken(
        replaceToken(html, "__VIREO_APP_NAME__", identity.name),
        "__VIREO_APP_DESCRIPTION__",
        identity.description,
      ),
      "__VIREO_APP_THEME_COLOR__",
      identity.themeColor,
    ),
    "__VIREO_APP_LANGUAGE__",
    identity.language,
  ).replaceAll("__VIREO_BUILD_REVISION__", () => escapeHtmlAttribute(buildRevision));
}
