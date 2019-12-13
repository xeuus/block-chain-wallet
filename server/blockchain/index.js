const Block = require('./block');

class Index {
  constructor() {
    this.chain = [Block.genesis()];
  }

  addBlock(data) {
    const block = Block.mineBlock(this.lastBlock(), data);
    this.chain.push(block);
    return block;
  }
  lastBlock() {
    return this.chain[this.chain.length - 1];
  }
  replaceChain(newChain) {
    if (newChain.length <= this.chain.length) {
      return;
    } else if (!this.isValidChain(newChain)) {
      return;
    }
    console.log('replacing chain');
    this.chain = newChain;
  }
  isValidChain(chain) {
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) return false;
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const lastBlock = chain[i - 1];
      if (block.lastHash !== lastBlock.hash || block.hash !== Block.blockHash(block)) {
        return false;
      }
    }
    return true;
  }

  toString() {
    let string = `Length of chain: ${this.chain.length}\n`;
    this.chain.forEach(block => {
      string += `${block.toString()}\n`;
    });
    return string;
  }
}

module.exports = Index;