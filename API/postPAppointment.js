const {Appointment, OnlineConsult} = require ('../database/mongodb')

const PAppointmentAPI = async (req, res) => {
    const checkdate = req.body.date;
    const data = {
      name: req.cookies.name,
      age: req.cookies.age,
      status: "Waiting to Approve",
      date: new Date(req.body.date),
      description: req.body.description,
      gender: req.cookies.gender,
      services: req.body.services,
      contact_number: req.cookies.phone,
      email: req.cookies.emailUser,
    };
    try {
      const existingAppointment = await OnlineConsult.findOne({
        date: checkdate,
      });
      const existingOnline = await Appointment.findOne({
        date: checkdate,
      });
      if (existingAppointment) {
        // Appointment already booked
        res.redirect("bookFailedAppointment");
        console.log("Booked Already");
      }else if(existingOnline){
        res.redirect("bookFailedAppointment");
        console.log("Booked Already");
      }
      else {
        console.log(data);
  
        await Appointment.insertMany([data]);
        res.render("PHome");
      }
    } catch (error) {
      console.log(error);
    }
}

module.exports = PAppointmentAPI