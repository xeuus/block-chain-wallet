const Websocket = require('ws');

module.exports = class P2pServer {
  constructor(blockchain, svd, transactionPool) {
    this.blockchain = blockchain;
    this.peers = {};
    this.svd = svd;
    this.transactionPool = transactionPool;
  }

  listen() {
    const server = new Websocket.Server({port: 0});


    function noop() {
    }

    function heartbeat() {
      this.isAlive = true;
    }


    setInterval(function () {
      server.clients.forEach(function each(socket) {
        if (socket.isAlive === false) return socket.terminate();
        socket.isAlive = false;
        socket.ping(noop);
      });
    }, 10000);

    const port = server.address().port;
    this.svd.onPeersUpdated(peers => this.connectToPeers(peers));
    this.svd.register(port, 'peer');
    this.port = port.toString();
    console.log(`[P2P] listening on port ${port}`);
    server.on('connection', socket => {

      socket.isAlive = true;
      socket.on('pong', heartbeat);

      socket._key = 'server';
      socket._ref = port;
      this.connectSocket(socket);
    });
  }

  connectToPeers(peers) {
    function heartbeat() {
      clearTimeout(this.pingTimeout);
      this.pingTimeout = setTimeout(() => {
        this.terminate();
      }, 10000 + 1000);
    }

    Object.keys(this.peers).forEach(key => {
      if (!peers.find(a => a.port === key) && !!this.peers[key].socket) {
        this.peers[key].socket.terminate();
        this.peers[key].socket = null;
      }
    });
    peers.forEach(peer => {
      const {port, type} = peer;
      if (type !== 'peer')
        return;
      if (port === this.port)
        return;
      this.peers[port] = this.peers[port] || {
        socket: null,
      };
      if (!this.peers[port].socket) {
        const client = new Websocket(`ws://localhost:${port}`);
        client.on('ping', heartbeat);
        client._key = 'peer';
        client._ref = port;
        this.peers[port].socket = client;
        const _this = this;
        client.on('open', function () {
          heartbeat.call(this);
          _this.connectSocket(client);
        });
        client.on('close', function () {
          clearTimeout(this.pingTimeout);
        });
      }
    })
  }

  connectSocket(socket) {
    this.messageHandler(socket);
    this.sendChain(socket);
  }

  syncChains(){
    Object.keys(this.peers).forEach(key => {
      const peer = this.peers[key];
      if(peer.socket){
       this.sendChain(peer.socket);
      }
    })
  }
  sendChain(socket) {
    socket.send(JSON.stringify({
      action: 'chain',
      chain: this.blockchain.chain,
    }));
  }

  sendTransaction(socket, transaction) {
    socket.send(JSON.stringify({
      action: 'transaction',
      transaction: transaction,
    }));
  }


  broadcastClearTransactions() {
    Object.keys(this.peers).forEach(key => {
      const peer = this.peers[key];
      if(peer.socket){
        peer.socket.send(JSON.stringify({
          action: 'clear-transaction',
        }));
      }
    })
  }
  broadcastTransaction(transaction) {
    Object.keys(this.peers).forEach(key => {
      const peer = this.peers[key];
      if(peer.socket){
        this.sendTransaction(peer.socket, transaction);
      }
    })
  }
  messageHandler(socket) {
    socket.on('message', data => {
      const json = JSON.parse(data);
      if(json.action === 'chain') {
        this.blockchain.replaceChain(json.chain);
      }else if(json.action === 'transaction'){
        this.transactionPool.updateOrAddTransaction(json.transaction);
      }else if(json.action === 'clear-transaction'){
        this.transactionPool.clear();
      }
    })
  }
};