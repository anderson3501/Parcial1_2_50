const express = require('express');
const multer = require('multer');
const amqp = require('amqplib');
const fs = require('fs');
const { v4: uuid } = require('uuid');
const app = express();
const upload = multer({ dest: 'upload/uploads/' });
const PORT = 5000;

const statuses = {};

async function sendToQueue(data) {
  const conn = await amqp.connect('amqp://user:pass@rabbitmq');
  const ch = await conn.createChannel();
  await ch.assertQueue('resize', { durable: true });
  ch.sendToQueue('resize', Buffer.from(JSON.stringify(data)), { persistent: true });
}

app.post('/upload', upload.single('image'), async (req, res) => {
  const id = uuid();
  const filepath = req.file.path;
  statuses[id] = 'uploaded';

  await sendToQueue({ id, path: filepath });
  res.json({ id, status: 'queued' });
});

app.get('/status/:id', (req, res) => {
  const status = statuses[req.params.id] || 'unknown';
  res.json({ id: req.params.id, status });
});

app.listen(PORT, () => console.log(API corriendo en http://localhost:${PORT}));
