# Metropolitan Museum Explorer

Browse departments and search highlights from The Metropolitan Museum of Art's collection. Built with Vue 2, Vue Router, Vuetify 2, and Axios.

## Development

```sh
npm ci
npm run serve
```

```sh
npm run lint
npm test
npm run build
```

The dependency-free regression tests use Node.js 18 or newer. This project retains its existing Vue CLI 4 toolchain; on modern Node versions, the build script enables the OpenSSL legacy provider required by Webpack 4.

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
  router/                 Route definitions
  styles/                 Global styles
  plugins/                Vue plugin configuration
```

Pages describe the collection to load through a single `query` object (`keyword`, plus `departmentId` for department browsing). `ArtworkCollection` connects that query to a model and owns the model's lifetime. `ArtworkGallery`, `ArtworkCard`, and `ArtworkDetailsDialog` receive data through props and report actions through events; they do not fetch collection data.

`createCollection` owns pagination, sampling, retry decisions, cancellation, and protection against stale responses. Its dependencies are injected, its state is local to each mounted collection, and it has no Vue or browser dependency. The component makes that state reactive through Vue's `data` option and calls `dispose()` when destroyed. Request handles stay private to the model.

The service layer owns HTTP details and bounded object fetching. Pure utilities stay independent of services and components. Tests import the API, model, and utilities directly, without extracting component source or evaluating it in a VM.

Search submits a trimmed keyword and shows ten highlights per page. Department browsing samples distinct artwork IDs with an adjustable count. Artwork requests run at most five at a time, preserve result order, and report partial failures. Changing searches or closing a department cancels pending requests; stale responses cannot replace the active collection.

API requests use Axios query parameters so keywords and department names are encoded correctly. Data comes directly from the public [Met Collection API](https://metmuseum.github.io/); no API key is required. Fonts and icons also require an internet connection.

The existing framework versions are preserved. A framework or dependency upgrade should be handled separately from this behavior-focused refactor.
