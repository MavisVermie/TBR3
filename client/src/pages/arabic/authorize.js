const jwt = require("jsonwebtoken");
require("dotenv").config();

// ميدل وير للتحقق من التوكن
module.exports = function (req, res, next) {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res.status(403).json({ msg: "تم رفض الوصول. لم يتم العثور على رمز التوثيق" });
    }

    const token = authHeader.split(' ')[1]; // "Bearer <token>"

    if (!token) {
      return res.status(403).json({ msg: "رمز التوثيق مفقود" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.userId) {
      console.error('هيكل التوكن غير صالح: لم يتم العثور على userId');
      return res.status(401).json({ msg: "هيكل التوكن غير صالح" });
    }

    // تخزين بيانات المستخدم في كائن الطلب
    req.user = {
      id: decoded.userId,
      isAdmin: decoded.isAdmin || false
    };

    next(); // الانتقال إلى الميدل وير التالي
  } catch (err) {
    console.error('خطأ في التوثيق', err.message);
    return res.status(401).json({ msg: "رمز التوثيق غير صالح" });
  }
};
