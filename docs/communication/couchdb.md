# CouchDB

Facilitates communication with [CouchDB](https://couchdb.apache.org/).

### Getting Started

First import the module as follows:
```ts 
import { CouchDB } from "https://deno.land/x/chomp/communication/couchdb.ts";
```

Next, we must create an instance of the class that we can use to talk to CouchDB.

```ts
// Option 1 (preferred)
const db = new CouchDB('http://localhost:5984', 'my_database', { username: 'couchuser', password: 'lamepassword'});
```

```ts
// Option 2
const db = new CouchDB('http://localhost:5984', 'my_database');
db.username = 'couchuser';
db.password = 'lamepassword';
```

## Getting a document

Getting a document from CouchDB can be done very easily:
```ts
const existing = await db.get('my-key');
```

If you want to then check whether a document was found, just check the `status`:
```ts
if(existing.status === 404) {
  // Handle non-existing document
}
```

## Inserting a document

If you want to insert a document, it can be done in the following way:
```ts
const resp = await db.insert({
  '_id': 'my-key',
  'data': 'my-data',
});
```

You can then check whether the operation was a success:
```ts
if(resp.status !== 201) {
  // Handle insert error
}
```

**NOTE**: Despite this example showing an object called "`data`" in the document, this value is chosen "arbitrarily".  
**NOTE**: Any document passed to the method will be attempted to insert "as-is".  
A more convenient "[`upsert`](#upserting-a-document)" method is available.

## Updating a document

If you want to update a document, it can be done in the following way:
```ts
const resp = await db.update('my-key', 'my-new-data');
```

You can then check whether the operation was a success:
```ts
if(resp.status !== 201) {
  // Handle insert error
}
```

**NOTE**: Despite this example using a "`my-new-data`" string, any data can be passed here and be updated "as-is".  
**NOTE**: This example does not check whether a document exists to be updated.  
A more convenient "[`upsert`](#upserting-a-document)" method is available.

## Upserting a document

Upserting combines `insert` and `update` in a single function.  
It'll automatically check whether a document exists, inserting if it doesn't and updating if it does.

```ts
const resp = await db.upsert(`my-key`, 'my-data');
```

You can then check whether the operation was a success:
```ts
if(resp.status !== 201) {
  // Handle upsert error
}
```

**NOTE**: Despite this example using a "`my-data`" string, any data can be passed here and be updated "as-is".

## Deleting a document

Once a document is no longer needed, one may want to delete it.  
To do so, you can use the `delete` method:
```ts
const existing = await db.get('my-key');
if(existing.status === 404) return;
const resp = await db.delete('my-key', existing.data['_rev']);
```

You can then check whether the operation was a success:
```ts
if(resp.status !== 200) {
  // Handle deletion error
}
```

**NOTE**: Currently, the revision must be passed manually to the `delete` method.

## Making a raw query

Sometimes, you may want to take a bit more control, for this, you can use the `raw` method.
However, we do not provide any examples of it as it simply can do too much, this block is simply there to inform you the option is there.  
If you want to use it, you probably are smarter than this library but feel free to have a look by yourself.
