const CausesSection = () => {
  const causes = [
    { title: 'ملابس شتوية', description: 'ساهم في توفير الدفء خلال فصل الشتاء.' },
    { title: 'ملابس أطفال', description: 'تبرع بملابس لأطفال بحاجة ماسة لها.' },
    { title: 'ملابس عمل', description: 'ادعم الشباب الباحثين عن عمل بملابس لائقة.' },
  ];

  return (
    <section className="bg-gray-100 py-16 px-6">
      <h2 className="text-3xl text-center font-bold mb-10">أنواع التبرعات</h2>
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {causes.map((cause, idx) => (
          <div key={idx} className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-xl font-semibold mb-2">{cause.title}</h3>
            <p className="text-gray-600">{cause.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
