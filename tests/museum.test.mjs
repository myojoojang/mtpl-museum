import test from 'node:test';
import assert from 'node:assert/strict';
import { createMuseumApi } from '../src/services/museum-api.mjs';
import { sampleIds } from '../src/utils/sampling.mjs';
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
