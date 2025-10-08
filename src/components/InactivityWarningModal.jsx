import React, { useState, useEffect } from "react";
import { useSecurity } from "../contexts/SecurityContext";
import toast from "react-hot-toast";

const InactivityWarningModal = () => {
	const { logout, getRemainingTime } = useSecurity();
	const [showWarning, setShowWarning] = useState(false);
	const [timeLeft, setTimeLeft] = useState(0);

	useEffect(() => {
		const checkInactivity = () => {
			const remaining = getRemainingTime();
			const warningTime = 5 * 60 * 1000; // 5 minutes

			if (remaining <= warningTime && remaining > 0) {
				if (!showWarning) {
					// Show toast when warning first appears
					toast.error(
						"⚠️ Session will expire soon! Click 'Stay Logged In' to continue.",
						{
							duration: 3000,
							position: "top-center",
							style: {
								background: "#fef3c7",
								color: "#d97706",
								border: "1px solid #fde68a",
								fontSize: "14px",
								fontWeight: "500",
							},
						}
					);
				}
				setShowWarning(true);
				setTimeLeft(Math.ceil(remaining / 1000));
			} else {
				setShowWarning(false);
			}
		};

		// Check every second when warning is shown
		const interval = setInterval(checkInactivity, 1000);

		return () => clearInterval(interval);
	}, [getRemainingTime, showWarning]);

	const handleStayLoggedIn = () => {
		setShowWarning(false);
		toast.success("✅ Session extended! You're staying logged in.", {
			duration: 3000,
			position: "top-center",
			style: {
				background: "#f0fdf4",
				color: "#16a34a",
				border: "1px solid #bbf7d0",
				fontSize: "14px",
				fontWeight: "500",
			},
		});
		// The security context will automatically reset the timer when user interacts
	};

	const handleLogout = () => {
		logout();
	};

	const formatTime = (seconds) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
	};

	if (!showWarning) return null;

	return (
		<div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
			<div className="p-6 mx-4 w-full max-w-md bg-white rounded-lg shadow-xl dark:bg-gray-800">
				<div className="flex justify-center items-center mx-auto mb-4 w-12 h-12 bg-yellow-100 rounded-full dark:bg-yellow-900">
					<svg
						className="w-6 h-6 text-yellow-600 dark:text-yellow-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
						/>
					</svg>
				</div>

				<h3 className="mb-2 text-lg font-medium text-center text-gray-900 dark:text-white">
					Session Timeout Warning
				</h3>

				<p className="mb-4 text-sm text-center text-gray-600 dark:text-gray-300">
					You will be automatically logged out due to inactivity in:
				</p>

				<div className="mb-6 text-center">
					<span className="text-2xl font-bold text-red-600 dark:text-red-400">
						{formatTime(timeLeft)}
					</span>
				</div>

				<div className="flex space-x-3">
					<button
						onClick={handleLogout}
						className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md transition-colors hover:bg-red-700"
					>
						Logout Now
					</button>
					<button
						onClick={handleStayLoggedIn}
						className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md transition-colors hover:bg-blue-700"
					>
						Stay Logged In
					</button>
				</div>
			</div>
		</div>
	);
};

export default InactivityWarningModal;
