const express = require('express');
const router = express.Router();
const pool = require('../db');

// المسار لجلب الصور باستخدام postId
router.get('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;

    // استعلام قاعدة البيانات لجلب بيانات الصورة بناءً على postId
    const result = await pool.query('SELECT attached_photo FROM posts WHERE post_id = $1', [postId]);

    // التحقق مما إذا كانت الصورة موجودة لهذا postId
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'الصورة غير موجودة' });
    }

    // استخراج بيانات الصورة من نتيجة الاستعلام
    const imageData = result.rows[0].attached_photo;

    // طباعة بيانات الصورة في وحدة التحكم لمراجعتها
    console.log('بيانات الصورة:', imageData);

    // إرسال الصورة كاستجابة مع نوع المحتوى المناسب
    res.writeHead(200, {
      'Content-Type': 'image/*', // عدّل نوع المحتوى حسب نوع الصورة لديك (مثلاً image/jpeg أو image/png)
      'Content-Length': imageData.length
    });
    res.end(imageData, 'binary');

  } catch (error) {
    console.error('خطأ أثناء جلب الصورة:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

module.exports = router;
