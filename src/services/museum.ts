import axios from "axios";
import type { CancellationCheck, RequestHandle } from "../types/museum";
import { createMuseumApi } from "./museum-api";

const client = axios.create({
  baseURL: "https://collectionapi.metmuseum.org/public/collection",
  timeout: 20000,
});

export const museumApi = createMuseumApi(client, axios.isCancel);
export const createRequest = (): RequestHandle => axios.CancelToken.source();
export const isCancelled: CancellationCheck = axios.isCancel;
