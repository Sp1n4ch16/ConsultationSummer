const { Doctor } = require("../database/mongodb");

const onlineConsultAPI = async (req, res, next) => {
  try {
    const doc = await Doctor.find()
    const patientName = req.cookies.name
    res.render("POnlineConsult", { doc,patientName });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching doctors.");
  }
};

module.exports = onlineConsultAPI;
