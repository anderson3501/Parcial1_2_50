const amqp = require('amqplib');

async function start() {
  const conn = await amqp.connect('amqp://user:pass@rabbitmq');
  const ch = await conn.createChannel();
  await ch.assertExchange('processed_images', 'fanout', { durable: false });

  const q = await ch.assertQueue('', { exclusive: true });
  ch.bindQueue(q.queue, 'processed_images', '');

  ch.consume(q.queue, (msg) => {
    console.log('[NOTIFICACION]', msg.content.toString());
  }, { noAck: true });
}

start();
