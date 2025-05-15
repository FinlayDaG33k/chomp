import { Cache } from "../core/cache.ts";

type Auth = {
  username: string;
  password: string;
}

type CouchRequest = {
  method: string;
  // deno-lint-ignore no-explicit-any -- TODO: Figure out proper type
  headers: any;
  body?: string;
}

type CouchSuccess = {
  ok: true;
  // deno-lint-ignore no-explicit-any -- Any arbitrary data may be used
  data: any;
}

type CouchError = {
  ok: false;
  error: {
    error: string;
    reason: string;
  }
}

type CachedResponse = {
  etag: string;
  // deno-lint-ignore no-explicit-any -- Any arbitrary data may be used
  data: any;
}

export type CouchResponse = {
  status: number;
  statusText: string;
} & (CouchSuccess | CouchError)

export interface CouchOverrides {
  method?: string;
  etag?: string;
}

/**
 * Interact with {@link https://couchdb.apache.org/ Apache CouchDB}.
 */
export class CouchDB {
  private auth = "";

  /**
   * @example
   * ```ts
   * import { CouchDB } from "https://deno.land/x/chomp/communication/couchdb.ts";
   *
   * const couchdb = new CouchDB(
   *   'http://localhost:5984',
   *   'my_database',
   *   {
   *     username: 'couchuser',
   *     password: 'lamepassword'
   *   }
   * );
   * ```
   *
   * @param host
   * @param database
   * @param auth
   */
  public constructor(
    private readonly host: string = "http://localhost:5984",
    private readonly database: string,
    auth: Auth = { username: "", password: "" },
  ) {
    this.auth = btoa(`${auth.username}:${auth.password}`);
  }

  /**
   * Update the username for this instance.
   * This does *not* update the username on the server.
   *
   * @example
   * ```ts
   * import { CouchDB } from "https://deno.land/x/chomp/communication/couchdb.ts";
   *
   * const couchdb = new CouchDB();
   * couchdb.username = 'couchuser';
   * ```
   *
   * @param username
   */
  public set username(username: string) {
    // Get the password from the data
    const password = atob(this.auth).split(":")[1];

    // Update auth string
    this.auth = btoa(`${username}:${password}`);
  }

  /**
   * Update the password for this instance.
   * This does *not* update the password on the server.
   *
   * @example
   * ```ts
   * import { CouchDB } from "https://deno.land/x/chomp/communication/couchdb.ts";
   *
   * const couchdb = new CouchDB();
   * couchdb.password = 'lamepassword';
   * ```
   *
   * @param password
   */
  public set password(password: string) {
    // Get the password from the data
    const username = atob(this.auth).split(":")[0];

    // Update auth string
    this.auth = btoa(`${username}:${password}`);
  }

  /**
   * Get the name of the database we're working with
   *
   * @example
   * ```ts
   * import { CouchDB } from "https://deno.land/x/chomp/communication/couchdb.ts";
   *
   * const couchdb = new CouchDB(...);
   * const database = couchdb.databaseName;
   * ```
   */
  public get databaseName(): string {
    return this.database;
  }

  /**
   * Get a document from the database.
   *
   * **Note**: Responses will always be stored in cache, regardless of the `cache` parameter.
   *
   * @example
   * ```ts
   * import { CouchDB } from "https://deno.land/x/chomp/communication/couchdb.ts";
   *
   * const couchdb = new CouchDB(...);
   * const existing = await couchdb.get('my-key');
   *
   * if(existing.status === 404) {
   *   // Handle non-existing document
   * }
   * ```
   *
   * @param id
   * @param cache
   */
  public get(id: string, cache: boolean = true): Promise<CouchResponse> {
    // Check if we want to cache
    // If not, just run the request without etag
    if(!cache) return this.raw(id);

    // Get the etag from cache
    const cached = Cache.get(`chomp.couchdb.cache ${id}`) as CachedResponse|null;

    // Check if cached version was found
    // If not, run the request without etag
    if(!cached) return this.raw(id);

    // Run the request with the etag
    return this.raw(id, null, {
      etag: cached.etag,
    });
  }

  /**
   * Insert a document into the database.
   *
   * Any document passed to the method will be attempted to insert "as-is".
   * The more convenient "{@linkcode CouchDB.upsert()}" method should be used most of the time.
   *
   * @example
   * ```ts
   * import { CouchDB } from "https://deno.land/x/chomp/communication/couchdb.ts";
   *
   * const couchdb = new CouchDB(...);
   * const resp = await couchdb.insert({
   *   '_id': 'my-key',
   *   'data': 'my-data',
   * });
   *
   * if(resp.status !== 201) {
   *   // Handle insert error
   * }
   * ```
   *
   * @param data
   */
  // deno-lint-ignore no-explicit-any -- Any arbitrary data may be used
  public insert(data: any): Promise<CouchResponse> {
    return this.raw("", data);
  }

  /**
   * Update a document in the database.
   *
   * This is only useful if you know the latest revision.
   * The more convenient "{@linkcode CouchDB.upsert()}" should be used most of the time.
   *
   * @example
   * ```ts
   * import { CouchDB } from "https://deno.land/x/chomp/communication/couchdb.ts";
   *
   * const couchdb = new CouchDB(...);
   * const resp = await couchdb.update(`my-key`, '1-abcdef', 'my-data');
   *
   * if(resp.status !== 201) {
   *   // Handle update error
   * }
   * ```
   *
   * @param id
   * @param revision
   * @param data
   */
  // deno-lint-ignore no-explicit-any -- Any arbitrary data may be used
  public update(id: string, revision: string, data: any): Promise<CouchResponse> {
    // Make sure the id and revision are set in the data
    if (!data["_id"] || data["_id"] !== id) data["_id"] = id;
    if (!data["_rev"] || data["_rev"] !== revision) data["_rev"] = revision;

    return this.raw(id, data, { method: "PUT" });
  }

  /**
   * Update or insert a document into the database.
   * This method will automatically check if an existing document exists and try to update it.
   * If no document exists, it will be created instead.
   *
   * @example
   * ```ts
   * import { CouchDB } from "https://deno.land/x/chomp/communication/couchdb.ts";
   *
   * const couchdb = new CouchDB(...);
   * const resp = await couchdb.upsert(`my-key`, 'my-data');
   *
   * if(resp.status !== 201) {
   *   // Handle upsert error
   * }
   * ```
   *
   * @param id
   * @param data
   */
  // deno-lint-ignore no-explicit-any -- Any arbitrary data may be used
  public async upsert(id: string, data: any): Promise<CouchResponse> {
    // Check if a document already exists
    // Insert a new document if not
    const exists = await this.raw(id, null, { method: "GET" });
    if (exists.status === 404) {
      data["_id"] = id;
      delete data["_rev"];
      return await this.insert(data);
    }

    // Make sure we got an "OK" status before
    if(!exists.ok) return exists;

    // Update the document
    return await this.update(id, exists.data["_rev"], data);
  }

  /**
   * Delete a document from the database.
   * TODO: Automatically find revision.
   *
   * @example
   * ```ts
   * import { CouchDB } from "https://deno.land/x/chomp/communication/couchdb.ts";
   *
   * const couchdb = new CouchDB(...);
   * const existing = await couchdb.get('my-key');
   * if(existing.status === 404) return;
   * const resp = await couchdb.delete('my-key', existing.data['_rev']);
   *
   * if(resp.status !== 200) {
   *   // Handle deletion error
   * }
   * ```
   *
   * @param id
   * @param revision
   */
  public delete(id: string, revision: string): Promise<CouchResponse> {
    return this.raw(`${id}?rev=${revision}`, null, { method: "DELETE" });
  }

  /**
   * Execute a view design
   *
   * @example
   * ```ts
   * import { CouchDB } from "https://deno.land/x/chomp/communication/couchdb.ts";
   *
   * const couchdb = new CouchDB(...);
   * const resp = await couchdb.viewDesign('my-design', 'my-view', 'my-partition');
   * if(resp.status !== 200) {
   *   // Handle view error
   * }
   * ```
   *
   * @param design
   * @param view
   * @param partition
   */
  public viewDesign(design: string, view: string, partition: string): Promise<CouchResponse> {
    return this.raw(`_partition/${partition}/_design/${design}/_view/${view}`);
  }

  /**
   * Find a document
   *
   * @example Basic usage
   * ```ts
   * import { CouchDB } from "https://deno.land/x/chomp/communication/couchdb.ts";
   *
   * const couchdb = new CouchDB(...);
   * const resp = await couchdb.find({"_id": "example});
   * ```
   *
   * @example Specific fields only
   * ```ts
   * import { CouchDB } from "https://deno.land/x/chomp/communication/couchdb.ts";
   *
   * const couchdb = new CouchDB(...);
   * const resp = await couchdb.find({"_id": "example}, ["_id", "_rev", "example_field"]);
   * ```
   *
   * @param selector
   * @param fields
   */
  public find(selector: any, fields: string[]|null = null): Promise<CouchResponse> {
    // Instantiate body with selector
    const body: {selector: any, fields?:string[]} = {
      selector: selector,
    };

    // Check if we want only specific fields
    if(fields !== null) body.fields = fields;

    // Execute query
    return this.raw(`_find`, body, {method: 'POST'});
  }

  /**
   * Main request handler.
   * This method is used for most of our other methods as well.
   *
   * @example
   * ```ts
   * // TODO: Write example
   * ```
   *
   * @param endpoint
   * @param body
   * @param overrides
   */
  // deno-lint-ignore no-explicit-any -- Any arbitrary data may be used
  public async raw(endpoint: string, body: any = null, overrides: CouchOverrides = {}): Promise<CouchResponse> {
    // Start building opts
    const opts: CouchRequest = {
      method: overrides["method"] ? overrides["method"] : "GET",
      headers: {
        Authorization: `Basic ${this.auth}`,
        "If-None-Match": overrides["etag"] ? overrides["etag"] : undefined,
      },
    };

    // Add body if specified
    if (body !== null) {
      opts["method"] = opts.method !== "GET" ? opts.method : "POST";
      opts["body"] = JSON.stringify(body);
      opts.headers["Content-Type"] = "application/json";
    }

    // Make sure the endpoint starts with a leading slash
    const cacheKey = endpoint;
    if (endpoint.charAt(0) !== "/" && endpoint !== "") endpoint = `/${endpoint}`;

    // Send our request
    const resp = await fetch(`${this.host}/${this.database}${endpoint}`, opts);

    // Check if we have a 304
    // If so, get data from cache
    if(resp.status === 304) {
      const cached = Cache.get(`chomp.couchdb.cache ${cacheKey}`) as CachedResponse;
      return cached.data;
    }

    // Get data from request
    let data = null;
    if (opts.method !== "HEAD") data = await resp.json();

    // Check whether we have an error
    if(!resp.ok) {
      return {
        ok: false,
        status: resp.status,
        statusText: resp.statusText,
        error: data,
      };
    }

    // Save etag and (slightly modified) response to cache
    if(resp.headers.get("etag")) Cache.set(`chomp.couchdb.cache ${cacheKey}`, {
      etag: resp.headers.get("etag"),
      data: {
        ok: true,
        status: 200,
        statusText: 'OK',
        data: data,
      },
    }, "+1 hour");

    // Return our response
    return {
      ok: true,
      status: resp.status,
      statusText: resp.statusText,
      data: data,
    };
  }
}
