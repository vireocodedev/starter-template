import { createSessionExpiryChannel } from "@vireocodedev/infrastructure";

/** Coordinates deduplicated session-expiry handling between HTTP and React routing. */
export const appSessionExpiry = createSessionExpiryChannel({
  onListenerError: error => console.error("Session-expiry listener failed.", error),
});
