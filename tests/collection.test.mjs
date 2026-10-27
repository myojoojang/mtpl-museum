import test from 'node:test';
import assert from 'node:assert/strict';
import { createCollection } from '../src/models/collection.mjs';

function collection(overrides = {}) {
  return createCollection({
    api: {
      search: async () => ({ ids: [1, 2, 3], total: 3 }),
      getArtworks: async ids => ({ artworks: ids.map(objectID => ({ objectID })), failed: 0 }),
      ...overrides,
    },
    createRequest: () => ({ token: {}, cancelled: false, cancel() { this.cancelled = true; } }),
    isCancelled: error => error.cancelled,
  });
}

test('a newer search wins even if the previous response arrives later', async () => {
  let resolveOld;
  const model = collection({
    search: ({ keyword }) => keyword === 'art'
      ? new Promise(resolve => { resolveOld = resolve; })
      : Promise.resolve({ ids: [2], total: 1 }),
  });
  const oldSearch = model.load({ keyword: 'art' });
  await model.load({ keyword: 'new' });
  resolveOld({ ids: [1], total: 1 });
  await oldSearch;
  assert.equal(model.state.artworks[0].objectID, 2);
  assert.equal(model.state.loading, false);
});

test('search failure clears loading and retry searches again', async () => {
  let attempts = 0;
  const model = collection({
    search: async () => {
      if (attempts++ === 0) throw new Error('Offline');
      return { ids: [], total: 0 };
    },
  });
  await model.load({ keyword: 'art' });
  assert.equal(model.state.loading, false);
  assert.match(model.state.error, /Unable to load the collection/);
  await model.retry();
  assert.equal(attempts, 2);
  assert.equal(model.state.error, '');
});

test('search loads only the selected page and resets the page for a new query', async () => {
  let selected;
  const model = collection({
    search: async () => ({ ids: Array.from({ length: 1000 }, (_, i) => i), total: 1000 }),
    getArtworks: async ids => {
      selected = ids;
      return { artworks: ids.map(objectID => ({ objectID })), failed: 0 };
    },
  });
  await model.load({ keyword: 'art' });
  await model.setPage(2);
  assert.deepEqual(selected, [10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  await model.load({ keyword: 'painting' });
  assert.equal(model.state.page, 1);
  assert.deepEqual(selected, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
});

test('artwork failures retry the page without repeating the search', async () => {
  let searches = 0;
  let attempts = 0;
  const model = collection({
    search: async () => { searches += 1; return { ids: [1], total: 1 }; },
    getArtworks: async () => attempts++ === 0
      ? { artworks: [], failed: 1 }
      : { artworks: [{ objectID: 1 }], failed: 0 },
  });
  await model.load({ keyword: 'art' });
  assert.equal(model.state.loading, false);
  assert.equal(model.state.failed, 1);
  assert.match(model.state.error, /Unable to load artworks/);
  await model.retry();
  assert.equal(searches, 1);
  assert.equal(model.state.artworks[0].objectID, 1);
  assert.equal(model.state.error, '');
});

test('department sample sizes are bounded by unique IDs', async () => {
  const model = collection({ search: async () => ({ ids: [1, 1, 2, 3], total: 4 }) });
  await model.load({ keyword: 'Department', departmentId: 4 });
  await model.setPageSize(50);
  assert.equal(model.state.pageSize, 50);
  assert.equal(model.state.artworks.length, 3);
  assert.equal(new Set(model.state.artworks.map(item => item.objectID)).size, 3);
});

test('disposing cancels the active request and ignores late responses', async () => {
  let resolveSearch;
  let current;
  const model = createCollection({
    api: {
      search: () => new Promise(resolve => { resolveSearch = resolve; }),
      getArtworks: () => { throw new Error('Must not request after disposal'); },
    },
    createRequest: () => {
      current = { token: {}, cancelled: false, cancel() { this.cancelled = true; } };
      return current;
    },
    isCancelled: () => false,
  });
  const pending = model.load({ keyword: 'art' });
  model.dispose();
  resolveSearch({ ids: [1], total: 1 });
  await pending;
  assert.equal(current.cancelled, true);
  assert.equal(model.state.loading, false);
  assert.equal(model.state.total, 0);
  await model.load({ keyword: 'another' });
  assert.equal(model.state.total, 0);
});

test('a late artwork response cannot overwrite the next collection', async () => {
  let resolveArtworks;
  const model = collection({
    search: async ({ keyword }) => ({ ids: [keyword === 'old' ? 1 : 2], total: 1 }),
    getArtworks: async ids => ids[0] === 1
      ? new Promise(resolve => { resolveArtworks = resolve; })
      : { artworks: [{ objectID: 2 }], failed: 0 },
  });
  const pending = model.load({ keyword: 'old' });
  await new Promise(resolve => setImmediate(resolve));
  await model.load({ keyword: 'new' });
  resolveArtworks({ artworks: [{ objectID: 1 }], failed: 0 });
  await pending;
  assert.deepEqual(model.state.artworks, [{ objectID: 2 }]);
});

test('separate galleries own independent state and request lifetimes', async () => {
  const first = collection();
  const second = collection();
  await Promise.all([first.load({ keyword: 'art' }), second.load({ keyword: 'painting' })]);
  await first.setPageSize(5);
  first.dispose();
  assert.equal(second.state.pageSize, 10);
  assert.equal(second.state.artworks.length, 3);
  await second.refresh();
  assert.equal(second.state.error, '');
});
