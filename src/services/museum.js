import axios from "axios";
import { createMuseumApi } from "./museum-api.mjs";

const client = axios.create({
  baseURL: "https://collectionapi.metmuseum.org/public/collection/v1",
  timeout: 20000,
});

export const museumApi = createMuseumApi(client, axios.isCancel);
export const createRequest = () => axios.CancelToken.source();
export const isCancelled = axios.isCancel;
