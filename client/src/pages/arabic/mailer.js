require('dotenv').config();
console.log("تم تحميل mailer.js"); // لأغراض التصحيح

const nodemailer = require('nodemailer'); // هذا هو nodemailer لإرسال الرسائل عبر البريد الإلكتروني

// إعداد ناقل البريد باستخدام حساب Gmail من ملف البيئة
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    },
});

// التحقق من إعدادات Gmail
(async () => {
    try {
        await transporter.verify(); // سيتحقق من الحساب ويطبع في حال وجود خطأ
        console.log("تم تسجيل الدخول بنجاح");
    } catch (err) {
        console.error("فشل التحقق من البريد الإلكتروني :", err);
    }
})();

// دالة لإرسال رسالة إعادة تعيين كلمة المرور
async function sendemail(to, resetlink) {
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: to,
        subject: '[TBR3] إعادة تعيين كلمة المرور',
        html: `
        <p>عزيزي المستخدم،</p>
        <p>لقد تلقينا طلبًا لإعادة تعيين كلمة المرور الخاصة بك. اضغط على الرابط أدناه لإعادة تعيينها:</p>
        <a href="${resetlink}">إعادة تعيين كلمة المرور</a>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('تم إرسال البريد الإلكتروني');
    } catch (error) {
        console.error('حدثت مشكلة أثناء إرسال البريد الإلكتروني:', error);
    }
}

// دالة لإرسال بريد إلكتروني مخصص
async function SendeCustomEmail(to, htmlmsg) {
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: to,
        subject: '[TBR3] إشعار مخصص',
        html: htmlmsg
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('تم إرسال البريد الإلكتروني المخصص');
    } catch (error) {
        console.error('حدثت مشكلة أثناء إرسال البريد الإلكتروني المخصص:', error);
    }
}

// تصدير الدوال لاستخدامها في ملفات أخرى
module.exports = { sendemail, SendeCustomEmail };
