const {
  Appointment,
  OnlineConsult,
  appointmentDone,
  consultDone,
} = require("../database/mongodb");
const moment = require("moment");

const transferAppointmentsToHistory = async (req, res, next) => {
  try {
    const philippinesTimeZoneOffset = 8 * 60; // UTC+8:00 in minutes
    const currentDateInPhilippines = new Date(Date.now() + philippinesTimeZoneOffset * 60 * 1000);

    // Get the current time
    const currentTime = currentDateInPhilippines;

    // Calculate the time 1 hour ago
    const oneHourAgo = new Date(currentTime.getTime() - 60 * 60 * 1000);

    // Find appointments where the date is 1 hour earlier than the current time
    const appointments = await Appointment.find({ datetime: { $lt: oneHourAgo } });
    const consult = await OnlineConsult.find({ datetime: { $lt: oneHourAgo } });

    // Transfer appointments to history collection
    await appointmentDone.insertMany(appointments);
    await consultDone.insertMany(consult);

    // Remove transferred appointments from the appointment collection
    await Appointment.deleteMany({
      _id: { $in: appointments.map(appointment => appointment._id) },
    });
    console.log("transfer appointment to hisotry is completed")
    await OnlineConsult.deleteMany({
      _id: { $in: consult.map(OnlineConsult => OnlineConsult._id) },
    });
    console.log("transfer online consultation to hisotry is completed")
    next();
  } catch (error) {
    console.error("Error transferring appointments to history:", error);
  }
};

module.exports = transferAppointmentsToHistory;
