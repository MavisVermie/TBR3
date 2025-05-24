import React, { useState, useCallback } from 'react';
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
    end_time: ''
  });

  const onDrop = useCallback((acceptedFiles) => {
    const validFiles = acceptedFiles.filter(file =>
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
    );
    if (validFiles.length !== acceptedFiles.length) {
      toast.warning("Some files were rejected. Only image files under 5MB are allowed.");
    }
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...validFiles]
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTimeInputChange = (type, value) => {
    // Remove any non-digit characters
    let cleanedValue = value.replace(/[^\d]/g, '');
    
    // Handle hours
    if (cleanedValue.length > 0) {
      const firstDigit = parseInt(cleanedValue[0]);
      if (firstDigit > 1) {
        cleanedValue = '0' + cleanedValue;
      }
      
      if (cleanedValue.length >= 2) {
        const hours = parseInt(cleanedValue.slice(0, 2));
        if (hours > 12) {
          toast.warning('Please enter a number between 00 and 12 for hours');
          cleanedValue = '12' + cleanedValue.slice(2);
        }
      }
    }
    
    // Add colon after hours if we have more than 2 digits
    if (cleanedValue.length > 2) {
      cleanedValue = cleanedValue.slice(0, 2) + ':' + cleanedValue.slice(2);
    }

    // Validate minutes if we have them
    if (cleanedValue.includes(':')) {
      const minutes = parseInt(cleanedValue.split(':')[1]);
      if (minutes > 59) {
        toast.warning('Minutes must be between 00 and 59');
        cleanedValue = cleanedValue.slice(0, 3) + '59';
      }
    }

    setFormData(prev => ({
      ...prev,
      [type]: cleanedValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = {
      title: 'Please enter an event title',
      description: 'Please enter an event description',
      location: 'Please select an event location',
      owner_name: 'Please enter the organizer name',
      event_date: 'Please select an event date',
      start_time: 'Please enter a start time',
      end_time: 'Please enter an end time'
    };

    for (const [field, message] of Object.entries(requiredFields)) {
      if (!formData[field]?.trim()) {
        toast.error(message);
        return;
      }
    }

    // Validate time format
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(formData.start_time) || !timeRegex.test(formData.end_time)) {
      toast.error('Please enter valid time format (HH:MM)');
      return;
    }

    // Validate end time is after start time
    if (formData.start_time >= formData.end_time) {
      toast.error('End time must be after start time');
      return;
    }

    // Validate images
    if (formData.images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    try {
      setIsSubmitting(true);
      const newEvent = addNewEvent(formData);
      toast.success('Event created successfully');
      navigate(`/events/${newEvent.id}`);
    } catch (error) {
      toast.error('Error creating event');
      console.error('Error creating event:', error);
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
        <div>
          <label className="block mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="4"
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block mb-1">Location</label>
          <LocationMap onLocationSelect={(location) => setFormData(prev => ({ ...prev, location }))} />
          {formData.location && (
            <p className="text-sm text-blue-600 mt-1">{formData.location}</p>
          )}
        </div>
        <div>
          <label className="block mb-1">Organizer Name</label>
          <input
            type="text"
            name="owner_name"
            value={formData.owner_name}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1">Event Date</label>
            <input
              type="date"
              name="event_date"
              value={formData.event_date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={isSubmitting}
            />
          </div>
          <TimeInput
            label="Start Time"
            value={formData.start_time}
            onChange={(value) => handleTimeInputChange('start_time', value)}
            isSubmitting={isSubmitting}
          />
          <TimeInput
            label="End Time"
            value={formData.end_time}
            onChange={(value) => handleTimeInputChange('end_time', value)}
            isSubmitting={isSubmitting}
          />
        </div>
        <ImageUpload
          images={formData.images}
          onDrop={onDrop}
          removeImage={(index) => setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
          }))}
          isSubmitting={isSubmitting}
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

const TimeInput = ({ label, value, onChange, isSubmitting }) => {
  const [ampm, setAmpm] = useState('AM');
  
  const handleTimeChange = (newValue) => {
    onChange(newValue);
  };

  const handleAMPMChange = (newAmpm) => {
    setAmpm(newAmpm);
  };

  const formatDisplayTime = () => {
    if (!value) return '';
    return `${value} ${ampm}`;
  };

  return (
    <div>
      <label className="block mb-1">{label}</label>
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => handleTimeChange(e.target.value)}
            placeholder="00:00"
            className="w-2/3 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isSubmitting}
            maxLength="5"
            pattern="[0-9:]*"
          />
          <select
            value={ampm}
            onChange={(e) => handleAMPMChange(e.target.value)}
            className="w-1/3 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={isSubmitting}
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>
        <p className="text-xs text-gray-500">{value ? formatDisplayTime() : 'Example: 09:30 AM'}</p>
      </div>
    </div>
  );
};

const ImageUpload = ({ images, onDrop, removeImage, isSubmitting }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif'] },
    maxSize: 5 * 1024 * 1024
  });

  return (
    <div>
      <label className="block mb-1">Images</label>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-gray-600">
          {isDragActive ? 'Drop the images here...' : 'Drag and drop images here or click to select files'}
        </p>
        <p className="text-sm text-gray-500 mt-1">JPEG, PNG, GIF (max 5MB per image)</p>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={URL.createObjectURL(image)}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-600 text-white text-xs rounded-full px-2 py-1 opacity-0 group-hover:opacity-100 transition"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
