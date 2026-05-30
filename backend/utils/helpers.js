const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const haversineDistanceKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const generateOtp = () => {
  if (process.env.MOCK_OTP) return process.env.MOCK_OTP;
  return String(Math.floor(100000 + Math.random() * 900000));
};

const toBool = (value) => value === true || value === 1 || value === '1';

const sanitizeUser = (user, { includeAadhar = false } = {}) => {
  if (!user) return null;
  const { password, aadhar, ...rest } = user;
  const safe = { ...rest };
  if (includeAadhar && aadhar) safe.aadhar = aadhar;
  return formatUser(safe);
};

const formatUser = (user) => {
  if (!user) return null;
  return {
    ...user,
    phone_verified: toBool(user.phone_verified),
    is_available: toBool(user.is_available),
    location_lat: user.location_lat != null ? parseFloat(user.location_lat) : null,
    location_lng: user.location_lng != null ? parseFloat(user.location_lng) : null,
    age: user.age != null ? parseInt(user.age, 10) : null,
  };
};

const formatNotification = (n) =>
  n
    ? {
        ...n,
        is_read: toBool(n.is_read),
      }
    : null;

const formatBloodRequest = (req) =>
  req
    ? {
        ...req,
        location_lat: req.location_lat != null ? parseFloat(req.location_lat) : null,
        location_lng: req.location_lng != null ? parseFloat(req.location_lng) : null,
        units: parseInt(req.units, 10),
        distance_km: req.distance_km != null ? parseFloat(req.distance_km) : undefined,
      }
    : null;

const googleMapsUrl = (lat, lng) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

/** Round GPS coords so they fit MySQL DECIMAL columns (max 6 decimal places). */
const normalizeCoordinate = (value, type = 'lat') => {
  const n = parseFloat(value);
  if (Number.isNaN(n)) return null;
  const rounded = Math.round(n * 1e6) / 1e6;
  if (type === 'lat' && (rounded < -90 || rounded > 90)) return null;
  if (type === 'lng' && (rounded < -180 || rounded > 180)) return null;
  return rounded;
};

const normalizeLocation = (lat, lng) => ({
  location_lat: normalizeCoordinate(lat, 'lat'),
  location_lng: normalizeCoordinate(lng, 'lng'),
});

const validateUnits = (units) => {
  if (units === undefined || units === null || units === '') {
    return { valid: false, message: 'Units must be a number.' };
  }
  const n = Number(units);
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    return { valid: false, message: 'Units must be a whole number.' };
  }
  if (n <= 0) {
    return { valid: false, message: 'Units must be greater than 0.' };
  }
  if (n > 10) {
    return { valid: false, message: 'Units cannot exceed 10.' };
  }
  return { valid: true, value: n };
};

module.exports = {
  BLOOD_GROUPS,
  haversineDistanceKm,
  generateOtp,
  sanitizeUser,
  formatUser,
  formatNotification,
  formatBloodRequest,
  toBool,
  googleMapsUrl,
  normalizeCoordinate,
  normalizeLocation,
  validateUnits,
};
