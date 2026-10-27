import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { createMuseumApi, sampleIds } from '../src/services/museum-api.mjs';
import { flattenArtwork } from '../src/utils/artwork.mjs';

const tick = () => new Promise(resolve => setImmediate(resolve));

test('department samples contain distinct IDs and handle small or empty collections', () => {
  const ids = [1, 1, 2, 3];
  assert.deepEqual(sampleIds(ids, 50, () => 0), [1, 2, 3]);
  assert.deepEqual(sampleIds([], 10), []);
  assert.deepEqual(sampleIds(ids, 2, () => 0.99), [3, 1]);
  assert.deepEqual(ids, [1, 1, 2, 3]);
});

test('search passes special characters as query parameters and normalizes no results', async () => {
  const calls = [];
  const api = createMuseumApi({ get: async (...args) => {
    calls.push(args);
    return { data: { total: 0, objectIDs: null } };
  } });
  assert.deepEqual(await api.search({ keyword: 'art & design?' }), { ids: [], total: 0 });
  assert.deepEqual(calls[0], ['/search', { params: {
    hasImages: true, q: 'art & design?', isHighlight: true,
  } }]);
  await api.search({ keyword: 'Arts & Crafts', departmentId: 4 });
  assert.deepEqual(calls[1][1].params, { hasImages: true, q: 'Arts & Crafts', departmentId: 4 });
});

test('artwork loading caps concurrency, preserves order, and reports partial failures', async () => {
  let active = 0;
  let maximum = 0;
  const api = createMuseumApi({ get: async path => {
    const id = Number(path.split('/').pop());
    active += 1;
    maximum = Math.max(active, maximum);
    await tick();
    active -= 1;
    if (id === 3) throw new Error('Unavailable');
    return { data: { objectID: id } };
  } });
  const result = await api.getArtworks(Array.from({ length: 15 }, (_, index) => index));
  assert.equal(maximum, 5);
  assert.equal(result.failed, 1);
  assert.deepEqual(result.artworks.map(item => item.objectID),
    Array.from({ length: 15 }, (_, index) => index).filter(id => id !== 3));
});

test('empty collections make no object requests', async () => {
  const api = createMuseumApi({ get: () => { throw new Error('Unexpected request'); } });
  assert.deepEqual(await api.getArtworks([]), { artworks: [], failed: 0 });
});

test('cancellation stops workers instead of reporting ordinary failures', async () => {
  const cancellation = new Error('Cancelled');
  let calls = 0;
  const api = createMuseumApi({ get: async () => {
    calls += 1;
    throw cancellation;
  } }, error => error === cancellation);
  await assert.rejects(api.getArtworks(Array.from({ length: 20 }, (_, i) => i)), cancellation);
  assert.equal(calls, 5);
});

test('metadata preserves nested fields, false and zero without rendering objects', () => {
  assert.deepEqual(flattenArtwork({
    title: 'Artwork', empty: '', missing: null, isPublicDomain: false, count: 0,
    tags: [{ term: 'Art' }, { term: 'Painting' }], measurements: { width: 12 },
  }), {
    title: 'Artwork', isPublicDomain: false, count: 0,
    'tags.0.term': 'Art', 'tags.1.term': 'Painting', 'measurements.width': 12,
  });
});

// Exercise the gallery's real script without a browser or a second test toolchain.
function gallery(api) {
  const source = readFileSync(new URL('../src/components/partial/Displays.vue', import.meta.url), 'utf8')
    .split('<script>')[1].split('</script>')[0]
    .replace(/^import .*;$/gm, '').replace('export default', 'component =');
  const context = {
    component: null, DisplayBox: {}, museumApi: api, sampleIds,
    createRequest: () => ({ token: {}, cancelled: false, cancel() { this.cancelled = true; } }),
    isCancelled: error => error.cancelled,
  };
  vm.runInNewContext(source, context);
  const component = context.component;
  const instance = { ...component.data(), isSearchReq: true, searchKeyword: 'art', depData: {} };
  Object.entries(component.methods).forEach(([name, method]) => { instance[name] = method.bind(instance); });
  return instance;
}

test('a newer search wins even if the previous response arrives later', async () => {
  let resolveOld;
  const instance = gallery({
    search: ({ keyword }) => keyword === 'art'
      ? new Promise(resolve => { resolveOld = resolve; })
      : Promise.resolve({ ids: [2], total: 1 }),
    getArtworks: async ids => ({ artworks: ids.map(objectID => ({ objectID })), failed: 0 }),
  });
  const oldSearch = instance.loadCollection();
  const oldRequest = instance.request;
  instance.searchKeyword = 'new';
  await instance.loadCollection();
  resolveOld({ ids: [1], total: 1 });
  await oldSearch;
  assert.equal(oldRequest.cancelled, true);
  assert.equal(instance.artworks[0].objectID, 2);
  assert.equal(instance.loading, false);
});

test('search failure clears loading and retry searches again', async () => {
  let attempts = 0;
  const instance = gallery({
    search: async () => {
      if (attempts++ === 0) throw new Error('Offline');
      return { ids: [], total: 0 };
    },
    getArtworks: async () => ({ artworks: [], failed: 0 }),
  });
  await instance.loadCollection();
  assert.equal(instance.loading, false);
  assert.match(instance.error, /Unable to load the collection/);
  instance.retry();
  await tick();
  assert.equal(attempts, 2);
  assert.equal(instance.error, '');
});

test('search requests only the selected page and reports total artwork failure', async () => {
  let selected;
  const instance = gallery({
    getArtworks: async ids => {
      selected = ids;
      return { artworks: [], failed: ids.length };
    },
  });
  instance.ids = Array.from({ length: 1000 }, (_, i) => i);
  instance.page = 2;
  await instance.loadArtworks();
  assert.deepEqual(Array.from(selected), [10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  assert.equal(instance.loading, false);
  assert.equal(instance.failed, 10);
  assert.match(instance.error, /Unable to load artworks/);
});
