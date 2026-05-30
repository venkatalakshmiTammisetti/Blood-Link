const pool = require('../db/connection');

const create = async (data) => {
  const [result] = await pool.execute(
    `INSERT INTO blood_requests (patient_id, blood_group, units, urgency, location_lat, location_lng, status)
     VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
    data
  );
  return result.insertId;
};

const findById = async (id) => {
  const [rows] = await pool.execute('SELECT * FROM blood_requests WHERE id = ?', [id]);
  return rows[0] || null;
};

const findActiveByPatient = async (patientId) => {
  const [rows] = await pool.execute(
    `SELECT id FROM blood_requests
     WHERE patient_id = ? AND status IN ('pending', 'accepted', 'in_progress')`,
    [patientId]
  );
  return rows[0] || null;
};

const findActiveByDonor = async (donorId) => {
  const [rows] = await pool.execute(
    `SELECT id FROM blood_requests WHERE donor_id = ? AND status IN ('accepted', 'in_progress')`,
    [donorId]
  );
  return rows[0] || null;
};

const findPendingByBloodGroup = async (bloodGroup) => {
  const [rows] = await pool.execute(
    `SELECT br.*, u.name AS patient_name
     FROM blood_requests br
     JOIN users u ON br.patient_id = u.id
     WHERE br.status = 'pending' AND br.blood_group = ?
     ORDER BY CASE WHEN br.urgency = 'emergency' THEN 0 ELSE 1 END, br.created_at DESC`,
    [bloodGroup]
  );
  return rows;
};

const cancel = async (id, patientId) => {
  const [result] = await pool.execute(
    `UPDATE blood_requests SET status = 'cancelled' WHERE id = ? AND patient_id = ? AND status = 'pending'`,
    [id, patientId]
  );
  return result.affectedRows > 0;
};

const accept = async (id, donorId) => {
  const [result] = await pool.execute(
    `UPDATE blood_requests SET donor_id = ?, status = 'accepted' WHERE id = ? AND status = 'pending'`,
    [donorId, id]
  );
  return result.affectedRows > 0;
};

const markInProgress = async (id, donorId) => {
  const [result] = await pool.execute(
    `UPDATE blood_requests SET status = 'in_progress' WHERE id = ? AND donor_id = ? AND status = 'accepted'`,
    [id, donorId]
  );
  return result.affectedRows > 0;
};

const complete = async (id) => {
  await pool.execute(`UPDATE blood_requests SET status = 'completed' WHERE id = ?`, [id]);
};

const getPatientHistory = async (patientId) => {
  const [rows] = await pool.execute(
    `SELECT br.*, d.name AS donor_name, d.phone AS donor_phone, d.blood_group AS donor_blood_group
     FROM blood_requests br
     LEFT JOIN users d ON br.donor_id = d.id
     WHERE br.patient_id = ?
     ORDER BY br.created_at DESC LIMIT 10`,
    [patientId]
  );
  return rows;
};

const getDonorHistory = async (donorId) => {
  const [rows] = await pool.execute(
    `SELECT br.*, u.name AS patient_name, u.phone AS patient_phone
     FROM blood_requests br
     JOIN users u ON br.patient_id = u.id
     WHERE br.donor_id = ? AND br.status IN ('accepted', 'in_progress', 'completed')
     ORDER BY br.created_at DESC LIMIT 10`,
    [donorId]
  );
  return rows;
};

const getActiveForPatient = async (patientId) => {
  const [rows] = await pool.execute(
    `SELECT br.*, d.name AS donor_name, d.phone AS donor_phone, d.blood_group AS donor_blood_group
     FROM blood_requests br
     LEFT JOIN users d ON br.donor_id = d.id
     WHERE br.patient_id = ? AND br.status IN ('pending', 'accepted', 'in_progress')
     ORDER BY br.created_at DESC LIMIT 1`,
    [patientId]
  );
  return rows[0] || null;
};

const getActiveForDonor = async (donorId) => {
  const [rows] = await pool.execute(
    `SELECT br.*, u.name AS patient_name, u.phone AS patient_phone
     FROM blood_requests br
     JOIN users u ON br.patient_id = u.id
     WHERE br.donor_id = ? AND br.status IN ('accepted', 'in_progress')
     ORDER BY br.created_at DESC LIMIT 1`,
    [donorId]
  );
  return rows[0] || null;
};

module.exports = {
  create,
  findById,
  findActiveByPatient,
  findActiveByDonor,
  findPendingByBloodGroup,
  accept,
  cancel,
  markInProgress,
  complete,
  getPatientHistory,
  getDonorHistory,
  getActiveForPatient,
  getActiveForDonor,
};
