# API compatibility baseline

The Template treats its generated OpenAPI document as a reviewed compatibility
surface. `src/test/resources/contracts/openapi-compatibility.json` records the exact
HTTP path/method set, response statuses, request schemas, schema names, selected
validation constraints, and session-cookie/CSRF requirements.

`OpenApiCompatibilityIntegrationTest` regenerates the document from the running
Spring application and compares semantic fields rather than a formatting-sensitive
JSON dump. A deliberate HTTP change must update implementation, frontend consumer,
tests, this contract, and migration guidance together. Removing an error status,
weakening authentication/CSRF metadata, or silently widening a DTO is not an
acceptable snapshot refresh.
