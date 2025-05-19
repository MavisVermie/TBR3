import { useState } from 'react';
import LocationMap from './locationMap';
import './contactInfo.css'
export default function ContactInfo() {
    // حالة رقم الهاتف
    const [phoneNumber, setPhoneNumber] = useState('');
    // حالة الموقع الكامل
    const [fullLocation, setFullLocation] = useState('');

    // معالج تغيير رقم الهاتف
    const handlePhoneChange = (e) => {
        const value = e.target.value;
        // التحقق من أن المدخل يحتوي على أرقام فقط
        if (/^\d*$/.test(value)) {
            setPhoneNumber(value);
        }
    };

    // معالج تغيير الموقع
    const handleLocationSelect = (location) => {
        setFullLocation(location);
    };

    return (
        <div className="contact-info-container space-y-4">
            {/* حقل رقم الهاتف */}
            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    رقم الهاتف
                </label>
                <input
                    type="tel"
                    id="phone"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="07XXXXXXXX"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    maxLength="10"
                    required
                />
                <p className="mt-1 text-sm text-gray-500">
                    أدخل رقم الهاتف بدون الرمز الدولي (مثال: 07XXXXXXXX)
                </p>
            </div>

            {/* مكون اختيار الموقع */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    الموقع
                </label>
                <LocationMap onLocationSelect={handleLocationSelect} />
                {fullLocation && (
                    <p className="mt-2 text-sm text-gray-600">
                        الموقع المختار: {fullLocation}
                    </p>
                )}
            </div>
        </div>
    );
}