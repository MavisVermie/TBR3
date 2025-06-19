const express = require('express');
const router = express.Router();
const pool = require('../db');
const authorize = require('../middleware/authorize');

// Send a message
// Send a message
router.post('/', authorize, async (req, res) => {
  const { receiver_id, content } = req.body;
  const sender_id = req.user.id;

  try {
    const result = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, content, is_read, updated_at)
       VALUES ($1, $2, $3, FALSE, NOW())
       RETURNING *`,
      [sender_id, receiver_id, content]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
// Mark messages from a user as read
router.patch('/mark-read/:userId', authorize, async (req, res) => {
  const receiver_id = req.user.id; // the logged-in user
  const sender_id = req.params.userId;

  try {
    await pool.query(
      `UPDATE messages
       SET is_read = TRUE
       WHERE sender_id = $1 AND receiver_id = $2 AND is_read = FALSE`,
      [sender_id, receiver_id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error marking messages as read:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get users you’ve chatted with, including last message and unread count
router.get('/contacts', authorize, async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `
      SELECT u.id, u.username,
             m2.content AS last_message,
             m2.updated_at AS last_timestamp,
             COALESCE(unread.count, 0) AS unread_count
      FROM (
        SELECT DISTINCT
          CASE
            WHEN sender_id = $1 THEN receiver_id
            ELSE sender_id
          END AS contact_id
        FROM messages
        WHERE sender_id = $1 OR receiver_id = $1
      ) contacts
      JOIN users u ON u.id = contacts.contact_id
      LEFT JOIN LATERAL (
        SELECT content, updated_at
        FROM messages
        WHERE (sender_id = u.id AND receiver_id = $1)
           OR (sender_id = $1 AND receiver_id = u.id)
        ORDER BY updated_at DESC
        LIMIT 1
      ) m2 ON true
      LEFT JOIN LATERAL (
        SELECT COUNT(*) AS count
        FROM messages
        WHERE sender_id = u.id AND receiver_id = $1 AND is_read = FALSE
      ) unread ON true
      ORDER BY m2.updated_at DESC NULLS LAST
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching contacts:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:userId/read', authorize, async (req, res) => {
  const readerId = req.user.id;
  const senderId = req.params.userId;

  try {
    await pool.query(
      `
      UPDATE messages
      SET is_read = true
      WHERE sender_id = $1 AND receiver_id = $2 AND is_read = false
      `,
      [senderId, readerId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Error marking messages as read:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get messages between two users
router.get('/:userId', authorize, async (req, res) => {
  const sender_id = req.user.id;
  const receiver_id = req.params.userId;

  try {
    const result = await pool.query(
      `
      SELECT * FROM messages 
      WHERE (sender_id = $1 AND receiver_id = $2)
         OR (sender_id = $2 AND receiver_id = $1)
      ORDER BY timestamp ASC
      `,
      [sender_id, receiver_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Server error' });
  }
});



module.exports = router;
