import test from 'node:test';
import assert from 'node:assert/strict';
import { createCollection } from '../src/models/collection';
import type { ArtworksResult, MuseumApi, SearchQuery, SearchResult } from '../src/types/museum';
import { createTrackedRequest, deferred } from './helpers';

function collection(overrides: Partial<Pick<MuseumApi, 'search' | 'getArtworks'>> = {}) {
  return createCollection({
    api: {
      search: async () => ({ ids: [1, 2, 3], total: 3 }),
      getArtworks: async ids => ({ artworks: ids.map(objectID => ({ objectID })), failed: 0 }),
      ...overrides,
    },
    createRequest: createTrackedRequest,
    isCancelled: error => typeof error === 'object' && error !== null && 'cancelled' in error,
  });
}

test('a newer search wins even if the previous response arrives later', async () => {
  const oldSearchResult = deferred<SearchResult>();
  const model = collection({
    search: ({ keyword }) => keyword === 'art'
      ? oldSearchResult.promise
      : Promise.resolve({ ids: [2], total: 1 }),
  });
  const oldSearch = model.load({ keyword: 'art' });
  await model.load({ keyword: 'new' });
  oldSearchResult.resolve({ ids: [1], total: 1 });
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
  let selected: readonly number[] = [];
  const requests: Array<{ offset: number; limit: number }> = [];
  const model = collection({
    search: async ({ offset, limit }) => {
      requests.push({ offset, limit });
      return { ids: Array.from({ length: Math.min(limit, 1000 - offset) }, (_, i) => offset + i), total: 1000 };
    },
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
  assert.equal(model.state.ids.length, 10);
  assert.deepEqual(requests, [{ offset: 0, limit: 10 }, { offset: 10, limit: 10 }, { offset: 0, limit: 10 }]);
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
  const searchResult = deferred<SearchResult>();
  const current = createTrackedRequest();
  const model = createCollection({
    api: {
      search: () => searchResult.promise,
      getArtworks: () => { throw new Error('Must not request after disposal'); },
    },
    createRequest: () => current,
    isCancelled: () => false,
  });
  const pending = model.load({ keyword: 'art' });
  model.dispose();
  searchResult.resolve({ ids: [1], total: 1 });
  await pending;
  assert.equal(current.cancelled, true);
  assert.equal(model.state.loading, false);
  assert.equal(model.state.total, 0);
  await model.load({ keyword: 'another' });
  assert.equal(model.state.total, 0);
});

test('a late artwork response cannot overwrite the next collection', async () => {
  const artworkResult = deferred<ArtworksResult>();
  const model = collection({
    search: async ({ keyword }) => ({ ids: [keyword === 'old' ? 1 : 2], total: 1 }),
    getArtworks: async ids => ids[0] === 1
      ? artworkResult.promise
      : { artworks: [{ objectID: 2 }], failed: 0 },
  });
  const pending = model.load({ keyword: 'old' });
  await new Promise(resolve => setImmediate(resolve));
  await model.load({ keyword: 'new' });
  artworkResult.resolve({ artworks: [{ objectID: 1 }], failed: 0 });
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

test('the search result window never exceeds the API limit of 10,000', async () => {
  const requests: SearchQuery[] = [];
  const model = collection({ search: async query => {
    requests.push(query);
    return { ids: [query.offset + 1], total: 20_000 };
  } });
  await model.load({ keyword: 'art' });
  await model.setPage(1000);
  assert.equal(requests[1].offset, 9990);
  assert.equal(requests[1].limit, 10);
  await model.setPage(1001);
  assert.equal(requests.length, 2);
  assert.equal(model.state.page, 1000);
});

test('retrying a failed search page keeps its offset', async () => {
  const offsets: number[] = [];
  let fail = true;
  const model = collection({ search: async ({ offset }) => {
    offsets.push(offset);
    if (offset === 10 && fail) { fail = false; throw new Error('Offline'); }
    return { ids: [offset + 1], total: 30 };
  } });
  await model.load({ keyword: 'art' });
  await model.setPage(2);
  assert.match(model.state.error, /Unable to load the collection/);
  await model.retry();
  assert.equal(model.state.page, 2);
  assert.deepEqual(offsets, [0, 10, 10]);
  assert.equal(model.state.artworks[0].objectID, 11);
});

test('department sampling requests a bounded window instead of enumerating every match', async () => {
  const requests: SearchQuery[] = [];
  const model = collection({ search: async query => {
    requests.push(query);
    return { ids: Array.from({ length: query.limit }, (_, i) => query.offset + i), total: 25_000 };
  } });
  await model.load({ keyword: 'Department', departmentId: 4 });
  await model.refresh();
  assert.equal(requests.length, 3);
  assert.equal(requests[0].limit, 1);
  for (const query of requests.slice(1)) {
    assert.equal(query.departmentId, 4);
    assert.ok(query.limit <= 500);
    assert.ok(query.offset >= 0 && query.offset + query.limit <= 10_000);
  }
  assert.equal(model.state.artworks.length, 10);
});

test('an empty department avoids requesting a zero-size page', async () => {
  let searches = 0;
  const model = collection({ search: async () => {
    searches += 1;
    return { ids: [], total: 0 };
  } });
  await model.load({ keyword: 'Department', departmentId: 4 });
  assert.equal(searches, 1);
  assert.equal(model.state.loading, false);
  assert.equal(model.state.artworks.length, 0);
  assert.equal(model.state.error, '');
});
