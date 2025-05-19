import { useState } from "react";

// مكون خريطة الموقع الذي يسمح للمستخدم باختيار المنطقة والموقع الفرعي في الأردن
export default function LocationMap({ onLocationSelect }) {
    // حالة المنطقة المختارة
    const [selectedRegion, setSelectedRegion] = useState('');
    // حالة الموقع الفرعي المدخل
    const [subLocation, setSubLocation] = useState('');
  
    // كائن يحتوي على جميع مناطق الأردن
    const jordanRegions = {
      amman: {
        name: 'عمان',
      },
      zarqa: {
        name: 'الزرقاء',
      },
      irbid: {
        name: 'إربد',
      },
      salt: {
        name: 'السلط',
      },
      madaba: {
        name: 'مادبا',
      },
      jerash: {
        name: 'جرش',
      },
      ajloun: {
        name: 'عجلون',
      },
      karak: {
        name: 'الكرك',
      },
      tafilah: {
        name: 'الطفيلة',
      },
      maan: {
        name: 'معان',
      },
      aqaba: {
        name: 'العقبة',
      },
      mafraq: {
        name: 'المفرق',
      }
    };
  
    // معالج تغيير المنطقة المختارة
    // يقوم بتحديث المنطقة المختارة وإرسالها إلى المكون الأب
    const handleRegionChange = (e) => {
      const regionId = e.target.value;
      setSelectedRegion(regionId);
      if (regionId && onLocationSelect) {
        const region = jordanRegions[regionId];
        onLocationSelect(region.name);
      }
    };
  
    // معالج تغيير الموقع الفرعي
    // يقوم بتحديث الموقع الفرعي وإرسال الموقع الكامل (المنطقة + الموقع الفرعي) إلى المكون الأب
    const handleSubLocationChange = (e) => {
      const value = e.target.value;
      setSubLocation(value);
      if (selectedRegion && value && onLocationSelect) {
        const fullLocation = `${jordanRegions[selectedRegion].name} - ${value}`;
        onLocationSelect(fullLocation);
      }
    };
  
    return (
      <div className="map-picker">
        {/* قائمة منسدلة لاختيار المنطقة */}
        <select 
          className="region-select"
          onChange={handleRegionChange}
          value={selectedRegion}
        >
          <option value="" disabled>اختر المنطقة</option>
          {Object.entries(jordanRegions).map(([id, region]) => (
            <option key={id} value={id}>
              {region.name}
            </option>
          ))}
        </select>
  
        {/* حقل إدخال الموقع الفرعي - يظهر فقط عند اختيار منطقة */}
        {selectedRegion && (
          <input
            type="text"
            className="sub-location-input"
            placeholder="اكتب الموقع الفرعي"
            value={subLocation}
            onChange={handleSubLocationChange}
          />
        )}
      </div>
    );
}