const express = require('express');
const app = express();
const ServiceDiscovery = require('./service-discovery');
const P2pServer = require('./p2p/p2p-server');

let Blockchain = require('./blockchain');
const Miner = require('./wallet/miner');
const TransactionPool = require('./wallet/trasaction-pool');
const Wallet = require('./wallet');

app.use(express.urlencoded({extended: false}));
app.use(express.json());
const {SVD_PORT, SERVER_PORT} = require('./config');
const svd = new ServiceDiscovery(SVD_PORT);

const bc = new Blockchain();
const wallet = new Wallet();
const tp = new TransactionPool();
const p2pServer = new P2pServer(bc, svd, tp);
const miner = new Miner(bc, tp, p2pServer);

app.get('/api/blocks', (req, res) => {
  res.json(bc.chain);
});

app.get('/api/mine-transactions', (req, res) => {
  miner.mine();
  res.json(bc.chain);
});

app.get('/api/balance', (req, res) => {
  res.json({ balance: wallet.calculateBalance(bc) });
});

app.post('/api/mine', (req, res) => {
  bc.addBlock(req.body.data);
  p2pServer.syncChains();
  res.json(bc.chain);
});

app.get('/api/transactions', (req, res) => {
  res.json(tp.transactions);
});

app.post('/api/transact', (req, res) => {
  const { recipient, amount } = req.body;
  const transaction = wallet.createTransaction(recipient, amount, bc, tp);
  p2pServer.broadcastTransaction(transaction);
  res.json(tp.transactions);
});

app.get('/api/public-key', (req, res) => {
  res.json({ publicKey: wallet.publicKey });
});

app.get('/api/peers', (req, res) => {
  res.json({ peers: p2pServer.peers.length });
});

const server = app.listen(SERVER_PORT, () => {
  svd.runClient(()=>{
    p2pServer.listen();
  });
  console.log(`[Http] listening on port ${server.address().port}`)
});
process.on('uncaughtException', (err) => console.log(err));
