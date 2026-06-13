import type { HttpClient, RequestOptions } from "../http/http-client";
import type { BuildRequestInput } from "../http/request-builder";
import { attachMeta } from "../meta";

/** Shared base for resource namespaces. Holds the {@link HttpClient}. */
export abstract class BaseResource {
  constructor(protected readonly http: HttpClient) {}

  /** Performs a request and returns the data with {@link ResponseMeta} attached. */
  protected async call<T>(
    input: BuildRequestInput,
    options?: RequestOptions,
  ): Promise<T> {
    const { data, meta } = await this.http.request<T>(input, options);
    return attachMeta(data, meta);
  }
}
