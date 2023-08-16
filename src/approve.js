const {OnlineConsult} = require('../database/mongodb')

const approvedAPI = async (req, res) => {
    try {
        //await client.connect();
        //const db = client.db("<database-name>");
        const { appointmentId } = req.body;
    
        // Retrieve the appointment to be canceled
        const onlineConsult = await OnlineConsult.findOne({ _id: appointmentId });
    
        if (onlineConsult) {
          (onlineConsult.status = "Approved"),
            (onlineConsult.isVerified = true),
            await onlineConsult.save();
        } else {
          res.send("No appointmentId match to be approve");
        }
        res.sendStatus(200);
      } catch (error) {
        console.error("Error canceling appointment:", error);
        res.status(500).send("An error occurred");
      }
}

module.exports = approvedAPI