# CheckSource

CheckSource allows you to run the Deno file checking before hand.  
This is useful for helping speed up deployments and reboots as you can now do all the checks in the pipeline rather than while starting the container.

## Getting Started

First, import the module as part of Chomp's core:
```ts
import * from "https://deno.land/x/chomp/mod.ts";
```

Or if you want a more minimal setup:
```ts
import { CheckSource } from "https://deno.land/x/chomp/mod.ts";
```

Then add the following code to your check script:
```ts
const checker = new CheckSource('./src');
await checker.run();
```

Then run the script.  
A common way of doing it would be to add a file `check.ts` and running that:

```ts
// check.ts
import { CheckSource } from "https://deno.land/x/chomp/mod.ts";

const checker = new CheckSource('./src');
await checker.run();
```

```
>>> deno run --allow-read check.ts
[2024/02/02 23:55:27] INFO  > Getting all files in directory "./src"...
[2024/02/02 23:55:27] INFO  > Getting all files in directory "./src/controller"...
[2024/02/02 23:55:27] INFO  > Getting all files in directory "./src/controller/component"...
[2024/02/02 23:55:27] INFO  > Getting all files in directory "./src/events"...
[2024/02/02 23:55:27] INFO  > Getting all files in directory "./src/templates"...
[2024/02/02 23:55:27] INFO  > Getting all files in directory "./src/templates/anidb"...
[2024/02/02 23:55:27] INFO  > Getting all files in directory "./src/templates/database"...
[2024/02/02 23:55:27] INFO  > Getting all files in directory "./src/templates/status"...
[2024/02/02 23:55:27] INFO  > Checking "15" files...
[2024/02/02 23:55:27] INFO  > Finished checking files!
```

## Excluding files or directories

In some cases, you may have additional files or directories mixed into your directory that you may not want to be checked, such as your handlebars templates.  
These files and directories can be specified to be ignored very simply by specifying them in the constructor:

```ts
const checker = new CheckSource('./src', {
  directories: ['my-dir'],
  files: ['my-file.txt']
});
```
