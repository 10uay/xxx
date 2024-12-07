import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
} from "./emailTemplates.js";
import nodemailer from "nodemailer";

export const sendVerificationEmail = async (email, verificationToken) => {
  const recipient = email;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // upgrade later with START TLS
    auth: {
      user: process.env.EMAIL_OWNER,
      pass: process.env.PASS_OWNER,
    },
    tls: {
      rejectUnauthorized: false, // this to allow self-signed certificates
    },
  });

  const mailOptions = {
    from: {
      name: "Al-Arqm",
      address: process.env.EMAIL_OWNER,
    },
    to: recipient,
    subject: "Verify your email",
    html: VERIFICATION_EMAIL_TEMPLATE.replace(
      "{verificationCode}",
      verificationToken
    ),
    category: "Email Verification",
  };

  const sendMail = async (transporter, mailOptions) => {
    try {
      await transporter.sendMail(mailOptions);
      // console.log("Email has been sent");
    } catch (error) {
      console.error(error);
    }
  };

  sendMail(transporter, mailOptions);

  // verify connection configuration
  transporter.verify(function (error, success) {
    if (error) {
      console.log(error);
    } else {
      // console.log("Server is ready to take our messages");
    }
  });
};

// export const sendWelcomeEmail = async (email, name) => {
//   const recipient = [{ email }];

//   try {
//     const response = await mailtrapClient.send({
//       from: sender,
//       to: recipient,
//       template_uuid: "e65925d1-a9d1-4a40-ae7c-d92b37d593df",
//       template_variables: {
//         company_info_name: "Auth Company",
//         name: name,
//       },
//     });

//     console.log("Welcome email sent successfully", response);
//   } catch (error) {
//     console.error(`Error sending welcome email`, error);

//     throw new Error(`Error sending welcome email: ${error}`);
//   }
// };

export const sendPasswordResetEmail = async (email, resetTOKEN) => {
  const recipient = email;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // upgrade later with START TLS
    auth: {
      user: process.env.EMAIL_OWNER,
      pass: process.env.PASS_OWNER,
    },
    tls: {
      rejectUnauthorized: false, // this to allow self-signed certificates
    },
  });

  const mailOptions = {
    from: {
      name: "Al-Arqm",
      address: process.env.EMAIL_OWNER,
    },
    to: recipient,
    subject: "Reset your password",
    html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetTOKEN}", resetTOKEN),
    category: "Password Reset",
  };

  const sendMail = async (transporter, mailOptions) => {
    try {
      await transporter.sendMail(mailOptions);
      // console.log("Email has been sent");
    } catch (error) {
      console.error(error);
    }
  };

  sendMail(transporter, mailOptions);

  // verify connection configuration
  transporter.verify(function (error, success) {
    if (error) {
      console.error(`Error sending password reset email`, error);
    } else {
      // console.log("Server is ready to take our messages");
    }
  });
};

export const sendResetSuccessEmail = async (email) => {
  const recipient = email;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // upgrade later with START TLS
    auth: {
      user: process.env.EMAIL_OWNER,
      pass: process.env.PASS_OWNER,
    },
    tls: {
      rejectUnauthorized: false, // this to allow self-signed certificates
    },
  });

  const mailOptions = {
    from: {
      name: "Al-Arqm",
      address: process.env.EMAIL_OWNER,
    },
    to: recipient,
    subject: "Password Reset Successful",
    html: PASSWORD_RESET_SUCCESS_TEMPLATE,
    category: "Password Reset",
  };

  const sendMail = async (transporter, mailOptions) => {
    try {
      await transporter.sendMail(mailOptions);
      // console.log("Password reset email sent successfully");
    } catch (error) {
      console.error(error);
    }
  };

  sendMail(transporter, mailOptions);

  // verify connection configuration
  transporter.verify(function (error, success) {
    if (error) {
      console.error(`Error sending password reset success email`, error);
    } else {
      // console.log("Server is ready to take our messages");
      throw new Error(`Error sending password reset success email: ${error}`);
    }
  });
};
