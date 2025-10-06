import axios from "axios";
import { getDecryptedApiUrl } from "./apiConfig";

export async function getDocuments() {
	const formData = new FormData();
	formData.append("operation", "GetDocuments");

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/student.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getRequirementsType() {
	const formData = new FormData();
	formData.append("operation", "getRequirementsType");

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/student.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getRequirementComments(requestId) {
	const formData = new FormData();
	formData.append("operation", "getRequirementComments");
	formData.append("json", JSON.stringify({ requestId }));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/student.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getDocumentRequirements(documentId) {
	const formData = new FormData();
	formData.append("operation", "getDocumentRequirements");
	formData.append("json", JSON.stringify({ documentId }));

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/student.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getDocumentPurposes(documentId) {
	const formData = new FormData();
	formData.append("operation", "getDocumentPurposes");
	formData.append("json", JSON.stringify({ documentId }));

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/student.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function addRequestDocument({
	userId,
	documentId,
	purpose,
	purposeIds,
	attachments = [],
	typeIds = [],
}) {
	const formData = new FormData();
	formData.append("operation", "addRequestDocument");
	formData.append(
		"json",
		JSON.stringify({ userId, documentId, purpose, purposeIds, typeIds })
	);

	// Add multiple file attachments if provided
	if (attachments && attachments.length > 0) {
		attachments.forEach((file, index) => {
			formData.append(`attachments[${index}]`, file);
		});
	}

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/student.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		console.log("response", response.data);
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getUserRequests(userId) {
	const formData = new FormData();
	formData.append("operation", "getUserRequests");
	formData.append("json", JSON.stringify({ userId }));

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/student.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function addCombinedRequestDocument({
	userId,
	primaryDocumentId,
	secondaryDocumentId,
	purpose,
	purposeIds,
	attachments = [],
	typeIds = [],
}) {
	const formData = new FormData();
	formData.append("operation", "addCombinedRequestDocument");
	formData.append(
		"json",
		JSON.stringify({
			userId,
			primaryDocumentId,
			secondaryDocumentId,
			purpose,
			purposeIds,
			typeIds,
		})
	);

	// Add multiple file attachments if provided
	if (attachments && attachments.length > 0) {
		attachments.forEach((file, index) => {
			formData.append(`attachments[${index}]`, file);
		});
	}

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/student.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		console.log("response", response.data);
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getRequestTracking(requestId) {
	const formData = new FormData();
	formData.append("operation", "getRequestTracking");
	formData.append("json", JSON.stringify({ requestId }));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/student.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getRequestAttachments(requestId) {
	const formData = new FormData();
	formData.append("operation", "getRequestAttachments");
	formData.append("json", JSON.stringify({ requestId }));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/student.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function _getStudentProfile(userId) {
	const formData = new FormData();
	formData.append("operation", "getProfile");
	formData.append("json", JSON.stringify({ userId }));

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/student.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function _updateStudentProfile(userId, profileData) {
	const formData = new FormData();
	formData.append("operation", "updateProfile");
	formData.append("json", JSON.stringify({ userId, ...profileData }));

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/student.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getUserProfile(userId, userType) {
	// For student, we use the _getStudentProfile function
	return await _getStudentProfile(userId);
}

export async function updateUserProfile(userId, userType, profileData) {
	// For student, we use the _updateStudentProfile function
	return await _updateStudentProfile(userId, profileData);
}

export async function cancelRequest(requestId) {
	const formData = new FormData();
	formData.append("operation", "cancelRequest");
	formData.append("json", JSON.stringify({ requestId }));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/student.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getExpectedDays() {
	const formData = new FormData();
	formData.append("operation", "getExpectedDays");

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/student.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

// New Nodemailer-based OTP sender hitting Node mail server directly
export async function sendPasswordResetOtpMail(email, fullName) {
	const hostname =
		typeof window !== "undefined" ? window.location.hostname : "";
	const isLocal = /^(localhost|127\.0\.0\.1)$/i.test(hostname);
	const baseOverride = process.env.REACT_APP_MAIL_API_BASE;
	const endpoint = baseOverride
		? `${baseOverride.replace(/\/$/, "")}/api/send-password-reset-otp`
		: isLocal
		? "http://localhost:4001/send-password-reset-otp"
		: "/api/send-password-reset-otp";

	const { data } = await axios.post(endpoint, { email, fullName });
	return data;
}

// Convenience helper: look up email/name from PHP backend, then send via Nodemailer
export async function sendPasswordResetOtpForUser(userId, userType) {
	// Fetch profile from PHP backend
	const profile = await getUserProfile(userId, userType);
	const email = profile?.email;
	const fullName = `${profile?.firstname || ""} ${
		profile?.lastname || ""
	}`.trim();
	if (!email) {
		throw new Error("User has no email on file");
	}
	// Send using the environment-aware mail endpoint
	return await sendPasswordResetOtpMail(email, fullName);
}

export async function _verifyStudentCurrentPassword(userId, currentPassword) {
	const formData = new FormData();
	formData.append("operation", "verifyCurrentPassword");
	formData.append(
		"json",
		JSON.stringify({ userId, currentPassword, userType: "student" })
	);

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/student.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function verifyCurrentPassword(userId, userType, currentPassword) {
	return await _verifyStudentCurrentPassword(userId, currentPassword);
}

export async function _changeStudentPassword(userId, newPassword) {
	const formData = new FormData();
	formData.append("operation", "resetPassword"); // Re-using resetPassword operation
	formData.append(
		"json",
		JSON.stringify({ userId, newPassword, userType: "student" })
	);

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/student.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function changePassword(userId, userType, newPassword) {
	return await _changeStudentPassword(userId, newPassword);
}
