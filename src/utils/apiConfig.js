import CryptoJS from "crypto-js";

// Secret key for encryption - in production, this should be more secure
const SECRET_KEY = "mogchs_api_secret_key";
const SESSION_KEY = "mogchs_encrypted_api_url";
const FALLBACK_API_URL = "http://localhost/request_docs/backend";
const MAIL_API_FALLBACK_URL = "https://request-docs.vercel.app/";

/**
 * Set the encrypted API URL in session storage
 * @param {string} apiUrl - The API URL to encrypt and store
 */
export const setEncryptedApiUrl = (apiUrl) => {
	try {
		const encrypted = CryptoJS.AES.encrypt(apiUrl, SECRET_KEY).toString();
		sessionStorage.setItem(SESSION_KEY, encrypted);
		console.log("API URL encrypted and stored in session storage");
	} catch (error) {
		console.error("Error encrypting API URL:", error);
	}
};

/**
 * Get the decrypted API URL from session storage
 * @returns {string} - The decrypted API URL or fallback URL if not found/invalid
 */
export const getDecryptedApiUrl = () => {
	try {
		// Check if sessionStorage is available
		if (typeof sessionStorage === "undefined") {
			console.warn("Session storage not available, using fallback API URL");
			return FALLBACK_API_URL;
		}

		const encrypted = sessionStorage.getItem(SESSION_KEY);
		if (!encrypted) {
			console.warn(
				"No encrypted API URL found in session storage, initializing..."
			);
			// Auto-initialize if not found
			setEncryptedApiUrl(FALLBACK_API_URL);
			return FALLBACK_API_URL;
		}

		const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
		const decrypted = bytes.toString(CryptoJS.enc.Utf8);

		if (!decrypted) {
			console.error("Failed to decrypt API URL, using fallback");
			// Re-initialize with fallback
			setEncryptedApiUrl(FALLBACK_API_URL);
			return FALLBACK_API_URL;
		}

		return decrypted;
	} catch (error) {
		console.error("Error decrypting API URL, using fallback:", error);
		return FALLBACK_API_URL;
	}
};

// Mail API URL handling (not encrypted; separate small Node server)
const MAIL_SESSION_KEY = "mogchs_mail_api_url";

export const setMailApiUrl = (mailApiUrl) => {
	try {
		if (typeof sessionStorage !== "undefined") {
			sessionStorage.setItem(MAIL_SESSION_KEY, mailApiUrl);
		}
	} catch (error) {
		console.error("Error setting Mail API URL:", error);
	}
};

export const getMailApiUrl = () => {
	try {
		if (typeof sessionStorage === "undefined") return MAIL_API_FALLBACK_URL;
		const url = sessionStorage.getItem(MAIL_SESSION_KEY);
		return url || MAIL_API_FALLBACK_URL;
	} catch (error) {
		return MAIL_API_FALLBACK_URL;
	}
};

/**
 * Remove the encrypted API URL from session storage
 */
export const removeEncryptedApiUrl = () => {
	try {
		if (typeof sessionStorage !== "undefined") {
			sessionStorage.removeItem(SESSION_KEY);
			console.log("Encrypted API URL removed from session storage");
		}
	} catch (error) {
		console.error("Error removing encrypted API URL:", error);
	}
};

/**
 * Initialize the API URL in session storage (call this once when the app starts)
 */
export const initializeApiUrl = () => {
	try {
		// Only initialize if session storage is available and not already set
		if (typeof sessionStorage !== "undefined") {
			const existing = sessionStorage.getItem(SESSION_KEY);
			if (!existing) {
				setEncryptedApiUrl(FALLBACK_API_URL);
				console.log("API URL initialized in session storage");
			} else {
				console.log("API URL already exists in session storage");
			}
		}
	} catch (error) {
		console.error("Error initializing API URL:", error);
	}
};
