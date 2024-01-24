# Chomp
Library of (arguably) useful stuff.  
Should work just fine but comes with no warranties whatsoever.  

## Usage

Chomp is structured in such a way that you can import just what you need for your app.  
A good start would be to import the most common things you might use:
```ts
import * from "https://deno.land/x/chomp/mod.ts";
```

This includes (list might not always be up-to-date):
- `Cache`
- `Configure`
- `Logger`
- `raise`
- `File`
- `Folder`
- `CheckSource`

You can then import any of the "extras" as you need:

- Discord Bot (Discordeno Wrapper):
```ts
import * from "https://deno.land/x/chomp/discord/mod.ts";
```
- Weberver:
```ts 
import * from "https://deno.land/x/chomp/webserver/mod.ts";
```
- Websocket Server:
```ts 
import * from "https://deno.land/x/chomp/websocket/mod.ts";
```

Additionally, you can visit the [docs](/docs) or [Deno.land](https://doc.deno.land/https://deno.land/x/chomp/mod.ts) to see what Chomp is capable off!

## Versioning

Versions adhere to the following versioning system of `x.y.z` where:
- `x` means a breaking change (eg. removal of a function, breaking upgrade of an upstream dependency etc.).
- `y` means an addition or non-breaking update.
- `z` means a typos, bug-fix etc.
