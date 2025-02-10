# Chomp

Library of (arguably) useful stuff.  
This library prioritizes "ease of use" over "efficiency".  

Should work just fine but comes with no warranties whatsoever.

## Usage

Chomp is structured in such a way that you can import just what you need for your app.\
A good start would be to import the most common things you might use:

```ts
import * from "https://deno.land/x/chomp/common.ts";
```

This includes (list might not always be up-to-date):

- [Cache](docs/core/cache.md)
- [Configure](docs/core/configure.md)
- [Logger](docs/logging/logger.md)
- [File](docs/filesystem/file.md)
- [Folder](docs/filesystem/folder.md)
- [CheckSource](docs/utility/check-source.md)

However, there are many more things included so feel free to explore the [docs](/docs) or [Deno.land](https://doc.deno.land/https://deno.land/x/chomp/mod.ts)
to see what more Chomp is capable off!

**NOTE**: While you can import `https://deno.land/x/chomp/mod.ts`, I advice against this as it'll load the entire
codebase, including stuff you may not actually be using.

## Versioning

As of `?.0.0.0`, versioning adheres to the following versioning system of `w.x.y.z` where:

- `w` means all previous deprecations were removed.
- `x` means deprecations were added in this release.
- `y` means new features were added in this release.
- `z` means a small fix was made (typo's, bugs etc.)
