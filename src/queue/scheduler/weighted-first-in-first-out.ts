import {QueueItem} from "../../../types/queue.ts";
import {valueOrDefault} from "../../utility/value-or-default.ts";

export default function(item: QueueItem, items: QueueItem[] = []) {
  // Check if weight was set, otherwise default to 0
  item.weight = valueOrDefault<number>(item.weight, 0);

  // Loop over all items in queue, add it at the bottom of it's weight
  for (let i = 0; i < items.length; i++) {
    // @ts-ignore Weight is set to 0 by default
    if (item.weight > items[i].weight || i === items.length) {
      items.splice(i, 0, item);
      return items;
    }
  }

  // Add item to the queue
  items.push(item);

  // Return the queue
  return items;
}
