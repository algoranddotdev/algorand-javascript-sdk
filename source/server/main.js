import fs from 'fs';
import fastify from 'fastify';
import fastifyStatic from '@fastify/static';

const server = fastify({
  logger: false
});

server.register(fastifyStatic, {
  root: new URL('../../product/', import.meta.url).pathname,
  prefix: '/product/'
});
server.register(fastifyStatic, {
  root: new URL('../../assets/', import.meta.url).pathname,
  prefix: '/assets/',
  decorateReply: false
});


if (process.argv[1] === import.meta.url.replace('file://', '')) {
  server.get('/', (request, reply) => {
    const document = fs.readFileSync('./source/client/document/main.html', 'utf-8');
    reply.header('Content-Type', 'text/html');
    return document;
  });
  
  server.listen({port: 3010}, (error, address) => {
    if (error) {
      throw error;
    }
  });
}

export {server};