module.exports = function (req, res, next) {
  const { email, name, password } = req.body;

  // التحقق من صحة البريد الإلكتروني باستخدام تعبير منتظم
  function validEmail(userEmail) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userEmail);
  }

  if (req.path === "/register") {
    console.log(!email.length);
    
    // التحقق من إدخال جميع البيانات المطلوبة
    if (![email, name, password].every(Boolean)) {
      return res.json("بيانات مفقودة");
    } else if (!validEmail(email)) {
      return res.json("بريد إلكتروني غير صالح");
    }

  } else if (req.path === "/login") {

    // التحقق من إدخال البريد وكلمة المرور
    if (![email, password].every(Boolean)) {
      return res.json("بيانات مفقودة");
    } else if (!validEmail(email)) {
      return res.json("بريد إلكتروني غير صالح");
    }
  }

  next(); // الاستمرار في المعالجة إذا كانت جميع الشروط صحيحة
};
