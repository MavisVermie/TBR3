import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './cardPost.css';

const المنشورات_لكل_صفحة = 12;

export default function بطاقة_منشور() {
  const [رمز_المستخدم, تعيين_رمز_المستخدم] = useState('');
  const [المنشورات, تعيين_المنشورات] = useState([]);
  const [الفئة_المحددة, تعيين_الفئة_المحددة] = useState('الكل');
  const [الموقع_المحدد, تعيين_الموقع_المحدد] = useState('الكل');
  const [ترتيب_الفرز, تعيين_ترتيب_الفرز] = useState('الاحدث');
  const [كلمة_بحث, تعيين_كلمة_بحث] = useState('');
  const [يتم_التحميل, تعيين_التحميل] = useState(false);
  const [خطأ, تعيين_الخطأ] = useState(null);
  const [صفحة, تعيين_صفحة] = useState(1);
  const [يوجد_المزيد, تعيين_يوجد_المزيد] = useState(true);
  const مراقب = useRef(null);

  const خيارات_الفئة = [
    'الكل', 'اثاث', 'الكترونيات', 'العاب', 'ملابس', 'كتب',
    'اجهزة', 'ادوات', 'معدات رياضية', 'طعام', 'اخرى'
  ];

  const استخراج_المدينة = (الموقع) => الموقع?.split(' - ')[0]?.trim() || 'مجهول';

  useEffect(() => {
    const جلب_الملف_الشخصي = async () => {
      try {
        const الرمز = localStorage.getItem('token');
        if (!الرمز) return;
        const استجابة = await fetch("http://localhost:5000/Posting/", {
          headers: { "Authorization": `Bearer ${الرمز}` }
        });
        if (استجابة.ok) {
          const [ملف] = await استجابة.json() || [];
          if (ملف) تعيين_رمز_المستخدم(ملف.zip_code);
        } else if (استجابة.status === 401) {
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.error('خطأ في تحميل الملف الشخصي', err);
      }
    };
    جلب_الملف_الشخصي();
  }, []);

  const جلب_صفحة_منشورات = async (رقم_الصفحة) => {
    تعيين_التحميل(true);
    تعيين_الخطأ(null);
    try {
      const الرمز = localStorage.getItem('token');
      const الرؤوس = {
        'Content-Type': 'application/json',
        ...(الرمز && { 'Authorization': `Bearer ${الرمز}` })
      };
      const استجابة = await fetch(
        `http://localhost:5000/posts?page=${رقم_الصفحة}&limit=${المنشورات_لكل_صفحة}`,
        { headers: الرؤوس }
      );
      if (!استجابة.ok) throw new Error(`Status ${استجابة.status}`);
      const { posts: منشورات_جديدة = [] } = await استجابة.json();

      تعيين_يوجد_المزيد(منشورات_جديدة.length === المنشورات_لكل_صفحة);

      تعيين_المنشورات(سابق => {
        const المعرفات = new Set(سابق.map(p => p.post_id));
        const منشورات_فريدة = منشورات_جديدة
          .filter(p => !المعرفات.has(p.post_id))
          .map(p => ({ ...p, image: p.attached_photo || null }));
        return [...سابق, ...منشورات_فريدة];
      });
    } catch (err) {
      console.error('فشل تحميل المنشورات', err);
      تعيين_الخطأ('فشل تحميل المنشورات. يرجى المحاولة لاحقًا.');
    } finally {
      تعيين_التحميل(false);
    }
  };

  useEffect(() => {
    جلب_صفحة_منشورات(1);
  }, []);

  const خيارات_الموقع = useMemo(() =>
    ['الكل', ...new Set(المنشورات.map(p => استخراج_المدينة(p.location)).filter(Boolean))],
    [المنشورات]
  );

  const منشورات_مصفاة_ومرتبة = useMemo(() => {
    return المنشورات
      .filter(p => الفئة_المحددة === 'الكل' || (p.features?.[0] || 'اخرى') === الفئة_المحددة)
      .filter(p => الموقع_المحدد === 'الكل' || استخراج_المدينة(p.location) === الموقع_المحدد)
      .filter(p => p.title?.toLowerCase().includes(كلمة_بحث.toLowerCase()))
      .sort((a, b) => {
        const تاريخA = new Date(a.created_at), تاريخB = new Date(b.created_at);
        return ترتيب_الفرز === 'الاحدث' ? تاريخB - تاريخA : تاريخA - تاريخB;
      });
  }, [المنشورات, الفئة_المحددة, الموقع_المحدد, كلمة_بحث, ترتيب_الفرز]);

  const تحميل_اكثر = useCallback((عنصر) => {
    if (يتم_التحميل) return;
    if (مراقب.current) مراقب.current.disconnect();
    مراقب.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && يوجد_المزيد) {
        تعيين_صفحة(سابق => {
          const التالي = سابق + 1;
          جلب_صفحة_منشورات(التالي);
          return التالي;
        });
      }
    });
    if (عنصر) مراقب.current.observe(عنصر);
  }, [يتم_التحميل, يوجد_المزيد]);

  const مؤشر_تحميل = () => (
    <div className="flex justify-center my-8">
      <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <section className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto text-center mb-8">
        <h1 className="text-4xl font-semibold text-red-700">تصفح جميع العناصر</h1>
        <div className="flex flex-wrap justify-center gap-6 mt-6">
          <محدد label="الفئة" value={الفئة_المحددة} onChange={تعيين_الفئة_المحددة} options={خيارات_الفئة} />
          <محدد label="الموقع" value={الموقع_المحدد} onChange={تعيين_الموقع_المحدد} options={خيارات_الموقع} />
          <محدد label="الترتيب الزمني" value={ترتيب_الفرز} onChange={تعيين_ترتيب_الفرز} options={['الاحدث','الاقدم']} />
          <div>
            <label className="block text-sm text-green-900 mb-1">البحث:</label>
            <input
              type="text"
              value={كلمة_بحث}
              onChange={e => تعيين_كلمة_بحث(e.target.value)}
              placeholder="مثلاً: كرسي"
              className="border px-3 py-1 rounded shadow-sm w-40"
            />
          </div>
        </div>
      </div>

      {خطأ && (
        <div className="max-w-6xl mx-auto mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p>{خطأ}</p>
          <button onClick={() => جلب_صفحة_منشورات(صفحة)} className="mt-2 px-4 py-2 bg-red-600 text-white rounded">
            حاول مرة أخرى
          </button>
        </div>
      )}

      {يتم_التحميل && صفحة === 1 ? (
        <مؤشر_تحميل />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-14 mx-auto">
            {منشورات_مصفاة_ومرتبة.map(منشور => (
              <Link to={`/posts/${منشور.post_id}`} key={منشور.post_id}>
                <div className="bg-white shadow rounded overflow-hidden transition-shadow duration-700 ease hover:shadow-xl hover:scale-110 hover:ring-2 hover:ring-green-700 w-l h-80">
                  <div className="w-full h-2/3 bg-gray-200 flex items-center justify-center">
                    {منشور.image
                      ? <img src={`data:image/jpeg;base64,${منشور.image}`} alt={منشور.title} className="object-cover w-full h-full" />
                      : <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0
                               00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    }
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold truncate">{منشور.title}</h3>
                    <p className="text-sm text-zinc-600">
                      <span className="font-medium">الموقع:</span> {استخراج_المدينة(منشور.location)}
                    </p>
                    <p className="text-sm text-gray-400">
                      <span className="font-medium">تم النشر:</span> {new Date(منشور.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {يوجد_المزيد && (
            <div ref={تحميل_اكثر}>
              <مؤشر_تحميل />
            </div>
          )}

          {!يوجد_المزيد && منشورات_مصفاة_ومرتبة.length === 0 && !يتم_التحميل && (
            <div className="text-center py-8 text-gray-600">
              لم يتم العثور على منشورات تطابق معاييرك.
            </div>
          )}
        </>
      )}
    </section>
  );
}

function محدد({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm text-green-900 mb-1">{label}:</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="border rounded px-3 py-1 shadow-sm"
      >
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
