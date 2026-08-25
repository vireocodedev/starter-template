import type { QueryEngineHttpClient, QueryEngineRequestOptions } from "@vireocodedev/starter-queryengine";
import { appAxios } from "@/app/data/network/clients/AppAxiosClient";

export class AppQueryEngineHttpClient implements QueryEngineHttpClient {
  async get(path: string, options?: QueryEngineRequestOptions): Promise<unknown> {
    const response = await appAxios.get(`queryengine/${path}`, {
      params: options?.params,
      signal: options?.signal,
    });
    return response.data;
  }
}
