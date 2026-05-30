export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const GENDERS = ['Male', 'Female', 'Other'];

export const formatCoordinate = (value, type = 'lat') => {
  const n = typeof value === 'number' ? value : parseFloat(String(value).trim());
  if (Number.isNaN(n)) return '';
  const rounded = Math.round(n * 1e6) / 1e6;
  if (type === 'lat' && (rounded < -90 || rounded > 90)) return '';
  if (type === 'lng' && (rounded < -180 || rounded > 180)) return '';
  return String(rounded);
};

const geolocationErrorMessage = (error) => {
  if (!error) return 'Unable to retrieve your location.';
  switch (error.code) {
    case 1:
      return 'Location permission denied. Click the lock icon in your browser address bar → allow Location, then try again.';
    case 2:
      return 'Location unavailable. Check that Windows Location is on, or enter latitude/longitude manually below.';
    case 3:
      return 'Location request timed out. Try again or enter coordinates manually.';
    default:
      return error.message || 'Unable to retrieve your location.';
  }
};

export const getCurrentLocation = () =>
  new Promise((resolve, reject) => {
    if (!window.isSecureContext && window.location.hostname !== 'localhost') {
      reject(
        new Error(
          'GPS requires HTTPS or localhost. Open http://localhost:5173 or enter coordinates manually.'
        )
      );
      return;
    }

    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser. Enter coordinates manually.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = formatCoordinate(pos.coords.latitude, 'lat');
        const lng = formatCoordinate(pos.coords.longitude, 'lng');
        if (!lat || !lng) {
          reject(new Error('Received invalid GPS coordinates. Enter them manually.'));
          return;
        }
        resolve({ lat, lng });
      },
      (err) => reject(new Error(geolocationErrorMessage(err))),
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 60000,
      }
    );
  });

export const statusBadge = (status) => {
  const map = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-indigo-100 text-indigo-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };
  return map[status] || 'bg-gray-100 text-gray-800';
};
