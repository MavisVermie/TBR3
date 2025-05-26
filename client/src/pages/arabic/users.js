const router = require("express").Router();
const pool = require("../db");

// ✅ GET /:userId - الحصول على بيانات مستخدم باستخدام معرف المستخدم
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // الاستعلام عن بيانات المستخدم من قاعدة البيانات
    const userQuery = await pool.query(
      `SELECT id AS user_id, username, email, zip_code FROM users WHERE id = $1`,
      [userId]
    );

    // التحقق مما إذا كان المستخدم موجودًا
    if (userQuery.rows.length === 0) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    // إرسال بيانات المستخدم كرد
    res.json(userQuery.rows[0]);

  } catch (err) {
    console.error("خطأ أثناء جلب بيانات المستخدم", err.message);
    res.status(500).send("خطأ في الخادم");
  }
});

module.exports = router;
