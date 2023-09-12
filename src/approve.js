const { OnlineConsult, Appointment } = require('../database/mongodb');
const transporter = require('../src/nodemailer');

const approvedAPI = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    // Retrieve the appointment to be approved
    const onlineConsult = await OnlineConsult.findOne({ _id: appointmentId });
    const appointment = await Appointment.findOne({ _id: appointmentId });

    if (onlineConsult) {
      onlineConsult.status = 'Approved';
      onlineConsult.isVerified = true;
      await onlineConsult.save();

      var mailOptions = {
        from: ' "Your Appointment is approved" <dummy8270@gmail.com>',
        to: onlineConsult.email,
        subject: 'Dr. Ryan Pangilinan dental clinic',
        html: `<h2> Your Online Consultation in Dr. Ryan Pangilinan dental clinic has been approved. You can now pay for the appointment to proceed.</h2>
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
          console.log('Approval message has been sent to the patient');
        }
      });
      res.sendStatus(200);
    } else if (appointment) {
      appointment.status = 'Approved';
      appointment.isVerified = true;
      await appointment.save();

      var mailOptions = {
        from: ' "Your Appointment is approved" <dummy8270@gmail.com>',
        to: appointment.email,
        subject: 'Dr. Ryan Pangilinan dental clinic',
        html: `<h2> Your Appointment in Dr. Ryan Pangilinan dental clinic has been approved.</h2>
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
          console.log('Approval message has been sent to the patient');
        }
      });
      res.sendStatus(200);
    } else {
      res.send('No appointmentId match to be approved');
    }
  } catch (error) {
    console.error('Error approving appointment:', error);
    res.status(500).send('An error occurred');
  }
};

module.exports = approvedAPI;
