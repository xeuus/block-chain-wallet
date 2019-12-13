const Websocket = require('ws');
const throttle = require('lodash/throttle');
const uuid = require('uuid/v4');

module.exports = class ServiceDiscovery {
  constructor(port) {
    this.port = port;
    this.peers = [];
  }

  onPeersUpdated(fn) {
    this.onpeersupdated = fn;
  }


  runClient(fn) {
    let alive = false;
    const restart = throttle(() => {
      if (alive)
        return;

      function heartbeat() {
        clearTimeout(this.pingTimeout);
        this.pingTimeout = setTimeout(() => {
          alive = false;
          this.terminate();
          restart();
        }, 10000 + 1000);
      }

      try {
        const client = new Websocket(`ws://localhost:${this.port}`);
        this.client = client;
        client.on('message', (data) => {
          const json = JSON.parse(data);
          if (json.action === 'update') {
            this.peers = json.peers;
            this.onpeersupdated(this.peers);
          }
        });
        client.on('ping', heartbeat);
        client.on('open', function () {
          alive = true;
          heartbeat.call(this);
          fn();
        });
        client.on('close', function () {
          clearTimeout(this.pingTimeout);

          alive = false;
          restart();
        });
      }catch (e) {
        restart();
      }
    }, 500);

    restart();
  }

  register(port, type) {
    this.client.send(JSON.stringify({
      action: 'register',
      type: type,
      port: port.toString(),
    }));
  }

  listen() {
    const server = new Websocket.Server({port: this.port});


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


    console.log(`[SVD] listening on port ${server.address().port}`);
    server.on('connection', socket => {

      socket.isAlive = true;
      socket.on('pong', heartbeat);

      socket.id = uuid();

      socket.send(JSON.stringify({
        action: 'update',
        peers: this.peers,
      }));

      socket.on('message', data => {
        const json = JSON.parse(data);
        if (json.action === 'register') {
          this.peers.push({
            service: socket.id,
            type: json.type,
            port: json.port.toString(),
          });
          server.clients.forEach(a => a.send(JSON.stringify({
            action: 'update',
            peers: this.peers,
          })))
        }
      });
      socket.on('close', () => {
        this.peers = this.peers.filter(a => a.service !== socket.id);
        server.clients.forEach(a => a.send(JSON.stringify({
          action: 'update',
          peers: this.peers,
        })))
      })
    });
  }

};