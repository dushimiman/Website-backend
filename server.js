const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer'); // Import nodemailer
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Define a schema for storing form submissions
const submissionSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    comment: String,
});

const Submission = mongoose.model('Submission', submissionSchema);

// Route to handle form submission
app.post('/api/submit', async (req, res) => {
    const { name, email, phone, comment } = req.body;

    try {
        const newSubmission = new Submission({ name, email, phone, comment });
        await newSubmission.save();

        // Send email notification
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Use your email service (e.g., Gmail, Outlook)
            auth: {
                user: process.env.EMAIL, // Your email address
                pass: process.env.EMAIL_PASSWORD // Your email password or app password
            }
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: process.env.RECEIVER_EMAIL, // Receiver's email address
            subject: 'New Customer Submission',
            text: `The Customer called: ${name}, Email: ${email}, Phone: ${phone}, Comment: ${comment}. You can contact them and ask what they want.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({ message: 'Information stored but failed to send email.' });
            }
            console.log('Email sent: ' + info.response);
        });

        res.status(201).json({ message: 'Information stored successfully and email sent!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error storing information.' });
    }
});
app.post('/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;
  
    // Basic validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    // Set up Nodemailer to send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'kezad812@gmail.com',
        pass: 'nxqf wrgw azqx icrk'
      }
    });
  
    const mailOptions = {
      from: email,
      to: 'satorwandaltd@gmail.com',
      subject: `New message from: ${name}`,
      text: `Subject: ${subject}\n\nMessage:\n${message}\n\nFrom:\n${name}\n${email}`
    };
  
    try {
      // Send the email
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'Your message has been sent successfully!' });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ error: 'Failed to send message, please try again later.' });
    }
  });
  

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
