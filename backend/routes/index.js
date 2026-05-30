/**
 * API route map (mounted under /api in server.js)
 *
 * Auth:        POST /auth/register|login|send-otp|verify-otp  GET /auth/me
 * User:        GET|PUT /user/:id
 * Request:     POST /request/create  GET /request/nearby|mine|active
 *              PUT /request/accept/:id  PUT /request/complete/:id
 * Notifications: GET /notifications/:userId  PUT /notifications/:userId/read
 * Admin:       GET /admin/stats|requests
 * Health:      GET /health
 */

module.exports = {};
