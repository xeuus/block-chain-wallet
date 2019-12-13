const ChainUtil = require('../chain-util');
const Transaction = require('./transaction');
const { INITIAL_BALANCE } = require('../config');

module.exports = class Wallet {
  constructor(name) {
    this.balance = INITIAL_BALANCE;
    this.keyPair = ChainUtil.loadOrGenerate(name);
    this.publicKey = this.keyPair.getPublic().encode('hex'); // address
  }
  sign(dataHash) {
    return this.keyPair.sign(dataHash);
  }
  createTransaction(recipient, amount, blockchain, transactionPool) {
    this.balance = this.calculateBalance(blockchain);

    // if (amount > this.balance) {
    //   console.log(`Amount: ${amount}, exceeds current balance: ${this.balance}`);
    //   return;
    // }
    let transaction = transactionPool.existingTransaction(this.publicKey);

    if (transaction) {
      transaction.update(this, recipient, amount);
    } else {
      transaction = Transaction.newTransaction(this, recipient, amount);
      transactionPool.updateOrAddTransaction(transaction);
    }
    return transaction;
  }

  calculateBalance(blockchain) {
    let balance = this.balance;

    let transactions = [];
    blockchain.chain.forEach(block => block.data.forEach(transaction => {
      transactions.push(transaction);
    }));

    const walletInputTs = transactions
      .filter(transaction => transaction.input.address === this.publicKey);

    let startTime = 0;
    if (walletInputTs.length > 0) {
      const recentInputT = walletInputTs.reduce((prev, current) => prev.input.timestamp > current.input.timestamp ? prev : current);
      startTime = recentInputT.input.timestamp;
      balance = recentInputT.outputs.find(output => output.address === this.publicKey).amount;
    }

    transactions.forEach(transaction => {
      if (transaction.input.timestamp > startTime) {
        transaction.outputs.forEach(output => {
          if (output.address === this.publicKey) {
            balance += output.amount;
          }
        });
      }
    });

    return balance;
  }

  toString() {
    return `Wallet -
      publicKey : ${this.publicKey.toString()}
      balance   : ${this.balance}`
  }
};