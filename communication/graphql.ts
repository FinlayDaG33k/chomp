export class GraphQL {
  private _variables = {};
  private _query: string = 'query{}';
  
  public constructor(
    private readonly endpoint = '/graphql'
  ) {
  }
  
  public execute() {
    return fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        query: this._query,
        variables: this._variables
      })
    }).then(r => r.json());
  }

  /**
   * Set our query string
   *
   * @param query
   * @return The instance of this class
   */

  public setQuery(query: string): GraphQL {
    this._query = query;
    return this;
  }

  /**
   * Add a variable to our variables object
   *
   * @param key
   * @param value
   * @return The instance of this class
   */
  public addVariable(key: string, value: string): GraphQL {
   this._variables[key] = value;
   return this;
  }
}
