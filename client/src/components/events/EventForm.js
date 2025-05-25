import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDropzone } from 'react-dropzone';
import LocationMap from '../contactInfo/locationMap';
import { addNewEvent } from '../../data/mockEvents';

export default function EventForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    owner_name: '',
    images: [],
    event_date: '',
    start_time: '',
    end_time: '',
    start_ampm: 'AM',
    end_ampm: 'AM',
  });

  // استخدم useCallback للثوابت حتى لا يعاد تعريفها
  const onDrop = useCallback((acceptedFiles) => {
    const validFiles = acceptedFiles.filter(
      (file) => file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
    );
    if (validFiles.length !== acceptedFiles.length) {
      toast.warning("Some files were rejected. Only images under 5MB allowed.");
    }
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...validFiles],
    }));
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // تحويل الوقت مع AM/PM إلى صيغة 24 ساعة (مثلاً: 02:30 PM => 14:30)
  const convertTo24Hour = (time, ampm) => {
    if (!time) return '';
    let [hours, minutes] = time.split(':').map(Number);
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // تحقق من الحقول المطلوبة
  const validateForm = () => {
    const requiredFields = {
      title: 'Please enter an event title',
      description: 'Please enter an event description',
      location: 'Please select an event location',
      owner_name: 'Please enter the organizer name',
      event_date: 'Please select an event date',
      start_time: 'Please enter a start time',
      end_time: 'Please enter an end time',
    };

    for (const [field, message] of Object.entries(requiredFields)) {
      if (!formData[field]?.trim()) {
        toast.error(message);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // تحويل الوقت لـ 24 ساعة
    const startTime24 = convertTo24Hour(formData.start_time, formData.start_ampm);
    const endTime24 = convertTo24Hour(formData.end_time, formData.end_ampm);

    // تحقق صيغة الوقت
    const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (!timeRegex.test(startTime24) || !timeRegex.test(endTime24)) {
      toast.error('Please enter valid time format (HH:MM)');
      return;
    }

    // تحقق من أن نهاية الوقت بعد بدايته
    if (startTime24 >= endTime24) {
      toast.error('End time must be after start time');
      return;
    }

    // تحقق من وجود صور
    if (formData.images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    try {
      setIsSubmitting(true);
      // إنشاء نسخة من البيانات مع الوقت المحول
      const newEventData = {
        ...formData,
        start_time: startTime24,
        end_time: endTime24,
      };
      const newEvent = addNewEvent(newEventData);
      toast.success('Event created successfully');
      navigate(`/events/${newEvent.id}`);
    } catch (error) {
      toast.error('Error creating event');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Create New Event</h2>
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <p className="text-blue-700">
          Note: The event creation request will be sent to the administration for review and approval.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          disabled={isSubmitting}
          required
        />

        <TextareaField
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          disabled={isSubmitting}
          required
        />

        <div>
          <label className="block mb-1">Location</label>
          <LocationMap onLocationSelect={(location) => setFormData((prev) => ({ ...prev, location }))} />
          {formData.location && <p className="text-sm text-blue-600 mt-1">{formData.location}</p>}
        </div>

        <InputField
          label="Organizer Name"
          name="owner_name"
          value={formData.owner_name}
          onChange={handleChange}
          disabled={isSubmitting}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField
            label="Event Date"
            name="event_date"
            type="date"
            value={formData.event_date}
            onChange={handleChange}
            disabled={isSubmitting}
            required
            min={new Date().toISOString().split('T')[0]}
          />
          <TimeInput
            label="Start Time"
            value={formData.start_time}
            ampm={formData.start_ampm}
            onTimeChange={(val) => setFormData((prev) => ({ ...prev, start_time: val }))}
            onAmpmChange={(val) => setFormData((prev) => ({ ...prev, start_ampm: val }))}
            disabled={isSubmitting}
          />
          <TimeInput
            label="End Time"
            value={formData.end_time}
            ampm={formData.end_ampm}
            onTimeChange={(val) => setFormData((prev) => ({ ...prev, end_time: val }))}
            onAmpmChange={(val) => setFormData((prev) => ({ ...prev, end_ampm: val }))}
            disabled={isSubmitting}
          />
        </div>

        <ImageUpload
          images={formData.images}
          onDrop={onDrop}
          removeImage={(index) =>
            setFormData((prev) => ({
              ...prev,
              images: prev.images.filter((_, i) => i !== index),
            }))
          }
          disabled={isSubmitting}
        />

        <button
          type="submit"
          className={`w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isSubmitting || formData.images.length === 0}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Event Creation Request'}
        </button>
      </form>
    </div>
  );
}

// مكونات مساعدة

const InputField = ({ label, name, value, onChange, disabled, required, type = 'text', min }) => (
  <div>
    <label className="block mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      min={min}
      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    />
  </div>
);

const TextareaField = ({ label, name, value, onChange, disabled, required }) => (
  <div>
    <label className="block mb-1">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      rows={4}
      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    />
  </div>
);

const TimeInput = ({ label, value, ampm, onTimeChange, onAmpmChange, disabled }) => {
  return (
    <div>
      <label className="block mb-1">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onTimeChange(e.target.value)}
          placeholder="hh:mm"
          disabled={disabled}
          maxLength={5}
          pattern="[0-9:]*"
          className="w-2/3 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <select
          value={ampm}
          onChange={(e) => onAmpmChange(e.target.value)}
          disabled={disabled}
          className="w-1/3 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
      <p className="text-xs text-gray-500 mt-1">{value ? `${value} ${ampm}` : 'Example: 09:30 AM'}</p>
    </div>
  );
};

const ImageUpload = ({ images, onDrop, removeImage, disabled }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif'] },
    maxSize: 5 * 1024 * 1024,
    disabled,
  });

  // احفظ الـ object URLs في useMemo لتحسين الأداء وعدم إنشاء روابط جديدة في كل رندر
  const previewUrls = useMemo(
    () => images.map((file) => URL.createObjectURL(file)),
    [images]
  );

  // حرصاً على تحرير الـ URLs عند إزالة الصور أو تغييرها (لتجنب تسرب الذاكرة)
  React.useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  return (
    <div>
      <label className="block mb-1">Images</label>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <p className="text-gray-600">
          {isDragActive ? 'Drop the images here...' : 'Drag and drop images here or click to select files'}
        </p>
        <p className="text-sm text-gray-500 mt-1">JPEG, PNG, GIF (max 5MB per image)</p>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          {images.map((file, index) => (
            <div key={file.name + index} className="relative border rounded overflow-hidden">
              <img
                src={previewUrls[index]}
                alt={`preview ${index + 1}`}
                className="w-full h-32 object-cover"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
                  aria-label="Remove image"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
