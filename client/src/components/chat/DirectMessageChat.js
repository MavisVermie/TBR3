import { useEffect, useRef, useState } from 'react';
import socket from '../../utils/socket';
import axios from 'axios';

export default function DirectMessageChat({ currentUserId, otherUserId }) {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [otherUserName, setOtherUserName] = useState(`User ${otherUserId}`);
  const chatContainerRef = useRef(null);

  // 👤 Fetch the other user's name
  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/users/${otherUserId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.data?.username) {
          setOtherUserName(res.data.username);
        }
      } catch (err) {
        console.error('Error fetching user info:', err);
      }
    };

    if (otherUserId) fetchUserName();
  }, [otherUserId]);

  // 📨 Fetch chat history & mark messages as read
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/messages/${otherUserId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        const formatted = data.map((msg) => ({
          from: msg.sender_id === currentUserId ? 'me' : 'them',
          text: msg.content,
          timestamp: msg.timestamp
        }));
        setChat(formatted);

        // ✅ Mark messages from otherUserId as read
        await fetch(`${process.env.REACT_APP_API_URL}/messages/${otherUserId}/read`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();
  }, [currentUserId, otherUserId]);

  // 🔌 Socket logic
  useEffect(() => {
    socket.connect();
    socket.emit('register', currentUserId);

    const handlePrivateMessage = ({ fromUserId, message }) => {
      if (parseInt(fromUserId) === parseInt(otherUserId)) {
        setChat((prev) => [...prev, { from: 'them', text: message, timestamp: new Date().toISOString() }]);
      }
    };

    socket.on('private_message', handlePrivateMessage);

    return () => {
      socket.off('private_message', handlePrivateMessage);
    };
  }, [currentUserId, otherUserId]);

  // ⬇️ Auto scroll
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chat]);

  // 📤 Send message
  const sendMessage = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`${process.env.REACT_APP_API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiver_id: otherUserId,
          content: trimmed,
        }),
      });

      socket.emit('private_message', {
        toUserId: otherUserId,
        fromUserId: currentUserId,
        message: trimmed,
      });

      setChat((prev) => [...prev, {
        from: 'me',
        text: trimmed,
        timestamp: new Date().toISOString()
      }]);

      setMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '16px' }}>
      <h2 style={{
        textAlign: 'center',
        marginBottom: '20px',
        fontSize: '22px',
        color: '#333'
      }}>
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
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.05)'
        }}
      >
        {chat.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: msg.from === 'me' ? 'flex-end' : 'flex-start',
              marginBottom: '10px'
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
                  fontSize: '14px'
                }}
              >
                {msg.text}
              </div>
              <div style={{
                fontSize: '11px',
                color: '#999',
                marginTop: '4px'
              }}>
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
          gap: '10px'
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
            backgroundColor: '#f8f8f8'
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
            transition: 'background 0.3s'
          }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = '#0056b3'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = '#007bff'}
        >
          Send
        </button>
      </div>
    </div>
  );
}
