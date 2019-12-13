const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const uuidV1 = require('uuid/v1');
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
  static verifySignature(publicKey, signature, dataHash) {
    const key = ec.keyFromPublic(publicKey, 'hex');
    return key.verify(dataHash, signature);
  }
  static id() {
    return uuidV1();
  }
};