# Metropolitan Museum Explorer

Browse departments and search highlights from The Metropolitan Museum of Art's collection. Built with TypeScript, Vue 2.7, Vue Router, Vuetify 2, and Axios.

## Development

```sh
nvm use
npm ci
npm run serve
```

```sh
npm run lint
npm run lint:fix
npm run typecheck
npm test
npm run build
```

Use Node.js 24, as specified in `.nvmrc`, to match the Netlify build environment. The tooling requires at least Node.js 18. Tests run through Node's test runner with `tsx` to load TypeScript. `npm run typecheck` checks application code, Vue scripts and templates, and test code under strict TypeScript settings. `npm run build` runs that check before compiling the production bundle.

This project retains Vue CLI 4 and Vuetify 2. Vue and its template compiler are aligned on 2.7.16 for typed component props. The build and development scripts enable the OpenSSL legacy provider required by Webpack 4 on modern Node versions. ESLint runs independently of Vue CLI with TypeScript and Vue parsers.

All application modules and tests use `.ts`; every Vue component uses `<script lang="ts">` with `defineComponent` for inference. Shared domain contracts live in `src/types/museum.ts`. Global UI component declarations describe the registered UI components; Vuetify's framework entry point reuses its published types. TypeScript `strict` mode applies throughout the app and tests. Template expressions and known component prop types are checked, while `strictTemplates` remains disabled for Vue 2 compatibility with reserved attributes such as `key`. Babel configuration lives in `babel.config.json`, and Vue CLI settings live in the `vue` section of `package.json`.

## Structure

```text
src/
  views/                  Route-level pages and page-specific interactions
  components/
    layout/               Application shell, header, and footer
    collection/           Collection controls, gallery, cards, and details
  services/               HTTP client and museum API operations
  utils/                  Pure sampling and metadata functions
  types/                  Domain contracts and global component declarations
  router/                 Route definitions
  styles/                 Global styles
  plugins/                Vue plugin configuration
```

`ArtworkCollection` follows the original component flow: search for matching IDs, select random IDs for a department, and load the artworks. The refresh button and count selector reuse the IDs already fetched. Artwork requests run together through `Promise.all`. Errors are logged to the console.

`src/services/museum.ts` contains three direct Axios operations: departments, search, and artwork details. There is no collection model, request scheduler, cancellation layer, timeout, retry flow, or partial-failure counter.

Search displays only the first page returned by `/public/collection/v1.1/search` (100 IDs by default). Department browsing samples from that first page using the original random selection behavior, so repeats are possible. The results label shows how many artworks are displayed out of the total match count. There are no pagination controls or background requests for further pages.

API requests use Axios query parameters so keywords and department names are encoded correctly. Data comes directly from the public [Met Collection API](https://metmuseum.github.io/); no API key is required. Fonts and icons also require an internet connection.

The app retains the Vue 2/Vuetify 2 architecture. A Vue 3 or build-tool migration remains a separate change.

## Netlify deployment

`netlify.toml` sets the build command to `npm run build` and publishes `dist`. Netlify reads `.nvmrc` to select Node.js 24, overriding an older Node version pinned in the site's UI. Use the same version locally with `nvm use`.

If `vue-tsc` fails with `SyntaxError: Unexpected token '.'` at an optional-chaining expression, check the Node version near the start of the deploy log. The build must use the repository's `.nvmrc` version. Header, page, and redirect checks depend on a successful deploy and may all fail when the build stops.

The museum retired `/public/collection/v1/search` on October 1, 2026. Only search uses `v1.1`; departments and individual artwork details continue to use `v1`. See the [Met API migration guide](https://metmuseum.github.io/#migrating-from-v1search).

## Code style

ESLint configuration lives in `.eslintrc.json`. Use `npm run lint` to check the app and tests, or `npm run lint:fix` to apply formatting fixes.

Use multiline blocks with braces, explicit arrow-function returns, two-space indentation, single quotes in scripts, semicolons, and separate lines for object properties and Vue attributes. Use clear state names and separate dense expressions into named values. Indexed loops, increment/decrement operators, and manual `+=`/`-=` counters are rejected by lint. These rules preserve the simple loading flow described above.
