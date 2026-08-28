# Recipe: preview and generate a capability

The repository includes a versioned Purchase Order example schema. Preview it before writing files:

```bash
corepack npm run vireo -- generate entity .vireo/examples/purchase-order.entity.json --dry-run
```

Generate the capability and check ownership metadata:

```bash
corepack npm run vireo -- generate entity .vireo/examples/purchase-order.entity.json
corepack npm run generate:check
```

Run the application and follow the generated navigation entry:

```bash
corepack npm run dev
```

Generated files remain application source. Edit declared extension zones for routine customization; eject ownership before changing generator-owned regions. See [generated capabilities](../generated-capabilities.md) for the exact merge and upgrade contract.

