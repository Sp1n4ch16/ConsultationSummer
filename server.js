const session = require("express-session");
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const http = require("http");
const server = http.createServer(app);
const cookieparser = require("cookie-parser");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server, { cors: { origin: "*" } });
require("dotenv").config();
const paypal = require("paypal-rest-sdk");
var cron = require('node-cron');
const fs = require('fs')
const multer = require('multer')

const flash = require('express-flash')
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(flash())

const accountSid = 'AC67744b6b3dd1ed03a116bd71cffafe0e';
const authToken = 'adef90ea2422b2814b4ebbe9a791351e';
const client = require('twilio')(accountSid, authToken);

const verifyEmail = require("./src/verify");
const calculateAge = require("./src/calculateAge");
const loginVerify = require("./src/login-verify");
const transferAppointmentsToHistory = require("./src/trasnferAppointemt");
const { storage, upload } = require("./src/multer");
const uploadprescription = multer({ dest: "uploads/" });
const transporter = require("./src/nodemailer");
const createToken = require("./src/jwt");
const automaticSMS = require("./src/automaticsms");
automaticSMS()
const approvedAPI = require('./src/approve')


const myappointmentAPI = require("./API/getmyappointment");
const dhomeAPI = require("./API/getDHome");
const onlineConsultAPI = require("./API/getPOnlineConsult");
const roomAPI = require("./API/getRoom");
const loginAPI = require("./API/postLogin");
const registerAPI = require("./API/postRegister");
const postPOnlineConsultAPI = require("./API/postPOnlineConsult");
const cancelAppointment = require('./API/postCancelAppointment')
const historyAPI = require('./API/getHistory')
const PAppointmentAPI = require('./API/postPAppointment')
const DAppointmentAPI = require('./API/getDAppointment')
const DOnlineConsultAPI = require('./API/getDOnlineConsult')
const DHisotryAPI = require('./API/getDHistory')
const myAccountAPI = require('./API/postMyAccount')

const {
  Register,
  Appointment,
  OnlineConsult,
  Doctor,
  appointmentDone,
  consultDone,
} = require("./database/mongodb");

app.set("view engine", "ejs");

app.use(express.static("src"));
app.use(express.static("CSS"));
app.use(express.static("database"));
app.use(express.static("images"));
app.use(express.static("views"));
app.use(cookieparser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: "secret key",
    cookie: { maxAge: 60000 },
    saveUninitialized: false,
    resave: false,
  })
);

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(http, {
  debug: true,
});

//socket.io chat
const users = {};

io.on("connection", socket => {
  socket.on("join-room", (roomId, userId, name, email) => {
    users[socket.id] = name;
    socket.broadcast.emit("user-connected", userId);
    socket.broadcast.emit("join-name", name);
    socket.broadcast.emit("join-email", email);

    socket.on("disconnect", () => {
      socket.broadcast.emit("user-disconnected", userId);
    });
  });

  socket.on("send-chat-message", message => {
    socket.broadcast.emit("chat-message", {
      message: message,
      name: users[socket.id],
    });
  });
});

paypal.configure({
  mode: "live", //sandbox or live
  client_id:
    "AYqdpvOQdeWvgTK9bl-cxL7CiF-FcIOdyHgLJfEIG6-FBhvdtTntKlXP_f4u-ZCsiKbxZpwyTGIRvDe6",
  client_secret:
    "EFI2B7zQ5HDBO_nNEe3hjwGeytc7LtGXNpzrpxCATSj93Gw5jDKvIhyMRshsXltx4LYC2Q5hndU8s3L_",
});

let patientName;


app.get("/", (req, res) => {
  res.render("login");
});
app.get("/loginFailed", (req, res) => {
  res.render("loginFailed");
});
app.get("/loginSuccess", (req, res) => {
  res.render("loginSuccess");
});
app.get("/verify", (req, res) => {
  res.render("verify");
});

app.get("/login/verify-email", loginVerify, async (req, res) => {
  res.redirect("/");
});

app.get("/register", (req, res) => {
  const errors = req.flash().error || [];
  console.log(req.flash())
  res.render("register",{errors});
}); 

app.get("/PHome", (req, res) => {
  patientName = req.cookies.name
  res.render("PHome", {patientName});
});

app.get("/bookFailed", (req, res) => {
  res.render("bookFailed");
});

app.get("/bookFailedAppointment", (req, res) => {
  res.render("bookFailedAppointment");
});

app.get("/POnlineConsult", onlineConsultAPI, (req, res) => {});

app.get("/MyAccount",async (req, res) => {
  const email = req.cookies.emailUser
  const user = await Register.findOne({email:email})
  const userList = Object.values(user);
  if(user){
    res.render('MyAccount',{userList})
  }else {
    res.send('Canoot get the email')
  }
});

app.post("/MyAccount",myAccountAPI,(req, res) => {

})

app.get("/myappointment", transferAppointmentsToHistory, myappointmentAPI);

app.get("/PAppointment", (req, res) => {
  patientName = req.cookies.name;
  res.render("PAppointment",{patientName});
});

app.get("/room", (req, res) => {
  res.redirect(`/room${uuidv4()}`);
});

app.get("/room:room", roomAPI, (req, res) => {});

app.get('/history', historyAPI, (req, res) => {})

/*-----LOGIN-----*/
app.post("/login", verifyEmail, loginAPI, (req, res) => {});

/*-----REGISTER------*/
app.post("/register", registerAPI, (req, res) => {});

/*---ONLINE CONSULTATION----*/
app.post(
  "/POnlineConsult",
  upload.single("image"),
  postPOnlineConsultAPI,
  async (req, res) => {}
);

app.post('/PAppointment', upload.single('image'),PAppointmentAPI, (req, res) => {})

app.post("/cancel-appointment",cancelAppointment, async (req, res) => {});

app.post('/docCancel-appointment', async (req, res) => {
  try {
    //await client.connect();
    //const db = client.db("<database-name>");
    const { appointmentId } = req.body;

    // Retrieve the appointment to be canceled
    const appointment = await Appointment.findOne({ _id: appointmentId });
    const onlineConsult = await OnlineConsult.findOne({ _id: appointmentId });

    if (appointment) {
      var mailOptions = {
        from: ' "Your Appointment is Cancel" <dummy8270@gmail.com>',
        to: appointment.email,
        subject: "Dr. Ryan Pangilinan dental clinic",
        html: `<h2> Your appointment has been cancel</h2>`,
      };
    
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("cancel message has been sent to the patient");
        }
      });

      // Transfer the appointment to the history collection
      appointment.status = "Cancel"
      await appointment.save();
      await appointmentDone.insertMany(appointment);
      // Delete the appointment from the original collection
      await Appointment.deleteMany({ _id: appointmentId });


    } else if(onlineConsult) {

      var mailOptions = {
        from: ' "Your Appointment is Cancel" <dummy8270@gmail.com>',
        to: onlineConsult.email,
        subject: "Dr. Ryan Pangilinan dental clinic",
        html: `<h2> Your appointment has been cancel</h2>`,
      };
    
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("cancel message has been sent to the patient");
        }
      });

      onlineConsult.status = "Cancel"
      await onlineConsult.save()
      await consultDone.insertMany(onlineConsult);
      await OnlineConsult.deleteMany({ _id: appointmentId });
    }
    res.sendStatus(200);
  } catch (error) {
    console.error("Error canceling appointment:", error);
    res.status(500).send("An error occurred");
  }
})

var consult; // Declare consult variable outside of the route
var fee;

app.post('/pay', async (req, res) => {
  consult = req.body.appointmentId; // Declare consult using 'const'
  const doctor = await Doctor.findOne({}); // Use findOne instead of find
  fee = doctor.fee;

  const create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
      "return_url": "https://consultationsummer.onrender.com/success",
      "cancel_url": "https://consultationsummer.onrender.com/cancel"
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": "Consultation Fee",
                "sku": "001",
                "price":fee, // Use the fixed fee value here
                "currency": "PHP",
                "quantity": 1
            }]
        },
        "amount": {
            "currency": "PHP",
            "total": fee // Use the fixed fee value here
        },
        "description": "Best Dentist Ever"
    }]
};

app.get('/success', async (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  const transactionId = await OnlineConsult.findOne({_id: consult})
  try {

    if (!transactionId) {
      console.log('Consult not found');
      return res.status(404).send('Consult not found');
    }

    transactionId.paid = "Paid";
    await transactionId.save();
   console.log('Transaction marked as paid:', transactionId);
  } catch (error) {
    console.log(error);
  }

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
        "amount": {
            "currency": "PHP",
            "total": fee
        }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
        console.log(error.response);
        throw error;
    } else {
        console.log(JSON.stringify(payment));
        res.redirect('myappointment');
    }
  });
});
  paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
          throw error;
      } else {
          for(let i = 0;i < payment.links.length;i++){
            if(payment.links[i].rel === 'approval_url'){
              res.redirect(payment.links[i].href);
            }
          }
      }
    });
    
});

app.get('/cancel', (req, res) => res.redirect('myappointment'));


// Doctor/Admin Route

app.get("/DHome", dhomeAPI, (req, res) => {});

app.get('/DAppointment',DAppointmentAPI, (req,res) => {})

app.get('/DOnlineConsult',DOnlineConsultAPI, (req, res) => {})

app.get('/DHistory', DHisotryAPI, (req, res) => {})

app.get("/Droom", (req, res) => {
  res.redirect(`/Droom${uuidv4()}`);
});
let patientEmail;
app.get("/Droom:Droom", (req, res) => {
  res.render("Droom", {
    roomId: "Droom" + req.params.Droom,
    name: req.cookies.name,
    emailOfPatient: patientEmail
  });
});

app.post("/approve-appointment", approvedAPI, () => {});

app.post("/prescription",uploadprescription.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No image uploaded.");
  }
  const picturePath = path.join(__dirname, "pictures", req.file.originalname);
  fs.renameSync(req.file.path, picturePath);

  const data = {
    name: req.body.email,
    picture: req.file.originalname,
  };
  //send verification to the user
  var mailOptions = {
    from: ' "Verify your email" <dummy8270@gmail.com>',
    to: data.name,
    subject: "Dr. Ryan -verify your email",
    html: `<h2> Thanks for Consulting in Dr. Ryan Dental Clinic here's your prescription! </h2>`,
    attachments: [
      {
        filename: data.picture,
        path: `pictures/${data.picture}`,
      },
    ],
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Prescription has been sent to the patient");
      res.redirect("Droom");
    }
  });
});

app.get("/DoctorInfo", async (req, res) => {
  const email = req.cookies.emailUser
  const doc = await Doctor.findOne({email:email})
  const docInfo = Object.values(doc)
  res.render("DoctorInfo",{fullname:req.cookies.name , docInfo});
});

const formatContactNumber = require ("./src/changeContactFormat");
const { YesterdayInstance } = require("twilio/lib/rest/api/v2010/account/usage/record/yesterday");
app.post('/docRegister', async (req, res) => {
    try {
      const userBirthdate = req.body.birthdate;
      const userAge = calculateAge(userBirthdate);
      const userContact = req.body.contactNumber;
      const userPhone = formatContactNumber(userContact)
      console.log(userPhone)
      const data = {
        first_name: req.body.firstName,
        last_name: req.body.lastName,
        full_name: req.body.firstName + " " + req.body.lastName,
        contact_number: userPhone,
        address: req.body.address,
        birthdate: new Date(userBirthdate),
        age: userAge,
        gender: req.body.gender,
        email: req.body.email,
        password: req.body.password,
        isVerified: true,
        emailToken: null,
        userRole: "1",
      };
      const salt = await bcrypt.genSalt(10);
      const hashpassword = await bcrypt.hash(data.password, salt);
      data.password = hashpassword;
      await Doctor.insertMany([data]);
      console.log('doc register')
  
  }catch(error){
    console.log(error)
  };
})

app.post('/docInfo', async (req, res) => {
  try {
    const user = await Doctor.findOne({email: req.cookies.emailUser})
    const salt = await bcrypt.genSalt(10);
    const consFee = req.body.fee
    const totalFee = consFee + ".00"
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
        user.fee = totalFee;
        user.password = req.body.password;
        const hashpassword = await bcrypt.hash(user.password, salt);
        user.password = hashpassword;
        await user.save()
        console.log('Update Successfully')
        const name = user.full_name
        res.cookie("name", `Dr. ${name}`);
        res.redirect('DHome')
    }else{
        res.send('No user or email was found!')
    }
    }
    catch (err) {
        console.log(err);
      }
})

app.post('/patientEmail', async (req, res) => {
  const { appointmentId } = req.body;
  const check = await OnlineConsult.findOne({_id:appointmentId})
  if(check){
    patientEmail = check.email
    res.redirect('Droom')
  }
  else{
    res.send('No appointmentID found')
  }
})

server.listen(3000, () => {
  console.log("Port running on 3000");
});
