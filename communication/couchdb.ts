interface Auth {
  username: string;
  password: string;
}

export interface CouchResponse {
  status: number;
  statusText: string;
  data?: any;
  error?: {
    error: string;
    reason: string;
  };
}

interface CouchOverrides {
  method?: string;
}

export class CouchDB {
  private auth = '';

  public constructor(
    private readonly host: string = 'http://localhost:5984',
    private readonly database: string,
    auth: Auth = {username: '', password: ''},
  ) {
    this.auth = btoa(`${auth.username}:${auth.password}`);
  }

  /**
   * Update the username for this instance.
   * This does *not* update the username on the server.
   *
   * @param username
   */
  public set username(username: string): void {
    // Get the password from the data
    const password = atob(this.auth).split(':')[1];

    // Update auth string
    this.auth = btoa(`${username}:${password}`);
  }

  /**
   * Update the password for this instance.
   * This does *not* update the password on the server.
   *
   * @param password
   */
  public set password(password: string): void {
    // Get the password from the data
    const username = atob(this.auth).split(':')[0];

    // Update auth string
    this.auth = btoa(`${username}:${password}`);
  }

  /**
   * Get a document from the database.
   *
   * @param id
   */
  public async get(id: string): Promise<CouchResponse> {
    return await this.raw(id);
  }

  /**
   * Insert a document into the database.
   *
   * @param data
   */
  public async insert(data: any): Promise<CouchResponse> {
    return await this.raw('', data);
  }

  /**
   * Update a document in the database.
   * This is only useful if you know the latest revision, otherwise see the "upsert" method instead.
   *
   * @param id
   * @param revision
   * @param data
   */
  public async update(id: string, revision: string, data: any): Promise<CouchResponse> {
    // Make sure the id and revision are set in the data
    if(!data['_id'] || data['_id'] !== id) data['_id'] = id;
    if(!data['_rev'] || data['_rev'] !== revision) data['_rev'] = revision;

    return await this.raw(id, data, { method: 'PUT' });
  }

  /**
   * Update or insert a document into the database.
   * This method will automatically check if an existing document exists and try to update it.
   * If no document exists, it will be created instead.
   *
   * @param id
   * @param data
   */
  public async upsert(id: string, data: any): Promise<CouchResponse> {
    // Check if a document already exists
    // Insert a new document if not
    const exists = await this.raw(id, null, { method: 'GET' });
    if(exists.status === 404) {
      data['_id'] = id;
      return await this.insert(data);
    }

    // Update the document
    return await this.update(id, exists.data['_rev'], data);
  }

  /**
   * Delete a document from the database.
   *
   * @param id
   */
  public async delete(id: string, revision: string): Promise <CouchResponse> {
    return await this.raw(`${id}?rev=${revision}`, null, { method: 'DELETE' });
  }

  /**
   * Main request handler.
   * This method is used for most of our other methods as well.
   *
   * @param endpoint
   * @param body
   * @param overrides
   */
  public async raw(endpoint: string, body: any = null, overrides: CouchOverrides = {}): Promise<CouchResponse> {
    // Start building opts
    const opts: any = {
      method: overrides['method'] ? overrides['method'] : 'GET',
      headers: {
        Authorization: `Basic ${this.auth}`,
      }
    };

    // Add body if specified
    if(body !== null) {
      opts['method'] = opts.method !== 'GET' ? opts.method : 'POST';
      opts['body'] = JSON.stringify(body);
      opts.headers['Content-Type'] = 'application/json';
    }

    // Make sure the endpoint starts with a leading slash
    if(endpoint.charAt(0) !== '/' && endpoint !== '') endpoint = `/${endpoint}`;

    // Send our request and get the response
    const resp = await fetch(`${this.host}/${this.database}${endpoint}`, opts);
    let data = null;
    if(opts.method !== 'HEAD') data = await resp.json();

    // Prepare our CouchResponse
    const couchResponse = {
      status: resp.status,
      statusText: resp.statusText,
    };

    // Check whether we have an error
    if(resp.ok) {
      couchResponse['data'] = data;
    } else {
      couchResponse['error'] = data;
    }

    return couchResponse;
  }
}
