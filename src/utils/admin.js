import axios from "axios";
import { getDecryptedApiUrl } from "./apiConfig";

export async function getUserLevel() {
	const formData = new FormData();
	formData.append("operation", "getUserLevel");

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function addUser(userData) {
	const formData = new FormData();
	formData.append("operation", "addUser");
	formData.append("json", JSON.stringify(userData));

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getUsers() {
	const formData = new FormData();
	formData.append("operation", "getUsers");

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function verifyPin(userId, pin) {
	const formData = new FormData();
	formData.append("operation", "verifyPin");
	formData.append("json", JSON.stringify({ userId, pin }));

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function checkEmailExists(email) {
	const formData = new FormData();
	formData.append("operation", "checkEmailExists");
	formData.append("json", JSON.stringify({ email }));

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function sendPasswordResetOTP(userId, userType) {
	const formData = new FormData();
	formData.append("operation", "sendPasswordResetOTP");
	formData.append("json", JSON.stringify({ userId, userType }));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
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

export async function activateUser(userId, userType) {
	const formData = new FormData();
	formData.append("operation", "activateUser");
	formData.append("json", JSON.stringify({ userId, userType }));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData);
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function deactivateUser(userId, userType) {
	const formData = new FormData();
	formData.append("operation", "deactivateUser");
	formData.append("json", JSON.stringify({ userId, userType }));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData);
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function verifyPasswordResetOTP(userId, userType, otp) {
	const formData = new FormData();
	formData.append("operation", "verifyPasswordResetOTP");
	formData.append("json", JSON.stringify({ userId, userType, otp }));

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function resetPassword(
	userId,
	userType,
	newPassword,
	newPinCode = ""
) {
	const formData = new FormData();
	formData.append("operation", "resetPassword");
	formData.append(
		"json",
		JSON.stringify({ userId, userType, newPassword, newPinCode })
	);

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function resetPin(userId, userType) {
	const formData = new FormData();
	formData.append("operation", "resetPin");
	formData.append("json", JSON.stringify({ userId, userType }));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function verifyCurrentPassword(userId, userType, currentPassword) {
	const formData = new FormData();
	formData.append("operation", "verifyCurrentPassword");
	formData.append(
		"json",
		JSON.stringify({ userId, userType, currentPassword })
	);

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function changePassword(userId, userType, newPassword) {
	return await resetPassword(userId, userType, newPassword);
}

export async function verifyCurrentPin(userId, userType, currentPin) {
	const formData = new FormData();
	formData.append("operation", "verifyCurrentPin");
	formData.append("json", JSON.stringify({ userId, userType, currentPin }));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
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
	formData.append("json", JSON.stringify({ userId, userType, newPin }));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getGradeLevel() {
	const formData = new FormData();
	formData.append("operation", "getGradelevel");

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		console.log("response", response.data);
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getRequestStats() {
	const formData = new FormData();
	formData.append("operation", "getRequestStats");

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getCompletedRequests(statusFilter = null) {
	const formData = new FormData();
	formData.append("operation", "getCompletedRequests");

	if (statusFilter) {
		formData.append("json", JSON.stringify({ statusFilter }));
	}

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getRequestStatuses() {
	const formData = new FormData();
	formData.append("operation", "getRequestStatuses");

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getAllRequestsWithDetails() {
	const formData = new FormData();
	formData.append("operation", "getAllRequestsWithDetails");

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getRecentActivity() {
	const formData = new FormData();
	formData.append("operation", "getRecentActivity");

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getTotalUsers() {
	const formData = new FormData();
	formData.append("operation", "getTotalUsers");

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getRequestAnalytics(
	dateFrom = null,
	dateTo = null,
	granularity = "day",
	statusFilter = null
) {
	const formData = new FormData();
	formData.append("operation", "getRequestAnalytics");
	const payload = {};
	if (dateFrom) payload.dateFrom = dateFrom;
	if (dateTo) payload.dateTo = dateTo;
	if (granularity) payload.granularity = granularity;
	if (statusFilter) payload.statusFilter = statusFilter;
	formData.append("json", JSON.stringify(payload));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function exportRequestAnalytics(dateFrom = null, dateTo = null) {
	const formData = new FormData();
	formData.append("operation", "exportRequestAnalytics");
	const payload = {};
	if (dateFrom) payload.dateFrom = dateFrom;
	if (dateTo) payload.dateTo = dateTo;
	formData.append("json", JSON.stringify(payload));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
			responseType: "blob", // Important for file downloads
		});

		// Create a link element to trigger the download
		const url = window.URL.createObjectURL(new Blob([response.data]));
		const link = document.createElement("a");
		link.href = url;
		link.setAttribute(
			"download",
			`request_analytics_${new Date().toISOString().split("T")[0]}.csv`
		);
		document.body.appendChild(link);
		link.click();
		link.remove();
		window.URL.revokeObjectURL(url);

		return true;
	} catch (error) {
		console.error("Failed to export request analytics:", error);
		throw error;
	}
}

export async function addStudent(studentData) {
	const formData = new FormData();
	formData.append("operation", "addStudent");
	formData.append("json", JSON.stringify(studentData));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		console.log("response", response.data);
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getStudentsWithFilters(
	sectionId = null,
	schoolYearId = null
) {
	const formData = new FormData();
	formData.append("operation", "getStudentsWithFilters");

	const filters = {};
	if (sectionId) filters.sectionId = sectionId;
	if (schoolYearId) filters.schoolYearId = schoolYearId;

	formData.append("json", JSON.stringify(filters));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getSection(gradeLevelId = null) {
	const formData = new FormData();
	formData.append("operation", "getSection");

	if (gradeLevelId) {
		formData.append("gradeLevelId", gradeLevelId);
	}

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getAllSections(gradeLevelId = null) {
	const formData = new FormData();
	formData.append("operation", "getAllSections");

	if (gradeLevelId) {
		formData.append("gradeLevelId", gradeLevelId);
	}

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function checkUserExists(userId) {
	const formData = new FormData();
	formData.append("operation", "checkUserExists");
	formData.append("json", JSON.stringify({ userId }));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getUserProfile(userId, userType) {
	const formData = new FormData();
	formData.append("operation", "getUserProfile");
	formData.append("json", JSON.stringify({ userId, userType }));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		console.log("response", response.data);
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
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

// Resources management functions
export async function getDocuments() {
	const formData = new FormData();
	formData.append("operation", "getDocuments");

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getRequirementTypes() {
	const formData = new FormData();
	formData.append("operation", "getRequirementTypes");

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function addDocument(submitData) {
	const formData = new FormData();
	formData.append("operation", "addDocument");
	formData.append("json", JSON.stringify(submitData));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function addRequirementType(submitData) {
	const formData = new FormData();
	formData.append("operation", "addRequirementType");
	formData.append("json", JSON.stringify(submitData));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function updateDocument(documentId, documentData) {
	const formData = new FormData();
	formData.append("operation", "updateDocument");
	formData.append("json", JSON.stringify({ id: documentId, ...documentData }));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function updateRequirementType(
	requirementTypeId,
	requirementTypeData
) {
	const formData = new FormData();
	formData.append("operation", "updateRequirementType");
	formData.append(
		"json",
		JSON.stringify({ id: requirementTypeId, ...requirementTypeData })
	);

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function deleteDocument(documentId) {
	const formData = new FormData();
	formData.append("operation", "deleteDocument");
	formData.append("json", JSON.stringify({ id: documentId }));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function deleteRequirementType(requirementTypeId) {
	const formData = new FormData();
	formData.append("operation", "deleteRequirementType");
	formData.append("json", JSON.stringify({ id: requirementTypeId }));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

// Document Requirements management functions
export async function getDocumentRequirements() {
	const formData = new FormData();
	formData.append("operation", "getDocumentRequirements");

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function addDocumentRequirement(
	documentId,
	requirementTypeId,
	userId
) {
	const formData = new FormData();
	formData.append("operation", "addDocumentRequirement");
	formData.append(
		"json",
		JSON.stringify({
			documentId,
			requirementTId: requirementTypeId,
			userId,
		})
	);

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function deleteDocumentRequirement(documentRequirementId) {
	const formData = new FormData();
	formData.append("operation", "deleteDocumentRequirement");
	formData.append("json", JSON.stringify({ id: documentRequirementId }));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function updateDocumentRequirements(
	documentId,
	requirementTypeIds,
	userId
) {
	const formData = new FormData();
	formData.append("operation", "updateDocumentRequirements");
	formData.append(
		"json",
		JSON.stringify({
			documentId,
			requirementTypeIds,
			userId,
		})
	);

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

// Purpose management functions
export async function getPurposes() {
	const formData = new FormData();
	formData.append("operation", "getPurposes");

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function addPurpose(purposeData) {
	const formData = new FormData();
	formData.append("operation", "addPurpose");
	formData.append("json", JSON.stringify(purposeData));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function updatePurpose(purposeId, purposeData) {
	const formData = new FormData();
	formData.append("operation", "updatePurpose");
	formData.append("json", JSON.stringify({ id: purposeId, ...purposeData }));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function deletePurpose(purposeId) {
	const formData = new FormData();
	formData.append("operation", "deletePurpose");
	formData.append("json", JSON.stringify({ id: purposeId }));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

// Grade Level functions
export async function getGradeLevels() {
	const formData = new FormData();
	formData.append("operation", "getGradeLevels");

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function addGradeLevel(gradeLevelData) {
	const formData = new FormData();
	formData.append("operation", "addGradeLevel");
	formData.append("json", JSON.stringify(gradeLevelData));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function updateGradeLevel(gradeLevelId, gradeLevelData) {
	const formData = new FormData();
	formData.append("operation", "updateGradeLevel");
	formData.append(
		"json",
		JSON.stringify({ id: gradeLevelId, ...gradeLevelData })
	);

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function deleteGradeLevel(gradeLevelId) {
	const formData = new FormData();
	formData.append("operation", "deleteGradeLevel");
	formData.append("json", JSON.stringify({ id: gradeLevelId }));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

// Academic Type functions
export async function getAcademicTypes() {
	const formData = new FormData();
	formData.append("operation", "getAcademicTypes");

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function addAcademicType(academicTypeData) {
	const formData = new FormData();
	formData.append("operation", "addAcademicType");
	formData.append("json", JSON.stringify(academicTypeData));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function updateAcademicType(academicTypeId, academicTypeData) {
	const formData = new FormData();
	formData.append("operation", "updateAcademicType");
	formData.append(
		"json",
		JSON.stringify({ id: academicTypeId, ...academicTypeData })
	);

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function deleteAcademicType(academicTypeId) {
	const formData = new FormData();
	formData.append("operation", "deleteAcademicType");
	formData.append("json", JSON.stringify({ id: academicTypeId }));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

// Section functions
export async function getSections() {
	const formData = new FormData();
	formData.append("operation", "getSections");

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function addSection(sectionData) {
	const formData = new FormData();
	formData.append("operation", "addSection");
	formData.append("json", JSON.stringify(sectionData));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function updateSection(sectionId, sectionData) {
	const formData = new FormData();
	formData.append("operation", "updateSection");
	formData.append("json", JSON.stringify({ id: sectionId, ...sectionData }));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function deleteSection(sectionId) {
	const formData = new FormData();
	formData.append("operation", "deleteSection");
	formData.append("json", JSON.stringify({ id: sectionId }));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

// Track management functions
export async function getTracks() {
	const formData = new FormData();
	formData.append("operation", "getTracks");

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function addTrack(trackData) {
	const formData = new FormData();
	formData.append("operation", "addTrack");
	formData.append("json", JSON.stringify(trackData));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function updateTrack(trackId, trackData) {
	const formData = new FormData();
	formData.append("operation", "updateTrack");
	formData.append("json", JSON.stringify({ id: trackId, ...trackData }));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function deleteTrack(trackId) {
	const formData = new FormData();
	formData.append("operation", "deleteTrack");
	formData.append("json", JSON.stringify({ id: trackId }));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

// Strand management functions
export async function getStrands() {
	const formData = new FormData();
	formData.append("operation", "getStrands");

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function addStrand(strandData) {
	const formData = new FormData();
	formData.append("operation", "addStrand");
	formData.append("json", JSON.stringify(strandData));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function updateStrand(strandId, strandData) {
	const formData = new FormData();
	formData.append("operation", "updateStrand");
	formData.append("json", JSON.stringify({ id: strandId, ...strandData }));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function deleteStrand(strandId) {
	const formData = new FormData();
	formData.append("operation", "deleteStrand");
	formData.append("json", JSON.stringify({ id: strandId }));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

// Login Logs management functions
export async function getLoginLogs(filters = {}) {
	const formData = new FormData();
	formData.append("operation", "getLoginLogs");
	formData.append("json", JSON.stringify(filters));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/admin.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}
