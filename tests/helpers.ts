import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

export function httpClient(
  handler: (path: string, options?: AxiosRequestConfig) => Promise<unknown>,
) {
  return axios.create({ adapter: async config => ({
    data: await handler(config.url || '', config),
    status: 200, statusText: 'OK', headers: {}, config,
  }) });
}

export function deferred<T>(): { promise: Promise<T>; resolve(value: T): void } {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(fulfill => { resolve = fulfill; });
  return { promise, resolve };
}
