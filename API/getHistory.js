const { appointmentDone,consultDone} = require ('../database/mongodb')
const moment = require('moment')

const historyAPI = async (req, res) => {
    const appointmentHistory = await appointmentDone.find({
        email: req.cookies.emailUser,
      });
      const consultHistory = await consultDone.find({
        email: req.cookies.emailUser,
      });
    
      const historyList = appointmentHistory.map(appointmentHistory => {
        const historyDate = appointmentHistory.date;
        const formattedDate = moment(historyDate).format("MMMM Do YYYY, h:mm:ss a"); // Format the date
    
        return {
          ...appointmentHistory.toObject(),
          formattedDate,
        };
      });
    
      const consultHistoryList = consultHistory.map(consultHistory => {
        const historyDate = consultHistory.date;
        const formattedDate = moment(historyDate).format("MMMM Do YYYY, h:mm:ss a"); // Format the date
    
        return {
          ...consultHistory.toObject(),
          formattedDate,
        };
      });
    
      res.render("history", { historyList, consultHistoryList });
}

module.exports = historyAPI