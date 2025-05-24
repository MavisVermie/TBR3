// المسارات/مسارات_المسؤول.js

const express = require("express");
const router = express.Router();
const pool = require("../db");
const authorize = require("../middleware/authorize");

// ✅ تطبيق التحقق من الصلاحيات والتحقق من كونه مسؤولًا على جميع المسارات
router.use(authorize);
router.use((req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ msg: "للمسؤولين فقط." });
  }
  next();
});

// الحصول على جميع المستخدمين
router.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, username, email, is_admin FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error("خطأ في جلب المستخدمين من قبل المسؤول:", err.message);
    res.status(500).json({ msg: "خطأ في الخادم" });
  }
});

// ترقية/إلغاء ترقية المستخدم كمسؤول
router.put("/users/:id/toggle-admin", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE users SET is_admin = NOT is_admin WHERE id = $1 RETURNING id, is_admin",
      [id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("خطأ في تبديل حالة المسؤول:", err.message);
    res.status(500).json({ msg: "خطأ في الخادم" });
  }
});

// حذف مستخدم
router.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    res.json({ msg: "تم حذف المستخدم" });
  } catch (err) {
    console.error("خطأ في حذف المستخدم من قبل المسؤول:", err.message);
    res.status(500).json({ msg: "خطأ في الخادم" });
  }
});

// جلب جميع المنشورات
router.get("/posts", async (req, res) => {
  console.log("✅ تم الوصول إلى المسار /admin/posts");
  try {
    const result = await pool.query(`
      SELECT 
        posts.post_id, 
        posts.title, 
        posts.primary_photo,
        users.id AS user_id,
        users.username,
        users.email
      FROM posts
      JOIN users ON posts.user_id = users.id
    `);

    const posts = result.rows.map(post => ({
      ...post,
      primary_photo: post.primary_photo?.toString("base64"),
    }));

    res.json(posts);
  } catch (err) {
    console.error("خطأ في جلب المنشورات من قبل المسؤول:", err.message);
    res.status(500).json({ msg: "خطأ في الخادم" });
  }
});

// حذف منشور
router.delete("/posts/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    await pool.query("DELETE FROM posts WHERE post_id = $1", [postId]);
    res.json({ msg: "تم حذف المنشور" });
  } catch (err) {
    console.error("خطأ في حذف المنشور من قبل المسؤول:", err.message);
    res.status(500).json({ msg: "خطأ في الخادم" });
  }
});

// مسار اختبار
router.get("/test", (req, res) => {
  res.send("مسار الاختبار للمسؤول يعمل!");
});

module.exports = router;
