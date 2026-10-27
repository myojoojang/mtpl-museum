import test from 'node:test';
import assert from 'node:assert/strict';
import { createMuseumApi } from '../src/services/museum-api';
import { sampleIds } from '../src/utils/sampling';
import { flattenArtwork } from '../src/utils/artwork';
import type { AxiosRequestConfig } from 'axios';
import { httpClient } from './helpers';

const tick = () => new Promise<void>(resolve => setImmediate(resolve));

test('department samples contain distinct IDs and handle small or empty collections', () => {
  const ids = [1, 1, 2, 3];
  assert.deepEqual(sampleIds(ids, 50, () => 0), [1, 2, 3]);
  assert.deepEqual(sampleIds([], 10), []);
  assert.deepEqual(sampleIds(ids, 2, () => 0.99), [3, 1]);
  assert.deepEqual(ids, [1, 1, 2, 3]);
});

test('search passes special characters as query parameters and normalizes no results', async () => {
  const calls: Array<[string, AxiosRequestConfig?]> = [];
  const api = createMuseumApi(httpClient(async (...args) => {
    calls.push(args);
    return { total: 0, objectIDs: null };
  }));
  assert.deepEqual(await api.search({ keyword: 'art & design?', offset: 10, limit: 10 }), { ids: [], total: 0 });
  assert.deepEqual(calls[0], ['/v1.1/search', { params: {
    hasImages: true, q: 'art & design?', isHighlight: true, offset: 10, limit: 10,
  } }]);
  await api.search({ keyword: 'Arts & Crafts', departmentId: 4, offset: 0, limit: 50 });
  assert.deepEqual(calls[1][1]?.params, { hasImages: true, departmentId: 4, offset: 0, limit: 50 });
});

test('artwork loading caps concurrency, preserves order, and reports partial failures', async () => {
  let active = 0;
  let maximum = 0;
  const api = createMuseumApi(httpClient(async path => {
    const id = Number(path.split('/').pop());
    active += 1;
    maximum = Math.max(active, maximum);
    await tick();
    active -= 1;
    if (id === 3) throw new Error('Unavailable');
    return { objectID: id };
  }));
  const result = await api.getArtworks(Array.from({ length: 15 }, (_, index) => index));
  assert.equal(maximum, 5);
  assert.equal(result.failed, 1);
  assert.deepEqual(result.artworks.map(item => item.objectID),
    Array.from({ length: 15 }, (_, index) => index).filter(id => id !== 3));
});

test('empty collections make no object requests', async () => {
  const api = createMuseumApi(httpClient(async () => { throw new Error('Unexpected request'); }));
  assert.deepEqual(await api.getArtworks([]), { artworks: [], failed: 0 });
});

test('cancellation stops workers instead of reporting ordinary failures', async () => {
  const cancellation = new Error('Cancelled');
  let calls = 0;
  const api = createMuseumApi(httpClient(async () => {
    calls += 1;
    throw cancellation;
  }), error => error === cancellation);
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

test('departments and object details retain their supported v1 routes', async () => {
  const paths: string[] = [];
  const api = createMuseumApi(httpClient(async path => {
    paths.push(path);
    return path.endsWith('/departments')
      ? { departments: [{ departmentId: 4, displayName: 'Arms and Armor' }] }
      : { objectID: 1 };
  }));
  await api.getDepartments();
  await api.getArtworks([1]);
  assert.deepEqual(paths, ['/v1/departments', '/v1/objects/1']);
});
