const amqp = require('amqplib');
const sharp = require('sharp');

async function start() {
  const conn = await amqp.connect('amqp://user:pass@rabbitmq');
  const ch = await conn.createChannel();
  await ch.assertQueue('marcaagua', { durable: true });
  await ch.assertQueue('detect', { durable: true });
  ch.prefetch(1);

  ch.consume('marcaagua', async (msg) => {
    const data = JSON.parse(msg.content.toString());
    const watermarkedPath = ${data.path}_watermarked.jpg;

    await sharp(data.path)
      .composite([{ input: Buffer.from(
        <svg><text x="10" y="50" font-size="30" fill="white">© MyApp</text></svg>
      ), top: 10, left: 10 }])
      .toFile(watermarkedPath);

    data.path = watermarkedPath;

    ch.sendToQueue('detect', Buffer.from(JSON.stringify(data)), { persistent: true });
    ch.ack(msg);
  });
}

start();
