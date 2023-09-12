const {Appointment} = require ('../database/mongodb')
const moment = require('moment')

const DAppointmentAPI = async (req, res) => {
    try {
        const appointment = await Appointment.find({});
        const appointmentList = appointment.map(appointment => {
          
          const philippinesTimeZoneOffset = 8 * 60; // UTC+8:00 in minutes
          const currentDateInPhilippines = new Date(Date.now() + philippinesTimeZoneOffset * 60 * 1000);

          const currentTime = currentDateInPhilippines;
          const appointmentDate = appointment.datetime;
          const oneHourAhead = new Date(appointmentDate.getTime() + 60 * 60 * 1000); // Add 1 hour to the appointment date
          const enabled =
            currentTime > appointmentDate && currentTime < oneHourAhead; // Determine if the button should be enabled
          const formattedDate = moment(appointmentDate).format(
            "MMMM Do YYYY, h:mm:ss a"
          ); // Format the date
    
          return {
            ...appointment.toObject(),
            enabled,
            formattedDate,
          };
        });
        const fullname = req.cookies.name
        res.render("DAppointment", { fullname,appointmentList });
      } catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error);
      }
}

module.exports = DAppointmentAPI;