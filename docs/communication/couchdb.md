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

## Inserting a document

## Updating a document

## Upserting a document

## Deleting a document

## Making a raw query
