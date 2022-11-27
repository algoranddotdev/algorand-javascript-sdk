import fs from 'fs';
import fastifyWebSocket from '@fastify/websocket';

import webpack from 'webpack';

import config from '../../webpack.config.cjs';
import {server} from './main.js';

const compiler = webpack(config);

class Organizer {
  constructor() {
    this.hash = null;
    this.connections = [];
  }
  addConnection(connection) {
    this.connections.push(connection);
  }
  removeConnection(connection) {
    this.connections = this.connections.filter((candidate) => candidate !== connection);
  }
  didCompile(hash) {
    if (this.hash !== hash) {
      this.hash = hash;
      for (const connection of this.connections) {
        connection.socket.send('didCompile');
      }
    }
  }
}

const organizer = new Organizer();

compiler.watch({
  aggregateTimeout: 300,
  poll: undefined
}, (error, stats) => {
  organizer.didCompile(stats.compilation.hash);
});

function onExit() {
  compiler.close((error, result) => {
    console.log(error, result);
  });
  process.exit();
}

['SIGUSR2', 'SIGINT'].forEach((interrupt) => {
  process.on(interrupt, onExit);
});

server.register(fastifyWebSocket);

server.get('/development', {websocket: true}, (connection, request) => {
  organizer.addConnection(connection);
  console.log(organizer.connections.length);
  connection.socket.on('message', (message) => {
    connection.socket.send('hi!');
  });
  connection.socket.on('close', () => {
    console.log('close');
    organizer.removeConnection(connection);
  });
});

server.get('/*', (request, reply) => {
  const document = fs.readFileSync('./source/client/document/development.html', 'utf-8');
  reply.header('Content-Type', 'text/html');
  return document;
});

server.listen({port: 3010}, (error, address) => {
  if (error) {
    throw error;
  }
});