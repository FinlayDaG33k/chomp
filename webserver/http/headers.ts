export class Headers { 
  private _headers = {
    'Content-Type': 'text/html',
  };
  
  public get(key: string|null = null): any {
    if(key) return this._headers[key];
    return this._headers;
  }

  /**
   * Set a response header
   * 
   * @param key
   * @param value
   */
  public set(key: string, value: string) {
    this._headers[key] = value;
  }
}
