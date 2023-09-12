const {OnlineConsult} = require ('../database/mongodb')
const moment = require('moment')

const DOnlineConsultAPI = async (req, res) => {
    try {
        const onlineConsult = await OnlineConsult.find({});
        const onlineConsultList = onlineConsult.map(onlineConsult => {

          const philippinesTimeZoneOffset = 8 * 60; // UTC+8:00 in minutes
          const currentDateInPhilippines = new Date(Date.now() + philippinesTimeZoneOffset * 60 * 1000);

          const currentTime = currentDateInPhilippines;
          const onlineConsultDate = onlineConsult.datetime;
          const oneHourAhead = new Date(
            onlineConsultDate.getTime() + 60 * 60 * 1000
          ); // Add 1 hour to the appointment date
          const enabled =
            currentTime > onlineConsultDate && currentTime < oneHourAhead; // Determine if the button should be enabled
          const formattedDate = moment(onlineConsultDate).format(
            "MMMM Do YYYY, h:mm:ss a"
          ); // Format the date
    
          return {
            ...onlineConsult.toObject(),
            enabled,
            formattedDate,
          };
        });
        const fullname = req.cookies.name
        res.render("DOnlineConsult", { fullname,onlineConsultList });
      } catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error);
      }
}

module.exports = DOnlineConsultAPI;