import { useState } from "react";

export default function LocationMap({ onLocationSelect }) {
  const [selectedRegion, setSelectedRegion] = useState('');
  const [subLocation, setSubLocation] = useState('');

  const jordanRegions = {
    amman: { name: 'Amman' },
    zarqa: { name: 'Zarqa' },
    irbid: { name: 'Irbid' },
    salt: { name: 'Salt' },
    madaba: { name: 'Madaba' },
    jerash: { name: 'Jerash' },
    ajloun: { name: 'Ajloun' },
    karak: { name: 'Karak' },
    tafilah: { name: 'Tafilah' },
    maan: { name: 'Ma’an' },
    aqaba: { name: 'Aqaba' },
    mafraq: { name: 'Mafraq' }
  };

  const handleRegionChange = (e) => {
    const regionId = e.target.value;
    setSelectedRegion(regionId);
    setSubLocation(""); // reset sub-location

    if (regionId && onLocationSelect) {
      const region = jordanRegions[regionId];
      onLocationSelect(region.name);
    }
  };

  const handleSubLocationChange = (e) => {
    const value = e.target.value;
    setSubLocation(value);

    if (selectedRegion && value && onLocationSelect) {
      const fullLocation = `${jordanRegions[selectedRegion].name} - ${value}`;
      onLocationSelect(fullLocation);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
          Select Region
        </label>
        <select
          id="region"
          className="block w-full mt-1 border rounded-md py-2 px-3 shadow-sm focus:border-green-500 focus:ring-green-500"
          onChange={handleRegionChange}
          value={selectedRegion}
        >
          <option value="" disabled>-- Choose a Region --</option>
          {Object.entries(jordanRegions).map(([id, region]) => (
            <option key={id} value={id}>
              {region.name}
            </option>
          ))}
        </select>
      </div>

      {selectedRegion && (
        <div>
          <label htmlFor="sub-location" className="block text-sm font-medium text-gray-700 mb-1">
            Specific Area
          </label>
          <input
            id="sub-location"
            type="text"
            className="block w-full border rounded-md py-2 px-3 shadow-sm focus:border-green-500 focus:ring-green-500"
            placeholder="e.g. Tla' Al-Ali"
            value={subLocation}
            onChange={handleSubLocationChange}
          />
        </div>
      )}
    </div>
  );
}
