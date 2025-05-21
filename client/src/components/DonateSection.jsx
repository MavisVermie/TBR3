const DonateSection = () => {
  return (
    <section id="donate" className="py-20 px-6 text-center bg-white">
      <h2 className="text-3xl font-bold mb-6">تبرع بالملابس</h2>
      <p className="mb-6 text-gray-700 max-w-xl mx-auto">
        الرجاء تعبئة المعلومات التالية لتسجيل تبرعك بقطعة أو مجموعة من الملابس.
      </p>
      <form className="max-w-xl mx-auto grid gap-4 text-left">
        <input type="text" placeholder="الاسم الكامل" className="p-3 border rounded" />
        <input type="text" placeholder="رقم الهاتف" className="p-3 border rounded" />
        <input type="text" placeholder="نوع الملابس (مثلاً: جاكيت، قميص)" className="p-3 border rounded" />
        <input type="text" placeholder="المقاس (صغير - متوسط - كبير - أطفال...)" className="p-3 border rounded" />
        <textarea placeholder="حالة الملابس (جديدة / بحالة جيدة...)" className="p-3 border rounded"></textarea>
        <button className="bg-mint-600 text-white py-3 px-6 rounded-full hover:bg-mint-700 transition">
          إرسال التبرع
        </button>
      </form>
    </section>
  );
};
