import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export default function MessagesPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      setCurrentUserId(decoded.userId);
    }

    const fetchContacts = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/messages/contacts`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setContacts(res.data);
      } catch (err) {
        console.error('Failed to load contacts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
    const interval = setInterval(fetchContacts, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const formatTime = timestamp => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = date.toDateString() === new Date(Date.now() - 86400000).toDateString();
    if (isToday) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isYesterday) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const getStatusIcon = (contact) => {
    if (contact.last_sender_id !== currentUserId) return null;

    const style = {
      fontSize: '14px',
      marginLeft: '6px'
    };

    if (contact.last_status === 'read') {
      return <span style={{ ...style, color: '#007bff' }}>✔✔</span>; // Blue for read
    } else {
      return <span style={{ ...style, color: '#999' }}>✔</span>; // Gray for sent
    }
  };

  if (loading) return <p>Loading conversations...</p>;
  if (contacts.length === 0) return <p>No conversations yet.</p>;

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Messages</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {contacts.map(contact => (
          <li
            key={contact.id}
            onClick={() => navigate(`/dm/${contact.id}`)}
            style={{
              cursor: 'pointer',
              padding: '12px',
              borderBottom: '1px solid #eee',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              borderRadius: '8px',
              backgroundColor: '#fafafa',
              transition: 'background 0.2s ease-in-out'
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#f1f1f1')}
            onMouseLeave={e => (e.currentTarget.style.background = '#fafafa')}
          >
            {/* Profile Circle */}
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#007bff',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '18px',
              flexShrink: 0
            }}>
              {contact.username?.charAt(0)?.toUpperCase() || '?'}
            </div>

            {/* Contact Info */}
            <div style={{ flex: 1 }}>
              <div style={{
                fontWeight: contact.unread_count > 0 ? 'bold' : 'normal',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                {contact.username}
                {contact.unread_count > 0 && (
                  <span style={{
                    backgroundColor: '#ff4d4f',
                    color: 'white',
                    fontSize: '12px',
                    borderRadius: '999px',
                    padding: '2px 8px',
                    marginLeft: '10px'
                  }}>
                    {contact.unread_count}
                  </span>
                )}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#555',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                marginTop: '2px',
                display: 'flex',
                alignItems: 'center'
              }}>
                {contact.last_message || 'No messages yet'} {getStatusIcon(contact)}
              </div>
            </div>

            {/* Timestamp */}
            <div style={{
              fontSize: '12px',
              color: '#999',
              marginLeft: '8px',
              whiteSpace: 'nowrap'
            }}>
              {formatTime(contact.last_timestamp)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
