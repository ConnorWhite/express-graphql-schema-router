# express-graphql-schema-router

A package to route users to different GraphQL servers. Uses Express, ApolloServer, and graphql-http-proxy. Allows for custom filtering in each schema, and is reflected in what users see in GraphQL Playground.

#### Installation
```
npm i express-graphql-schema-router
```

## schemaRouter({ entryPoints, path, router })

#### Options

```entryPoints```: ```<Object>``` (required)

* A map of ApolloServer options

```path```: ```String``` (required)

* Path to serve GraphQL from. Equates to ```app.use(path, ...)```

```router```: ```<Function>``` (required)

* Function which returns key of schema corresponding to ApolloServer options from ```entryPoints``` to route the response to


#### Example
```js
const express = require('express');
const jwt = require('jsonwebtoken');
const parseBearerToken = require('parse-bearer-token').default;
const { schemaRouter } = require('express-graphql-schema-router');

const app = express();

...

const entryPoints = {
  public: {
    schema: publicSchema,
    context
  },
  authenticated: {
    schema: authenticatedSchema
    context
  }
};

app.use(...schemaRouter({
  entryPoints,
  path: "/graphql",
  router: (req) => {
    let route = "public";
    let token = parseBearerToken(req);
    if(token) {
      try {
        let test = jwt.verify(token, secret);
        if(test !== undefined) {
          route = "authenticated";
        }
      } catch(e) {}
    }
    return route;
  }
}));

app.listen("3000", () => {
  console.log("Listening on port 3000");
});

```

## filterSchemaRouter({ schemaMap, options, path, router })

#### Options

```schemaMap```: ```<Object>``` (required)

* Map of schema keys to baseline and typeMap
  * ```typeMap```: ```<Object>``` (default: ```{}```)

  * ```baseline```: ```<Object>``` (default: ```graylist```)

  ###### whitelist

  Allow root fields, allow object fields

  ###### graylist

  Deny root fields, allow object fields

  ###### blacklist

  Deny root fields, deny object fields

###### Example:
```js
{
  public: {
    baseline: graylist,
    typeMap: {
      Query: {
        field1: true
      }
    }
  },
  authenticated: {
    baseline: whitelist
  },
}
```

```options```: ```<Object>``` (required)

* A map of ApolloServer options

```path```: ```String``` (required)

* Path to serve GraphQL from. Equates to ```app.use(path, ...)```

```router```: ```<Function>``` (required)

* Function which returns key of schema corresponding to ApolloServer options from ```entryPoints``` to route the response to

#### Example

```js
const express = require('express');
const jwt = require('jsonwebtoken');
const parseBearerToken = require('parse-bearer-token').default;
const { filterSchemaRouter, whitelist, graylist } = require('express-graphql-schema-router');

const app = express();

...

const publicTypeMap = {
  Query: {
    public1: true,
    public2: true
  }
};

const schemaMap = {
  public: {
    baseline: graylist,
    typeMap: publicTypeMap
  },
  authenticated: {
    baseline: whitelist
  }
};

app.use(...filterSchemaRouter({
  schemaMap,
  options: {
    schema,
    context
  },
  path: "/graphql",
  router: (req) => {
    let route = "public";
    let token = parseBearerToken(req);
    if(token) {
      try {
        let test = jwt.verify(token, secret);
        if(test !== undefined) {
          route = "authenticated";
        }
      } catch(e) {}
    }
    return route;
  }
}));

app.listen("3000", () => {
  console.log("Listening on port 3000");
});

```

## filterSchema({ schema, typeMap, baseline })

Filters fields available in a schema based on a typeMap and baseline. Returns the filtered schema.

#### Options

* ```schema```: GraphQL Schema (required)

* ```typeMap```: ```<Object>``` (default: ```{}```)

* ```baseline```: ```<Object>``` (default: ```graylist```)
