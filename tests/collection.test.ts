import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import { collectionApi } from '../src/services/collectionApi';
import { sampleItems } from '../src/utils/sampleItems';
import { flattenObject } from '../src/utils/flattenObject';

const originalAdapter = axios.defaults.adapter;

afterEach(() => {
  axios.defaults.adapter = originalAdapter;
});

function mockHttp(handler: (config: AxiosRequestConfig) => Promise<unknown>): void {
  axios.defaults.adapter = async (config) => {
    return {
      data: await handler(config),
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  };
}

test('search uses the first v1.1 page and preserves the original filters', async () => {
  const calls: AxiosRequestConfig[] = [];

  mockHttp(async (config) => {
    calls.push(config);

    return {
      total: 0,
      objectIDs: null,
    };
  });
  assert.deepEqual(await collectionApi.search({ keyword: 'art & design?' }), {
    ids: [],
    total: 0,
  });
  assert.equal(calls[0].url, 'https://collectionapi.metmuseum.org/public/collection/v1.1/search');
  assert.deepEqual(calls[0].params, {
    q: 'art & design?',
    hasImages: true,
    isHighlight: true,
  });
  await collectionApi.search({
    keyword: 'Arms and Armor',
    departmentId: 4,
  });
  assert.deepEqual(calls[1].params, {
    q: 'Arms and Armor',
    hasImages: true,
    departmentId: 4,
  });
});

test('departments and artwork details retain their supported v1 routes', async () => {
  const urls: string[] = [];

  mockHttp(async (config) => {
    urls.push(config.url || '');
    if (config.url?.endsWith('/departments')) {
      return {
        departments: [{
          departmentId: 4,
          displayName: 'Arms and Armor',
        }],
      };
    }

    return { objectID: 1 };
  });
  const departments = await collectionApi.getDepartments();
  const artworks = await collectionApi.getArtworks([1]);

  assert.equal(departments[0].departmentId, 4);
  assert.equal(artworks[0].objectID, 1);
  assert.deepEqual(urls, [
    'https://collectionapi.metmuseum.org/public/collection/v1/departments',
    'https://collectionapi.metmuseum.org/public/collection/v1/objects/1',
  ]);
});

test('selected artworks start together without a request limit', async () => {
  const started: number[] = [];
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });

  mockHttp(async (config) => {
    const objectID = Number(config.url?.split('/').pop());

    started.push(objectID);
    await pending;

    return { objectID };
  });
  const ids = [1, 2, 3, 4, 5, 6];
  const loading = collectionApi.getArtworks(ids);

  await new Promise<void>((resolve) => {
    setImmediate(resolve);
  });
  assert.deepEqual(started, ids);
  release();
  const artworks = await loading;

  assert.deepEqual(artworks.map((artwork) => {
    return artwork.objectID;
  }), ids);
});

test('artwork failures reject without partial-failure tracking', async () => {
  mockHttp(async () => {
    throw new Error('Unavailable');
  });
  await assert.rejects(collectionApi.getArtworks([1]), /Unavailable/);
  assert.deepEqual(await collectionApi.getArtworks([]), []);
});

test('department selection keeps the original random selection behavior', () => {
  const ids = [1, 2, 3];

  assert.deepEqual(sampleItems(ids, 50, () => {
    return 0;
  }), [1, 1, 1]);
  assert.deepEqual(sampleItems([], 10), []);
  assert.deepEqual(sampleItems(ids, 2, () => {
    return 0.99;
  }), [3, 3]);
  assert.deepEqual(ids, [1, 2, 3]);
});

test('metadata retains nested fields, false, and zero', () => {
  assert.deepEqual(flattenObject({
    title: 'Artwork',
    empty: '',
    missing: null,
    isPublicDomain: false,
    count: 0,
    tags: [{ term: 'Art' }, { term: 'Painting' }],
    measurements: { width: 12 },
  }), {
    title: 'Artwork',
    isPublicDomain: false,
    count: 0,
    'tags.0.term': 'Art',
    'tags.1.term': 'Painting',
    'measurements.width': 12,
  });
});
