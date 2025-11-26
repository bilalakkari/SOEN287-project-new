import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "bilal.akkari101@gmail.com",
                pass: "zemf laew sdzk bisp"
            }
        });

        await transporter.sendMail({
            from: `"Campus Booking" <bilal.akkari101@gmail.com>`,
            to,
            subject,
            text
        });

        console.log("Email sent to", to);

    } catch (err) {
        console.error("Email error:", err);
    }
};