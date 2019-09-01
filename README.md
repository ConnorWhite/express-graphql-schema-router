# express-graphql-schema-router

A package to route users to different GraphQL servers. Uses Express, ApolloServer, and graphql-http-proxy.

#### Installation
```js
npm i express-graphql-schema-router
```

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
const schemaRouter = require('express-graphql-schema-router');

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
