const ServiceDiscovery = require('./service-discovery');
const P2pServer = require('./p2p/p2p-server');
const {SVD_PORT} = require('./config');
const svd = new ServiceDiscovery(SVD_PORT);

const TransactionPool = require('./wallet/trasaction-pool');
let Blockchain = require('./blockchain');
const bc = new Blockchain();
const tp = new TransactionPool();
const p2pServer = new P2pServer(bc, svd, tp);

svd.runClient(()=>{
  p2pServer.listen();
});