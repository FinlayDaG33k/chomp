import { Logger } from "../logging/logger.ts";

interface QueueItem {
  weight?: number;
  data: any;
}

export enum Scheduler {
  /* First In, First Out */
  FIFO = 0,

  /* Last In, First Out */
  LIFO = 1,

  /* Highest Weight go out FIFO */
  WEIGHTED = 2,
}

export class Queue {
  private items: QueueItem[] = [];
  private readonly scheduler: Scheduler;

  public constructor(scheduler: Scheduler = Scheduler.FIFO) {
    this.scheduler = scheduler;
  }

  /**
   * Get the number of items contained in the Queue
   *
   * @returns number
   */
  public get count(): number { return this.items.length; }

  /**
   * Check whether the Queue has any items
   *
   * @returns boolean
   */
  public get isEmpty(): boolean { return this.items.length === 0; }

  /**
   * Get the next item from the queue.
   * Unlike the Queue#peek() method, this *does* remove the item.
   *
   * @returns QueueItem
   */
  public get next(): QueueItem|null {
    // Make sure we have items in our queue
    if(this.items.length === 0) return null;

    // Return and remove QueueItem based on scheduler
    switch(this.scheduler) {
      case Scheduler.FIFO:
        // @ts-ignore We already return null when no items are present
        return this.items.shift();
      case Scheduler.LIFO:
        // @ts-ignore We already return null when no items are present
        return this.items.pop();
      case Scheduler.WEIGHTED:
        // @ts-ignore We automatically set weights when the WEIGHTED scheduler is used
        this.items.sort((a: QueueItem, b: QueueItem) => b.weight - a.weight);
        // @ts-ignore We already return null when no items are present
        return this.items.shift();
      default:
        throw Error('No scheduler has been set, this is a bug!');
    }
  }

  /**
   * Get the next item from the queue.
   * Unlike the Queue#next() method, this does *not* remove the item.
   *
   * @returns QueueItem|null
   */
  public get peek(): QueueItem|null {
    // Make sure we have items in our queue
    if(this.items.length === 0) return null;

    // Return QueueItem based on scheduler
    switch(this.scheduler) {
      case Scheduler.FIFO:
        return this.items[0];
      case Scheduler.LIFO:
        return this.items[this.items.length -1];
      case Scheduler.WEIGHTED:
        // @ts-ignore We automatically set weights when the WEIGHTED scheduler is used
        this.items.sort((a: QueueItem, b: QueueItem) => b.weight - a.weight);
        return this.items[0];
      default:
        throw Error('No scheduler has been set, this is a bug!');
    }
  }

  /**
   * Add an item to the end of the queue
   *
   * @param item Item to add to the queue
   */
  public add(item: QueueItem): void {
    if(Object.keys(item.data).length === 0) throw Error('Data for queue item may not be empty!');
    if(!item.hasOwnProperty('weight') && this.scheduler === Scheduler.WEIGHTED) {
      Logger.debug('No weight was set with weighted scheduler, defaulting to 0...');
      item.weight = 0;
    }
    this.items.push(item);
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
      if(queued.weight !== item.weight) return false;

      // Check if all keys exists and if they have the same value
      for(const key of itemKeys) {
        if(!queued.data.hasOwnProperty(key)) return false;
        if(queued.data[key] !== item.data[key]) return false;
      }
      return true;
    });
    return typeof match !== 'undefined';
  }

  /**
   * Remove all items from the Queue
   *
   * @returns void
   */
  public clear(): void { this.items = []; }
}
