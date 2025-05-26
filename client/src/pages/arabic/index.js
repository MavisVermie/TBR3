require('dotenv').config();
console.log("تم تحميل سر JWT:", process.env.JWT_SECRET);

const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");
const fileUpload = require("express-fileupload");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authorize = require("./middleware/authorize");
const sendemail = require("./middleware/mailer"); // وحدة إرسال البريد
const jwtSecret = process.env.JWT_SECRET;
const crypto = require("crypto");
const NodeCache = require("node-cache");
const cache = new NodeCache();

// التوجيهات
const feedbackRouter = require("./routes/feedback");

// Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());

// المسارات
app.use("/events", require("./routes/eventroutes"));
app.use("/api/users", require("./routes/users")); // /api/users/:userId
app.use("/api/feedback", feedbackRouter); // ملاحظات المستخدمين
app.use("/admin", require("./routes/adminroutes"));
app.use("/authentication", require("./routes/jwtAuth"));
app.use("/Posting", require("./routes/itemPost"));

// مسار عرض الصور حسب postId
app.get('/images/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const result = await pool.query('SELECT attached_photo FROM posts WHERE post_id = $1', [postId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'الصورة غير موجودة' });
    }

    const imageData = result.rows[0].attached_photo;
    const base64ImageData = imageData.toString('base64');
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>صورة مدمجة</title>
      </head>
      <body>
        <h1>عرض الصورة</h1>
        <img src="data:image/;base64,${base64ImageData}" alt="صورة">
      </body>
      </html>
    `;

    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Worked': 'yes'
    });
    res.end(htmlContent);

  } catch (error) {
    console.error('خطأ في جلب الصورة:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// توليد رمز JWT
function generateJWTToken(userId) {
  return jwt.sign({ userId }, jwtSecret, { expiresIn: '1h' });
}

// تحديث بيانات المستخدم
app.put("/update-credentials", authorize, async (req, res) => {
  try {
    const user_id = req.user.id;
    const { username, email, phone_number, newPassword } = req.body;

    const fields = [];
    const values = [];
    let index = 1;

    if (username) {
      fields.push(`username = $${index++}`);
      values.push(username);
    }

    if (email) {
      fields.push(`email = $${index++}`);
      values.push(email);
    }

    if (phone_number) {
      fields.push(`phone_number = $${index++}`);
      values.push(phone_number);
    }

    if (newPassword && newPassword.length >= 6) {
      const hashed = await bcrypt.hash(newPassword, 10);
      fields.push(`password = $${index++}`);
      values.push(hashed);
    } else if (newPassword && newPassword.length < 6) {
      return res.status(400).json({ message: "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل" });
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: "لم يتم تقديم بيانات صالحة للتحديث." });
    }

    const query = `
      UPDATE users 
      SET ${fields.join(', ')} 
      WHERE id = $${index}
      RETURNING username, email, phone_number
    `;
    values.push(user_id);

    const updated = await pool.query(query, values);

    if (updated.rows.length === 0) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    res.json(updated.rows[0]);
  } catch (err) {
    console.error("خطأ أثناء تحديث بيانات المستخدم:", err.message);
    res.status(500).send("خطأ في الخادم");
  }
});

// تسجيل المستخدم
app.post("/authentication/registration", async (req, res) => {
  try {
    const { username, password, email, zip_code, phone_number } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const { rows } = await pool.query(
      "INSERT INTO users (username, password, email, zip_code, phone_number) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [username, hashedPassword, email, zip_code, phone_number]
    );

    const userId = rows[0].id;
    const jwtToken = generateJWTToken(userId);

    res.json({ jwtToken });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("خطأ في الخادم");
  }
});

// إرسال رابط استعادة كلمة المرور
app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    const userId = user.rows[0].id;
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 دقيقة

    await pool.query('DELETE FROM password_resets WHERE user_id = $1', [userId]);

    await pool.query(
      'INSERT INTO password_resets (user_id, token, expires) VALUES ($1, $2, $3)',
      [userId, token, expires]
    );

    const resetLink = `http://localhost:3000/reset-password?token=${token}`;
    await sendemail(email, resetLink);

    res.json({ message: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني." });

  } catch (err) {
    console.error("خطأ في طلب إعادة تعيين كلمة المرور:", err);
    res.status(500).send("خطأ في الخادم");
  }
});

// تنفيذ إعادة تعيين كلمة المرور
app.post('/reset-password', async (req, res) => {
  try {
    const { token, new_password } = req.body;

    if (!new_password || new_password.length < 6) {
      return res.status(400).json({ message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });
    }

    const tokenRes = await pool.query(
      'SELECT user_id, expires FROM password_resets WHERE token = $1',
      [token]
    );

    if (tokenRes.rows.length === 0 || new Date() > tokenRes.rows[0].expires) {
      return res.status(400).json({ message: 'رمز غير صالح أو منتهي الصلاحية' });
    }

    const userId = tokenRes.rows[0].user_id;
    const hashedPassword = await bcrypt.hash(new_password, 10);

    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);
    await pool.query('DELETE FROM password_resets WHERE token = $1', [token]);

    res.json({ message: 'تمت إعادة تعيين كلمة المرور بنجاح' });

  } catch (err) {
    console.error('خطأ أثناء إعادة تعيين كلمة المرور:', err.message);
    res.status(500).send('خطأ في الخادم');
  }
});

// إنشاء منشور جديد
app.post("/create_post", async (req, res) => {
  try {
    const token = req.header("jwt_token");
    if (!token) return res.status(401).json({ message: "لم يتم تقديم الرمز" });

    const decoded = jwt.verify(token, jwtSecret);
    const userId = decoded.userId;

    if (!req.files || !req.files.images || !req.body.title || !req.body.description) {
      return res.status(400).send("العنوان والوصف وصورة واحدة على الأقل مطلوبة.");
    }

    const { title, description, features, email, phone, location } = req.body;

    const imageFiles = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
    const primaryPhoto = imageFiles[0].data;
    const extraImages = imageFiles.slice(1);

    let parsedFeatures = [];
    try {
      parsedFeatures = features ? JSON.parse(features) : [];
    } catch (err) {
      console.warn("فشل في تحليل الميزات:", err.message);
    }

    const postInsert = await pool.query(
      `INSERT INTO posts (title, description, primary_photo, user_id, email, phone, features, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING post_id`,
      [
        title,
        description,
        primaryPhoto,
        userId,
        email || null,
        phone || null,
        parsedFeatures.length ? parsedFeatures : null,
        location || null
      ]
    );

    const postId = postInsert.rows[0].post_id;

    for (const file of extraImages) {
      await pool.query("INSERT INTO post_images (post_id, image) VALUES ($1, $2)", [postId, file.data]);
    }

    cache.keys().forEach(key => {
      if (key.startsWith('posts_') || key === 'total_posts_count') {
        cache.del(key);
      }
    });

    res.json({ message: "تم إنشاء المنشور بنجاح", post_id: postId });

  } catch (err) {
    console.error("خطأ في إنشاء المنشور:", err);
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});
// ✅ جلب المنشورات مع معلومات المستخدم والتخزين المؤقت
app.get('/posts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    const cacheKey = `posts_${page}_${limit}`;
    const countCacheKey = 'total_posts_count';

    // ✅ التحقق من التخزين المؤقت أولاً
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    // ✅ جلب العدد الإجمالي من المنشورات (مع التخزين المؤقت)
    let totalPosts = cache.get(countCacheKey);
    if (!totalPosts) {
      const countResult = await pool.query('SELECT COUNT(*) FROM posts');
      totalPosts = parseInt(countResult.rows[0].count);
      cache.set(countCacheKey, totalPosts, 60); // التخزين لمدة 60 ثانية
    }

    // ✅ جلب المنشورات مع معلومات المستخدم
    const result = await pool.query(`
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
    `, [limit, offset]);

    if (!result.rows) {
      throw new Error('استعلام قاعدة البيانات لم يُرجع نتائج');
    }

    // ✅ معالجة الصور بالتوازي
    const postsWithPhotos = await Promise.all(result.rows.map(async post => {
      try {
        const imageBuffer = post.primary_photo;
        let optimizedImage = null;

        if (imageBuffer) {
          try {
            optimizedImage = await optimizeImage(imageBuffer);
          } catch (imageError) {
            console.error('خطأ في تحسين الصورة:', imageError);
          }
        }

        return {
          post_id: post.post_id,
          title: post.title,
          email: post.email,
          description: post.description,
          userId: post.user_id,
          zip_code: post.zip_code,
          features: post.features || ["Other"],
          attached_photo: optimizedImage ? optimizedImage.toString('base64') : null,
          created_at: post.created_at,
          location: post.post_location || "Unknown"
        };
      } catch (postError) {
        console.error('خطأ في معالجة المنشور:', postError);
        return null;
      }
    }));

    const validPosts = postsWithPhotos.filter(post => post !== null);

    if (validPosts.length === 0) {
      return res.json({
        posts: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalPosts: 0,
          hasMore: false
        }
      });
    }

    const response = {
      posts: validPosts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts,
        hasMore: offset + limit < totalPosts
      }
    };

    // ✅ تخزين النتيجة مؤقتاً
    cache.set(cacheKey, response, 60);
    res.json(response);
  } catch (error) {
    console.error('خطأ في نقطة النهاية /posts:', error);
    res.status(500).json({ 
      message: 'خطأ في الخادم',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ✅ جلب بيانات المستخدم
app.get("/profile", authorize, async (req, res) => {
  try {
    const userId = req.user.id;

    const profileResult = await pool.query(
      `SELECT username, email, phone_number FROM users WHERE id = $1`,
      [userId]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    const user = profileResult.rows[0];

    // ✅ عدد المنشورات بدون صور
    const postsCountResult = await pool.query(
      `SELECT COUNT(*) FROM posts WHERE user_id = $1`,
      [userId]
    );
    user.active_posts = parseInt(postsCountResult.rows[0].count, 10);

    // ✅ التقييم المتوسط
    const ratingResult = await pool.query(
      `SELECT ROUND(AVG(rating)::numeric, 1) AS rating FROM feedback WHERE receiver_id = $1`,
      [userId]
    );
    user.rating = ratingResult.rows[0].rating !== null
      ? parseFloat(ratingResult.rows[0].rating)
      : null;

    // ✅ التعليقات
    const feedbackResult = await pool.query(
      `SELECT f.giver_id, f.rating, f.comment, f.created_at, u.username AS giver_username
       FROM feedback f
       JOIN users u ON f.giver_id = u.id
       WHERE f.receiver_id = $1
       ORDER BY f.created_at DESC`,
      [userId]
    );
    user.feedbacks = feedbackResult.rows;

    res.json([user]);
  } catch (err) {
    console.error("خطأ في /profile:", err.message);
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

// ✅ جلب منشورات مستخدم معين
app.get('/posts/user', authorize, async (req, res) => {
  try {
    const user_id = req.user.id;

    const result = await pool.query('SELECT * FROM posts WHERE user_id = $1', [user_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'لا توجد منشورات لهذا المستخدم' });
    }

    res.json(result.rows.map(post => ({
      ...post,
      attached_photo: post.attached_photo.toString('base64')
    })));
  } catch (error) {
    console.error('خطأ في جلب منشورات المستخدم:', error.message);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// ✅ حذف منشور
app.delete('/posts/:postId', authorize, async (req, res) => {
  try {
    const { postId } = req.params;
    const user_id = req.user.id;

    const deleteQuery = 'DELETE FROM posts WHERE post_id = $1 AND user_id = $2 RETURNING *';
    const result = await pool.query(deleteQuery, [postId, user_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'المنشور غير موجود أو لا تملك صلاحية حذفه' });
    }

    res.json({ message: 'تم حذف المنشور' });
  } catch (error) {
    console.error('خطأ في حذف المنشور:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// ✅ تحسين الصورة (نسخة بسيطة)
async function optimizeImage(imageBuffer) {
  try {
    return imageBuffer;
  } catch (error) {
    console.error('خطأ في معالجة الصورة:', error);
    return imageBuffer;
  }
}

// ✅ معالج أخطاء عام
app.use((err, req, res, next) => {
  console.error('خطأ غير معالج:', err);
  res.status(500).json({
    message: 'خطأ في الخادم',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ✅ التعامل مع أخطاء غير معالجة
process.on('uncaughtException', (err) => {
  console.error('استثناء غير معالج:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('رفض غير معالج في:', promise, 'السبب:', reason);
});

// ✅ منع إغلاق الاتصال بقاعدة البيانات
setInterval(() => {
  pool.query('SELECT 1').catch(() => {});
}, 300000);

app.listen(5000, () => {
  console.log("تم تشغيل الخادم على المنفذ 5000");
});

