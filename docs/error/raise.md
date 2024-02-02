# raise

Utility function that provides a band-aid for ES' shortcoming on not allowing `throw` statements during null-coalescing like, for example, PHP can do.

```php
// PHP Example
$myVar = null ?? throw new Exception('Error Message');
```

```ts
// TS Example
const myVar = null ?? throw new Error('Error Message'); // Expression expected
```

## Getting Started

First, import the function as follows:
```ts
import { raise } from "https://deno.land/x/chomp/error/raise.ts";
```

Then you can use it in your chains as follows:
```ts
const myVar = null ?? raise('Error Message');
```

## Using Custom Error Types

By default, the `raise` function will throw a "standard" `Error`:
```
error: Uncaught (in promise) Error: Error Message
```

However, it may be desirable to be able to be more specific in what error has happened:
To do this, you can easily pass a name for the error to `raise`:

```ts
const myVar = null ?? raise('Error Message', 'CustomError');
```
```
error: Uncaught (in promise) CustomError: Error Message
```

Additionally, you can ommit the "Error" part in the name as this will be automatically added:
```ts
const myVar = null ?? raise('Error Message', 'Custom');
```
```
error: Uncaught (in promise) CustomError: Error Message
```

If you need more flexibility, you can pass an `Error`-class to `raise` instead:
```ts
class CustomError extends Error {
  constructor(public message: string) {
    super(message);
  }
}

const myVar = null ?? raise('Error Message', CustomError);
```

```
error: Uncaught (in promise) CustomError: Error Message
```
