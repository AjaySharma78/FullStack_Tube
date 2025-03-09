import { PASSWORD_RESET_REQUEST_TEMPLATE, EMAIL_VERIFICATION_TEMPLATE, BACKUP_CODES_TEMPLATE, EMAIL_REVERTED_TEMPLATE, ACCOUNT_DELETION, PASSWORD_CHANGED } from "../helpers/emailTemplate.js";
import config from "../env/config.js";
import nodemailer from "nodemailer";

export const sendMail = async ({ email, subject, text, backupCodes }) => {
  try {
    var transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      port: config.emailPort,
      auth: {
        user: config.emailID,
        pass: config.emailPassword,
      },
    });

    let htmlContent;
    if (subject === "Reset Password") {
      htmlContent = PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", text);
    } else if (subject === "Email Verification") {
      htmlContent = EMAIL_VERIFICATION_TEMPLATE.replace("{resetURL}", text);
    } else if (subject === "Your 2FA Backup Codes") {
      const backupCodesList = [];
      for (let i = 0; i < backupCodes.length; i += 2) {
        backupCodesList.push(
          `<tr>
            <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">${backupCodes[i]}</td>
            <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">${backupCodes[i + 1] || ""}</td>
          </tr>`
        );
      }
      htmlContent = BACKUP_CODES_TEMPLATE.replace(
        "{backupCodes}",
        backupCodesList.join("")
      );
    } else if (subject === "Email Reverted") {
      htmlContent = EMAIL_REVERTED_TEMPLATE.replace("{Text}", text);
    } else if (subject === "Account Deletion") {
      htmlContent = ACCOUNT_DELETION.replace("{Text}", text);
    } else if (subject === "Password Changed") {
      htmlContent = PASSWORD_CHANGED.replace("{Text}", text);
    }

    await transporter.sendMail({
      from: config.emailID,
      to: email,
      subject,
      html: htmlContent,
    });
  } catch (error) {
    console.log(error);
  }
};
