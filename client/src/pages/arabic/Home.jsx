import React from "react";
import { useNavigate } from "react-router-dom";

const Homepage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-100 text-[#065f46] font-sans">

      <section className="relative w-full h-[500px] overflow-hidden rounded-b-xl shadow-lg">
        <img
          src="/images/banner2.gif"
          alt="خلفية التبرع"
          className="w-full h-full object-cover backdrop-blur-sm"
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg">
            كن مؤثرًا وتبرّع
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl">
            ساعد المحتاجين وكن صديقًا للبيئة
          </p>
          <button
            onClick={() => navigate("/feed")}
            className="bg-green-600 hover:bg-[#34d399] text-white font-bold py-3 px-8 rounded-full text-lg transition shadow-lg"
          >
            !عرض المزيد
          </button>
        </div>
      </section>

      <div className="w-full mx-auto flex flex-col md:flex-row gap-8">
        <section className="flex flex-col md:flex-row items-center bg-green-600 p-10 mt-20 shadow-lg gap-10">
          <div className="md:w-1/2">
            <h2 className="text-4xl font-medium text-white mb-4 text-center md:text-left">..وجهة نظرنا</h2>
            <p className="text-lg text-white leading-loose text-center md:text-left">
              TBR3 هي منصة أردنية وُلِدت من الكلمة العربية تَبَرّع 
              والتي تعكس مهمة قائمة على العطاء، والاستدامة، ورعاية المجتمع. <br /><br />
              تتيح هذه المنصة للناس مشاركة الأغراض المستعملة بدلاً من التخلص منها،
              مما يقلل من النفايات ويوفر الدعم لمن هم في حاجة.<br /><br />
              من خلال إطالة دورة حياة المنتجات، تدعم TBR3 مبادئ الحوسبة الخضراء بشكل فعّال، 
              مما يقلل الأثر البيئي، ويحافظ على الموارد، ويشجع على السلوك البيئي الواعي. <br /><br />
              كما تتماشى المنصة بشكل عميق مع القيم الإسلامية مثل الصدقة،
              وتجنّب التبذير، والحفاظ على الأرض. <br /><br />
              TBR3 ليست مجرد منصة تبرع، بل هي حركة تجمع بين 
              التكنولوجيا، والإيمان، والمسؤولية البيئية لبناء مجتمع أكثر لطفًا وخضرة وعطاءً.
            </p>
          </div>
          <div className="md:w-1/2">
            <img src="/images/donation.jpg" alt="تبرع" className="rounded-lg shadow-lg w-full h-[500px] object-cover" />
          </div>
        </section>
      </div>

      <section className="flex flex-col md:flex-row items-center bg-[#093965] p-10 mt-20 shadow-lg mb-10 gap-10">
        <div className="md:w-1/2">
          <img src="/images/list.jpg" alt="من نحن" className="shadow-lg w-full h-[400px] object-cover rounded-lg" />
        </div>
        <div className="md:w-1/2">
          <h2 className="text-4xl font-bold text-[#10b981] mb-2 text-center md:text-left">
            ماذا يمكنك أن تتبرع؟
          </h2>
          <p className="text-lg text-white leading-loose text-center md:text-left whitespace-pre-line">
            العناصر الممكن التبرع بها:<br /><br />

            الملابس – ملابس جديدة أو مستخدمة بحالة جيدة، أحذية، معاطف.<br /><br />

            الأثاث – أسرّة، أرائك، طاولات، إلخ.<br /><br />

            الإلكترونيات – هواتف، حواسيب محمولة، أجهزة لوحية (بحالة تشغيل جيدة).<br /><br />

            الكتب والألعاب – للأطفال أو للاستخدام المجتمعي العام.<br /><br />

            الأدوات المنزلية – أدوات المطبخ، الأغطية، الأجهزة المنزلية.
          </p>
        </div>
      </section>

    </div>
  );
};

export default Homepage;
