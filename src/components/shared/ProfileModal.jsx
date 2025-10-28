import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
	X,
	User,
	Mail,
	Calendar,
	MapPin,
	Users,
	Shield,
	Edit,
	Save,
	XCircle,
	LockKeyhole,
	Eye,
	EyeOff,
	ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import {
	getUserProfile as getStudentProfile,
	updateUserProfile as updateStudentProfile,
	sendPasswordResetOtpForUser as sendStudentPasswordResetOtpForUser,
	verifyCurrentPassword as verifyStudentCurrentPassword,
	changePassword as changeStudentPassword,
} from "../../utils/student";
import {
	getUserProfile as getAdminProfile,
	updateUserProfile as updateAdminProfile,
	sendPasswordResetOtpForUser as sendAdminPasswordResetOtpForUser,
	verifyCurrentPassword as verifyAdminCurrentPassword,
	changePassword as changeAdminPassword,
	verifyCurrentPin as verifyAdminCurrentPin,
	changePin as changeAdminPin,
} from "../../utils/admin";
import {
	getUserProfile as getRegistrarProfile,
	updateUserProfile as updateRegistrarProfile,
	sendPasswordResetOtpForUser as sendRegistrarPasswordResetOtpForUser,
	verifyCurrentPassword as verifyRegistrarCurrentPassword,
	changePassword as changeRegistrarPassword,
	verifyCurrentPin as verifyRegistrarCurrentPin,
	changePin as changeRegistrarPin,
} from "../../utils/registrar";
import {
	getUserProfile as getTeacherProfile,
	updateUserProfile as updateTeacherProfile,
	sendPasswordResetOtpForUser as sendTeacherPasswordResetOtpForUser,
	verifyCurrentPassword as verifyTeacherCurrentPassword,
	changePassword as changeTeacherPassword,
	verifyCurrentPin as verifyTeacherCurrentPin,
	changePin as changeTeacherPin,
} from "../../utils/teacher";

const profileApiMap = {
	student: {
		get: getStudentProfile,
		update: updateStudentProfile,
		sendOtp: sendStudentPasswordResetOtpForUser,
		verifyCurrentPassword: verifyStudentCurrentPassword,
		changePassword: changeStudentPassword,
		title: "Student Profile",
		fields: [
			{ key: "firstname", label: "First Name", editable: true, icon: User },
			{ key: "middlename", label: "Middle Name", editable: true, icon: User },
			{ key: "lastname", label: "Last Name", editable: true, icon: User },
			{ key: "lrn", label: "LRN", editable: false, icon: Shield },
			{
				key: "email",
				label: "Email",
				editable: true,
				icon: Mail,
				type: "email",
			},
			{
				key: "birthDate",
				label: "Birth Date",
				editable: true,
				icon: Calendar,
				type: "date",
			},
			{ key: "birthPlace", label: "Birth Place", editable: true, icon: MapPin },
			{ key: "age", label: "Age", editable: true, icon: Users, type: "number" },
			{ key: "contactNo", label: "Contact Number", editable: true, icon: Mail },
			{ key: "sectionName", label: "Section", editable: false, icon: Shield },
			{ key: "strand", label: "Strand", editable: false, icon: Shield },
			{ key: "track", label: "Track", editable: false, icon: Shield },
			{
				key: "schoolYear",
				label: "School Year",
				editable: false,
				icon: Shield,
			},
			{
				key: "gradeLevel",
				label: "Grade Level",
				editable: false,
				icon: Shield,
			},
			{ key: "religion", label: "Religion", editable: true, icon: Users },
			{
				key: "completeAddress",
				label: "Complete Address",
				editable: true,
				icon: MapPin,
				component: Textarea,
			},
			{
				key: "fatherName",
				label: "Father's Name",
				editable: true,
				icon: Users,
			},
			{
				key: "motherName",
				label: "Mother's Name",
				editable: true,
				icon: Users,
			},
			{
				key: "guardianName",
				label: "Guardian's Name",
				editable: true,
				icon: Users,
			},
			{
				key: "guardianRelationship",
				label: "Guardian's Relationship",
				editable: true,
				icon: Users,
			},
		],
	},
	admin: {
		get: getAdminProfile,
		update: updateAdminProfile,
		sendOtp: sendAdminPasswordResetOtpForUser,
		verifyCurrentPassword: verifyAdminCurrentPassword,
		changePassword: changeAdminPassword,
		verifyCurrentPin: verifyAdminCurrentPin,
		changePin: changeAdminPin,
		title: "Admin Profile",
		fields: [
			{ key: "firstname", label: "First Name", editable: true, icon: User },
			{ key: "middlename", label: "Middle Name", editable: true, icon: User },
			{ key: "lastname", label: "Last Name", editable: true, icon: User },
			{
				key: "email",
				label: "Email",
				editable: true,
				icon: Mail,
				type: "email",
			},
			{ key: "userLevel", label: "User Level", editable: false, icon: Shield },
		],
	},
	registrar: {
		get: getRegistrarProfile,
		update: updateRegistrarProfile,
		sendOtp: sendRegistrarPasswordResetOtpForUser,
		verifyCurrentPassword: verifyRegistrarCurrentPassword,
		changePassword: changeRegistrarPassword,
		verifyCurrentPin: verifyRegistrarCurrentPin,
		changePin: changeRegistrarPin,
		title: "Registrar Profile",
		fields: [
			{ key: "firstname", label: "First Name", editable: true, icon: User },
			{ key: "middlename", label: "Middle Name", editable: true, icon: User },
			{ key: "lastname", label: "Last Name", editable: true, icon: User },
			{
				key: "email",
				label: "Email",
				editable: true,
				icon: Mail,
				type: "email",
			},
			{ key: "userLevel", label: "User Level", editable: false, icon: Shield },
		],
	},
	teacher: {
		get: getTeacherProfile,
		update: updateTeacherProfile,
		sendOtp: sendTeacherPasswordResetOtpForUser,
		verifyCurrentPassword: verifyTeacherCurrentPassword,
		changePassword: changeTeacherPassword,
		verifyCurrentPin: verifyTeacherCurrentPin,
		changePin: changeTeacherPin,
		title: "Teacher Profile",
		fields: [
			{ key: "firstname", label: "First Name", editable: true, icon: User },
			{ key: "middlename", label: "Middle Name", editable: true, icon: User },
			{ key: "lastname", label: "Last Name", editable: true, icon: User },
			{
				key: "email",
				label: "Email",
				editable: true,
				icon: Mail,
				type: "email",
			},
			{ key: "userLevel", label: "User Level", editable: false, icon: Shield },
		],
	},
};

export default function ProfileModal({ isOpen, onClose, userId, userType }) {
	const [profile, setProfile] = useState(null);
	const [isEditing, setIsEditing] = useState(false);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [formData, setFormData] = useState({});

	// States for Change Password functionality
	const [isChangePasswordActive, setIsChangePasswordActive] = useState(false);
	const [passwordStep, setPasswordStep] = useState(1); // 1: Current Password, 2: OTP, 3: New Password
	const [currentPassword, setCurrentPassword] = useState("");
	const [otp, setOtp] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmNewPassword, setConfirmNewPassword] = useState("");
	const [storedOTP, setStoredOTP] = useState(""); // Temporarily store OTP for client-side verification
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

	// States for Change PIN functionality
	const [isChangePinActive, setIsChangePinActive] = useState(false);
	const [pinStep, setPinStep] = useState(1); // 1: Current Password + PIN, 2: OTP, 3: New PIN
	const [currentPasswordForPin, setCurrentPasswordForPin] = useState("");
	const [currentPin, setCurrentPin] = useState("");
	const [pinOtp, setPinOtp] = useState("");
	const [newPin, setNewPin] = useState("");
	const [confirmNewPin, setConfirmNewPin] = useState("");
	const [storedPinOTP, setStoredPinOTP] = useState("");
	const [showCurrentPasswordForPin, setShowCurrentPasswordForPin] =
		useState(false);
	const [showCurrentPin, setShowCurrentPin] = useState(false);
	const [showNewPin, setShowNewPin] = useState(false);
	const [showConfirmNewPin, setShowConfirmNewPin] = useState(false);

	// Fetch profile data when modal opens
	useEffect(() => {
		if (isOpen && userId) {
			fetchProfile();
		}
	}, [isOpen, userId]);

	const fetchProfile = async () => {
		setLoading(true);
		const api = profileApiMap[userType];
		if (!api) {
			toast.error("Invalid user type for profile");
			setLoading(false);
			return;
		}

		try {
			const data = await api.get(userId, userType);
			if (data.error) {
				toast.error(data.error);
			} else {
				setProfile(data);
				const initialFormData = {};
				api.fields.forEach((field) => {
					initialFormData[field.key] = data[field.key] || "";
				});
				setFormData(initialFormData);
			} // Fetch profile after update
		} catch (error) {
			console.error("Failed to fetch profile:", error);
			toast.error("Failed to load profile");
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleEdit = () => {
		setIsEditing(true);
	};

	const handleCancel = () => {
		setIsEditing(false);
		// Reset form data to original profile data
		if (profile) {
			const api = profileApiMap[userType];
			const initialFormData = {};
			api.fields.forEach((field) => {
				initialFormData[field.key] = profile[field.key] || "";
			});
			setFormData(initialFormData);
		}
	};

	const handleSave = async () => {
		setSaving(true);
		const api = profileApiMap[userType];
		if (!api) {
			toast.error("Invalid user type for profile");
			setSaving(false);
			return;
		}

		try {
			const result = await api.update(userId, userType, formData);
			if (result.success) {
				toast.success("Profile updated successfully!");
				setIsEditing(false);
				// Refresh profile data
				await fetchProfile();
			} else {
				toast.error(result.error || "Failed to update profile");
			}
		} catch (error) {
			console.error("Failed to update profile:", error);
			toast.error("Failed to update profile");
		} finally {
			setSaving(false);
		}
	};

	const handleChangePasswordClick = () => {
		setIsChangePasswordActive(true);
		setPasswordStep(1);
		// Reset all password-related states when initiating change password
		setCurrentPassword("");
		setOtp("");
		setNewPassword("");
		setConfirmNewPassword("");
		setStoredOTP("");
		setShowCurrentPassword(false);
		setShowNewPassword(false);
		setShowConfirmNewPassword(false);
	};

	const handleBackToProfile = () => {
		setIsChangePasswordActive(false);
		setIsChangePinActive(false);
		setIsEditing(false);
		setPasswordStep(1);
		setPinStep(1);
	};

	const handleChangePinClick = () => {
		setIsChangePinActive(true);
		setPinStep(1);
		// Reset all PIN-related states when initiating change PIN
		setCurrentPasswordForPin("");
		setCurrentPin("");
		setPinOtp("");
		setNewPin("");
		setConfirmNewPin("");
		setStoredPinOTP("");
		setShowCurrentPasswordForPin(false);
		setShowCurrentPin(false);
		setShowNewPin(false);
		setShowConfirmNewPin(false);
	};

	// Handlers for password change steps
	const handleCurrentPasswordSubmit = async () => {
		if (!currentPassword.trim()) {
			toast.error("Please enter your current password.");
			return;
		}

		setLoading(true);
		const api = profileApiMap[userType];

		try {
			const verificationResult = await api.verifyCurrentPassword(
				userId,
				userType,
				currentPassword
			);
			if (verificationResult.success) {
				toast.success("Current password verified! Sending OTP...");
				// Fetch user profile to get email and full name for OTP sending
				const userProfile = await api.get(userId, userType);
				// Add a check for userProfile being null or undefined
				if (!userProfile || userProfile.error) {
					toast.error(
						userProfile?.error || "Failed to fetch user profile for OTP."
					);
					setLoading(false);
					return;
				}

				const email = userProfile?.email;
				const fullName = `${userProfile?.firstname || ""} ${
					userProfile?.lastname || ""
				}`.trim();

				if (!email) {
					toast.error("User has no email on file. Cannot send OTP.");
					setLoading(false);
					return;
				}

				const otpResult = await api.sendOtp(userId, userType); // Using sendOtp from profileApiMap

				if (otpResult.status === "success") {
					setStoredOTP(otpResult.otp); // Store OTP for local verification, assuming API returns it
					toast.success("OTP sent to your email!");
					setPasswordStep(2);
				} else {
					toast.error(otpResult.message || "Failed to send OTP.");
				}
			} else {
				toast.error(verificationResult.error || "Invalid current password.");
			}
		} catch (error) {
			console.error("Error verifying current password or sending OTP:", error);
			toast.error(
				"An error occurred during password verification or OTP sending."
			);
		} finally {
			setLoading(false);
		}
	};

	const handleOTPSubmit = async () => {
		if (otp.length !== 6) {
			toast.error("Please enter a 6-digit OTP.");
			return;
		}

		setLoading(true);
		const api = profileApiMap[userType];

		try {
			// For now, client-side OTP verification with storedOTP from sendOtp response
			if (otp === storedOTP) {
				toast.success("OTP verified. Please set your new password.");
				setPasswordStep(3);
			} else {
				toast.error("Invalid OTP.");
			}
		} catch (error) {
			console.error("Error verifying OTP:", error);
			toast.error("An error occurred during OTP verification.");
		} finally {
			setLoading(false);
		}
	};

	// Password validation function
	const validatePassword = (password) => {
		const rules = {
			minLength: password.length >= 8,
			hasUppercase: /[A-Z]/.test(password),
			hasLowercase: /[a-z]/.test(password),
			hasNumber: /\d/.test(password),
			hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
			noSpaces: !/\s/.test(password),
		};

		const isValid = Object.values(rules).every((rule) => rule);
		return { rules, isValid };
	};

	// PIN validation function
	const validatePin = (pin) => {
		const rules = {
			exactLength: pin.length === 4,
			onlyNumbers: /^\d+$/.test(pin),
		};

		const isValid = Object.values(rules).every((rule) => rule);
		return { rules, isValid };
	};

	const passwordValidation = validatePassword(newPassword);
	const pinValidation = validatePin(newPin);

	const handleNewPasswordSubmit = async () => {
		if (!passwordValidation.isValid) {
			toast.error("Please ensure your password meets all requirements.");
			return;
		}
		if (newPassword !== confirmNewPassword) {
			toast.error("New passwords do not match.");
			return;
		}

		setSaving(true);
		const api = profileApiMap[userType];

		try {
			const result = await api.changePassword(userId, userType, newPassword);
			if (result.success) {
				toast.success("Password changed successfully!");
				setIsChangePasswordActive(false);
				setIsEditing(false);
				onClose();
			} else {
				toast.error(result.error || "Failed to change password.");
			}
		} catch (error) {
			console.error("Error changing password:", error);
			toast.error("An error occurred during password change.");
		} finally {
			setSaving(false);
		}
	};

	const handleResendOTP = async () => {
		setLoading(true);
		const api = profileApiMap[userType];

		try {
			const otpResult = await api.sendOtp(userId, userType);
			if (otpResult.status === "success") {
				setStoredOTP(otpResult.otp); // Update stored OTP
				toast.success("OTP resent to your email!");
			} else {
				toast.error(otpResult.message || "Failed to resend OTP.");
			}
		} catch (error) {
			console.error("Error resending OTP:", error);
			toast.error("An error occurred while resending OTP.");
		} finally {
			setLoading(false);
		}
	};

	// Handlers for PIN change steps
	const handleCurrentPasswordAndPinSubmit = async () => {
		if (!currentPasswordForPin.trim()) {
			toast.error("Please enter your current password.");
			return;
		}
		if (!currentPin.trim() || currentPin.length !== 4) {
			toast.error("Please enter your current 4-digit PIN.");
			return;
		}

		setLoading(true);
		const api = profileApiMap[userType];

		try {
			// First verify current password
			const passwordVerification = await api.verifyCurrentPassword(
				userId,
				userType,
				currentPasswordForPin
			);

			if (!passwordVerification.success) {
				toast.error(passwordVerification.error || "Invalid current password.");
				setLoading(false);
				return;
			}

			// Then verify current PIN
			const pinVerification = await api.verifyCurrentPin(
				userId,
				userType,
				currentPin
			);

			if (!pinVerification.success) {
				toast.error(pinVerification.error || "Invalid current PIN.");
				setLoading(false);
				return;
			}

			toast.success("Password and PIN verified! Sending OTP...");

			// Fetch user profile to get email and full name for OTP sending
			const userProfile = await api.get(userId, userType);
			if (!userProfile || userProfile.error) {
				toast.error(
					userProfile?.error || "Failed to fetch user profile for OTP."
				);
				setLoading(false);
				return;
			}

			const email = userProfile?.email;
			if (!email) {
				toast.error("User has no email on file. Cannot send OTP.");
				setLoading(false);
				return;
			}

			const otpResult = await api.sendOtp(userId, userType);

			if (otpResult.status === "success") {
				setStoredPinOTP(otpResult.otp);
				toast.success("OTP sent to your email!");
				setPinStep(2);
			} else {
				toast.error(otpResult.message || "Failed to send OTP.");
			}
		} catch (error) {
			console.error("Error verifying password/PIN or sending OTP:", error);
			toast.error("An error occurred during verification or OTP sending.");
		} finally {
			setLoading(false);
		}
	};

	const handlePinOTPSubmit = async () => {
		if (pinOtp.length !== 6) {
			toast.error("Please enter a 6-digit OTP.");
			return;
		}

		setLoading(true);

		try {
			if (pinOtp === storedPinOTP) {
				toast.success("OTP verified. Please set your new PIN.");
				setPinStep(3);
			} else {
				toast.error("Invalid OTP.");
			}
		} catch (error) {
			console.error("Error verifying OTP:", error);
			toast.error("An error occurred during OTP verification.");
		} finally {
			setLoading(false);
		}
	};

	const handleNewPinSubmit = async () => {
		if (!pinValidation.isValid) {
			toast.error("Please ensure your PIN is exactly 4 digits.");
			return;
		}
		if (newPin !== confirmNewPin) {
			toast.error("New PINs do not match.");
			return;
		}

		setSaving(true);
		const api = profileApiMap[userType];

		try {
			const result = await api.changePin(userId, userType, newPin);
			if (result.success) {
				toast.success("PIN changed successfully!");
				setIsChangePinActive(false);
				setIsEditing(false);
				onClose();
			} else {
				toast.error(result.error || "Failed to change PIN.");
			}
		} catch (error) {
			console.error("Error changing PIN:", error);
			toast.error("An error occurred during PIN change.");
		} finally {
			setSaving(false);
		}
	};

	const handleResendPinOTP = async () => {
		setLoading(true);
		const api = profileApiMap[userType];

		try {
			const otpResult = await api.sendOtp(userId, userType);
			if (otpResult.status === "success") {
				setStoredPinOTP(otpResult.otp);
				toast.success("OTP resent to your email!");
			} else {
				toast.error(otpResult.message || "Failed to resend OTP.");
			}
		} catch (error) {
			console.error("Error resending OTP:", error);
			toast.error("An error occurred while resending OTP.");
		} finally {
			setLoading(false);
		}
	};

	const renderProfileContent = () => {
		// Add null check for profile
		if (!profile) {
			return (
				<div className="flex justify-center items-center py-12">
					<div className="text-gray-500 dark:text-gray-400">
						No profile data available
					</div>
				</div>
			);
		}

		return (
			<div className="space-y-8">
				{/* Profile Information */}
				<div className="p-6 bg-gray-50 rounded-lg dark:bg-gray-700">
					<h3 className="flex items-center mb-4 text-lg font-semibold text-gray-900 dark:text-white">
						<User className="mr-2 w-5 h-5 text-blue-600" />
						General Information
					</h3>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						{profileApiMap[userType].fields.map((field) => (
							<div className="space-y-2" key={field.key}>
								<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
									{field.label}
								</Label>
								{isEditing && field.editable ? (
									field.component === Textarea ? (
										<Textarea
											name={field.key}
											value={formData[field.key]}
											onChange={handleInputChange}
											className="w-full"
											rows={3}
										/>
									) : (
										<Input
											name={field.key}
											type={field.type || "text"}
											value={formData[field.key]}
											onChange={handleInputChange}
											className="w-full"
										/>
									)
								) : (
									<div
										className={`p-3 rounded-md border ${
											field.editable
												? "bg-white border-gray-200 dark:bg-gray-600 dark:border-gray-500"
												: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
										}`}
									>
										{field.icon && (
											<field.icon className="inline-block mr-2 w-4 h-4 text-gray-500" />
										)}
										{field.key === "birthDate" &&
										profile[field.key] &&
										profile[field.key] !== "0000-00-00"
											? new Date(profile[field.key]).toLocaleDateString()
											: profile[field.key] || "N/A"}
									</div>
								)}
							</div>
						))}
					</div>
				</div>

				{/* Change Password and PIN Buttons */}
				<div className="flex flex-col gap-3 justify-center mt-6 sm:flex-row">
					<Button
						onClick={handleChangePasswordClick}
						className="flex justify-center items-center space-x-2 w-full text-white bg-red-600 sm:w-auto hover:bg-red-700"
					>
						<LockKeyhole className="w-4 h-4" />
						<span>Change Password</span>
					</Button>
					{/* Only show Change PIN for admin, registrar, and teacher */}
					{userType !== "student" && (
						<Button
							onClick={handleChangePinClick}
							className="flex justify-center items-center space-x-2 w-full text-white bg-orange-600 sm:w-auto hover:bg-orange-700"
						>
							<Shield className="w-4 h-4" />
							<span>Change PIN</span>
						</Button>
					)}
				</div>
			</div>
		);
	};

	const renderChangePasswordContent = () => {
		switch (passwordStep) {
			case 1:
				return (
					<div className="space-y-4">
						<h3 className="text-xl font-bold text-gray-900 dark:text-white">
							Verify Current Password
						</h3>
						<div>
							<Label
								htmlFor="currentPassword"
								className="text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								Current Password
							</Label>
							<div className="relative mt-1">
								<Input
									id="currentPassword"
									type={showCurrentPassword ? "text" : "password"}
									value={currentPassword}
									onChange={(e) => setCurrentPassword(e.target.value)}
									placeholder="Enter current password"
									className="pr-10"
								/>
								<button
									type="button"
									onClick={() => setShowCurrentPassword(!showCurrentPassword)}
									className="flex absolute inset-y-0 right-0 items-center pr-3"
								>
									{showCurrentPassword ? (
										<EyeOff className="w-4 h-4 text-gray-400" />
									) : (
										<Eye className="w-4 h-4 text-gray-400" />
									)}
								</button>
							</div>
						</div>
						<div className="flex justify-end space-x-2">
							<Button variant="outline" onClick={handleBackToProfile}>
								Cancel
							</Button>
							<Button onClick={handleCurrentPasswordSubmit}>Next</Button>
						</div>
					</div>
				);
			case 2:
				return (
					<div className="space-y-4">
						<h3 className="text-xl font-bold text-gray-900 dark:text-white">
							Verify OTP
						</h3>
						<p className="text-gray-600 dark:text-gray-300">
							A 6-digit OTP has been sent to your email. Please enter it below.
						</p>
						<div>
							<Label
								htmlFor="otp"
								className="text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								OTP
							</Label>
							<Input
								id="otp"
								type="text"
								value={otp}
								onChange={(e) =>
									setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
								}
								placeholder="000000"
								className="mt-1 text-lg tracking-widest text-center"
								maxLength={6}
							/>
						</div>
						<div className="flex justify-end space-x-2">
							<Button variant="outline" onClick={handleBackToProfile}>
								Cancel
							</Button>
							<Button onClick={handleOTPSubmit} disabled={otp.length !== 6}>
								Verify OTP
							</Button>
						</div>
						<div className="text-center">
							<Button variant="link" onClick={handleResendOTP}>
								Resend OTP
							</Button>
						</div>
					</div>
				);
			case 3:
				return (
					<div className="space-y-4">
						<h3 className="text-xl font-bold text-gray-900 dark:text-white">
							Set New Password
						</h3>
						<div>
							<Label
								htmlFor="newPassword"
								className="text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								New Password
							</Label>
							<div className="relative mt-1">
								<Input
									id="newPassword"
									type={showNewPassword ? "text" : "password"}
									value={newPassword}
									onChange={(e) => {
										// Prevent spaces in password
										const value = e.target.value.replace(/\s/g, "");
										setNewPassword(value);
									}}
									placeholder="Enter new password"
									className="pr-10"
								/>
								<button
									type="button"
									onClick={() => setShowNewPassword(!showNewPassword)}
									className="flex absolute inset-y-0 right-0 items-center pr-3"
								>
									{showNewPassword ? (
										<EyeOff className="w-4 h-4 text-gray-400" />
									) : (
										<Eye className="w-4 h-4 text-gray-400" />
									)}
								</button>
							</div>
							{/* Password Requirements */}
							<div className="p-3 mt-2 bg-gray-50 rounded-md dark:bg-gray-700">
								<p className="mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">
									Password must contain:
								</p>
								<div className="space-y-1">
									<div
										className={`flex items-center text-xs ${
											passwordValidation.rules.minLength
												? "text-green-600 dark:text-green-400"
												: "text-red-500 dark:text-red-400"
										}`}
									>
										<span className="mr-2">
											{passwordValidation.rules.minLength ? "✓" : "✗"}
										</span>
										At least 8 characters
									</div>
									<div
										className={`flex items-center text-xs ${
											passwordValidation.rules.hasUppercase
												? "text-green-600 dark:text-green-400"
												: "text-red-500 dark:text-red-400"
										}`}
									>
										<span className="mr-2">
											{passwordValidation.rules.hasUppercase ? "✓" : "✗"}
										</span>
										At least 1 uppercase letter
									</div>
									<div
										className={`flex items-center text-xs ${
											passwordValidation.rules.hasLowercase
												? "text-green-600 dark:text-green-400"
												: "text-red-500 dark:text-red-400"
										}`}
									>
										<span className="mr-2">
											{passwordValidation.rules.hasLowercase ? "✓" : "✗"}
										</span>
										At least 1 lowercase letter
									</div>
									<div
										className={`flex items-center text-xs ${
											passwordValidation.rules.hasNumber
												? "text-green-600 dark:text-green-400"
												: "text-red-500 dark:text-red-400"
										}`}
									>
										<span className="mr-2">
											{passwordValidation.rules.hasNumber ? "✓" : "✗"}
										</span>
										At least 1 number
									</div>
									<div
										className={`flex items-center text-xs ${
											passwordValidation.rules.hasSpecialChar
												? "text-green-600 dark:text-green-400"
												: "text-red-500 dark:text-red-400"
										}`}
									>
										<span className="mr-2">
											{passwordValidation.rules.hasSpecialChar ? "✓" : "✗"}
										</span>
										At least 1 special character (!@#$%^&*...)
									</div>
									<div
										className={`flex items-center text-xs ${
											passwordValidation.rules.noSpaces
												? "text-green-600 dark:text-green-400"
												: "text-red-500 dark:text-red-400"
										}`}
									>
										<span className="mr-2">
											{passwordValidation.rules.noSpaces ? "✓" : "✗"}
										</span>
										No spaces allowed
									</div>
								</div>
							</div>
						</div>
						<div>
							<Label
								htmlFor="confirmNewPassword"
								className="text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								Confirm New Password
							</Label>
							<div className="relative mt-1">
								<Input
									id="confirmNewPassword"
									type={showConfirmNewPassword ? "text" : "password"}
									value={confirmNewPassword}
									onChange={(e) => {
										// Prevent spaces in password
										const value = e.target.value.replace(/\s/g, "");
										setConfirmNewPassword(value);
									}}
									placeholder="Confirm new password"
									className="pr-10"
								/>
								<button
									type="button"
									onClick={() =>
										setShowConfirmNewPassword(!showConfirmNewPassword)
									}
									className="flex absolute inset-y-0 right-0 items-center pr-3"
								>
									{showConfirmNewPassword ? (
										<EyeOff className="w-4 h-4 text-gray-400" />
									) : (
										<Eye className="w-4 h-4 text-gray-400" />
									)}
								</button>
							</div>
						</div>
						<div className="flex justify-end space-x-2">
							<Button variant="outline" onClick={handleBackToProfile}>
								Cancel
							</Button>
							<Button
								onClick={handleNewPasswordSubmit}
								disabled={
									!passwordValidation.isValid ||
									newPassword !== confirmNewPassword
								}
							>
								Change Password
							</Button>
						</div>
					</div>
				);
			default:
				return null;
		}
	};

	const renderChangePinContent = () => {
		switch (pinStep) {
			case 1:
				return (
					<div className="space-y-4">
						<h3 className="text-xl font-bold text-gray-900 dark:text-white">
							Verify Current Password and PIN
						</h3>
						<div>
							<Label
								htmlFor="currentPasswordForPin"
								className="text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								Current Password
							</Label>
							<div className="relative mt-1">
								<Input
									id="currentPasswordForPin"
									type={showCurrentPasswordForPin ? "text" : "password"}
									value={currentPasswordForPin}
									onChange={(e) => setCurrentPasswordForPin(e.target.value)}
									placeholder="Enter current password"
									className="pr-10"
								/>
								<button
									type="button"
									onClick={() =>
										setShowCurrentPasswordForPin(!showCurrentPasswordForPin)
									}
									className="flex absolute inset-y-0 right-0 items-center pr-3"
								>
									{showCurrentPasswordForPin ? (
										<EyeOff className="w-4 h-4 text-gray-400" />
									) : (
										<Eye className="w-4 h-4 text-gray-400" />
									)}
								</button>
							</div>
						</div>
						<div>
							<Label
								htmlFor="currentPin"
								className="text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								Current PIN
							</Label>
							<div className="relative mt-1">
								<Input
									id="currentPin"
									type={showCurrentPin ? "text" : "password"}
									value={currentPin}
									onChange={(e) => {
										// Only allow numbers and limit to 4 digits
										const value = e.target.value.replace(/\D/g, "").slice(0, 4);
										setCurrentPin(value);
									}}
									placeholder="Enter current 4-digit PIN"
									className="pr-10 text-lg tracking-widest text-center"
									maxLength={4}
								/>
								<button
									type="button"
									onClick={() => setShowCurrentPin(!showCurrentPin)}
									className="flex absolute inset-y-0 right-0 items-center pr-3"
								>
									{showCurrentPin ? (
										<EyeOff className="w-4 h-4 text-gray-400" />
									) : (
										<Eye className="w-4 h-4 text-gray-400" />
									)}
								</button>
							</div>
						</div>
						<div className="flex justify-end space-x-2">
							<Button variant="outline" onClick={handleBackToProfile}>
								Cancel
							</Button>
							<Button onClick={handleCurrentPasswordAndPinSubmit}>Next</Button>
						</div>
					</div>
				);
			case 2:
				return (
					<div className="space-y-4">
						<h3 className="text-xl font-bold text-gray-900 dark:text-white">
							Verify OTP
						</h3>
						<p className="text-gray-600 dark:text-gray-300">
							A 6-digit OTP has been sent to your email. Please enter it below.
						</p>
						<div>
							<Label
								htmlFor="pinOtp"
								className="text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								OTP
							</Label>
							<Input
								id="pinOtp"
								type="text"
								value={pinOtp}
								onChange={(e) =>
									setPinOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
								}
								placeholder="000000"
								className="mt-1 text-lg tracking-widest text-center"
								maxLength={6}
							/>
						</div>
						<div className="flex justify-end space-x-2">
							<Button variant="outline" onClick={handleBackToProfile}>
								Cancel
							</Button>
							<Button
								onClick={handlePinOTPSubmit}
								disabled={pinOtp.length !== 6}
							>
								Verify OTP
							</Button>
						</div>
						<div className="text-center">
							<Button variant="link" onClick={handleResendPinOTP}>
								Resend OTP
							</Button>
						</div>
					</div>
				);
			case 3:
				return (
					<div className="space-y-4">
						<h3 className="text-xl font-bold text-gray-900 dark:text-white">
							Set New PIN
						</h3>
						<div>
							<Label
								htmlFor="newPin"
								className="text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								New PIN
							</Label>
							<div className="relative mt-1">
								<Input
									id="newPin"
									type={showNewPin ? "text" : "password"}
									value={newPin}
									onChange={(e) => {
										// Only allow numbers and limit to 4 digits
										const value = e.target.value.replace(/\D/g, "").slice(0, 4);
										setNewPin(value);
									}}
									placeholder="Enter new 4-digit PIN"
									className="pr-10 text-lg tracking-widest text-center"
									maxLength={4}
								/>
								<button
									type="button"
									onClick={() => setShowNewPin(!showNewPin)}
									className="flex absolute inset-y-0 right-0 items-center pr-3"
								>
									{showNewPin ? (
										<EyeOff className="w-4 h-4 text-gray-400" />
									) : (
										<Eye className="w-4 h-4 text-gray-400" />
									)}
								</button>
							</div>
							{/* PIN Requirements */}
							<div className="p-3 mt-2 bg-gray-50 rounded-md dark:bg-gray-700">
								<p className="mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">
									PIN requirements:
								</p>
								<div className="space-y-1">
									<div
										className={`flex items-center text-xs ${
											pinValidation.rules.exactLength
												? "text-green-600 dark:text-green-400"
												: "text-red-500 dark:text-red-400"
										}`}
									>
										<span className="mr-2">
											{pinValidation.rules.exactLength ? "✓" : "✗"}
										</span>
										Exactly 4 digits
									</div>
									<div
										className={`flex items-center text-xs ${
											pinValidation.rules.onlyNumbers
												? "text-green-600 dark:text-green-400"
												: "text-red-500 dark:text-red-400"
										}`}
									>
										<span className="mr-2">
											{pinValidation.rules.onlyNumbers ? "✓" : "✗"}
										</span>
										Numbers only (0-9)
									</div>
								</div>
							</div>
						</div>
						<div>
							<Label
								htmlFor="confirmNewPin"
								className="text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								Confirm New PIN
							</Label>
							<div className="relative mt-1">
								<Input
									id="confirmNewPin"
									type={showConfirmNewPin ? "text" : "password"}
									value={confirmNewPin}
									onChange={(e) => {
										// Only allow numbers and limit to 4 digits
										const value = e.target.value.replace(/\D/g, "").slice(0, 4);
										setConfirmNewPin(value);
									}}
									placeholder="Confirm new 4-digit PIN"
									className="pr-10 text-lg tracking-widest text-center"
									maxLength={4}
								/>
								<button
									type="button"
									onClick={() => setShowConfirmNewPin(!showConfirmNewPin)}
									className="flex absolute inset-y-0 right-0 items-center pr-3"
								>
									{showConfirmNewPin ? (
										<EyeOff className="w-4 h-4 text-gray-400" />
									) : (
										<Eye className="w-4 h-4 text-gray-400" />
									)}
								</button>
							</div>
						</div>
						<div className="flex justify-end space-x-2">
							<Button variant="outline" onClick={handleBackToProfile}>
								Cancel
							</Button>
							<Button
								onClick={handleNewPinSubmit}
								disabled={!pinValidation.isValid || newPin !== confirmNewPin}
							>
								Change PIN
							</Button>
						</div>
					</div>
				);
			default:
				return null;
		}
	};

	const modalTitle = isChangePasswordActive
		? "Change Password"
		: isChangePinActive
		? "Change PIN"
		: profileApiMap[userType]?.title || "User Profile";

	const renderHeaderButtons = () => {
		if (isChangePasswordActive || isChangePinActive) {
			return (
				<Button
					onClick={handleBackToProfile}
					variant="ghost"
					className="flex items-center px-3 py-2 space-x-2 text-sm sm:text-base"
				>
					<ArrowLeft className="w-4 h-4" />
					<span className="hidden sm:inline">Back to Profile</span>
				</Button>
			);
		} else if (!isEditing) {
			return (
				<Button
					onClick={handleEdit}
					className="flex items-center px-3 py-2 space-x-2 text-sm text-white bg-blue-600 sm:text-base hover:bg-blue-700"
				>
					<Edit className="w-4 h-4" />
					<span className="hidden sm:inline">Edit Profile</span>
				</Button>
			);
		} else {
			return (
				<>
					<Button
						onClick={handleCancel}
						variant="outline"
						className="flex items-center px-3 py-2 space-x-2 text-sm sm:text-base"
					>
						<XCircle className="w-4 h-4" />
						<span className="hidden sm:inline">Cancel</span>
					</Button>
					<Button
						onClick={handleSave}
						disabled={saving}
						className="flex items-center px-3 py-2 space-x-2 text-sm text-white bg-green-600 sm:text-base hover:bg-green-700"
					>
						<Save className="w-4 h-4" />
						<span className="hidden sm:inline">
							{saving ? "Saving..." : "Save Changes"}
						</span>
					</Button>
				</>
			);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="flex fixed inset-0 z-50 justify-center items-center p-4">
			{/* Backdrop */}
			<div
				className="absolute inset-0 backdrop-blur-sm bg-black/50"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="relative bg-white rounded-none sm:rounded-2xl shadow-2xl w-full sm:max-w-4xl h-[100svh] sm:h-auto sm:max-h-[95vh] overflow-hidden transform transition-all duration-300 scale-100 dark:bg-gray-800">
				{/* Header */}
				<div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
					<div className="flex items-center space-x-3">
						<User className="w-6 h-6 text-blue-600" />
						<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
							{modalTitle}
						</h2>
					</div>
					<div className="flex gap-2 items-center ml-auto">
						{renderHeaderButtons()}
						<button
							onClick={onClose}
							className="p-2 w-9 h-9 text-gray-400 rounded-full transition-colors hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
						>
							<X className="w-5 h-5" />
						</button>
					</div>
				</div>

				{/* Content */}
				<div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
					{loading ? (
						<div className="flex justify-center items-center py-12">
							<div className="w-12 h-12 rounded-full border-b-2 border-blue-600 animate-spin"></div>
						</div>
					) : isChangePasswordActive ? (
						renderChangePasswordContent()
					) : isChangePinActive ? (
						renderChangePinContent()
					) : (
						renderProfileContent()
					)}
				</div>
			</div>
		</div>
	);
}
