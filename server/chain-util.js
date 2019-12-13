const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const uuidV1 = require('uuid/v1');
const fs = require('fs');
const path = require('path');
const ec = new EC('secp256k1');
module.exports = class {
  static hash(data) {
    return SHA256(JSON.stringify(data)).toString();
  }
  static genKeyPair() {
    return ec.genKeyPair();
  }
  static keyFromPrivate(keyPair) {
    return ec.keyFromPrivate(keyPair.getPrivate(), 'hex');
  }

  static loadOrGenerate(name){
    const p = path.resolve(__dirname, `./${name}`);
    if(!fs.existsSync(p+'.puk')){
      const pair = ec.genKeyPair();
      fs.writeFileSync(p+'.puk', pair.getPrivate('hex'));
      return pair;
    }else {
      return ec.keyFromPrivate(fs.readFileSync(p+'.puk'), 'hex');
    }
  }
  static verifySignature(publicKey, signature, dataHash) {
    const key = ec.keyFromPublic(publicKey, 'hex');
    return key.verify(dataHash, signature);
  }
  static id() {
    return uuidV1();
  }
};