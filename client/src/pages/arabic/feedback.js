const router = require("express").Router();
const authorize = require("../middleware/authorize");
const pool = require("../db");

// POST / - إرسال تقييم لمستخدم
router.post("/", authorize, async (req, res) => {
  try {
    const giverId = req.user.id;
    const { receiver_id, rating, comment } = req.body;

    // منع المستخدم من تقييم نفسه
    if (giverId === receiver_id) {
      return res.status(400).json({ message: "لا يمكنك تقييم نفسك" });
    }

    // التحقق من صحة البيانات المُدخلة
    if (!receiver_id || typeof rating !== "number" || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "تقييم أو معرف مستلم غير صالح" });
    }

    // التحقق من عدم وجود تقييم سابق
    const existing = await pool.query(
      `SELECT * FROM feedback WHERE giver_id = $1 AND receiver_id = $2`,
      [giverId, receiver_id]
    );

    if (existing.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "لقد قمت مسبقاً بإرسال تقييم لهذا المستخدم" });
    }

    // إدخال التقييم في قاعدة البيانات
    const newFeedback = await pool.query(
      `INSERT INTO feedback (giver_id, receiver_id, rating, comment)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [giverId, receiver_id, rating, comment]
    );

    res.json({
      message: "تم إرسال التقييم بنجاح",
      feedback: newFeedback.rows[0],
    });
  } catch (err) {
    console.error("خطأ أثناء إرسال التقييم", err.message);
    res.status(500).send("خطأ في الخادم");
  }
});

// GET /:userId - عرض جميع التقييمات لمستخدم معين
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const feedbacks = await pool.query(
      `SELECT 
         f.giver_id,
         f.rating, 
         f.comment, 
         f.created_at, 
         u.username AS giver_username
       FROM feedback f
       JOIN users u ON f.giver_id = u.id
       WHERE f.receiver_id = $1
       ORDER BY f.created_at DESC`,
      [userId]
    );

    const avgResult = await pool.query(
      `SELECT ROUND(AVG(rating), 1) AS average_rating
       FROM feedback
       WHERE receiver_id = $1`,
      [userId]
    );

    const averageRating = avgResult.rows[0].average_rating || 0;

    res.json({
      average_rating: averageRating,
      feedbacks: feedbacks.rows,
    });
  } catch (err) {
    console.error("خطأ أثناء جلب التقييمات", err.message);
    res.status(500).send("خطأ في الخادم");
  }
});

// DELETE /:receiverId - حذف التقييم الذي أرسله المستخدم الحالي لمستخدم معين
router.delete("/:receiverId", authorize, async (req, res) => {
  try {
    const giverId = req.user.id;
    const receiverId = req.params.receiverId;

    const deleted = await pool.query(
      `DELETE FROM feedback WHERE giver_id = $1 AND receiver_id = $2 RETURNING *`,
      [giverId, receiverId]
    );

    if (deleted.rowCount === 0) {
      return res.status(404).json({ message: "لم يتم العثور على التقييم" });
    }

    res.json({ message: "تم حذف التقييم بنجاح." });
  } catch (err) {
    console.error("خطأ أثناء حذف التقييم", err.message);
    res.status(500).send("خطأ في الخادم");
  }
});

module.exports = router;
