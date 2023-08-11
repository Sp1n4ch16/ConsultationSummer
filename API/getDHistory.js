const {appointmentDone, consultDone} = require ('../database/mongodb')
const moment = require('moment')

const DHistoryAPI = async (req, res) => {
    const history = await appointmentDone.find({});
    const consultHistory = await consultDone.find({});
  
    const historyList = history.map(history => {
      const historyDate = history.date;
      const formattedDate = moment(historyDate).format("MMMM Do YYYY, h:mm:ss a"); // Format the date
  
      return {
        ...history.toObject(),
        formattedDate,
      };
    });
    const consultHistoryList = consultHistory.map(consultHistory => {
      const historyDate = history.date;
      const formattedDate = moment(historyDate).format("MMMM Do YYYY, h:mm:ss a"); // Format the date
  
      return {
        ...consultHistory.toObject(),
        formattedDate,
      };
    });
  
    res.render("DHistory", { historyList, consultHistoryList });
}

module.exports = DHistoryAPI