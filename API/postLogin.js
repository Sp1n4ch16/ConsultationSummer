const { Register, doctorInfo, Doctor } = require("../database/mongodb");
const bcrypt = require("bcrypt");
const createToken = require("../src/jwt");

const loginAPI = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const patient = await Register.findOne({ email: email }).exec(); // Add .exec() to execute the query
    const doc = await Doctor.findOne({ email: email }).exec(); // Add .exec() to execute the query
    if (patient) {
      const match = await bcrypt.compare(password, patient.password);
      if (match) {
          //create token
          const token = createToken(patient._id);
          const user = patient.email;
          const name = patient.full_name;
          const age = patient.age;
          const gender = patient.gender;
          const phone = patient.contact_number
          //store token in cookie
          res.cookie("access-token", token);
          res.cookie("emailUser", user);
          res.cookie("name", name);
          res.cookie("age", age);
          res.cookie("gender", gender);
          res.cookie("phone", phone);
          res.redirect("loginSuccess");
        }
       else {
        console.log("invalid password");
        res.redirect("loginFailed");
      }
    }else if (doc){
      const match = await bcrypt.compare(password, doc.password);
      if(match){
          //create token
          const doctors = await Doctor.find({email: email});
          const token = createToken(doc._id);
          const user = doc.email;
          const name = doc.full_name;
          const age = doc.age;
          //store token in cookie
          res.cookie("access-token", token);
          res.cookie("emailUser", user);
          res.cookie("name",`Dr. ${name}`);
          res.cookie("age", age);
          console.log(doctors)
          res.render("DHome", {fullname: req.cookies.name});
      } else {
        console.log("invalid password");
        res.redirect("loginFailed");
    }
  }
}catch (err) {
  res.redirect("loginFailed");
  console.log(err);
};
}

module.exports = loginAPI;
