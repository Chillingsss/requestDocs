import React, {
	createContext,
	useContext,
	useEffect,
	useRef,
	useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import toast from "react-hot-toast";

const SecurityContext = createContext();

const COOKIE_KEY = "mogchs_user";
const SECRET_KEY = "mogchs_secret_key";
const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 1 hour in milliseconds
const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before logout

export const useSecurity = () => {
	const context = useContext(SecurityContext);
	if (!context) {
		throw new Error("useSecurity must be used within a SecurityProvider");
	}
	return context;
};

export const SecurityProvider = ({ children }) => {
	const navigate = useNavigate();
	const timeoutRef = useRef(null);
	const warningTimeoutRef = useRef(null);
	const lastActivityRef = useRef(Date.now());
	const isLoggedInRef = useRef(false);

	// Function to check if user is logged in
	const checkAuthStatus = useCallback(() => {
		const encrypted = Cookies.get(COOKIE_KEY);
		if (!encrypted) {
			return false;
		}
		try {
			const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
			const user = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
			return user && user.userLevel;
		} catch (e) {
			return false;
		}
	}, []);

	// Function to logout user
	const logout = useCallback(() => {
		// Clear cookies
		Cookies.remove(COOKIE_KEY);
		Cookies.remove("theme");

		// Clear any other session data
		localStorage.removeItem("theme");
		sessionStorage.clear();

		// Clear timeouts
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
		if (warningTimeoutRef.current) {
			clearTimeout(warningTimeoutRef.current);
			warningTimeoutRef.current = null;
		}

		// Reset refs
		isLoggedInRef.current = false;
		lastActivityRef.current = Date.now();

		// Navigate to login
		navigate("/", { replace: true });
	}, [navigate]);

	// Function to reset the inactivity timer
	const resetInactivityTimer = useCallback(() => {
		if (!isLoggedInRef.current) return;

		// Clear existing timeouts
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
		if (warningTimeoutRef.current) {
			clearTimeout(warningTimeoutRef.current);
		}

		// Update last activity time
		lastActivityRef.current = Date.now();

		// Set warning timeout (5 minutes before logout)
		warningTimeoutRef.current = setTimeout(() => {
			// Show toast warning
			toast.error("⚠️ You will be logged out in 5 minutes due to inactivity!", {
				duration: 300000, // Show for 5 minutes
				position: "top-center",
				style: {
					background: "#fef2f2",
					color: "#dc2626",
					border: "1px solid #fecaca",
					fontSize: "14px",
					fontWeight: "500",
				},
			});
			console.warn("You will be logged out in 5 minutes due to inactivity");
		}, INACTIVITY_TIMEOUT - WARNING_TIME);

		// Set logout timeout
		timeoutRef.current = setTimeout(() => {
			console.log("Logging out due to inactivity");
			toast.error("🔒 Session expired due to inactivity. Please login again.", {
				duration: 5000,
				position: "top-center",
				style: {
					background: "#fef2f2",
					color: "#dc2626",
					border: "1px solid #fecaca",
					fontSize: "14px",
					fontWeight: "500",
				},
			});
			logout();
		}, INACTIVITY_TIMEOUT);
	}, [logout]);

	// Function to track user activity
	const trackActivity = useCallback(() => {
		if (isLoggedInRef.current) {
			resetInactivityTimer();
		}
	}, [resetInactivityTimer]);

	// Function to start security monitoring
	const startSecurityMonitoring = useCallback(() => {
		if (checkAuthStatus()) {
			isLoggedInRef.current = true;
			resetInactivityTimer();
		}
	}, [checkAuthStatus, resetInactivityTimer]);

	// Function to stop security monitoring
	const stopSecurityMonitoring = useCallback(() => {
		isLoggedInRef.current = false;
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
		if (warningTimeoutRef.current) {
			clearTimeout(warningTimeoutRef.current);
			warningTimeoutRef.current = null;
		}
	}, []);

	// Set up activity listeners
	useEffect(() => {
		const events = [
			"mousedown",
			"mousemove",
			"keypress",
			"scroll",
			"touchstart",
			"click",
		];

		// Add event listeners
		events.forEach((event) => {
			document.addEventListener(event, trackActivity, true);
		});

		// Cleanup function
		return () => {
			events.forEach((event) => {
				document.removeEventListener(event, trackActivity, true);
			});
		};
	}, [trackActivity]);

	// Check auth status on mount and when navigating
	useEffect(() => {
		const isLoggedIn = checkAuthStatus();
		if (isLoggedIn) {
			startSecurityMonitoring();
		} else {
			stopSecurityMonitoring();
		}
	}, [checkAuthStatus, startSecurityMonitoring, stopSecurityMonitoring]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			stopSecurityMonitoring();
		};
	}, [stopSecurityMonitoring]);

	// Function to manually logout
	const manualLogout = useCallback(() => {
		stopSecurityMonitoring();
		logout();
	}, [stopSecurityMonitoring, logout]);

	// Function to get remaining time before logout
	const getRemainingTime = useCallback(() => {
		if (!isLoggedInRef.current) return 0;
		const elapsed = Date.now() - lastActivityRef.current;
		return Math.max(0, INACTIVITY_TIMEOUT - elapsed);
	}, []);

	const value = {
		isLoggedIn: isLoggedInRef.current,
		logout: manualLogout,
		trackActivity,
		getRemainingTime,
		startSecurityMonitoring,
		stopSecurityMonitoring,
	};

	return (
		<SecurityContext.Provider value={value}>
			{children}
		</SecurityContext.Provider>
	);
};
