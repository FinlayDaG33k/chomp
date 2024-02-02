# Configure

Allows easily setting application configs using JSON rather than environment-variables.

## Getting Started

First, create a file `config.json` at your application's root.  
By default `debug` and `error_log` are set to these values.  
If you want to change them, this is the place where to do it!
```json
{
  "debug": false,
  "error_log": "logs/error.logs"
}
```

Then import the module as part of Chomp's core and load the configure:
```ts
import * from "https://deno.land/x/chomp/mod.ts";

await Configure.load();
```

Although, if you want to use a more minimal setup:
```ts
import { Configure } from "https://deno.land/x/chomp/mod.ts";

await Configure.load();
```

## Getting an item from the Configure

Getting an item from the Configure can be done by calling `Configure.get()`.  
Doing this will return either the value set in the configure or `null`.
```ts
const myConst = Configure.get('app configure item');
```

If you want to have a default return value, then you can specify it as follows:
```ts
const myConst = Configure.get('app configure item', 'default value');
```

## Setting or updating an item in the Configure

Sometimes you may want to set or update an item during runtime.  
You can do so as follows:
```ts
Configure.set('app configure item', 'my value');
```

**NOTE**: Changes made here do not persist between restarts of your app.

## Checking whether an item exists

To check whether an item exists, just run the following:
```ts
const exists = Configure.check('app configure item');
```

## Consume a Configure item

Consuming a Configure item will return the item and then remove it.  
```ts
const myConst = Configure.consume('app configure item', 'default value');
```

## Delete a Configure item

Deleting a configure item will remove it from the Configure.

```ts
Configure.delete('app configure item');
```

**NOTE**: Changes made here do not persist between restarts of your app.

## Dump all Configure items

Sometimes it is useful to know all the items that are currently in the Configure.  
In this case, you can simply dump all the contents:
```ts
console.log(Configure.dump());
```

```ts
Map(3) {
  "debug" => false,
  "error_log" => "/path/to/logs/error.log",
  "app configuration key" => "app configuration value"
}
```

**NOTE**: This should only be done for debugging purposes as it may leak sensitive information!

## Clear or reset all Configure items

Made a mistake or have another reason to start with a clean Configure? Then this can be done in two ways: `Configure.clear()` and `Configure.reset()`.  

`Configure.clear()` will *completely* empty the configure:
```ts 
console.log(Configure.dump());
Configure.clear();
console.log(Configure.dump());
```

```ts
Map(3) {
  "debug" => false,
  "error_log" => "/path/to/logs/error.log",
  "app configuration key" => "app configuration value"
}
Map(0) {}
```

Whereas `Configure.clear()` will reset the configure to it's default state:
```ts 
console.log(Configure.dump());
Configure.reset();
console.log(Configure.dump());
```

```ts
Map(3) {
  "debug" => false,
  "error_log" => "/path/to/logs/error.log",
  "app configuration key" => "app configuration value"
}
Map(2) {
  "debug" => false, 
  "error_log" => "/path/to/logs/error.log"
}
```

However, the default state is coded into Chomp itself and is *not* your app's defaults.  
If instead, you want to use your app's defaults, you must first clear/reset then force a load:
```ts
Configure.clear(); // Or reset depending on your needs
await Configure.load(true); // Force the configure to reload
```
