const { transformSchema, FilterRootFields, FilterObjectFields } = require('graphql-tools-fork');
const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const proxy = require('express-http-proxy');

const whitelist = {
  root: true,
  objects: true
};

const graylist = {
  root: false,
  objects: true
};

const blacklist = {
  root: false,
  objects: false
};

const filterSchema = ({ schema, typeMap={}, baseline=whitelist }) => {
  return transformSchema(schema, [
    new FilterRootFields((operation, fieldName, field) => {
      if(typeMap[operation] && typeMap[operation][fieldName] !== undefined) {
        return typeMap[operation][fieldName];
      } else {
        return baseline.root;
      }
    }),
    new FilterObjectFields((typeName, fieldName, field) => {
      if(typeMap[typeName] && typeMap[typeName][fieldName] !== undefined) {
        return typeMap[typeName][fieldName];
      } else {
        return baseline.objects;
      }
    })
  ]);
};

const schemaRouter = ({ entryPoints={}, path="/", router }) => {
  let listeners = {};
  Object.keys(entryPoints).forEach((schemaKey) => {
    let server = new ApolloServer({ ...entryPoints[schemaKey], playground: { endpoint: path } });
    let app = express();
    server.applyMiddleware({ app, path: "/" });
    listeners[schemaKey] = app.listen();
  });
  return [path, proxy(async (req) => `http://127.0.0.1:${listeners[await router(req)].address().port}/${path}`, {
    parseReqBody: false,
    memoizeHost: true
  })];
};

const filterSchemaRouter = ({ schemaMap, options, path="/", router }) => {
  let schema = options.schema;
  const entryPoints = Object.keys(schemaMap).reduce((retval, schemaKey) => {
    let { typeMap, baseline } = schemaMap[schemaKey];
    retval[schemaKey] = {
      ...options,
      schema: filterSchema({ schema, typeMap, baseline })
    };
    return retval;
  }, {});
  return schemaRouter({ entryPoints, path, router });
}

module.exports = {
  filterSchema,
  schemaRouter,
  filterSchemaRouter,
  whitelist,
  graylist,
  blacklist
}
