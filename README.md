# Metropolitan Museum Explorer

Browse departments and search highlights from The Metropolitan Museum of Art's collection. Built with TypeScript, Vue 2.7, Vue Router, Vuetify 2, and Axios.

## Development

```sh
npm ci
npm run serve
```

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

Use Node.js 18 or newer. Tests run through Node's test runner with `tsx` to load TypeScript. `npm run typecheck` checks application code, Vue scripts and templates, and test code under strict TypeScript settings. `npm run build` runs that check before compiling the production bundle.

This project retains Vue CLI 4 and Vuetify 2. Vue and its template compiler are aligned on 2.7.16 for typed component props. The build and development scripts enable the OpenSSL legacy provider required by Webpack 4 on modern Node versions. ESLint runs independently of Vue CLI with TypeScript and Vue parsers.

All application modules and tests use `.ts`; every Vue component uses `<script lang="ts">` with `defineComponent` for inference. Shared domain contracts live in `src/types/museum.ts`. Global UI component declarations describe the registered UI components; Vuetify's framework entry point reuses its published types. TypeScript `strict` mode applies throughout the app and tests. Template expressions and known component prop types are checked, while `strictTemplates` remains disabled for Vue 2 compatibility with reserved attributes such as `key`. Babel configuration lives in `babel.config.json`, and Vue CLI settings live in the `vue` section of `package.json`.

## Structure

```text
src/
  views/                  Route-level pages and page-specific interactions
  components/
    layout/               Application shell, header, and footer
    collection/           Collection controls, gallery, cards, and details
  models/                 Collection state and asynchronous workflows
  services/               HTTP client and museum API operations
  utils/                  Pure sampling and metadata functions
  types/                  Domain contracts and global component declarations
  router/                 Route definitions
  styles/                 Global styles
  plugins/                Vue plugin configuration
```

Pages describe the collection to load through a single `query` object (`keyword`, plus `departmentId` for department browsing). `ArtworkCollection` connects that query to a model and owns the model's lifetime. `ArtworkGallery`, `ArtworkCard`, and `ArtworkDetailsDialog` receive data through props and report actions through events; they do not fetch collection data.

`createCollection` owns pagination, sampling, retry decisions, cancellation, and protection against stale responses. Its dependencies are injected, its state is local to each mounted collection, and it has no Vue or browser dependency. The component makes that state reactive through Vue's `data` option and calls `dispose()` when destroyed. Request handles stay private to the model.

The service layer owns HTTP details and bounded object fetching. Pure utilities stay independent of services and components. Tests import the API, model, and utilities directly, without extracting component source or evaluating it in a VM.

Search submits a trimmed keyword and shows ten highlights per page. Department browsing samples distinct artwork IDs with an adjustable count. Artwork requests run at most five at a time, preserve result order, and report partial failures. Changing searches or closing a department cancels pending requests; stale responses cannot replace the active collection.

API requests use Axios query parameters so keywords and department names are encoded correctly. Data comes directly from the public [Met Collection API](https://metmuseum.github.io/); no API key is required. Fonts and icons also require an internet connection.

The app retains the Vue 2/Vuetify 2 architecture. A Vue 3 or build-tool migration remains a separate change.
