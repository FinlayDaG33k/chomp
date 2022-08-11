import { assertEquals } from "https://deno.land/std@0.152.0/testing/asserts.ts";
import { Queue, Scheduler } from "../../queue/queue.ts";

Deno.test("Queue Test", async (t) => {
  await t.step("Common", () => {
    // Create our queue
    const queue = new Queue(Scheduler.FIFO);

    // Test isEmpty and count without items
    assertEquals(queue.isEmpty, true);
    assertEquals(queue.count, 0);

    // Add test items to the queue
    queue.add({ data: { job: 'test1', } });
    queue.add({ data: { job: 'test2', } });
    queue.add({ data: { job: 'test3', } });
    queue.add({ data: { job: 'test4', } });

    // Test isEmpty and count with items
    assertEquals(queue.isEmpty, false);
    assertEquals(queue.count, 4);

    // Make sure clearing works
    queue.clear();
    assertEquals(queue.isEmpty, true);
    assertEquals(queue.count, 0);
  })

  await t.step("FIFO Scheduler", () => {
    // Create our queue
    const queue = new Queue(Scheduler.FIFO);

    // Add test items to the queue
    queue.add({ data: { job: 'test1', } });
    queue.add({ data: { job: 'test2', } });
    queue.add({ data: { job: 'test3', } });
    queue.add({ data: { job: 'test4', } });

    // Make sure peeking works without removal
    assertEquals(queue.peek, { data: { job: 'test1', } });
    assertEquals(queue.count, 4);

    // Make sure next works with removal
    assertEquals(queue.next, { data: { job: 'test1', } });
    assertEquals(queue.count, 3);
    assertEquals(queue.peek, { data: { job: 'test2', } });

    // Make sure contains works
    assertEquals(queue.contains({ data: { job: 'test2', } }), true);
    assertEquals(queue.contains({ data: { job: 'test4', } }), true);
    assertEquals(queue.contains({ data: { job: 'test5', } }), false);
  });

  await t.step("LIFO Scheduler", () => {
    // Create our queue
    const queue = new Queue(Scheduler.LIFO);

    // Add test items to the queue
    queue.add({ data: { job: 'test1', } });
    queue.add({ data: { job: 'test2', } });
    queue.add({ data: { job: 'test3', } });
    queue.add({ data: { job: 'test4', } });

    // Make sure peeking works without removal
    assertEquals(queue.peek, { data: { job: 'test4', } });
    assertEquals(queue.count, 4);

    // Make sure next works with removal
    assertEquals(queue.next, { data: { job: 'test4', } });
    assertEquals(queue.count, 3);
    assertEquals(queue.peek, { data: { job: 'test3', } });

    // Make sure contains works
    assertEquals(queue.contains({ data: { job: 'test1', } }), true);
    assertEquals(queue.contains({ data: { job: 'test3', } }), true);
    assertEquals(queue.contains({ data: { job: 'test5', } }), false);
  });

  await t.step("WEIGHTED Scheduler", () => {
    // Create our queue
    const queue = new Queue(Scheduler.WEIGHTED);

    // Add test items to the queue
    queue.add({ weight: 0, data: { job: 'test1', } });
    queue.add({ weight: 0, data: { job: 'test2', } });
    queue.add({ weight: 1, data: { job: 'test3', } });
    queue.add({ weight: 2, data: { job: 'test4', } });
    queue.add({ weight: 3, data: { job: 'test5', } });
    queue.add({ data: { job: 'test6', } });

    // Make sure peeking works without removal
    assertEquals(queue.peek, { weight: 3, data: { job: 'test5', } });
    assertEquals(queue.count, 6);

    // Make sure next works with removal
    assertEquals(queue.next, { weight: 3, data: { job: 'test5', } });
    assertEquals(queue.count, 5);
    assertEquals(queue.peek, { weight: 2, data: { job: 'test4', } });

    // Make sure contains works
    assertEquals(queue.contains({ weight: 0, data: { job: 'test1', } }), true);
    assertEquals(queue.contains({ weight: 1, data: { job: 'test3', } }), true);
    assertEquals(queue.contains({ weight: 2, data: { job: 'test3', } }), false);

    // Make sure we didn't add "weightless" items
    assertEquals(queue.contains({ data: { job: 'test6', } }), false);
  });
})
