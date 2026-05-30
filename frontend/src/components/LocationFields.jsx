import { useState } from 'react';
import { getCurrentLocation } from '../utils/constants';

const LocationFields = ({ lat, lng, onChange, onError, onSuccess }) => {
  const [gpsLoading, setGpsLoading] = useState(false);

  const useMyLocation = async () => {
    onError?.('');
    setGpsLoading(true);
    try {
      const loc = await getCurrentLocation();
      onChange(loc.lat, loc.lng);
      onSuccess?.('Location captured successfully.');
    } catch (err) {
      onError?.(err.message);
    } finally {
      setGpsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-end flex-wrap">
        <div className="flex-1 min-w-[120px]">
          <label className="label">Latitude</label>
          <input
            type="text"
            inputMode="decimal"
            className="input-field"
            placeholder="e.g. 17.385044"
            value={lat}
            onChange={(e) => onChange(e.target.value, lng)}
            required
          />
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="label">Longitude</label>
          <input
            type="text"
            inputMode="decimal"
            className="input-field"
            placeholder="e.g. 78.486671"
            value={lng}
            onChange={(e) => onChange(lat, e.target.value)}
            required
          />
        </div>
        <button
          type="button"
          onClick={useMyLocation}
          disabled={gpsLoading}
          className="btn-outline whitespace-nowrap mb-0 disabled:opacity-60"
        >
          {gpsLoading ? 'Getting GPS...' : 'Use GPS'}
        </button>
      </div>
      <p className="text-xs text-gray-500">
        Allow location when your browser asks. If GPS fails, enter coordinates manually (find them in Google Maps → right-click a place → copy coordinates).
      </p>
    </div>
  );
};

export default LocationFields;
