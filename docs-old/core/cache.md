# Cache

Facilitates keeping items in memory for a set (or indefinite) period of time.

## Adding an item to the Cache

Adding an item to the cache is as simple as calling `Cache.set()`.  
By default, items will expire in `1 minute`, however, this can be changed if desired.
```ts
Cache.set('I expire in 1 minute', 'foo');
Cache.set('I expire in 10 minutes', 'bar', '+10 minutes');
Cache.set('I never expire', 'baz', null);
```

**NOTE**: Expiry times use [TimeString](../utility/time-string.md) formats.

## Getting an item from the Cache

You can get items from the cache by calling `Cache.get()`.
```ts
Cache.get('cache item name'); // Honours expiry
Cache.get('cache item name', true); // Optimistically serve expired cache items
```

## Checking if an item exists in Cache

You can check if an item exists in the cache by calling `Cache.exists()`.  
However, this does not check whether an item has expired or not so it may exist only if obtained optimistically.
```ts
Cache.exists('cache item name');
```

## Checking if an item has expired

You can check if an item exists *and* has not yet expired by calling `Cache.expired()`.  
Items that have expired *may* still exist but only be able to be obtained optimistically.
```ts
Cache.expired('cache item name');
```

## Remove an item from the Cache

If you want to remove an item from the cache, you can simply call `Cache.remove()`.
```ts
Cache.remove('cache item name');
```

## Showing all items in Cache

You can obtain the raw cache contents using the `Cache.dump()` method.
```ts
console.log(Cache.dump());
```

```ts
Map(1) {
  "cache item name" => { data: "cache item value", expires: null }
}
```

**NOTE**: This should only be done for debugging purposes!

## Cleaning up expired items

By default, the cache will be cleaned up every hour.  
Items may linger in the cache for up-to an additional hour to enable for more predictable optimistic caching.

If you want to clean up expired cache items manually, you can do so by running `Cache.sweep()`.
```ts
console.log(Cache.dump());
Cache.sweep();
console.log(Cache.dump());
```

```ts
Map(4) {
  "entry #1 (expired)" => { data: 1234, expires: 2024-01-25T07:09:04.252Z },
  "entry #2 (expired, optimistic)" => { data: 1234, expires: 2024-01-25T07:20:04.253Z },
  "entry #3 (valid)" => { data: 1234, expires: 2024-01-25T09:20:04.253Z },
  "entry #4 (valid, indefinite)" => { data: 1234, expires: null }
}
Map(3) {
  "entry #2 (expired, optimistic)" => { data: 1234, expires: 2024-01-25T07:20:04.253Z },
  "entry #3 (valid)" => { data: 1234, expires: 2024-01-25T09:20:04.253Z },
  "entry #4 (valid, indefinite)" => { data: 1234, expires: null }
}
```
