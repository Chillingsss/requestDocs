import axios from "axios";
import { getDecryptedApiUrl } from "./apiConfig";

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

export async function getStudentRecords() {
	const formData = new FormData();
	formData.append("operation", "getStudentRecords");

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

export async function getSectionsByGradeLevel() {
	const formData = new FormData();
	formData.append("operation", "getSectionsByGradeLevel");

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
