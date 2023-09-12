const { OnlineConsult, Appointment } = require("../database/mongodb");
const moment = require("moment");

const myappointmentAPI = async (req, res, next) => {
  const patientName = req.cookies.name;

  try {
    const appointment = await Appointment.find({
      email: req.cookies.emailUser,
    });

    const onlineConsult = await OnlineConsult.find({
      email: req.cookies.emailUser,
    });
    const age = req.cookies.age;
    const fullname = req.cookies.name;
    const gender = req.cookies.gender;

    // Modify the appointmentList array to include the enabled property
    const appointmentList = appointment.map(appointment => {
      const currentTime = new Date();
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

    const onlineConsultList = onlineConsult.map(onlineConsult => {

      const philippinesTimeZoneOffset = 8 * 60; // UTC+8:00 in minutes
      const currentDateInPhilippines = new Date(Date.now() + philippinesTimeZoneOffset * 60 * 1000);

      console.log(currentDateInPhilippines);
      
      const currentTime = currentDateInPhilippines
      const onlineConsultDate = onlineConsult.datetime;
      const oneHourAhead = new Date(
        onlineConsultDate.getTime() + 60 * 60 * 1000
      );
      const enabled =
        onlineConsult.paid === "Paid" && currentTime > onlineConsultDate && currentTime < oneHourAhead;
      const formattedDate = moment(onlineConsultDate).format(
        "MMMM Do YYYY, h:mm:ss a"
      );


      console.log(currentTime)
      console.log(onlineConsultDate)
      console.log(oneHourAhead)
      const paymentEnabled = onlineConsult.status === "Approved";
      return {
        ...onlineConsult.toObject(),
        enabled,
        formattedDate,
        paymentEnabled,
      };
    });

    res.render("myappointment", {
      appointmentList,
      onlineConsultList,
      age,
      fullname,
      gender,
      patientName,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};

module.exports = myappointmentAPI;
