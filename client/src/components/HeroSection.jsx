const HeroSection = () => {
  return (
    <section className="bg-mint-600 text-white text-center py-20 px-4" style={{ backgroundColor: '#a3f7bf' }}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">تبرع بملابسك، وامنح الدفء لمن يحتاجه</h1>
        <p className="text-lg mb-6">ساهم بقطعة ملابس نظيفة لمن هم بأمس الحاجة، وكن سببًا في فرحتهم.</p>
        <a href="#donate" className="bg-white text-mint-600 font-bold py-3 px-6 rounded-full shadow-md hover:bg-mint-100 transition">
          تبرع الآن
        </a>
      </div>
    </section>
  );
};
