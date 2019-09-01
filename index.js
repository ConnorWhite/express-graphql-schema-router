const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const proxy = require('express-http-proxy');

module.exports = ({ entryPoints={}, path="/", router }) => {
  let listeners = {};
  Object.keys(entryPoints).forEach((key) => {
    let server = new ApolloServer({ ...entryPoints[key], playground: { endpoint: path } });
    let app = express();
    server.applyMiddleware({ app, path: "/" });
    listeners[key] = app.listen();
  });
  return [path, proxy((req) => `http://127.0.0.1:${listeners[router(req)].address().port}/${path}`, {
    parseReqBody: false,
    memoizeHost: true
  })];
}
