/** Normalize MySQL 0/1 booleans from API */
export const toBool = (value) => value === true || value === 1 || value === '1';

export const isAvailable = (user) => toBool(user?.is_available);

export const isPhoneVerified = (user) => toBool(user?.phone_verified);
