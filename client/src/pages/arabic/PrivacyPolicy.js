import React from 'react';

export default function PrivacyPolicy() {
  return (
    <section className='bg-gray-100'>
      <div className="min-h-screen text-right w-full px-6 py-12 bg-white rounded-lg shadow-md text-gray-900 font-sans">
        <h1 className="text-4xl font-semibold mb-8 border-b-2 border-green-600 pb-4 text-center ">
          سياسة الخصوصية
        </h1>

        <p className="mb-6 leading-relaxed text-lg text-black">
          خصوصيتك مهمة بالنسبة لنا. تشرح سياسة الخصوصية هذه كيف نجمع ونستخدم ونكشف ونحمي معلوماتك عندما تستخدم موقعنا الإلكتروني.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-green-700">
          المعلومات التي نجمعها
        </h2>
        <ul className="list-disc list-inside space-y-2 text-black">
          <li>معلومات التعريف الشخصية (الاسم، عنوان البريد الإلكتروني، رقم الهاتف، إلخ)</li>
          <li>بيانات الاستخدام (مثل الصفحات التي تم زيارتها، الوقت الذي تم قضاؤه)</li>
          <li>الكوكيز وتقنيات التتبع</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-green-700">
          كيف نستخدم معلوماتك
        </h2>
        <p className="mb-4 leading-relaxed text-black">
          :نستخدم معلوماتك من اجل
        </p>
        <ul className="list-disc list-inside space-y-2 text-black">
          <li>تقديم وتشغيل وصيانة موقعنا الإلكتروني</li>
          <li>تحسين وتخصيص تجربة المستخدم</li>
          <li>التواصل معك، بما في ذلك خدمة العملاء والتحديثات</li>
          <li>ضمان الامتثال للالتزامات القانونية</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-green-700">
          مشاركة معلوماتك
        </h2>
        <p className="mb-6 leading-relaxed text-black">
          نحن لا نبيع أو نؤجر بياناتك الشخصية. قد نشارك بياناتك مع مزودي الخدمات الذين يساعدوننا في تشغيل الموقع، حسبما يقتضي القانون، أو في سياق صفقة تجارية.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-green-700">
          حقوقك
        </h2>
        <p className="mb-6 leading-relaxed text-black">
          لديك الحق في الوصول إلى معلوماتك الشخصية وتحديثها أو حذفها. يرجى التواصل معنا لأي استفسارات تتعلق بالخصوصية.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-green-700">
          التغييرات على هذه السياسة
        </h2>
        <p className="mb-6 leading-relaxed text-black">
          قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. نشجعك على مراجعة هذه الصفحة بشكل دوري لأي تغييرات.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-green-700">
          تواصل معنا
        </h2>
        <p className="text-black">
          إذا كان لديك أي أسئلة حول هذه السياسة، يرجى التواصل معنا على{' '}
          <a 
            href="mailto:support@example.com" 
            className="text-green-600 hover:text-green-800 underline transition-colors"
          >
           tbr3project@gmail.com
          </a>.
        </p>
      </div>
    </section>
  );
}
