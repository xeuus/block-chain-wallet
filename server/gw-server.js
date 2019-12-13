const httpProxy = require('http-proxy');
const express = require('express');
const app = express();
const {SERVER_PORT, SVD_PORT} = require('./config');
const ServiceDiscovery = require('./service-discovery');
const svd = new ServiceDiscovery(SVD_PORT);


let peers = [];
let counter = 0;

svd.onPeersUpdated(p =>{
  peers = p.filter(a=>a.type === 'http').map(a=>a.port);
});

const proxyServer = httpProxy.createProxyServer();

app.all('*', (req, res) => {
  if(peers.length < 1) {
    res.statusCode = 503;
    res.end('503 service unavailable');
    return
  }
  const address =  'http://localhost:'+peers[ (counter++)%peers.length ];
  return proxyServer.proxyRequest(req, res, {
    changeOrigin: true,
    target: address,
    secure: false,
  });
});
const server = app.listen(SERVER_PORT, () => {
  svd.runClient(()=>{});
  console.log(`[Http] listening on port ${server.address().port}`)
});
process.on('uncaughtException', (err) => console.log(err));
