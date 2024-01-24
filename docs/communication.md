# Communication

Classes that abstract communication with other services.

## CouchDB

Facilitates communication with [CouchDB](https://couchdb.apache.org/).

```ts 
import { CouchDB } from "https://deno.land/x/chomp/communication/couchdb.ts";
```

### Connecting

First, we must pass all the information to the class so it can properly connect to CouchDB.

```ts
// Option 1 (preferred)
const db1 = new CouchDB('http://localhost:5984', 'my_database', { username: 'couchuser', password: 'lamepassword'});

// Option 2
const db2 = new CouchDB('http://localhost:5984', 'my_database');
db2.username = 'couchuser';
db2.password = 'lamepassword';
```

### Getting a document

### Inserting a document

### Updating a document

### Upserting a document

### Deleting a document

### Making a raw query

## Druid

## GraphQL

## InfluxDB

## Loki

## NTFY

## NUT

## RCON

## Redis
