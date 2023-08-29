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

const {
  Register,
  Appointment,
  OnlineConsult,
  Doctor,
  appointmentDone,
  consultDone,
  doctorInfo,
  ScreenRecord,
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
    secret: "secret",
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
  res.render("register");
});

app.get("/PHome", (req, res) => {
  res.render("PHome");
});

app.get("/bookFailed", (req, res) => {
  res.render("bookFailed");
});

app.get("/bookFailedAppointment", (req, res) => {
  res.render("bookFailedAppointment");
});

app.get("/POnlineConsult", onlineConsultAPI, (req, res) => {});

app.get("/myappointment", transferAppointmentsToHistory, myappointmentAPI);

app.get("/PAppointment", (req, res) => {
  res.render("PAppointment");
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
  const doctor = await doctorInfo.findOne({}); // Use findOne instead of find
  fee = doctor.consultation_fee;

  const create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://localhost:3000/success",
        "cancel_url": "http://localhost:3000/cancel"
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
app.get("/Droom:Droom", (req, res) => {
  res.render("Droom", {
    roomId: "Droom" + req.params.Droom,
    name: req.cookies.name,
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

app.get("/DoctorInfo", (req, res) => {
  res.render("DoctorInfo");
});

app.post("/DoctorInfo", async (req, res) => {
  const fullName = req.body.doctorName;
  const date = req.body.date;
  const consultation_fee = req.body.consultationFee+".00";

  doctorInfo
    .findOneAndUpdate(
      {},
      { fullName, date, consultation_fee },
      { upsert: true }
    )
    .then(() => {
      console.log("Data updated successfully");
      res.redirect("DHome");
    })
    .catch(error => {
      console.log("Error updating data:", error);
      res.status(500).send("Error updating data");
    });
});

server.listen(3000, () => {
  console.log("Port running on 3000");
});
