// Simple in-memory appointment store for demo/testing
// Not suitable for production; replace with DB persistence in real app
const appointments = [];

function addAppointment(apt) {
  appointments.push(apt);
  return apt;
}

function getAppointmentsByPatient(patientId) {
  return appointments.filter(a => a.patientId === patientId);
}

function getAppointmentsByDoctor(doctorId) {
  return appointments.filter(a => a.doctorId === doctorId);
}

module.exports = {
  addAppointment,
  getAppointmentsByPatient,
  getAppointmentsByDoctor,
  _all: appointments
};
