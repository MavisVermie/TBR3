const users = new Map(); // userId -> Set of socket.ids

module.exports = function (io) {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

socket.on('register', (userId) => {
  userId = String(userId); // <-- force string
  if (!users.has(userId)) users.set(userId, new Set());
  users.get(userId).add(socket.id);
  console.log(` Registered user ${userId} with socket ${socket.id}`);
});

socket.on('private_message', ({ toUserId, fromUserId, message }) => {
  toUserId = String(toUserId); // <-- force string
  const targetSockets = users.get(toUserId);
  if (targetSockets) {
    for (const socketId of targetSockets) {
      io.to(socketId).emit('private_message', {
        fromUserId,
        message,
        timestamp: Date.now()
      });
    }
  }
});


    socket.on('disconnect', () => {
      for (const [userId, sockets] of users.entries()) {
        if (sockets.has(socket.id)) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            users.delete(userId);
          }
          break;
        }
      }
      console.log('User disconnected:', socket.id);
    });
  });
};
