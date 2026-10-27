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

- `src/services/`: API client, request timeout, bounded artwork loading, and unique random sampling.
- `src/components/`: home, department explorer, and keyword search views.
- `src/components/partial/`: shared gallery, artwork card, and details dialog.
- `src/components/main/`: navigation and application shell.
- `src/utils/`: artwork metadata formatting.
- `tests/`: API and metadata regression tests.

Search submits a trimmed keyword and shows ten highlights per page. Department browsing samples distinct artwork IDs with an adjustable count. Artwork requests run at most five at a time, preserve result order, and report partial failures. Changing searches or closing a department cancels pending requests; stale responses cannot replace the active collection.

API requests use Axios query parameters so keywords and department names are encoded correctly. Data comes directly from the public [Met Collection API](https://metmuseum.github.io/); no API key is required. Fonts and icons also require an internet connection.

The existing framework versions are preserved. A framework or dependency upgrade should be handled separately from this behavior-focused refactor.
