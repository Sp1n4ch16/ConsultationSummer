const {Appointment, OnlineConsult} = require('../database/mongodb.js')
const cron = require("node-cron")
const twilio = require ("twilio")


const accountSid = 'AC5b1d4b6644db48a2d6833c93df7dcfab';
const authToken = 'd3565a7f4dc0c3abd9e83260807e9894';
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
                    const number = appointment.contact_number
                    // Send the SMS
                    client.messages
                        .create({
                            body: 'You have Appointment in 30 minutes',
                            to: `${number}`,
                            from: '+16292765493'
                        })
                        .then(message => console.log('SMS sent:', message.sid))
                        .catch(error => console.error('Error sending SMS:', error));

                    // Update the appointment's smsSent property to true
                    appointment.smsSent = true;
                    appointment.save();
                }
            });

            onlineConsult.forEach(consult => {
                const onlineConsultDate = new Date(consult.date);
                const smsSendTime = new Date(onlineConsultDate.getTime() - 30 * 60 * 1000);
        
                if (currentTime >= smsSendTime && currentTime < onlineConsultDate && !consult.smsSent) {
                    // Update the appointment's smsSent property to true
                    consult.smsSent = true;
                    consult.save();
                    const number = consult.contact_number
                    // Send the SMS
                    client.messages
                        .create({
                            body: 'You have Online Consultation in 30 minutes',
                            to: `${number}`,
                            from: '+16292765493',
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
