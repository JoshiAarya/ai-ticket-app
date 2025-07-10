import nodemailer from "nodemailer";

export const sendMail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: `"Inngest TMS" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log("✅ Message sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Mail error:", error.message);
    throw error;
  }
};
