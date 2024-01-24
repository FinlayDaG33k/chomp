# Getting Started

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

But there's plenty more you can use.
