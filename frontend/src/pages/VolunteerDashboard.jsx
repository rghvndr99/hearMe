import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

export default function VolunteerDashboard() {
  const [token, setToken] = useState(localStorage.getItem('volToken'));
  const [socket, setSocket] = useState(null);
  const [incoming, setIncoming] = useState(null);

  useEffect(() => {
    if (token) {
      const s = io(process.env.VITE_BACKEND_URL || '', {
        transports: ['websocket'],
        auth: { token },
      });
      s.on('connect', () => {
        // identify as listener
        s.emit('identify', { role: 'listener', volunteerId: 'vol-' + Date.now(), volunteerName: 'You' });
      });
      s.on('incoming_request', (d) => {
        setIncoming(d.sessionId);
      });
      s.on('queue_update', (q) => console.log('queue', q));
      s.on('queue_status', (q) => console.log('queue status', q));
      setSocket(s);
      return () => s.disconnect();
    }
  }, [token]);

  const accept = () => {
    socket.emit('accept_listener', { sessionId: incoming });
    setIncoming(null);
  };

  return (
    <div className="p-4">
      {!token && <div>Please login</div>}
      {incoming && (
        <div className="bg-white p-4 rounded">
          <div>Incoming request: {incoming}</div>
          <button onClick={accept} className="bg-green-500 px-3 py-1 rounded">Accept</button>
        </div>
      )}
    </div>
  );
}
