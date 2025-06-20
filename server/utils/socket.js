const pool = require('../db');

const users = new Map();       // userId -> Set of socket.ids
const activeChats = new Map(); // userId -> currently open chat userId

function socketHandler(io) {
  io.on('connection', (socket) => {
    console.log('🔌 A user connected:', socket.id);

    // ✅ Register user
    socket.on('register', (userId) => {
      userId = String(userId);
      if (!users.has(userId)) users.set(userId, new Set());
      users.get(userId).add(socket.id);
      console.log(`✅ Registered user ${userId} with socket ${socket.id}`);
    });

    // 💬 Track active chats
    socket.on('chat_open', ({ userId, chattingWith }) => {
      activeChats.set(String(userId), String(chattingWith));
      console.log(`💬 User ${userId} is chatting with ${chattingWith}`);
    });

    socket.on('chat_close', ({ userId }) => {
      activeChats.delete(String(userId));
      console.log(`🚪 User ${userId} left the chat`);
    });

    // 📩 Handle sending private messages
    socket.on('private_message', async ({ toUserId, fromUserId, message, messageId }) => {
      toUserId = String(toUserId);
      fromUserId = String(fromUserId);

      try {
        // 1. Save message to DB (if not already inserted via REST)
        const result = await pool.query(
          `UPDATE messages
           SET status = 'sent'
           WHERE id = $1 AND sender_id = $2 AND receiver_id = $3`,
          [messageId, fromUserId, toUserId]
        );

        // 2. If recipient is actively chatting with sender, mark as read
        let messageStatus = 'sent';
        if (activeChats.get(toUserId) === fromUserId) {
          await pool.query(
            `UPDATE messages SET is_read = TRUE, status = 'read' WHERE id = $1`,
            [messageId]
          );
          messageStatus = 'read';
        }

        // 3. Emit only to recipient
        const targetSockets = users.get(toUserId);
        if (targetSockets) {
          for (const socketId of targetSockets) {
            io.to(socketId).emit('private_message', {
              fromUserId,
              message,
              timestamp: Date.now(),
              id: messageId,
              status: messageStatus
            });
          }
        }

        // 4. Emit status update to sender
        const senderSockets = users.get(fromUserId);
        if (senderSockets) {
          for (const socketId of senderSockets) {
            io.to(socketId).emit('message_status_update', {
              messageId,
              status: messageStatus
            });
          }
        }
      } catch (err) {
        console.error('❌ Socket error sending message:', err);
      }
    });

    // 🔵 Real-time read receipts
    socket.on('message_read', async ({ readerId, messageId }) => {
      try {
        await pool.query(
          `UPDATE messages SET is_read = TRUE, status = 'read' WHERE id = $1`,
          [messageId]
        );

        const msgRes = await pool.query(
          `SELECT sender_id FROM messages WHERE id = $1`,
          [messageId]
        );
        const senderId = String(msgRes.rows[0]?.sender_id);
        if (!senderId) return;

        const senderSockets = users.get(senderId);
        if (senderSockets) {
          for (const socketId of senderSockets) {
            io.to(socketId).emit('message_status_update', {
              messageId,
              status: 'read'
            });
          }
        }
      } catch (err) {
        console.error('❌ Error updating read status:', err);
      }
    });

    // ❌ Disconnect cleanup
    socket.on('disconnect', () => {
      for (const [userId, sockets] of users.entries()) {
        if (sockets.has(socket.id)) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            users.delete(userId);
            activeChats.delete(userId);
          }
          break;
        }
      }
      console.log('❌ User disconnected:', socket.id);
    });
  });
}

module.exports = socketHandler;
module.exports.users = users;
