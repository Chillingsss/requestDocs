import axios from "axios";
import { getDecryptedApiUrl } from "./apiConfig";

export async function getDocuments() {
	const formData = new FormData();
	formData.append("operation", "GetDocuments");

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/registrar.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
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
		const response = await axios.post(`${apiUrl}/registrar.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getAllRequests() {
	const formData = new FormData();
	formData.append("operation", "getAllRequests");
	// Add cache-busting parameter
	formData.append("timestamp", Date.now());

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/registrar.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getRequestStats() {
	const formData = new FormData();
	formData.append("operation", "getRequestStats");

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/registrar.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function processRequest(requestId, userId) {
	const formData = new FormData();
	formData.append("operation", "processRequest");
	formData.append("json", JSON.stringify({ requestId, userId }));

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/registrar.php`, formData, {
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

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/registrar.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getStudentDocuments(requestId) {
	const formData = new FormData();
	formData.append("operation", "getStudentDocuments");
	formData.append("json", JSON.stringify({ requestId }));

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/registrar.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getStudentInfo(requestId) {
	const formData = new FormData();
	formData.append("operation", "getStudentInfo");
	formData.append("json", JSON.stringify({ requestId }));

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/registrar.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function updateStudentInfo(
	requestId,
	lrn,
	strandId,
	firstname,
	middlename,
	lastname,
	userId
) {
	const formData = new FormData();
	formData.append("operation", "updateStudentInfo");
	formData.append(
		"json",
		JSON.stringify({
			requestId,
			lrn,
			strandId,
			firstname,
			middlename,
			lastname,
			userId,
		})
	);
	const apiUrl = getDecryptedApiUrl();
	try {
		const response = await axios.post(`${apiUrl}/registrar.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getSection() {
	const formData = new FormData();
	formData.append("operation", "getSection");

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/registrar.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getSchoolYear() {
	const formData = new FormData();
	formData.append("operation", "getSchoolYear");

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/registrar.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getDocumentAllStudent() {
	const formData = new FormData();
	formData.append("operation", "getDocumentAllStudent");

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/registrar.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function uploadStudentDocuments(formData) {
	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/registrar.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function uploadSingleStudentDocument(studentId, documentType, gradeLevelId, file) {
	const apiUrl = getDecryptedApiUrl();
	const formData = new FormData();
	formData.append("operation", "uploadSingleStudentDocument");
	formData.append("studentId", studentId);
	formData.append("documentType", documentType);
	formData.append("gradeLevelId", gradeLevelId);
	formData.append("document", file);

	try {
		const response = await axios.post(`${apiUrl}/registrar.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getStrands() {
	const formData = new FormData();
	formData.append("operation", "getStrands");
	const apiUrl = getDecryptedApiUrl();
	try {
		const response = await axios.post(`${apiUrl}/registrar.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getGradeLevels() {
	const formData = new FormData();
	formData.append("operation", "getGradeLevels");
	const apiUrl = getDecryptedApiUrl();
	try {
		const response = await axios.post(`${apiUrl}/registrar.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getSectionsByGradeLevel(gradeLevelId) {
	const formData = new FormData();
	formData.append("operation", "getSectionsByGradeLevel");
	formData.append("json", JSON.stringify({ gradeLevelId }));
	const apiUrl = getDecryptedApiUrl();
	try {
		const response = await axios.post(`${apiUrl}/registrar.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getSf10DocumentId() {
	const formData = new FormData();
	formData.append("operation", "getSf10DocumentId");

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/registrar.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function addIndividualStudent(
	studentData,
	sf10File,
	documentId,
	userId
) {
	const formData = new FormData();

	// Add student data
	formData.append("operation", "addIndividualStudent");
	formData.append("studentData", JSON.stringify(studentData));
	formData.append("documentId", documentId);
	formData.append("userId", userId);

	// Add SF10 file
	if (sf10File) {
		formData.append("sf10File", sf10File);
	}

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/registrar.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getAllStudentDocuments() {
	const formData = new FormData();
	formData.append("operation", "getAllStudentDocuments");

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/registrar.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getAllStudentFiles() {
	const formData = new FormData();
	formData.append("operation", "getAllStudentFiles");

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/registrar.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function processRelease(requestId, userId) {
	const formData = new FormData();
	formData.append("operation", "processRelease");
	formData.append("json", JSON.stringify({ requestId, userId }));

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/registrar.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function scheduleRelease(requestId, releaseDate, userId) {
	const formData = new FormData();
	formData.append("operation", "scheduleRelease");
	formData.append("json", JSON.stringify({ requestId, releaseDate, userId }));

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/registrar.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getReleaseSchedule(requestId) {
	const formData = new FormData();
	formData.append("operation", "getReleaseSchedule");
	formData.append("json", JSON.stringify({ requestId }));

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/registrar.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

// Add to registrar.js
export async function addForgotLrnRequest(firstname, lastname, email, birthDate) {
	const formData = new FormData();
	formData.append("operation", "addForgotLrnRequest");
	formData.append("json", JSON.stringify({ firstname, lastname, email, birthDate }));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/registrar.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getForgotLrnRequests() {
	const formData = new FormData();
	formData.append("operation", "getForgotLrnRequests");

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/registrar.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function processLrnRequest(requestId, userId, studentId, lrn) {
	const formData = new FormData();
	formData.append("operation", "processLrnRequest");
	formData.append(
		"json",
		JSON.stringify({
			requestId,
			userId,
			studentId,
			lrn,
		})
	);

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/registrar.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function rejectLrnRequest(requestId, userId, reason = null) {
	const formData = new FormData();
	formData.append("operation", "rejectLrnRequest");
	formData.append(
		"json",
		JSON.stringify({
			requestId,
			userId,
			reason,
		})
	);

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/registrar.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

// Add requirement comment
export async function addRequirementComment(
	requirementId,
	requestId,
	registrarId,
	comment
) {
	const formData = new FormData();
	formData.append("operation", "addRequirementComment");
	formData.append(
		"json",
		JSON.stringify({
			requirementId,
			requestId,
			registrarId,
			comment,
		})
	);

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/registrar.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

// Get requirement comments for a request
export async function getRequirementComments(requestId) {
	const formData = new FormData();
	formData.append("operation", "getRequirementComments");
	formData.append("json", JSON.stringify({ requestId }));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/registrar.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

// Update comment status
export async function updateCommentStatus(commentId, status) {
	const formData = new FormData();
	formData.append("operation", "updateCommentStatus");
	formData.append(
		"json",
		JSON.stringify({
			commentId,
			status,
		})
	);

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/registrar.php`, formData, {
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
		const response = await axios.post(`${apiUrl}/registrar.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function markAdditionalRequirementsViewed(requestId) {
	const formData = new FormData();
	formData.append("operation", "markAdditionalRequirementsViewed");
	formData.append("json", JSON.stringify({ requestId }));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/registrar.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getRequestOwner(requestId) {
	const formData = new FormData();
	formData.append("operation", "getRequestOwner");
	formData.append("json", JSON.stringify({ requestId }));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/registrar.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function sendLrnEmail({ email, firstName, lastName, lrn }) {
	const hostname =
		typeof window !== "undefined" ? window.location.hostname : "";
	const isLocal = /^(localhost|127\.0\.0\.1)$/i.test(hostname);
	const baseOverride = process.env.REACT_APP_MAIL_API_BASE;
	const endpoint = baseOverride
		? `${baseOverride.replace(/\/$/, "")}/api/send-lrn-email`
		: isLocal
		? "http://localhost:4001/send-lrn-email"
		: "/api/send-lrn-email";

	try {
		const response = await axios.post(endpoint, {
			email,
			firstName,
			lastName,
			lrn,
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getUserProfile(userId) {
	const formData = new FormData();
	formData.append("operation", "getProfile");
	formData.append("json", JSON.stringify({ userId }));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/registrar.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function updateUserProfile(userId, userType, profileData) {
	const formData = new FormData();
	formData.append("operation", "updateProfile");
	formData.append("json", JSON.stringify({ userId, userType, ...profileData }));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/registrar.php`, formData, {
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

export async function _verifyRegistrarCurrentPassword(userId, currentPassword) {
	const formData = new FormData();
	formData.append("operation", "verifyCurrentPassword");
	formData.append(
		"json",
		JSON.stringify({ userId, currentPassword, userType: "registrar" })
	);

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/registrar.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});

		console.log("responsedata", response.data);
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function verifyCurrentPassword(userId, userType, currentPassword) {
	return await _verifyRegistrarCurrentPassword(userId, currentPassword);
}

export async function changePassword(userId, userType, newPassword) {
	const formData = new FormData();
	formData.append("operation", "resetPassword");
	formData.append(
		"json",
		JSON.stringify({ userId, newPassword, userType: "registrar" })
	);

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/registrar.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function verifyCurrentPin(userId, userType, currentPin) {
	const formData = new FormData();
	formData.append("operation", "verifyCurrentPin");
	formData.append(
		"json",
		JSON.stringify({ userId, currentPin, userType: "registrar" })
	);

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/registrar.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function changePin(userId, userType, newPin) {
	const formData = new FormData();
	formData.append("operation", "changePin");
	formData.append(
		"json",
		JSON.stringify({ userId, newPin, userType: "registrar" })
	);

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/registrar.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function updateStudent(studentId, studentData, userId) {
	const formData = new FormData();
	formData.append("operation", "updateStudent");
	formData.append(
		"json",
		JSON.stringify({ studentId, ...studentData, userId })
	);

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/registrar.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}
