const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../db");
const authorize = require("../middleware/authorize");
const jwtGenerator = require("../utils/jwtGenerator"); // ✅ استيراد مولد JWT
require('dotenv').config();

// ✅ تسجيل الدخول
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // البحث عن المستخدم بالبريد الإلكتروني
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    // إذا لم يتم العثور على مستخدم
    if (user.rows.length === 0) {
      return res.status(401).json("بيانات الاعتماد غير صحيحة");
    }

    // التحقق من كلمة المرور
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(401).json("بيانات الاعتماد غير صحيحة");
    }

    // توليد رمز JWT
    const jwtToken = jwtGenerator(user.rows[0].id, user.rows[0].is_admin);

    // إرسال الرمز للمستخدم
    res.json({ jwtToken });

  } catch (err) {
    console.error("خطأ أثناء تسجيل الدخول", err.message);
    res.status(500).send("خطأ في الخادم");
  }
});

// ✅ التحقق من صحة الجلسة
router.post("/verify", authorize, (req, res) => {
  console.log("تم استلام طلب تحقق /verify");
  try {
    res.json(true);
  } catch (err) {
    console.error("خطأ أثناء التحقق:", err.message);
    res.status(500).send("خطأ في الخادم");
  }
});

module.exports = router;
