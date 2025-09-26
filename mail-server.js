// Simple Node mail server for OTP via Nodemailer
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.MAIL_SERVER_PORT || 4001;

const allowedOriginPatterns = [
	/http:\/\/localhost:\d+/,
	/http:\/\/127\.0\.0\.1:\d+/,
	/https:\/\/.*\.vercel\.app$/,
];

// Allow comma-separated explicit origins via env (e.g., https://mogchs.vercel.app,https://mail.yourdomain.com)
const explicitOrigins = (process.env.ALLOWED_ORIGINS || "")
	.split(",")
	.map((o) => o.trim())
	.filter(Boolean);

app.use(
	cors({
		origin: (origin, callback) => {
			if (!origin) return callback(null, true);
			if (explicitOrigins.includes(origin)) return callback(null, true);
			const ok = allowedOriginPatterns.some((re) => re.test(origin));
			return ok
				? callback(null, true)
				: callback(new Error("CORS not allowed"));
		},
		credentials: false,
	})
);
app.use(express.json());

function createTransport() {
	// Configure via env vars; works with Gmail App Passwords or any SMTP
	const host = process.env.SMTP_HOST || "smtp.gmail.com";
	const port = Number(process.env.SMTP_PORT || 465);
	const secure = process.env.SMTP_SECURE
		? process.env.SMTP_SECURE === "true"
		: port === 465;
	const user = process.env.SMTP_USER;
	const pass = process.env.SMTP_PASS;

	if (!user || !pass) {
		throw new Error("SMTP_USER and SMTP_PASS must be set");
	}

	return nodemailer.createTransport({
		host,
		port,
		secure,
		auth: { user, pass },
	});
}

function generateOtp() {
	return String(Math.floor(Math.random() * 1000000)).padStart(6, "0");
}

app.post("/send-password-reset-otp", async (req, res) => {
	try {
		const { email, fullName } = req.body || {};
		if (!email)
			return res
				.status(400)
				.json({ status: "error", message: "Email is required" });

		const otp = generateOtp();
		const transporter = createTransport();

		const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h2 style="color: #333;">MOGCHS Password Reset</h2>
        </div>
        <div style="padding: 20px; background-color: #ffffff;">
          <p>Dear <strong>${fullName || "User"}</strong>,</p>
          <p>You have requested to reset your password. Please use the following OTP to complete the process:</p>
          <div style="background-color: #f8f9fa; padding: 15px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
          </div>
          <p><strong>Important:</strong></p>
          <ul>
            <li>This OTP is valid for 10 minutes only</li>
            <li>Do not share this OTP with anyone</li>
            <li>If you didn't request this reset, please ignore this email</li>
          </ul>
          <p>Best regards,<br/>MOGCHS System Administrator</p>
        </div>
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          This is an automated message. Please do not reply to this email.
        </div>
      </div>
    `;

		await transporter.sendMail({
			from: process.env.MAIL_FROM || "noreply@mogchs.com",
			to: email,
			subject: "Password Reset OTP - MOGCHS",
			html,
		});

		return res.json({
			status: "success",
			message: "OTP sent successfully",
			otp,
		});
	} catch (err) {
		return res.status(500).json({
			status: "error",
			message: err.message || "Failed to send OTP email",
		});
	}
});

app.listen(PORT, () => {
	// eslint-disable-next-line no-console
	console.log(`Mail server running on http://localhost:${PORT}`);
});
