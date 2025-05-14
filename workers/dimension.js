const amqp = require('amqplib');
const sharp = require('sharp');
const fs = require('fs');

async function start() {
  const conn = await amqp.connect('amqp://user:pass@rabbitmq');
  const ch = await conn.createChannel();
  await ch.assertQueue('dimension', { durable: true });
  await ch.assertQueue('marcaagua', { durable: true });
  ch.prefetch(1);

  ch.consume('dimension', async (msg) => {
    const data = JSON.parse(msg.content.toString());
    const resizedPath = ${data.path}_resized.jpg;

    await sharp(data.path).resize(800, 600).toFile(resizedPath);
    data.path = resizedPath;

    ch.sendToQueue('marcaagua', Buffer.from(JSON.stringify(data)), { persistent: true });
    ch.ack(msg);
  });
}

start();
