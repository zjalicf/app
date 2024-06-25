# Acreom

## Development

### Prerequisites

- Node v14 (required by electron-builder)

> **Important!** Make sure that dev dependencies are not in production dependencies.
> This is important for electron app since it bundles all prod dependencies.

### Frontend

Running frontend

1. Setup TipTap pro repository access

```bash
yarn config set "@tiptap-pro:registry" https://registry.tiptap.dev/
yarn config set "//registry.tiptap.dev/:_authToken" "${TIPTAP_PRO_TOKEN}"

```

2. Install dependencies

```bash
yarn
```

3. Run locally

```
yarn dev
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).

### Electron

List of commands:

- `yarn run desktop-app:dev` - run development server and open it in electron
- `yarn run desktop-app:build` - build web app and open it in electron
- `yarn run desktop-app:package` - create a production build for _windows_ and _mac_
    - `yarn run desktop-app:package:win` - only _windows_ (exe)
    - `yarn run desktop-app:package:mac` - only _mac_ (dmg)

Set base url before packaging the app to choose the backend
-- `export BASE_URL=https://api.acreom.com && yarn run desktop-app:package:mac`
