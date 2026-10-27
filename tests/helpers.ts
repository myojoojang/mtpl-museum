import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import type { MuseumHttpClient } from '../src/types/museum';

// Test fixtures represent the unvalidated HTTP boundary. The production API
// chooses the response type; keep that one assertion inside this adapter.
export function httpClient(
  handler: (path: string, options?: AxiosRequestConfig) => Promise<unknown>,
): MuseumHttpClient {
  return {
    async get<T>(path: string, options?: AxiosRequestConfig): Promise<{ data: T }> {
      return { data: await handler(path, options) as T };
    },
  };
}

export function deferred<T>(): { promise: Promise<T>; resolve(value: T): void } {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(fulfill => { resolve = fulfill; });
  return { promise, resolve };
}

export function createTrackedRequest() {
  const source = axios.CancelToken.source();
  return {
    token: source.token,
    cancelled: false,
    cancel() {
      this.cancelled = true;
      source.cancel();
    },
  };
}
