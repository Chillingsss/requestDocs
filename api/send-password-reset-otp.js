import nodemailer from "nodemailer";

function generateOtp() {
	return String(Math.floor(Math.random() * 1000000)).padStart(6, "0");
}

function createTransport() {
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

export default async function handler(req, res) {
	// Basic CORS to allow local dev to call the deployed API
	const origin = req.headers.origin || "*";
	res.setHeader("Access-Control-Allow-Origin", origin);
	res.setHeader("Vary", "Origin");
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Content-Type, Authorization, X-Requested-With"
	);
	res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

	if (req.method === "OPTIONS") {
		return res.status(204).end();
	}

	if (req.method !== "POST") {
		return res
			.status(405)
			.json({ status: "error", message: "Method Not Allowed" });
	}

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
          <p>Please use the following OTP to complete your password reset:</p>
          <div style="background-color: #f8f9fa; padding: 15px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
          </div>
          <ul>
            <li>OTP is valid for 10 minutes</li>
            <li>Do not share this OTP</li>
          </ul>
          <p>Best regards,<br/>MOGCHS System Administrator</p>
        </div>
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          This is an automated message. Please do not reply.
        </div>
      </div>
    `;

		await transporter.sendMail({
			from: `"MOGCHS Registrar Office" <${
				process.env.MAIL_FROM || "noreply@mogchs.com"
			}>`,
			to: email,
			subject: "Password Reset OTP - MOGCHS",
			html,
		});

		res
			.status(200)
			.json({ status: "success", message: "OTP sent successfully", otp });
	} catch (err) {
		res.status(500).json({
			status: "error",
			message: err.message || "Failed to send OTP email",
		});
	}
}
