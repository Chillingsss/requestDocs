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

export async function resetPassword(userId, userType, newPassword) {
	const formData = new FormData();
	formData.append("operation", "resetPassword");
	formData.append("json", JSON.stringify({ userId, userType, newPassword }));

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

export async function getCompletedRequests() {
	const formData = new FormData();
	formData.append("operation", "getCompletedRequests");

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
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function updateUserProfile(userId, userType, profileData) {
	const formData = new FormData();
	formData.append("operation", "updateUserProfile");
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
