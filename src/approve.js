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
        html: `<h2> Your Online Consultation in Dr. Ryan Pangilinan dental clinic has been approved. You can now pay for the appointment to proceed.</h2>`,
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
        html: `<h2> Your Appointment in Dr. Ryan Pangilinan dental clinic has been approved.</h2>`,
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
