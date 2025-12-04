export type QueueItem = {
  /**
   * Weight for the item.
   * Only used in weighted algorithms.
   */
  weight?: number;

  /**
   * Main data for the QueueItem
   */
  // deno-lint-ignore no-explicit-any -- Any arbitrary data may be used
  data: any;
}

export type Scheduler = (item: QueueItem, items: QueueItem[]) => QueueItem[];
