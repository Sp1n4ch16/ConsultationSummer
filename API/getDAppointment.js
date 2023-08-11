const {Appointment} = require ('../database/mongodb')
const moment = require('moment')

const DAppointmentAPI = async (req, res) => {
    try {
        const appointment = await Appointment.find({});
    
        const appointmentList = appointment.map(appointment => {
          const currentTime = new Date();
          const appointmentDate = appointment.date;
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
    
        res.render("DAppointment", { appointmentList });
      } catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error);
      }
}

module.exports = DAppointmentAPI;