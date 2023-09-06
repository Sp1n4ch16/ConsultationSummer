const { doctorInfo } = require("../database/mongodb");

const onlineConsultAPI = async (req, res, next) => {
  try {
    const doctors = await doctorInfo.find();
    const patientName = req.cookies.name
    res.render("POnlineConsult", { doctors,patientName });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching doctors.");
  }
};

module.exports = onlineConsultAPI;
