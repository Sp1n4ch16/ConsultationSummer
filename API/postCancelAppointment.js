const {Appointment,OnlineConsult,appointmentDone,consultDone,Doctor} = require ('../database/mongodb')
const transporter = require('../src/nodemailer');


const cancelAppointment = async (req, res) => {
    try {
        //await client.connect();
        //const db = client.db("<database-name>");
        const { appointmentId } = req.body;
    
        // Retrieve the appointment to be canceled
        const appointment = await Appointment.findOne({ _id: appointmentId });
        const onlineConsult = await OnlineConsult.findOne({ _id: appointmentId });
        const doctor = await Doctor.findOne({})
    
        if (appointment) {
          // Transfer the appointment to the history collection
          appointment.status = "Cancel"
          await appointment.save();
          await appointmentDone.insertMany(appointment);
          // Delete the appointment from the original collection
          await Appointment.deleteMany({ _id: appointmentId });

          var mailOptions = {
            from: ' "<dummy8270@gmail.com>',
            to: doctor.email,
            subject: 'Dr. Ryan Pangilinan dental clinic',
            html: `<h2> Appointment has been cancel. </h2> <br>
                    <p>Appointment ID: ${appointment._id}</p>
                    <p>Appiontment Name: ${appointment.name}</p>
                    <p>Appiontment Email: ${appointment.email}</p>
                    <p>Appiontment Date: ${appointment.datetime}</p>
                    <p>Appiontment Description: ${appointment.description}</p>
                    <p>Appiontment Services: ${appointment.services}</p>
                    <p>Appiontment Contact Number: ${appointment.contact_number}</p>
            `,
          };

          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log('Email cancelation for appointment has been sent to the doctor');
            }
          });

        } else if(onlineConsult) {
          onlineConsult.status = "Cancel"
          await onlineConsult.save()
          await consultDone.insertMany(onlineConsult);
          await OnlineConsult.deleteMany({ _id: appointmentId });

          var mailOptions = {
            from: ' "<dummy8270@gmail.com>',
            to: doctor.email,
            subject: 'Dr. Ryan Pangilinan dental clinic',
            html: `<h2> Consultation has been cancel. </h2> <br>
                    <p>Consultation ID: ${onlineConsult._id}</p>
                    <p>Consultation Name: ${onlineConsult.name}</p>
                    <p>Consultation Email: ${onlineConsult.email}</p>
                    <p>Consultation Date: ${onlineConsult.datetime}</p>
                    <p>Consultation Description: ${onlineConsult.description}</p>
                    <p>Consultation Contact Number: ${onlineConsult.contact_number}</p>
            `,
          };

          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            } else {
                console.log('Email cancelation for online consultation has been sent to the doctor');
            }
          });
        }
        res.sendStatus(200);
      } catch (error) {
        console.error("Error canceling appointment:", error);
        res.status(500).send("An error occurred");
      }
}

module.exports = cancelAppointment
