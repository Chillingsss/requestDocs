import nodemailer from "nodemailer";

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
		const {
			email,
			firstName,
			lastName,
			documentName,
			displayPurpose,
			releaseDate,
		} = req.body || {};

		if (!email || !firstName || !lastName || !documentName || !releaseDate) {
			return res.status(400).json({
				status: "error",
				message:
					"Missing required fields: email, firstName, lastName, documentName, releaseDate",
			});
		}

		const transporter = createTransport();

		// Format the release date
		const formattedDate = new Date(releaseDate).toLocaleDateString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		});

		const html = `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<div style="background-color: #5409DA; color: white; padding: 20px; text-align: center;">
					<h1 style="margin: 0;">MOGCHS Registrar Office</h1>
				</div>
				
				<div style="padding: 30px; background-color: #f9f9f9;">
					<h2 style="color: #333; margin-bottom: 20px;">Document Release Schedule</h2>
					
					<p>Dear <strong>${firstName} ${lastName}</strong>,</p>
					
					<p>Your document request has been processed and is ready for release.</p>
					
					<div style="background-color: white; padding: 20px; border-radius: 8px; border-left: 4px solid #5409DA; margin: 20px 0;">
						<h3 style="color: #5409DA; margin-top: 0;">Request Details:</h3>
						<p><strong>Document:</strong> ${documentName}</p>
						<p><strong>Purpose:</strong> ${displayPurpose}</p>
						<p><strong>Release Date:</strong> ${formattedDate}</p>
						<p><strong>Office Hours:</strong> 8:00 AM - 5:00 PM (Monday to Friday)</p>
					</div>
					
					<div style="background-color: #e8f4fd; padding: 15px; border-radius: 5px; border: 1px solid #bee5eb;">
						<h4 style="color: #0c5460; margin-top: 0;">Important Notes:</h4>
						<ul style="color: #0c5460; margin: 10px 0; padding-left: 20px;">
							<li>Please bring a valid ID for verification</li>
							<li>If you cannot claim on the scheduled date, please contact the registrar office</li>
							<li>Documents not claimed within 30 days may be disposed of</li>
						</ul>
					</div>
					
					<p>If you have any questions, please contact the registrar office.</p>
					
					<p>Best regards,<br>
					<strong>MOGCHS Registrar Office</strong></p>
				</div>
				
				<div style="background-color: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
					<p style="margin: 0;">This is an automated message. Please do not reply to this email.</p>
				</div>
			</div>
		`;

		const text = `
			MOGCHS Registrar Office
			
			Document Release Schedule
			
			Dear ${firstName} ${lastName},
			
			Your document request has been processed and is ready for release.
			
			Request Details:
			- Document: ${documentName}
			- Purpose: ${displayPurpose}
			- Release Date: ${formattedDate}
			- Office Hours: 8:00 AM - 5:00 PM (Monday to Friday)
			
			Important Notes:
			- Please bring a valid ID for verification
			- If you cannot claim on the scheduled date, please contact the registrar office
			- Documents not claimed within 30 days may be disposed of
			
			If you have any questions, please contact the registrar office.
			
			Best regards,
			MOGCHS Registrar Office
		`;

		await transporter.sendMail({
			from: `"MOGCHS Registrar Office" <${
				process.env.MAIL_FROM || "noreply@mogchs.com"
			}>`,
			to: email,
			subject: `Document Release Schedule - ${documentName}`,
			html,
			text,
		});

		res.status(200).json({
			status: "success",
			message: "Release schedule email sent successfully",
		});
	} catch (err) {
		console.error("Email sending failed:", err);
		res.status(500).json({
			status: "error",
			message: err.message || "Failed to send release schedule email",
		});
	}
}
