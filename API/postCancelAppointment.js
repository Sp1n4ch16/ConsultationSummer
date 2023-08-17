const {Appointment,OnlineConsult,appointmentDone,consultDone} = require ('../database/mongodb')


const cancelAppointment = async (req, res) => {
    try {
        //await client.connect();
        //const db = client.db("<database-name>");
        const { appointmentId } = req.body;
    
        // Retrieve the appointment to be canceled
        const appointment = await Appointment.findOne({ _id: appointmentId });
        const onlineConsult = await OnlineConsult.findOne({ _id: appointmentId });
    
        if (appointment) {
          // Transfer the appointment to the history collection
          appointment.status = "Cancel"
          await appointment.save();
          await appointmentDone.insertMany(appointment);
          // Delete the appointment from the original collection
          await Appointment.deleteMany({ _id: appointmentId });
        } else if(onlineConsult) {
          onlineConsult.status = "Cancel"
          await onlineConsult.save()
          await consultDone.insertMany(onlineConsult);
          await OnlineConsult.deleteMany({ _id: appointmentId });
        }
        res.sendStatus(200);
      } catch (error) {
        console.error("Error canceling appointment:", error);
        res.status(500).send("An error occurred");
      }
}

module.exports = cancelAppointment
