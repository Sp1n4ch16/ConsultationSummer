const {Appointment, OnlineConsult} = require('../database/mongodb.js')
const cron = require("node-cron")
const twilio = require ("twilio")
const transporter = require('../src/nodemailer');


const accountSid = 'AC5b1d4b6644db48a2d6833c93df7dcfab';
const authToken = 'de2e2e765e6d2336400cb91825becf5d';
const client = require('twilio')(accountSid, authToken);

const automaticSMS =  (req, res) => {
    
    cron.schedule('* * * * *', async() => {
        try {
            const appointments = await Appointment.find({});
            const onlineConsult = await OnlineConsult.find({});
        
            const philippinesTimeZoneOffset = 8 * 60; // UTC+8:00 in minutes
            const currentDateInPhilippines = new Date(Date.now() + philippinesTimeZoneOffset * 60 * 1000);
            const currentTime = new Date();
            console.log(currentTime)

        
            appointments.forEach(appointment => {
                const appointmentDate = new Date(appointment.datetime);
                console.log(appointmentDate)
                const smsSendTime = new Date(appointmentDate.getTime() - 30 * 60 * 1000);
        
                if (currentTime >= smsSendTime && currentTime < appointmentDate && !appointment.smsSent) {
                    const number = appointment.contact_number

                    // Send the SMS
                    /*client.messages
                        .create({
                            body: 'You have Appointment in 30 minutes',
                            to: `${number}`,
                            from: '+16292765493'
                        })
                        .then(message => console.log('SMS sent:', message.sid))
                        .catch(error => console.error('Error sending SMS:', error));*/
                    // Update the appointment's smsSent property to true

                    var mailOptions = {
                        from: ' "<dummy8270@gmail.com>',
                        to: appointment.email,
                        subject: 'Dr. Ryan Pangilinan dental clinic',
                        html: `<h2> You have incoming appointment in Dr. Ryan Pangilinan Clinic.</h2>
                                <p>Consultation ID: ${appointment._id}</p>
                                <p>Consultation Name: ${appointment.name}</p>
                                <p>Consultation Email: ${appointment.email}</p>
                                <p>Consultation Date: ${appointment.datetime}</p>
                                <p>Consultation Description: ${appointment.description}</p>
                                <p>Consultation Description: ${appointment.services}</p>
                                <p>Consultation Contact Number: ${appointment.contact_number}</p>
                        `,
                      };
                
                      transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                          console.log(error);
                        } else {
                            console.log('Email notificaition for appointement before 30min has been sent');
                        }
                      });

                    appointment.smsSent = true;
                    appointment.save();
                }
            });

            onlineConsult.forEach(consult => {
                const onlineConsultDate = new Date(consult.datetime);
                console.log(onlineConsultDate)
                const smsSendTime = new Date(onlineConsultDate.getTime() - 30 * 60 * 1000);
                console.log(smsSendTime)
        
                    // Update the appointment's smsSent property to true
                    consult.smsSent = true;
                    consult.save();
                    /*const number = consult.contact_number
                    // Send the SMS
                    client.messages
                        .create({
                            body: 'You have Online Consultation in 30 minutes',
                            to: `${number}`,
                            from: '+16292765493',
                        })
                        .then(message => console.log('SMS sent:', message.sid))
                        .catch(error => console.error('Error sending SMS:', error));*/
                    
                    var mailOptions = {
                        from: ' "<dummy8270@gmail.com>',
                        to: consult.email,
                        subject: 'Dr. Ryan Pangilinan dental clinic',
                        html: `<h2> You have incoming Online consultation in Dr. Ryan Pangilinan Clinic.</h2>
                                <p>Consultation Fee: ${fee}</p> <br>
                                <p>Consultation ID: ${consult._id}</p>
                                <p>Consultation Name: ${consult.name}</p>
                                <p>Consultation Email: ${consult.email}</p>
                                <p>Consultation Date: ${consult.datetime}</p>
                                <p>Consultation Description: ${consult.description}</p>
                                <p>Consultation Contact Number: ${consult.contact_number}</p>
                        `,
                    };
    
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email notificaition for Online Consultation before 30min has been sent');
                        }
                    });
                
              });    

        } catch (error) {
            res.status(500).json({ message: error.message });
            console.log(error);
        }
        console.log("running every minute")
    })

}

module.exports = automaticSMS
