import {QueueItem} from "../../../types/queue.ts";

export default function(item: QueueItem, items: QueueItem[] = []) {
  // Remove weight if specified
  if ("weight" in item) delete item.weight;

  // Add item to the queue
  items.unshift(item);

  // Return the queue
  return items;
}
