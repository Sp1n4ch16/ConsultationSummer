const bcrypt = require("bcrypt");
const calculateAge = require("../src/calculateAge");
const crypto = require("crypto");
const { Register } = require("../database/mongodb");
const transporter = require("../src/nodemailer");
const formatContactNumber = require ("../src/changeContactFormat")

const myAccountAPI = async (req, res) => {
  try {
    const user = await Register.findOne({email: req.cookies.emailUser})
    const salt = await bcrypt.genSalt(10);
    if(user){
        const userBirthdate = req.body.birthdate;
        const userAge = calculateAge(userBirthdate);
        user.first_name = req.body.firstName;
        user.last_name = req.body.lastName;
        user.full_name = req.body.firstName + " " + req.body.lastName;
        user.contact_number = req.body.contactNumber;
        user.address = req.body.address;
        user.birthdate = new Date(userBirthdate);
        user.age = userAge;
        user.gender = req.body.gender;
        user.password = req.body.password;
        const hashpassword = await bcrypt.hash(user.password, salt);
        user.password = hashpassword;
        await user.save()
        console.log('Update Successfully')
        const name = user.full_name
        res.cookie("name", name);
        res.redirect('PHome')
    }else{
        res.send('No user or email was found!')
    }
    }
    catch (err) {
        console.log(err);
      }
    };
    
module.exports = myAccountAPI;
    