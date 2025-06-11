const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config(); // Load environment variables

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Load email credentials from .env
const OWNER_EMAIL = process.env.OWNER_EMAIL;
const OWNER_PASSWORD = process.env.OWNER_PASSWORD;

// ✅ Create reusable transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: OWNER_EMAIL,
    pass: OWNER_PASSWORD,
  },
});

// ✅ POST route to receive and forward inquiries
app.post("/send-inquiry", (req, res) => {
  const { name, email, message } = req.body;

  const mailOptions = {
    from: `"${name}" <${OWNER_EMAIL}>`, // ✅ Display user's name, but use your email for authentication
    to: OWNER_EMAIL, // ✅ Owner receives the inquiry
    subject: `Inquiry from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    replyTo: email, // ✅ When owner clicks reply, it will go to this address
    envelope: {
      from: email,       // ✅ SMTP envelope sender — makes reply actually go to user
      to: OWNER_EMAIL,
    },
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("❌ Email failed:", error);
      return res.status(500).json({ message: "Failed to send inquiry" });
    }
    console.log("✅ Email sent:", info.response);
    res.status(200).json({ message: "Inquiry sent successfully!" });
  });
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
