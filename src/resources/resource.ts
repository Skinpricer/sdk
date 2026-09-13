import type { HttpClient, RequestOptions } from "../http/http-client";
import type { BuildRequestInput } from "../http/request-builder";
import type { Game } from "../types/games";
import { attachMeta } from "../meta";

/** Shared base for resource namespaces. Holds the {@link HttpClient}. */
export abstract class BaseResource {
  constructor(
    protected readonly http: HttpClient,
    private readonly game?: Game,
  ) {}

  /** Performs a request and returns the data with {@link ResponseMeta} attached. */
  protected async call<T>(
    input: BuildRequestInput,
    options?: RequestOptions,
  ): Promise<T> {
    const scoped =
      this.game === undefined
        ? input
        : {
            ...input,
            baseUrl: this.http.versionedBaseUrl("v2", input.baseUrl),
            query: { ...input.query, game: this.game },
          };
    const { data, meta } = await this.http.request<T>(scoped, options);
    return attachMeta(data, meta);
  }
}
