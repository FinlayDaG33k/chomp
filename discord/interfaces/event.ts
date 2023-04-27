export interface Event {
  execute(opts: unknown): Promise<void>;
}
