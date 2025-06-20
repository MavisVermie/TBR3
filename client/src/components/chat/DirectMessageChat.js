import { useEffect, useRef, useState } from 'react';
import socket from '../../utils/socket';
import axios from 'axios';

export default function DirectMessageChat({ currentUserId, otherUserId }) {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [otherUserName, setOtherUserName] = useState(`User ${otherUserId}`);
  const chatContainerRef = useRef(null);

  // Fetch user name
  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/${otherUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOtherUserName(res.data?.username || `User ${otherUserId}`);
      } catch (err) {
        console.error('Error fetching user info:', err);
      }
    };
    fetchUserName();
  }, [otherUserId]);

  // Fetch messages + notify server we're in the chat
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.REACT_APP_API_URL}/messages/${otherUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const formatted = data.map((msg) => ({
          id: msg.id,
          from: msg.sender_id === currentUserId ? 'me' : 'them',
          text: msg.content,
          timestamp: msg.timestamp,
          status: msg.status || 'sent',
        }));
        setChat(formatted);

        // Notify backend we are chatting
        socket.emit('chat_open', {
          userId: currentUserId,
          chattingWith: otherUserId,
        });

        // Mark as read
const readRes = await axios.patch(
  `${process.env.REACT_APP_API_URL}/messages/${otherUserId}/read`,
  {},
  { headers: { Authorization: `Bearer ${token}` } }
);

// 🔁 Emit read receipts for each newly read message
if (Array.isArray(readRes.data?.readMessageIds)) {
  readRes.data.readMessageIds.forEach((msgId) => {
    socket.emit('message_read', {
      readerId: currentUserId,
      messageId: msgId
    });
  });
}
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();

    return () => {
      socket.emit('chat_close', { userId: currentUserId });
    };
  }, [currentUserId, otherUserId]);

  // Socket listeners
  useEffect(() => {
    socket.connect();
    socket.emit('register', currentUserId);

const handlePrivateMessage = ({ fromUserId, message, timestamp, id, status }) => {
  if (parseInt(fromUserId) === parseInt(otherUserId)) {
    setChat((prev) => {
      const alreadyExists = prev.some(msg => msg.id === id);
      if (alreadyExists) return prev;

      return [
        ...prev,
        {
          id,
          from: 'them',
          text: message,
          timestamp: timestamp || new Date().toISOString(),
          status: status || 'delivered',
        }
      ];
    });

    socket.emit('message_read', { readerId: currentUserId, messageId: id });
  } else {
    // If the sender is me and this is a status update from the server, update existing message
    setChat((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, status: status || msg.status } : msg
      )
    );
  }
};



    const handleMessageStatusUpdate = ({ messageId, status }) => {
      setChat((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, status } : msg
        )
      );
    };

    socket.on('private_message', handlePrivateMessage);
    socket.on('message_status_update', handleMessageStatusUpdate);

    return () => {
      socket.off('private_message', handlePrivateMessage);
      socket.off('message_status_update', handleMessageStatusUpdate);
    };
  }, [currentUserId, otherUserId]);

  // Auto scroll
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chat]);

  // Send message
  const sendMessage = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/messages`,
        { receiver_id: otherUserId, content: trimmed },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newMessage = {
        id: res.data.id,
        from: 'me',
        text: trimmed,
        timestamp: res.data.timestamp || new Date().toISOString(),
        status: 'sent',
      };

      setChat((prev) => [...prev, newMessage]);

      socket.emit('private_message', {
        toUserId: otherUserId,
        fromUserId: currentUserId,
        message: trimmed,
        messageId: res.data.id,
      });

      setMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTick = (msg) => {
    if (msg.from !== 'me') return null;
    if (msg.status === 'read') return '✓✓';
    if (msg.status === 'delivered') return '✓✓';
    return '✓';
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '16px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '22px', color: '#333' }}>
        Chat with {otherUserName}
      </h2>

      <div
        ref={chatContainerRef}
        style={{
          border: '1px solid #e0e0e0',
          borderRadius: '12px',
          padding: '16px',
          height: '400px',
          overflowY: 'auto',
          background: '#ffffff',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.05)',
        }}
      >
        {chat.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: msg.from === 'me' ? 'flex-end' : 'flex-start',
              marginBottom: '10px',
            }}
          >
            <div style={{ textAlign: msg.from === 'me' ? 'right' : 'left' }}>
              <div
                style={{
                  padding: '10px 14px',
                  background: msg.from === 'me' ? '#007bff' : '#f1f1f1',
                  color: msg.from === 'me' ? 'white' : '#333',
                  borderRadius: '18px',
                  maxWidth: '300px',
                  wordWrap: 'break-word',
                  fontSize: '14px',
                  position: 'relative',
                }}
              >
                {msg.text}
                {msg.from === 'me' && (
                  <span
                    style={{
                      fontSize: '11px',
                      marginLeft: '8px',
                      color: msg.status === 'read' ? '#4CAF50' : '#ccc',
                    }}
                  >
                    {getTick(msg)}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                {formatTime(msg.timestamp)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: '20px',
            border: '1px solid #ccc',
            outline: 'none',
            fontSize: '14px',
            backgroundColor: '#f8f8f8',
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: '10px 20px',
            borderRadius: '20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
