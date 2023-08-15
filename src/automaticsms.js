const {Appointment, OnlineConsult} = require('../database/mongodb.js')
const cron = require("node-cron")
const twilio = require ("twilio")


const accountSid = 'AC67744b6b3dd1ed03a116bd71cffafe0e';
const authToken = 'b50f8f553b326b24efa92b526443f061';
const client = require('twilio')(accountSid, authToken);


const automaticSMS =  (req, res) => {
    
    cron.schedule('* * * * *', async() => {
        try {
            const appointments = await Appointment.find({});
            const onlineConsult = await OnlineConsult.find({});
        
            const currentTime = new Date();
        
            appointments.forEach(appointment => {
                const appointmentDate = new Date(appointment.date);
                const smsSendTime = new Date(appointmentDate.getTime() - 30 * 60 * 1000);
        
                if (currentTime >= smsSendTime && currentTime < appointmentDate && !appointment.smsSent) {
                    // Update the appointment's smsSent property to true
                    appointment.smsSent = true;
                    appointment.save();
        
                    // Send the SMS
                    client.messages
                        .create({
                            body: 'Testing 30min',
                            to: '+639611580504',
                            from: '+12295972175'
                        })
                        .then(message => console.log('SMS sent:', message.sid))
                        .catch(error => console.error('Error sending SMS:', error));
                }
            });

            onlineConsult.forEach(consult => {
                const onlineConsultDate = new Date(consult.date);
                const smsSendTime = new Date(onlineConsultDate.getTime() - 30 * 60 * 1000);
        
                if (currentTime >= smsSendTime && currentTime < onlineConsultDate && !consult.smsSent) {
                    // Update the appointment's smsSent property to true
                    consult.smsSent = true;
                    consult.save();
        
                    // Send the SMS
                    client.messages
                        .create({
                            body: 'Testing 30min',
                            to: '+639611580504',
                            from: '+12295972175'
                        })
                        .then(message => console.log('SMS sent:', message.sid))
                        .catch(error => console.error('Error sending SMS:', error));
                }
              });    

        } catch (error) {
            res.status(500).json({ message: error.message });
            console.log(error);
        }
        console.log("running every minute")

    })

}

module.exports = automaticSMS
