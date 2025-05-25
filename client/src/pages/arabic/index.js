require('dotenv').config();
console.log("تم تحميل مفتاح JWT:", process.env.JWT_SECRET);

const express = require("express");
const التطبيق = express();
const cors = require("cors");
const قاعدة_البيانات = require("./db");
const رفع_الملفات = require("express-fileupload");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const تحقق_الصلاحية = require("./middleware/authorize");
const إرسال_بريد = require("./middleware/mailer");
const مفتاحJWT = process.env.JWT_SECRET;
const crypto = require('crypto');
const NodeCache = require('node-cache');
const الذاكرة_المؤقتة = new NodeCache();
// const sharp = require('sharp');
const موجه_الآراء = require("./routes/feedback");

// وسائط
التطبيق.use(cors());
التطبيق.use(express.json());
التطبيق.use(رفع_الملفات());

// المسارات
التطبيق.use("/api/users", require("./routes/users")); // المستخدمون
التطبيق.use("/api/feedback", موجه_الآراء); // الآراء
التطبيق.use("/admin", require("./routes/adminroutes")); // لوحة الإدارة
التطبيق.use("/authentication", require("./routes/jwtAuth")); // المصادقة
التطبيق.use("/Posting", require("./routes/itemPost")); // النشر

// عرض الصور حسب معرف المنشور
التطبيق.get('/images/:postId', async (طلب, رد) => {
  try {
    const { postId } = طلب.params;

    const نتيجة = await قاعدة_البيانات.query('SELECT attached_photo FROM posts WHERE post_id = $1', [postId]);

    if (نتيجة.rows.length === 0) {
      return رد.status(404).json({ message: 'الصورة غير موجودة' });
    }

    const الصورة = نتيجة.rows[0].attached_photo;
    const صورةBase64 = الصورة.toString('base64');
    const محتوىHTML = `
      <!DOCTYPE html>
      <html lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>عرض صورة</title>
      </head>
      <body>
        <h1>الصورة المدمجة</h1>
        <img src="data:image/;base64,${صورةBase64}" alt="الصورة">
      </body>
      </html>
    `;

    رد.writeHead(200, {
      'Content-Type': 'text/html',
      'Worked': 'yes'
    });
    رد.end(محتوىHTML);

  } catch (خطأ) {
    console.error('خطأ أثناء جلب الصورة:', خطأ);
    رد.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// توليد رمز JWT
function توليدJWT(userId) {
  return jwt.sign({ userId }, مفتاحJWT, { expiresIn: '1h' });
}

// تحديث بيانات المستخدم
التطبيق.put("/update-credentials", تحقق_الصلاحية, async (طلب, رد) => {
  try {
    const user_id = طلب.user.id;
    const { username, email, phone_number, newPassword } = طلب.body;

    const الحقول = [];
    const القيم = [];
    let المؤشر = 1;

    if (username) {
      الحقول.push(`username = $${المؤشر++}`);
      القيم.push(username);
    }

    if (email) {
      الحقول.push(`email = $${المؤشر++}`);
      القيم.push(email);
    }

    if (phone_number) {
      الحقول.push(`phone_number = $${المؤشر++}`);
      القيم.push(phone_number);
    }

    if (newPassword && newPassword.length >= 6) {
      const مشفر = await bcrypt.hash(newPassword, 10);
      الحقول.push(`password = $${المؤشر++}`);
      القيم.push(مشفر);
    } else if (newPassword) {
      return رد.status(400).json({ message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });
    }

    if (الحقول.length === 0) {
      return رد.status(400).json({ message: "لم يتم توفير حقول للتحديث." });
    }

    const استعلام = `
      UPDATE users 
      SET ${الحقول.join(', ')} 
      WHERE id = $${المؤشر}
      RETURNING username, email, phone_number
    `;
    القيم.push(user_id);

    const محدث = await قاعدة_البيانات.query(استعلام, القيم);

    if (محدث.rows.length === 0) {
      return رد.status(404).json({ message: "المستخدم غير موجود" });
    }

    رد.json(محدث.rows[0]);
  } catch (خطأ) {
    console.error("خطأ أثناء التحديث:", خطأ.message);
    رد.status(500).send("خطأ في الخادم");
  }
});

// تسجيل مستخدم جديد
التطبيق.post("/authentication/registration", async (طلب, رد) => {
  try {
    const { username, password, email, zip_code, phone_number } = طلب.body;

    const كلمة_المرور_المشفرة = await bcrypt.hash(password, 10);

    const { rows } = await قاعدة_البيانات.query(
      "INSERT INTO users (username, password, email, zip_code, phone_number) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [username, كلمة_المرور_المشفرة, email, zip_code, phone_number]
    );

    const معرف_المستخدم = rows[0].id;
    const رمزJWT = توليدJWT(معرف_المستخدم);

    رد.json({ jwtToken: رمزJWT });

  } catch (err) {
    console.error(err.message);
    رد.status(500).send("خطأ في الخادم");
  }
});

// نسيان كلمة المرور
التطبيق.post("/forgot-password", async (طلب, رد) => {
  try {
    const { email } = طلب.body;

    const مستخدم = await قاعدة_البيانات.query('SELECT * FROM users WHERE email = $1', [email]);
    if (مستخدم.rows.length === 0) {
      return رد.status(404).json({ message: "المستخدم غير موجود" });
    }

    const معرف_المستخدم = مستخدم.rows[0].id;
    const رمز = crypto.randomBytes(32).toString('hex');
    const صلاحية = new Date(Date.now() + 15 * 60 * 1000);

    await قاعدة_البيانات.query('DELETE FROM password_resets WHERE user_id = $1', [معرف_المستخدم]);

    await قاعدة_البيانات.query(
      'INSERT INTO password_resets (user_id, token, expires) VALUES ($1, $2, $3)',
      [معرف_المستخدم, رمز, صلاحية]
    );

    const رابط_إعادة_التعيين = `http://localhost:3000/reset-password?token=${رمز}`;
    await إرسال_بريد(email, رابط_إعادة_التعيين);

    رد.json({ message: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني." });

  } catch (err) {
    console.error("خطأ في نسيان كلمة المرور:", err);
    رد.status(500).send("خطأ في الخادم");
  }
});

// إعادة تعيين كلمة المرور
التطبيق.post('/reset-password', async (طلب, رد) => {
  try {
    const { token, new_password } = طلب.body;

    if (!new_password || new_password.length < 6) {
      return رد.status(400).json({ message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });
    }

    const التحقق = await قاعدة_البيانات.query(
      'SELECT user_id, expires FROM password_resets WHERE token = $1',
      [token]
    );

    if (التحقق.rows.length === 0 || new Date() > التحقق.rows[0].expires) {
      return رد.status(400).json({ message: 'الرمز غير صالح أو منتهي الصلاحية' });
    }

    const معرف_المستخدم = التحقق.rows[0].user_id;
    const مشفر = await bcrypt.hash(new_password, 10);

    await قاعدة_البيانات.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [مشفر, معرف_المستخدم]
    );

    await قاعدة_البيانات.query('DELETE FROM password_resets WHERE token = $1', [token]);

    رد.json({ message: 'تم تعيين كلمة المرور بنجاح!' });

  } catch (err) {
    console.error('خطأ في تعيين كلمة المرور:', err.message);
    رد.status(500).send('خطأ في الخادم');
  }
});

// إنشاء منشور جديد
التطبيق.post("/create_post", async (طلب, رد) => {
  try {
    const token = طلب.header("jwt_token");
    if (!token) return رد.status(401).json({ message: "لم يتم توفير رمز الدخول" });

    const مفكوك = jwt.verify(token, مفتاحJWT);
    const معرف_المستخدم = مفكوك.userId;

    if (!طلب.files || !طلب.files.images || !طلب.body.title || !طلب.body.description) {
      return رد.status(400).send("العنوان والوصف وصورة واحدة على الأقل مطلوبة.");
    }

    const { title, description, features, email, phone, location } = طلب.body;

    const الصور = Array.isArray(طلب.files.images) ? طلب.files.images : [طلب.files.images];
    const الصورة_الرئيسية = الصور[0].data;
    const صور_إضافية = الصور.slice(1);

    let المميزات_محللة = [];
    try {
      المميزات_محللة = features ? JSON.parse(features) : [];
    } catch (err) {
      console.warn("فشل في تحليل المميزات:", err.message);
    }

    const إدخال_المنشور = await قاعدة_البيانات.query(
      `INSERT INTO posts (title, description, primary_photo, user_id, email, phone, features, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING post_id`,
      [
        title,
        description,
        الصورة_الرئيسية,
        معرف_المستخدم,
        email || null,
        phone || null,
        المميزات_محللة.length ? المميزات_محللة : null,
        location || null
      ]
    );

    const postId = إدخال_المنشور.rows[0].post_id;

    for (const ملف of صور_إضافية) {
      await قاعدة_البيانات.query(
        "INSERT INTO post_images (post_id, image) VALUES ($1, $2)",
        [postId, ملف.data]
      );
    }

    // حذف الكاش بعد الإنشاء
    الذاكرة_المؤقتة.keys().forEach(مفتاح => {
      if (مفتاح.startsWith('posts_') || مفتاح === 'total_posts_count') {
        الذاكرة_المؤقتة.del(مفتاح);
      }
    });

    رد.json({ message: "تم إنشاء المنشور بنجاح", post_id: postId });
  } catch (err) {
    console.error("خطأ في إنشاء منشور:", err);
    رد.status(500).json({ message: "خطأ في الخادم" });
  }
});

// نقطة نهاية لجلب المنشورات مع دعم التصفح والذاكرة المؤقتة
app.get('/posts', async (req, res) => {
  try {
    const الصفحة = parseInt(req.query.page) || 1;
    const الحد = parseInt(req.query.limit) || 12;
    const البداية = (الصفحة - 1) * الحد;
    const مفتاح_الذاكرة = `posts_${الصفحة}_${الحد}`;
    const مفتاح_عدد_المنشورات = 'total_posts_count';

    // ✅ تحقق من الذاكرة المؤقتة أولاً
    const بيانات_مخزنة = cache.get(مفتاح_الذاكرة);
    if (بيانات_مخزنة) {
      return res.json(بيانات_مخزنة);
    }

    // ✅ جلب العدد الكلي (محفوظ في الذاكرة المؤقتة)
    let إجمالي_المنشورات = cache.get(مفتاح_عدد_المنشورات);
    if (!إجمالي_المنشورات) {
      const نتيجة_العد = await pool.query('SELECT COUNT(*) FROM posts');
      إجمالي_المنشورات = parseInt(نتيجة_العد.rows[0].count);
      cache.set(مفتاح_عدد_المنشورات, إجمالي_المنشورات, 60); // حفظ لمدة 60 ثانية
    }

    // ✅ جلب المنشورات مع معلومات المستخدم
    const النتيجة = await pool.query(`
      SELECT 
        p.post_id, 
        p.title, 
        p.primary_photo,
        p.user_id,
        p.features,
        p.created_at,
        p.location AS post_location,
        u.email,
        p.description,
        u.zip_code
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2
    `, [الحد, البداية]);

    if (!النتيجة.rows) {
      throw new Error('لم يتم العثور على نتائج من قاعدة البيانات');
    }

    // ✅ معالجة الصور بالتوازي
    const منشورات_مع_صور = await Promise.all(النتيجة.rows.map(async منشور => {
      try {
        const صورة = منشور.primary_photo;
        let صورة_محسنة = null;

        if (صورة) {
          try {
            صورة_محسنة = await optimizeImage(صورة);
          } catch (خطأ_صورة) {
            console.error('خطأ في تحسين الصورة:', خطأ_صورة);
          }
        }

        return {
          post_id: منشور.post_id,
          title: منشور.title,
          email: منشور.email,
          description: منشور.description,
          userId: منشور.user_id,
          zip_code: منشور.zip_code,
          features: منشور.features || ["Other"],
          attached_photo: صورة_محسنة ? صورة_محسنة.toString('base64') : null,
          created_at: منشور.created_at,
          location: منشور.post_location || "غير معروف"
        };
      } catch (خطأ_منشور) {
        console.error('خطأ في معالجة المنشور:', خطأ_منشور);
        return null;
      }
    }));

    const منشورات_صالحة = منشورات_مع_صور.filter(منشور => منشور !== null);

    if (منشورات_صالحة.length === 0) {
      return res.json({
        posts: [],
        pagination: {
          currentPage: الصفحة,
          totalPages: 0,
          totalPosts: 0,
          hasMore: false
        }
      });
    }

    const رد = {
      posts: منشورات_صالحة,
      pagination: {
        currentPage: الصفحة,
        totalPages: Math.ceil(إجمالي_المنشورات / الحد),
        totalPosts: إجمالي_المنشورات,
        hasMore: البداية + الحد < إجمالي_المنشورات
      }
    };

    // ✅ حفظ الرد في الذاكرة المؤقتة لمدة 60 ثانية
    cache.set(مفتاح_الذاكرة, رد, 60);
    res.json(رد);
  } catch (خطأ) {
    console.error('خطأ في /posts:', خطأ);
    res.status(500).json({ 
      message: 'خطأ في الخادم',
      error: process.env.NODE_ENV === 'development' ? خطأ.message : undefined
    });
  }
});

// نقطة نهاية لجلب ملف المستخدم
app.get("/profile", authorize, async (req, res) => {
  try {
    const معرف_المستخدم = req.user.id;

    const نتيجة_الملف = await pool.query(
      `SELECT username, email, phone_number FROM users WHERE id = $1`,
      [معرف_المستخدم]
    );

    if (نتيجة_الملف.rows.length === 0) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    const المستخدم = نتيجة_الملف.rows[0];

    // ✅ عدد المنشورات فقط بدون صور
    const نتيجة_عدد_المنشورات = await pool.query(
      `SELECT COUNT(*) FROM posts WHERE user_id = $1`,
      [معرف_المستخدم]
    );
    المستخدم.active_posts = parseInt(نتيجة_عدد_المنشورات.rows[0].count, 10);

    // ✅ التقييم المتوسط
    const نتيجة_التقييم = await pool.query(
      `SELECT ROUND(AVG(rating)::numeric, 1) AS rating FROM feedback WHERE receiver_id = $1`,
      [معرف_المستخدم]
    );
    المستخدم.rating = نتيجة_التقييم.rows[0].rating !== null
      ? parseFloat(نتيجة_التقييم.rows[0].rating)
      : null;

    // ✅ الآراء
    const نتيجة_الآراء = await pool.query(
      `SELECT f.giver_id, f.rating, f.comment, f.created_at, u.username AS giver_username
       FROM feedback f
       JOIN users u ON f.giver_id = u.id
       WHERE f.receiver_id = $1
       ORDER BY f.created_at DESC`,
      [معرف_المستخدم]
    );
    المستخدم.feedbacks = نتيجة_الآراء.rows;

    res.json([المستخدم]);
  } catch (err) {
    console.error("خطأ في /profile:", err.message);
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

// نقطة نهاية لجلب منشورات المستخدم الحالي
app.get('/posts/user', authorize, async (req, res) => {
  try {
    const معرف_المستخدم = req.user.id;
    
    const النتيجة = await pool.query('SELECT * FROM posts WHERE user_id = $1', [معرف_المستخدم]);

    if (النتيجة.rows.length === 0) {
      return res.status(404).json({ message: 'لا توجد منشورات لهذا المستخدم' });
    }

    res.json(النتيجة.rows.map(منشور => ({
      ...منشور,
      attached_photo: منشور.attached_photo.toString('base64')
    })));
  } catch (خطأ) {
    console.error('خطأ في جلب منشورات المستخدم:', خطأ.message);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// نقطة نهاية لحذف منشور
app.delete('/posts/:postId', authorize, async (req, res) => {
  try {
    const { postId } = req.params;
    const معرف_المستخدم = req.user.id;

    const استعلام_الحذف = 'DELETE FROM posts WHERE post_id = $1 AND user_id = $2 RETURNING *';
    const النتيجة = await pool.query(استعلام_الحذف, [postId, معرف_المستخدم]);

    if (النتيجة.rows.length === 0) {
      return res.status(404).json({ message: 'لم يتم العثور على المنشور أو ليس لديك صلاحية الحذف' });
    }

    res.json({ message: 'تم حذف المنشور' });
  } catch (خطأ) {
    console.error('خطأ في حذف المنشور:', خطأ);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// دالة تحسين الصور (بسيطة حالياً)
async function optimizeImage(imageBuffer) {
  try {
    return imageBuffer;
  } catch (error) {
    console.error('خطأ في معالجة الصورة:', error);
    return imageBuffer;
  }
}

// معالج أخطاء عام
app.use((err, req, res, next) => {
  console.error('خطأ غير معالج:', err);
  res.status(500).json({
    message: 'خطأ في الخادم',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// التعامل مع الأخطاء غير الملتقطة
process.on('uncaughtException', (err) => {
  console.error('استثناء غير معالج:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('رفض غير معالج عند:', promise, 'السبب:', reason);
});

// اتصال دوري للحفاظ على الاتصال بقاعدة البيانات
setInterval(() => {
  pool.query('SELECT 1').catch(() => {});
}, 300000);

// بدء تشغيل الخادم
app.listen(5000, () => {
  console.log("تم بدء تشغيل الخادم على المنفذ 5000");
});
