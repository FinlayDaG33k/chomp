import { QueueItem, Scheduler } from "../types/queue.ts";
import { default as defaultScheduler } from "./scheduler/first-in-first-out.ts";

/**
 * Crude yet effective in-memory Queue system
 */
export class Queue {
  private items: QueueItem[] = [];
  private readonly scheduler: Scheduler;

  public constructor(scheduler: Scheduler = defaultScheduler) {
    this.scheduler = scheduler;
  }

  /**
   * Get the number of items contained in the Queue
   *
   * @returns number
   */
  public get count(): number {
    return this.items.length;
  }

  /**
   * Check whether the Queue has any items
   *
   * @returns boolean
   */
  public get isEmpty(): boolean {
    return this.items.length === 0;
  }

  /**
   * Get the next item from the queue.
   * Unlike the Queue#peek() method, this *does* remove the item.
   *
   * @returns QueueItem
   */
  public get next(): QueueItem | null {
    // Make sure we have items in our queue
    if (this.items.length === 0) return null;

    // Return the first item in our queue and remove it
    // @ts-ignore We already return null when no items are present
    return this.items.shift();
  }

  /**
   * Get the next item from the queue.
   * Unlike the Queue#next() method, this does *not* remove the item.
   *
   * @returns QueueItem|null
   */
  public get peek(): QueueItem | null {
    // Make sure we have items in our queue
    if (this.items.length === 0) return null;

    // Return the first item in our queue
    return this.items[0];
  }

  /**
   * Return all the items in the queue
   *
   * @returns QueueItems[]
   */
  public get dump(): QueueItem[] {
    return [...this.items];
  }

  /**
   * Add an item to the queue
   *
   * @param item Item to add to the queue
   */
  public add(item: QueueItem): void {
    // Make sure data was set
    if (Object.keys(item.data).length === 0) throw Error("Data for queue item may not be empty!");

    // Add item to the queue via the scheduler
    this.items = this.scheduler(item, this.items);
  }

  /**
   * Check whether the queue already contains an identical item
   *
   * @returns boolean
   */
  public contains(item: QueueItem): boolean {
    const itemKeys = Object.keys(item.data);
    const match = this.items.find((queued: QueueItem) => {
      // Check if the weights are the same
      if (queued.weight !== item.weight) return false;

      // Check if all keys exists and if they have the same value
      for (const key of itemKeys) {
        // deno-lint-ignore no-prototype-builtins -- TODO
        if (!queued.data.hasOwnProperty(key)) return false;
        if (queued.data[key] !== item.data[key]) return false;
      }
      return true;
    });
    return typeof match !== "undefined";
  }

  /**
   * Remove all items from the Queue
   *
   * @returns void
   */
  public clear(): void {
    this.items = [];
  }
}
