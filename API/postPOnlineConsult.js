const { OnlineConsult, Appointment } = require("../database/mongodb");

const postPOnlineConsultAPI = async (req, res) => {
  const checkdate = req.body.date;
  const time = req.body.time
  const selectedTime = timeConverter(time)
  const datetimeInput = `${checkdate} ${selectedTime}`
  const data = {
    name: req.cookies.name,
    date: req.body.date,
    time: selectedTime,
    datetime: datetimeInput,
    description: req.body.description,
    email: req.cookies.emailUser,
    age: req.cookies.age,
    gender: req.cookies.gender,
    contact_number: req.cookies.phone,
    isVerified: false,
    paid: "Unpaid",
    status: "Waiting to Approved",
  };
  try {
    const existingAppointment = await OnlineConsult.findOne({
      datetime: datetimeInput,
    });
    const existingOnline = await Appointment.findOne({
      datetime: datetimeInput,
    });
    if (existingAppointment) {
      // Appointment already booked
      res.redirect("bookFailed");
      console.log("Booked Already");
    } else if(existingOnline){
      res.redirect("bookFailed");
      console.log("Booked Already");
    }else {
      await OnlineConsult.insertMany([data]);
      console.log(data)
      res.redirect("PHome");
    }
  } catch (error) {
    console.log(error);
  }
};

function timeConverter(time) {
  // Define a map to convert time strings to hour values
  const timeMap = {
    '8am': 8,
    '10am': 10,
    '12pm': 12,
    '2pm': 14,
    '4pm': 16,
    // Add more time options as needed
  };

  if (time in timeMap) {
    // Get the hour value from the timeMap
    const hour = timeMap[time];

    // Create a new Date object with the current date and the selected hour
    const currentDate = new Date()
    currentDate.setHours(hour, 0, 0, 0); // Set minutes, seconds, and milliseconds to 0

    // Format the time as HH:MM AM/PM
    const formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    
    return formattedTime;
  } else {
    // Handle invalid time input
    console.log('Invalid time selected');
    return null; // or throw an error, depending on your use case
  }
}

function utcTime(timeZone){
  var aryIanaTimeZones = ['Asia/Shanghai'];
  let date = new Date;
  aryIanaTimeZones.forEach((timeZone) =>
  {
  let strTime = date.toLocaleString("en-US", {timeZone: `${timeZone}`});
  console.log(timeZone, strTime);
  return(strTime)
  });
}

module.exports = postPOnlineConsultAPI;
