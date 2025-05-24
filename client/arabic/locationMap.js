import { useState, useEffect } from "react";

export default function خريطة_الموقع({ عند_اختيار_الموقع, الموقع_الابتدائي = '' }) {
  const [المنطقة_المختارة, تعيين_المنطقة_المختارة] = useState('');
  const [المنطقة_الفرعية, تعيين_المنطقة_الفرعية] = useState('');

  const مناطق_الأردن = {
    عمان: { name: 'عمان' },
    الزرقاء: { name: 'الزرقاء' },
    اربد: { name: 'اربد' },
    السلط: { name: 'السلط' },
    مأدبا: { name: 'مأدبا' },
    جرش: { name: 'جرش' },
    عجلون: { name: 'عجلون' },
    الكرك: { name: 'الكرك' },
    الطفيلة: { name: 'الطفيلة' },
    معان: { name: 'معان' },
    العقبة: { name: 'العقبة' },
    المفرق: { name: 'المفرق' }
  };

  useEffect(() => {
    if (الموقع_الابتدائي) {
      const [اسم_المنطقة, الفرعية = ''] = الموقع_الابتدائي.split(" - ");
      const معرف_المنطقة = Object.keys(مناطق_الأردن).find(
        key => مناطق_الأردن[key].name.toLowerCase() === اسم_المنطقة.toLowerCase()
      );
      if (معرف_المنطقة) {
        تعيين_المنطقة_المختارة(معرف_المنطقة);
        تعيين_المنطقة_الفرعية(الفرعية);
      }
    }
  }, [الموقع_الابتدائي]);

  useEffect(() => {
    if (المنطقة_المختارة !== '' && المنطقة_الفرعية !== '') {
      const الموقع_الكامل = `${مناطق_الأردن[المنطقة_المختارة].name} - ${المنطقة_الفرعية}`;
      عند_اختيار_الموقع(الموقع_الكامل);
    } else if (المنطقة_المختارة !== '') {
      عند_اختيار_الموقع(مناطق_الأردن[المنطقة_المختارة].name);
    }
  }, [المنطقة_المختارة, المنطقة_الفرعية]);

  const عند_تغيير_المنطقة = (e) => {
    تعيين_المنطقة_المختارة(e.target.value);
    تعيين_المنطقة_الفرعية('');
  };

  const عند_تغيير_الفرعية = (e) => {
    تعيين_المنطقة_الفرعية(e.target.value);
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
          اختر المحافظة
        </label>
        <select
          id="region"
          className="block w-full mt-1 border rounded-md py-2 px-3 shadow-sm focus:border-green-500 focus:ring-green-500"
          onChange={عند_تغيير_المنطقة}
          value={المنطقة_المختارة}
        >
          <option value="" disabled>-- اختر المحافظة --</option>
          {Object.entries(مناطق_الأردن).map(([id, المنطقة]) => (
            <option key={id} value={id}>
              {المنطقة.name}
            </option>
          ))}
        </select>
      </div>

      {المنطقة_المختارة && (
        <div>
          <label htmlFor="sub-location" className="block text-sm font-medium text-gray-700 mb-1">
            المنطقة الفرعية (اختياري)
          </label>
          <input
            id="sub-location"
            type="text"
            className="block w-full border rounded-md py-2 px-3 shadow-sm focus:border-green-500 focus:ring-green-500"
            placeholder="مثلاً: تلاع العلي"
            value={المنطقة_الفرعية}
            onChange={عند_تغيير_الفرعية}
          />
        </div>
      )}
    </div>
  );
}
