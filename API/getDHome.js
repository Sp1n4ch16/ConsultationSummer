const { doctorInfo } = require("../database/mongodb");

const dhomeAPI = async (req, res, next) => {
  try {
    const doctors = await doctorInfo.find();
    const patientName  = req.cookies.name
    console.log(patientName)
    res.render("DHome", {patientName});
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching doctors.");
  }
};

module.exports = dhomeAPI;
