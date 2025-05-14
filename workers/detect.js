const amqp = require('amqplib');

async function start() {
  const conn = await amqp.connect('amqp://user:pass@rabbitmq');
  const ch = await conn.createChannel();
  await ch.assertQueue('detect', { durable: true });
  await ch.assertExchange('processed_images', 'fanout', { durable: false });
  ch.prefetch(1);

  ch.consume('detect', async (msg) => {
    const data = JSON.parse(msg.content.toString());
    data.analysis = { safe: true, tags: ['photo', 'processed'] };

    ch.publish('processed_images', '', Buffer.from(JSON.stringify(data)));
    ch.ack(msg);
  });
}

start();
