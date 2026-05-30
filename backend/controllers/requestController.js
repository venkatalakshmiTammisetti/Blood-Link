const userModel = require('../models/userModel');
const requestModel = require('../models/requestModel');
const {
  haversineDistanceKm,
  googleMapsUrl,
  BLOOD_GROUPS,
  normalizeLocation,
  formatBloodRequest,
  toBool,
  validateUnits,
} = require('../utils/helpers');
const { createNotification } = require('./notificationController');

const MATCH_RADIUS_KM = parseFloat(process.env.MATCH_RADIUS_KM || '50');

const findMatchingDonors = async (bloodGroup, lat, lng) => {
  const donors = await userModel.findMatchingDonors(bloodGroup);

  return donors.filter((donor) => {
    const distance = haversineDistanceKm(
      parseFloat(lat),
      parseFloat(lng),
      parseFloat(donor.location_lat),
      parseFloat(donor.location_lng)
    );
    donor.distance_km = Math.round(distance * 10) / 10;
    return distance <= MATCH_RADIUS_KM;
  });
};

const createRequest = async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ success: false, message: 'Only patients can create blood requests.' });
    }

    const { blood_group, units = 1, urgency = 'normal', location_lat, location_lng } = req.body;

    const unitsCheck = validateUnits(units);
    if (!unitsCheck.valid) {
      return res.status(400).json({ success: false, message: unitsCheck.message });
    }

    if (!blood_group || !BLOOD_GROUPS.includes(blood_group)) {
      return res.status(400).json({ success: false, message: 'Valid blood group is required.' });
    }
    const coords = normalizeLocation(location_lat, location_lng);
    if (coords.location_lat == null || coords.location_lng == null) {
      return res.status(400).json({
        success: false,
        message: 'Valid location required. Use GPS or enter coordinates manually.',
      });
    }
    if (!['normal', 'emergency'].includes(urgency)) {
      return res.status(400).json({ success: false, message: 'Urgency must be normal or emergency.' });
    }

    const active = await requestModel.findActiveByPatient(req.user.id);
    if (active) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active blood request.',
        requestId: active.id,
      });
    }

    const requestId = await requestModel.create([
      req.user.id,
      blood_group,
      unitsCheck.value,
      urgency,
      coords.location_lat,
      coords.location_lng,
    ]);
    const matchedDonors = await findMatchingDonors(
      blood_group,
      coords.location_lat,
      coords.location_lng
    );

    const urgencyLabel = urgency === 'emergency' ? 'EMERGENCY' : 'Normal';
    for (const donor of matchedDonors) {
      await createNotification(
        donor.id,
        `${urgencyLabel} blood request nearby: ${blood_group} (${unitsCheck.value} unit(s)). ~${donor.distance_km} km away.`,
        requestId
      );
    }

    res.status(201).json({
      success: true,
      message: 'Blood request created. Nearby donors have been notified.',
      request: { id: requestId, status: 'pending', matched_donors_count: matchedDonors.length },
    });
  } catch (error) {
    console.error('createRequest error:', error);
    res.status(500).json({ success: false, message: 'Failed to create request.' });
  }
};

const getNearbyRequests = async (req, res) => {
  try {
    if (req.user.role !== 'donor') {
      return res.status(403).json({ success: false, message: 'Only donors can view nearby requests.' });
    }

    const donor = await userModel.findById(req.user.id);

    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor profile not found.' });
    }

    if (!toBool(donor.phone_verified)) {
      return res.status(403).json({ success: false, message: 'Verify your phone to view requests.' });
    }

    if (donor.location_lat == null || donor.location_lng == null) {
      return res.status(400).json({
        success: false,
        message: 'Update your location in profile before viewing nearby requests.',
      });
    }

    const requests = await requestModel.findPendingByBloodGroup(donor.blood_group);

    const nearby = requests
      .map((reqItem) => {
        const distance = haversineDistanceKm(
          parseFloat(donor.location_lat),
          parseFloat(donor.location_lng),
          parseFloat(reqItem.location_lat),
          parseFloat(reqItem.location_lng)
        );
        return { ...reqItem, distance_km: Math.round(distance * 10) / 10 };
      })
      .filter((r) => r.distance_km <= MATCH_RADIUS_KM);

    res.json({ success: true, requests: nearby.map(formatBloodRequest) });
  } catch (error) {
    console.error('getNearbyRequests error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch nearby requests.' });
  }
};

const getMyRequests = async (req, res) => {
  try {
    let requests = [];

    if (req.user.role === 'patient') {
      requests = await requestModel.getPatientHistory(req.user.id);
    } else if (req.user.role === 'donor') {
      requests = await requestModel.getDonorHistory(req.user.id);
    }

    res.json({ success: true, requests: requests.map(formatBloodRequest) });
  } catch (error) {
    console.error('getMyRequests error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch requests.' });
  }
};

const getActiveRequest = async (req, res) => {
  try {
    let request = null;

    if (req.user.role === 'patient') {
      request = await requestModel.getActiveForPatient(req.user.id);
    } else if (req.user.role === 'donor') {
      request = await requestModel.getActiveForDonor(req.user.id);
      if (request && request.status === 'accepted') {
        const updated = await requestModel.markInProgress(request.id, req.user.id);
        if (updated) {
          request.status = 'in_progress';
          await createNotification(
            request.patient_id,
            'Your assigned donor is on the way to your location.',
            request.id
          );
        }
      }
    }

    const formatted = request ? formatBloodRequest(request) : null;
    if (formatted) {
      formatted.maps_url = googleMapsUrl(formatted.location_lat, formatted.location_lng);
    }

    res.json({ success: true, request: formatted });
  } catch (error) {
    console.error('getActiveRequest error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch active request.' });
  }
};

const acceptRequest = async (req, res) => {
  try {
    if (req.user.role !== 'donor') {
      return res.status(403).json({ success: false, message: 'Only donors can accept requests.' });
    }

    const { id } = req.params;
    const donor = await userModel.findById(req.user.id);

    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor profile not found.' });
    }

    if (!toBool(donor.is_available) || !toBool(donor.phone_verified)) {
      return res.status(403).json({ success: false, message: 'You must be available and verified to accept.' });
    }

    if (donor.location_lat == null || donor.location_lng == null) {
      return res.status(400).json({ success: false, message: 'Set your location before accepting requests.' });
    }

    const activeDonorRequest = await requestModel.findActiveByDonor(req.user.id);
    if (activeDonorRequest) {
      return res.status(400).json({ success: false, message: 'You already have an active accepted request.' });
    }

    const request = await requestModel.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request is no longer available.' });
    }
    if (request.blood_group !== donor.blood_group) {
      return res.status(400).json({ success: false, message: 'Blood group does not match.' });
    }

    const distance = haversineDistanceKm(
      parseFloat(donor.location_lat),
      parseFloat(donor.location_lng),
      parseFloat(request.location_lat),
      parseFloat(request.location_lng)
    );
    if (distance > MATCH_RADIUS_KM) {
      return res.status(400).json({
        success: false,
        message: `Request is outside your match radius (${MATCH_RADIUS_KM} km).`,
      });
    }

    const accepted = await requestModel.accept(id, req.user.id);
    if (!accepted) {
      return res.status(409).json({ success: false, message: 'Request was already accepted by another donor.' });
    }

    await createNotification(
      request.patient_id,
      `Your blood request has been accepted by donor ${donor.name}.`,
      parseInt(id, 10)
    );

    res.json({ success: true, message: 'Request accepted successfully.' });
  } catch (error) {
    console.error('acceptRequest error:', error);
    res.status(500).json({ success: false, message: 'Failed to accept request.' });
  }
};

const cancelRequest = async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ success: false, message: 'Only patients can cancel blood requests.' });
    }

    const { id } = req.params;
    const request = await requestModel.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }
    if (Number(request.patient_id) !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this request.' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending requests can be cancelled.',
      });
    }

    const cancelled = await requestModel.cancel(id, req.user.id);
    if (!cancelled) {
      return res.status(400).json({ success: false, message: 'Request could not be cancelled.' });
    }

    res.json({ success: true, message: 'Blood request cancelled. You can create a new request.' });
  } catch (error) {
    console.error('cancelRequest error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel request.' });
  }
};

const completeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await requestModel.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }
    const isDonor = req.user.role === 'donor' && Number(request.donor_id) === req.user.id;
    const isPatient = req.user.role === 'patient' && Number(request.patient_id) === req.user.id;

    if (!isDonor && !isPatient) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    if (!['accepted', 'in_progress'].includes(request.status)) {
      return res.status(400).json({ success: false, message: 'Request cannot be completed in current status.' });
    }

    await requestModel.complete(id);

    await createNotification(
      request.patient_id,
      'Blood donation has been marked as completed. Thank you!',
      parseInt(id, 10)
    );
    if (request.donor_id) {
      await createNotification(
        request.donor_id,
        'You marked the donation as completed. Thank you for saving a life!',
        parseInt(id, 10)
      );
    }

    res.json({ success: true, message: 'Request marked as completed.' });
  } catch (error) {
    console.error('completeRequest error:', error);
    res.status(500).json({ success: false, message: 'Failed to complete request.' });
  }
};

module.exports = {
  createRequest,
  getNearbyRequests,
  getMyRequests,
  getActiveRequest,
  acceptRequest,
  cancelRequest,
  completeRequest,
};
