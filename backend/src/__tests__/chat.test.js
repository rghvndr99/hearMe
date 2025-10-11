import request from 'supertest';
import express from 'express';
import chatRouter from '../routes/chat.js';

const app = express();
app.use(express.json());
app.use('/api/chat', chatRouter);

describe('Chat route', () => {
  it('returns 400 when message missing', async () => {
    const res = await request(app).post('/api/chat').send({});
    expect(res.statusCode).toBe(400);
  });
});
