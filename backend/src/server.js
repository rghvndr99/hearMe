import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import chatRouter from './routes/chat.js';
import sentimentRouter from './routes/sentiment.js';
import listenerRouter from './routes/listener.js';
import authRouter from './routes/auth.js';
import aiChatRouter from './routes/aiChat.js';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Verify OpenAI API key is loaded
if (process.env.OPENAI_API_KEY) {
  console.log('✅ OpenAI API Key loaded successfully');
  console.log(`   Key starts with: ${process.env.OPENAI_API_KEY.substring(0, 10)}...`);
} else {
  console.warn('⚠️  WARNING: OPENAI_API_KEY not found in environment variables');
}

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
  max: parseInt(process.env.RATE_LIMIT_MAX || '60'),
});
app.use(limiter);

// REST routes
app.use('/api/chat', chatRouter);
app.use('/api/sentiment', sentimentRouter);
app.use('/api/listener', listenerRouter);
app.use('/api/auth', authRouter);
app.use('/api/ai-chat', aiChatRouter);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_ORIGIN || '*' },
});

// In-memory data (MVP)
const availableListeners = new Map();
const queue = [];
const pairs = new Map();

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  socket.on('identify', (data) => {
    socket.data.sessionId = data.sessionId;
    socket.data.role = data.role || 'user';
    socket.data.volunteerId = data.volunteerId || null;
    socket.data.volunteerName = data.volunteerName || null;
    if (data.role === 'listener') {
      availableListeners.set(socket.id, { socket, volunteerId: data.volunteerId || null });
      socket.emit('queue_status', { length: queue.length });
    } else {
      // user joins room named by sessionId
      if (data.sessionId) socket.join(data.sessionId);
    }
  });

  socket.on('typing', (d) => {
    const listenerSid = pairs.get(d.sessionId);
    if (listenerSid) io.to(listenerSid).emit('typing', { from: 'user', sessionId: d.sessionId });
  });

  socket.on('typing_clear', (d) => {
    const listenerSid = pairs.get(d.sessionId);
    if (listenerSid) io.to(listenerSid).emit('typing_clear', { sessionId: d.sessionId });
  });

  socket.on('request_listener', (d) => {
    const entry = { sessionId: d.sessionId, socketId: socket.id, requestedAt: Date.now() };
    queue.push(entry);
    for (const [, info] of availableListeners) {
      info.socket.emit('queue_update', { length: queue.length });
    }
    matchQueue();
  });

  socket.on('ai_reply', (d) => {
    const listenerSid = pairs.get(d.sessionId);
    if (listenerSid) io.to(listenerSid).emit('ai_reply', { sessionId: d.sessionId, reply: d.reply });
  });

  socket.on('accept_listener', (d) => {
    // volunteer accepts a session
    const idx = queue.findIndex((q) => q.sessionId === d.sessionId);
    if (idx !== -1) queue.splice(idx, 1);
    pairs.set(d.sessionId, socket.id);
    io.to(socket.id).emit('listener_assigned', { sessionId: d.sessionId, listenerId: socket.data.volunteerId || socket.id });
    io.to(d.sessionId).emit('listener_assigned', { sessionId: d.sessionId, listenerName: socket.data.volunteerName || 'Volunteer' });
  });

  socket.on('listener_message', (d) => {
    io.to(d.sessionId).emit('listener_message', { text: d.text, sessionId: d.sessionId });
  });

  socket.on('disconnect', () => {
    availableListeners.delete(socket.id);
    for (const [sessionId, listenerSid] of pairs.entries()) {
      if (listenerSid === socket.id) pairs.delete(sessionId);
    }
  });
});

function matchQueue() {
  if (queue.length === 0 || availableListeners.size === 0) return;
  const entry = queue.shift();
  const first = availableListeners.values().next().value;
  if (!first) return;
  const listenerSocket = first.socket;
  pairs.set(entry.sessionId, listenerSocket.id);
  listenerSocket.emit('incoming_request', { sessionId: entry.sessionId });
  io.to(entry.sessionId).emit('listener_assigned', { sessionId: entry.sessionId, listenerName: listenerSocket.data.volunteerName || 'Volunteer' });
}

const PORT = process.env.PORT || 5001;
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hearme')
  .then(() => server.listen(PORT, () => console.log(`Server listening on ${PORT}`)))
  .catch((err) => console.error('Mongo error', err));
