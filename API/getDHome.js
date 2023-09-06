

const dhomeAPI = async (req, res, next) => {
  try {
    const fullname  = req.cookies.name
    res.render("DHome", {fullname});
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching doctors.");
  }
};

module.exports = dhomeAPI;
