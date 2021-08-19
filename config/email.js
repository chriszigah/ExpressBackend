const { SMTPClient } = require("emailjs");
const { EMAIL_USER, EMAIL_PW, SMTP_HOST } = process.env;

const sendEmail = (message) => {
  const client = new SMTPClient({
    user: EMAIL_USER,
    password: EMAIL_PW,
    host: SMTP_HOST,
    ssl: true,
    Port: 465
  });

  // send the message and get a callback with an error or details of the message that was sent
  client.send(message, function (err, message) {
    console.log(err || message);
  });
};

module.exports = sendEmail;
