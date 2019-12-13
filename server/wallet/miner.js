const Transaction = require('./transaction');

class Miner {
  constructor(blockchain, transactionPool, p2pServer) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.p2pServer = p2pServer;
  }
  mine() {
    const validTransactions = this.transactionPool.validTransactions();
    const block = this.blockchain.addBlock(validTransactions);
    this.p2pServer.syncChains();
    this.transactionPool.clear();
    this.p2pServer.broadcastClearTransactions();

    return block;
  }
}

module.exports = Miner;