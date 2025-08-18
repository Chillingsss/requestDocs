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

export async function processRequest(requestId) {
	const formData = new FormData();
	formData.append("operation", "processRequest");
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
	lastname
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

export async function processRelease(requestId) {
	const formData = new FormData();
	formData.append("operation", "processRelease");
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
