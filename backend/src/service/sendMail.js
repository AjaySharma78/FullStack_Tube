import nodemailer from 'nodemailer';
import {PASSWORD_RESET_REQUEST_TEMPLATE, EMAIL_VERIFICATION_TEMPLATE} from '../helpers/emailTemplate.js';
import config from '../env/config.js';
export const sendMail = async ({email, subject, text}) => {
  try {
var transporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: config.emailPort,
    auth: {
      user: config.emailID,
      pass: config.emailPassword,
    }
  });

    await transporter.sendMail({
      from: config.emailID,
      to: email,
      subject,
      html: subject=== "Reset Password" ? PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", text) : EMAIL_VERIFICATION_TEMPLATE.replace("{resetURL}", text),
    });
  } catch (error) {
    console.log(error);
  }
};
