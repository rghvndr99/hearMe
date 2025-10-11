// src/pages/Chat.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

const SOCKET_PATH = import.meta.env.VITE_BACKEND_URL || ''; // e.g. http://localhost:5000

export default function Chat() {
  const [messages, setMessages] = useState([{ text: "Hi — I'm here to listen. What’s on your mind?", who:'ai' }]);
  const [input, setInput] = useState('');
  const [sessionId] = useState(() => localStorage.getItem('hearMeSessionId') || uuidv4());
  const [typingStatus, setTypingStatus] = useState(null); // 'listener', 'ai', null
  const [listenerRequested, setListenerRequested] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // persist session id
    localStorage.setItem('hearMeSessionId', sessionId);

    // connect socket
    const socket = io(SOCKET_PATH || undefined, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('identify', { sessionId, role: 'user' });
    });

    socket.on('typing', (data) => {
      // data = { from: 'listener' | 'ai', sessionId }
      if (data.sessionId === sessionId) setTypingStatus(data.from);
    });

    socket.on('listener_assigned', (data) => {
      // data = { listenerId, listenerName }
      appendMessage(`A volunteer has joined the session (${data.listenerName || 'listener'}).`, 'ai');
    });

    socket.on('listener_message', (data) => {
      if (data.sessionId === sessionId) appendMessage(data.text, 'ai');
    });

    socket.on('ai_reply', (data) => {
      if (data.sessionId === sessionId) appendMessage(data.reply, 'ai');
    });

    socket.on('typing_clear', (d) => { if (d.sessionId === sessionId) setTypingStatus(null); });

    return () => { socket.disconnect(); };
  }, [sessionId]);

  const appendMessage = (text, who='ai') => {
    setMessages(prev => [...prev, { text, who }]);
  };

  // call backend AI chat endpoint
  const sendToAI = async (text) => {
    try {
      appendMessage(text, 'user');
      const res = await axios.post(`${SOCKET_PATH || ''}/api/chat`, { sessionId, message: text, lang: 'en' });
      if (res.data?.reply) {
        appendMessage(res.data.reply, 'ai');
        // also emit ai_reply over socket to allow listeners to see it in real-time
        socketRef.current?.emit('ai_reply', { sessionId, reply: res.data.reply });
      }
    } catch (err) {
      appendMessage('Sorry, something went wrong connecting to the AI.', 'ai');
      console.error(err);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    // while typing: emit typing events ended
    socketRef.current?.emit('typing_clear', { sessionId, from: 'user' });
    await sendToAI(input.trim());
    setInput('');
  };

  // typing indicator emit
  let typingTimeout = useRef();
  const handleTyping = (val) => {
    setInput(val);
    socketRef.current?.emit('typing', { sessionId, from: 'user' });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socketRef.current?.emit('typing_clear', { sessionId, from: 'user' });
    }, 1200);
  };

  // request a human listener
  const requestListener = () => {
    setListenerRequested(true);
    socketRef.current?.emit('request_listener', { sessionId });
    appendMessage('Connecting you to a volunteer listener — please wait...', 'ai');
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="bg-white shadow rounded-xl p-4 flex flex-col h-[700px]">
        <div className="flex-1 overflow-y-auto space-y-3 py-3">
          {messages.map((m,i) => (
            <div key={i} className={`px-4 py-2 rounded-xl text-sm max-w-[80%] ${m.who==='user' ? 'bg-indigo-500 text-white self-end ml-auto' : 'bg-indigo-50 text-slate-800 self-start'}`}>
              {m.text}
            </div>
          ))}
        </div>

        <div className="text-xs text-slate-500 mb-2">{typingStatus ? `${typingStatus === 'listener' ? 'Volunteer is typing…' : 'Someone is typing…'}` : ''}</div>

        <div className="flex items-center gap-2 mt-2">
          <input
            value={input}
            onChange={(e) => handleTyping(e.target.value)}
            placeholder="Type or speak (e.g. 'I feel lonely')"
            className="flex-1 p-3 border rounded-lg"
            onKeyDown={(e) => { if (e.key==='Enter') handleSend(); }}
          />
          <button onClick={handleSend} className="bg-indigo-500 text-white px-4 py-2 rounded-lg">Send</button>
          <button onClick={requestListener} disabled={listenerRequested} className="bg-amber-400 px-3 py-2 rounded-lg">{listenerRequested ? 'Waiting...' : 'Talk to a human'}</button>
        </div>
      </div>
    </div>
  );
}