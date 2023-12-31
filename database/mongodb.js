const mongoose = require("mongoose");

mongoose.set("strictQuery", false);
mongoose
  .connect(
    "mongodb+srv://admin:admin@consultation.ctwo2ll.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch(error => {
    console.log(error);
  });

const registerSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, "Please enter first name"],
    },
    last_name: {
      type: String,
      required: [true, "Please enter last name"],
    },
    full_name: {
      type: String,
    },
    contact_number: {
      type: String,
      required: [true, "Please enter last name"],
    },
    address: {
      type: String,
      required: [true, "Please enter last name"],
    },
    birthdate: {
      type: Date,
    },
    age: {
      type: String,
    },
    gender: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "Please enter email"],
    },
    password: {
      type: String,
      required: [true, "Please enter password"],
    },
    isVerified: {
      type: Boolean,
    },
    emailToken: {
      type: String,
    },
    userRole: {
      type: String,
    },
    date: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    timestamps: true,
  }
);

const doctorSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, "Please enter first name"],
    },
    last_name: {
      type: String,
      required: [true, "Please enter last name"],
    },
    full_name: {
      type: String,
    },
    contact_number: {
      type: String,
      required: [true, "Please enter last name"],
    },
    address: {
      type: String,
      required: [true, "Please enter last name"],
    },
    birthdate: {
      type: Date,
    },
    age: {
      type: String,
    },
    gender: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "Please enter email"],
    },
    password: {
      type: String,
      required: [true, "Please enter password"],
    },
    isVerified: {
      type: Boolean,
    },
    emailToken: {
      type: String,
    },
    userRole: {
      type: String,
    },
    date: {
      type: Date,
      default: Date.now(),
    },
    fee:{
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

const appointmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    age: {
      type: String,
    },
    date: {
      type: String,
    },
    time:{
      type: String,
    },
    gender: {
      type: String,
    },
    datetime:{
      type:Date
    },
    services: {
      type: String,
      required: [true, "Please enter your services"],
    },
    email: {
      type: String,
    },
    status: {
      type: String,
    },
    contact_number:{
      type: String
    },
    smsSent:{
      type:String,
    }
  },
  {
    timestamps: true,
  }
);

const onlineconsultationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    date: {
      type: String,
    },
    time:{
      type: String,
    },
    datetime:{
      type:Date
    },
    age: {
      type: String,
    },
    gender: {
      type: String,
    },
    email: {
      type: String,
    },
    isVerified: {
      type: Boolean,
    },
    paid: {
      type: String,
    },
    status: {
      type: String,
    },
    contact_number:{
      type: String
    },
    smsSent:{
      type:String,
    }
  },
  {
    timestamps: true,
  }
);


const appointmentDoneschema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    age: {
      type: String,
    },
    date: {
      type: Date,
    },
    gender: {
      type: String,
    },
    description: {
      type: String,
    },
    services: {
      type: String,
    },
    image: {
      data: Buffer,
      contentType: String,
    },
    email: {
      type: String,
    },
    status: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const onlineConsultDoneschema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    age: {
      type: String,
    },
    status: {
      type: String,
    },
    date: {
      type: Date,
    },
    description: {
      type: String,
      required: [true, "Please enter description"],
    },
    image: {
      data: Buffer,
      contentType: String,
    },
    email: {
      type: String,
    },
    paid: {
      type: String
    },
    gender: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Appointment =  mongoose.model("Appointment", appointmentSchema);
const Register = mongoose.model("Register", registerSchema);
const appointmentDone =  mongoose.model("Appointment-History",appointmentDoneschema);
const consultDone =  mongoose.model("Online Consultation-History",onlineConsultDoneschema);
const OnlineConsult =  mongoose.model("Online Consultation",onlineconsultationSchema);
const Doctor = mongoose.model("Doctor", doctorSchema);

module.exports = {
  Appointment,
  Register,
  OnlineConsult,
  Doctor,
  appointmentDone,
  consultDone,
};
