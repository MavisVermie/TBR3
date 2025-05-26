const router = require("express").Router();
const authorize = require("../middleware/authorize");
const pool = require("../db");

// ✅ جلب معلومات الملف الشخصي للمستخدم (الاسم، البريد الإلكتروني، الرمز البريدي)
router.get("/", authorize, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await pool.query(
      "SELECT username, email, zip_code FROM users WHERE id = $1",
      [userId]
    );

    res.json(user.rows);
  } catch (err) {
    console.error("خطأ في جلب الملف الشخصي", err.message);
    res.status(500).send("خطأ في الخادم");
  }
});

// ✅ تحديث منشور
router.put("/update-post/:id", authorize, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const {
      title,
      description,
      email,
      phone,
      location,
      features
    } = req.body;

    let parsedFeatures = [];
    try {
      parsedFeatures = features ? JSON.parse(features) : [];
    } catch (err) {
      console.warn("فشل في تحويل المزايا", err.message);
    }

    const files = req.files?.images;
    const imageFiles = Array.isArray(files) ? files : files ? [files] : [];

    const primaryPhoto = imageFiles[0]?.data || null;
    const extraImages = imageFiles.slice(1);

    // الخطوة 1: تحديث البيانات الرئيسية للمنشور
    const updateQuery = `
      UPDATE posts
      SET title = $1,
          description = $2,
          email = $3,
          phone = $4,
          location = $5,
          features = $6,
          primary_photo = COALESCE($7, primary_photo)
      WHERE post_id = $8 AND user_id = $9
      RETURNING post_id
    `;

    const result = await pool.query(updateQuery, [
      title,
      description,
      email || null,
      phone || null,
      location || null,
      parsedFeatures.length ? parsedFeatures : null,
      primaryPhoto,
      id,
      userId
    ]);

    if (result.rows.length === 0) {
      return res.status(403).json({ message: "غير مصرح لك أو المنشور غير موجود" });
    }

    const postId = result.rows[0].post_id;

    // الخطوة 2: حذف الصور الإضافية القديمة
    await pool.query("DELETE FROM post_images WHERE post_id = $1", [postId]);

    // الخطوة 3: إضافة الصور الإضافية الجديدة
    for (const file of extraImages) {
      await pool.query(
        "INSERT INTO post_images (post_id, image) VALUES ($1, $2)",
        [postId, file.data]
      );
    }

    return res.json({ message: "تم تحديث المنشور بنجاح" });

  } catch (err) {
    console.error("خطأ أثناء تحديث المنشور", err.message);
    res.status(500).send("خطأ في الخادم");
  }
});

// ✅ حذف منشور
router.delete("/delete-post/:id", authorize, async (req, res) => {
  try {
    const { id } = req.params;

    const deletePost = await pool.query(
      "DELETE FROM posts WHERE post_id = $1 AND user_id = $2 RETURNING *",
      [id, req.user.id]
    );

    if (deletePost.rows.length === 0) {
      return res.json("هذا المنشور ليس لك أو غير موجود");
    }

    res.json("تم حذف المنشور بنجاح");
  } catch (err) {
    console.error("خطأ أثناء حذف المنشور", err.message);
    res.status(500).send("خطأ في الخادم");
  }
});

// ✅ جلب منشور معين باستخدام معرفه مع الصور الإضافية
router.get("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const postResult = await pool.query(`
      SELECT  
        posts.post_id,
        posts.title,
        posts.description,
        posts.primary_photo,
        posts.location,
        posts.features,
        posts.user_id,
        users.username,
        users.email,
        posts.phone
      FROM posts
      LEFT JOIN users ON posts.user_id = users.id
      WHERE posts.post_id = $1
    `, [id]);

    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: "المنشور غير موجود" });
    }

    const post = postResult.rows[0];

    // ✅ تحويل مميزات PostgreSQL من صيغة النص إلى مصفوفة
    let parsedFeatures = [];

    if (post.features && typeof post.features === 'string') {
      parsedFeatures = post.features
        .replace(/[{}"]/g, '')
        .split(',')
        .map(f => f.trim())
        .filter(f => f);
    } else if (Array.isArray(post.features)) {
      parsedFeatures = post.features;
    }

    // ✅ جلب الصور الإضافية
    const extraImagesResult = await pool.query(
      "SELECT image FROM post_images WHERE post_id = $1",
      [id]
    );

    const extraImages = extraImagesResult.rows.map(img =>
      img.image?.toString("base64")
    );

    // ✅ الاستجابة النهائية
    res.json({
      post_id: post.post_id,
      title: post.title,
      description: post.description,
      primary_photo: post.primary_photo?.toString("base64") || null,
      extra_images: extraImages,
      username: post.username,
      email: post.email,
      phone: post.phone,
      location: post.location || '',
      features: parsedFeatures,
      user_id: post.user_id
    });

  } catch (err) {
    console.error("خطأ أثناء جلب المنشور", err.message);
    res.status(500).send("خطأ في الخادم");
  }
});

// ✅ جلب جميع المنشورات الخاصة بالمستخدم الحالي
router.get("/my-posts", authorize, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("جلب منشورات المستخدم", userId);

    const myPosts = await pool.query(
      "SELECT post_id, title, description, primary_photo, location, created_at FROM posts WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );

    console.log("عدد المنشورات:", myPosts.rows.length);

    const formattedPosts = myPosts.rows.map(post => ({
      ...post,
      primary_photo: post.primary_photo?.toString("base64") || null
    }));

    res.json(formattedPosts);
  } catch (err) {
    console.error("خطأ أثناء جلب منشورات المستخدم", err.message);
    res.status(500).send("خطأ في الخادم");
  }
});

module.exports = router;
