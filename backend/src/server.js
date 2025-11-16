import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import chatRouter from './routes/chat.js';
import sentimentRouter from './routes/sentiment.js';
import listenerRouter from './routes/listener.js';
import authRouter from './routes/auth.js';
import aiChatRouter from './routes/aiChat.js';
import volunteerRouter from './routes/volunteer.js';
import ttsRouter from './routes/tts.js';
import usersRouter from './routes/users.js';
import voiceTwinRouter from './routes/voicetwin.js';
import speakerDiarizationRouter from './routes/speakerDiarization.js';
import storiesRouter from './routes/stories.js';
import subscriptionsRouter from './routes/subscriptions.js';
import pricingRouter from './routes/pricing.js';
import walletRouter from './routes/wallet.js';
import bookingsRouter from './routes/bookings.js';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// OpenAI API Key presence check removed (no console output in production)

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
app.use('/api/volunteer', volunteerRouter);
app.use('/api/tts', ttsRouter);
app.use('/api/users', usersRouter);
app.use('/api/voicetwin', voiceTwinRouter);
app.use('/api/speaker-diarization', speakerDiarizationRouter);
app.use('/api/stories', storiesRouter);
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api', pricingRouter);
app.use('/api', walletRouter);
app.use('/api', bookingsRouter);

const PORT = process.env.PORT || 5001;
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/voicelap')
  .then(() => app.listen(PORT))
  .catch(() => {});
