require('module-alias/register');
import express from 'express';
import {Server} from "coreact/dist/server";
const pack = require('../package.json');
const version = pack.version.split('.').join('');
const path = require('path');
const app = express();
const port = process.env.PORT;

const server = new Server({
  mode: process.env.NODE_ENV,
  provider: () => require('./provider'),
  assets: process.env.NODE_ENV != 'production' ? [
    '/dist/app.js',
  ] : [
    '/dist/app.js.gz',
    '/dist/app.css',
  ],
  apiPrefix: '/api',
  proxies: {
    default: {
      address: process.env.API_ADDR,
    }
  },
  envKeys: ['API_ADDR'],
  encrypt: true,
  version: +version,
  publicDir: ['/assets', path.resolve(__dirname, '../assets')],
  bundleDir: ['/dist', path.resolve(__dirname, '../bundle')],
  webpackOptions: process.env.NODE_ENV != 'production' ? require('../webpack.config.js') : {},
  rootPath: path.resolve(__dirname, '..'),
  srcPath: path.resolve(__dirname, '../src'),
  storagePrefix: 'todos',
});
server.isolate(process.env.APP_NAME);
server.start(app);

app.listen(port, () => console.log(`Listening on port ${port}`));
process.on('uncaughtException', (err) => console.log(err));
