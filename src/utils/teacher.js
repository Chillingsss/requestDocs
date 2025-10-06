import axios from "axios";
import { getDecryptedApiUrl } from "./apiConfig";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";

export async function getStudent() {
	const formData = new FormData();
	formData.append("operation", "getStudent");

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/teacher.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getStudentRecords(
	teacherGradeLevelId = null,
	teacherSectionId = null
) {
	const formData = new FormData();
	formData.append("operation", "getStudentRecords");

	// Add teacher's grade level if provided
	if (teacherGradeLevelId) {
		formData.append("teacherGradeLevelId", teacherGradeLevelId);
	}

	// Add teacher's section ID if provided
	if (teacherSectionId) {
		formData.append("teacherSectionId", teacherSectionId);
	}

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/teacher.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getSectionsByGradeLevel(
	teacherGradeLevelId = null,
	teacherSectionId = null
) {
	const formData = new FormData();
	formData.append("operation", "getSectionsByGradeLevel");

	// Add teacher's grade level if provided
	if (teacherGradeLevelId) {
		formData.append("teacherGradeLevelId", teacherGradeLevelId);
	}

	// Add teacher's section ID if provided
	if (teacherSectionId) {
		formData.append("teacherSectionId", teacherSectionId);
	}

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/teacher.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getAvailableSections(gradeLevelId) {
	const formData = new FormData();
	formData.append("operation", "getAvailableSections");
	formData.append("gradeLevelId", gradeLevelId);

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/teacher.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function updateStudentSection(studentId, newSectionId) {
	const formData = new FormData();
	formData.append("operation", "updateStudentSection");
	formData.append("studentId", studentId);
	formData.append("newSectionId", newSectionId);

	const COOKIE_KEY = "mogchs_user";
	const SECRET_KEY = "mogchs_secret_key";
	let userId = "";
	const encrypted = Cookies.get(COOKIE_KEY);
	if (encrypted) {
		try {
			const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
			const user = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
			userId = user?.id;
		} catch {}
	}

	if (userId) {
		formData.append("userId", userId);
	}

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/teacher.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function updateMultipleStudentSections(studentIds, newSectionId) {
	const formData = new FormData();
	formData.append("operation", "updateMultipleStudentSections");
	formData.append("studentIds", JSON.stringify(studentIds));
	formData.append("newSectionId", newSectionId);

	// Get current user ID from session storage
	const userId = sessionStorage.getItem("userId");
	if (userId) {
		formData.append("userId", userId);
	}

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/teacher.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function downloadFile(fileName) {
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await fetch(
			`${apiUrl}/download.php?file=${encodeURIComponent(fileName)}`,
			{
				method: "GET",
			}
		);

		if (response.ok) {
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = fileName;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
		} else {
			throw new Error("File download failed");
		}
	} catch (error) {
		console.error("Download error:", error);
		throw error;
	}
}

export async function getUserProfile(userId) {
	const formData = new FormData();
	formData.append("operation", "getProfile");
	formData.append("json", JSON.stringify({ userId }));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/teacher.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function updateUserProfile(userId, profileData) {
	const formData = new FormData();
	formData.append("operation", "updateProfile");
	formData.append("json", JSON.stringify({ userId, ...profileData }));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/teacher.php`, formData, {
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

export async function _verifyTeacherCurrentPassword(userId, currentPassword) {
	const formData = new FormData();
	formData.append("operation", "verifyCurrentPassword");
	formData.append(
		"json",
		JSON.stringify({ userId, currentPassword, userType: "teacher" })
	);

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/teacher.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function verifyCurrentPassword(userId, userType, currentPassword) {
	return await _verifyTeacherCurrentPassword(userId, currentPassword);
}

export async function changePassword(userId, userType, newPassword) {
	const formData = new FormData();
	formData.append("operation", "resetPassword");
	formData.append(
		"json",
		JSON.stringify({ userId, newPassword, userType: "teacher" })
	);

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/teacher.php`, formData, {
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
		JSON.stringify({ userId, currentPin, userType: "teacher" })
	);

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/teacher.php`, formData, {
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
		JSON.stringify({ userId, newPin, userType: "teacher" })
	);

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/teacher.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}
