import React, { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { getUserLevel, addUser, getGradeLevel } from "../../../utils/admin";
import { X, User, Mail, Lock, Shield, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

export default function AddUserModal({ isOpen, onClose, onSuccess }) {
	const [formData, setFormData] = useState({
		id: "",
		firstname: "",
		lastname: "",
		email: "",
		password: "",
		pinCode: "",
		userLevel: "",
	});
	const [userLevels, setUserLevels] = useState([]);
	const [loading, setLoading] = useState(false);
	const [loadingLevels, setLoadingLevels] = useState(true);
	const [gradeLevels, setGradeLevels] = useState([]);
	const [loadingGrades, setLoadingGrades] = useState(false);

	// Fetch user levels when modal opens
	useEffect(() => {
		if (isOpen) {
			fetchUserLevels();
		}
	}, [isOpen]);

	// Fetch grade levels if userLevel is Teacher
	useEffect(() => {
		if (isOpen && formData.userLevel && getTeacherLevelId()) {
			fetchGradeLevels();
		}
	}, [isOpen, formData.userLevel]);

	const getTeacherLevelId = () => {
		const teacher = userLevels.find(
			(level) => level.name.toLowerCase() === "teacher"
		);
		return teacher ? teacher.id : null;
	};

	const fetchUserLevels = async () => {
		try {
			setLoadingLevels(true);
			const data = await getUserLevel();
			setUserLevels(Array.isArray(data) ? data : []);
		} catch (error) {
			console.error("Failed to fetch user levels:", error);
			toast.error("Failed to load user levels");
			setUserLevels([]);
		} finally {
			setLoadingLevels(false);
		}
	};

	const fetchGradeLevels = async () => {
		try {
			setLoadingGrades(true);
			const data = await getGradeLevel();
			setGradeLevels(Array.isArray(data) ? data : []);
		} catch (error) {
			console.error("Failed to fetch grade levels:", error);
			setGradeLevels([]);
		} finally {
			setLoadingGrades(false);
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => {
			const newData = {
				...prev,
				[name]: value,
			};

			// Automatically set password to lastname when lastname changes
			if (name === "lastname") {
				newData.password = value;
			}

			// Reset gradeLevel if userLevel changes and is not Teacher
			if (name === "userLevel" && value !== getTeacherLevelId()) {
				newData.gradeLevel = "";
			}

			return newData;
		});
	};

	const validateForm = () => {
		const { id, firstname, lastname, email, pinCode, userLevel, gradeLevel } =
			formData;

		if (!id.trim()) {
			toast.error("User ID is required");
			return false;
		}
		if (!firstname.trim()) {
			toast.error("First name is required");
			return false;
		}
		if (!lastname.trim()) {
			toast.error("Last name is required");
			return false;
		}
		if (!email.trim()) {
			toast.error("Email is required");
			return false;
		}
		if (!email.includes("@")) {
			toast.error("Please enter a valid email address");
			return false;
		}
		if (!pinCode.trim()) {
			toast.error("PIN Code is required");
			return false;
		}
		if (!/^\d{4}$/.test(pinCode)) {
			toast.error("PIN Code must be exactly 4 digits");
			return false;
		}
		if (!userLevel) {
			toast.error("User level is required");
			return false;
		}
		// If Teacher, gradeLevel is required
		if (userLevel === String(getTeacherLevelId()) && !gradeLevel) {
			toast.error("Grade level is required for teachers");
			return false;
		}

		return true;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		try {
			setLoading(true);

			const userData = {
				...formData,
				pinCode: parseInt(formData.pinCode),
			};
			// Only include gradeLevelId if Teacher
			if (formData.userLevel === String(getTeacherLevelId())) {
				userData.gradeLevelId = formData.gradeLevel;
				delete userData.gradeLevel;
			} else {
				delete userData.gradeLevelId;
				delete userData.gradeLevel;
			}

			await addUser(userData);
			toast.success("User added successfully!");

			// Reset form
			setFormData({
				id: "",
				firstname: "",
				lastname: "",
				email: "",
				password: "",
				pinCode: "",
				userLevel: "",
			});

			onClose();
			if (onSuccess) onSuccess();
		} catch (error) {
			console.error("Failed to add user:", error);
			toast.error("Failed to add user");
		} finally {
			setLoading(false);
		}
	};

	const handleClose = () => {
		setFormData({
			id: "",
			firstname: "",
			lastname: "",
			email: "",
			password: "",
			pinCode: "",
			userLevel: "",
		});
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="flex fixed inset-0 z-50 justify-center items-center p-4">
			{/* Overlay with animation */}
			<div
				className="absolute inset-0 backdrop-blur-sm transition-opacity duration-300 bg-black/60"
				onClick={handleClose}
			/>

			{/* Modal Content with enhanced design */}
			<div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden transform transition-all duration-300 scale-100">
				{/* Header with gradient background */}
				<div className="px-6 py-6 bg-gradient-to-r from-blue-600 to-purple-600 sm:px-8 sm:py-8">
					<div className="flex justify-between items-center">
						<div className="flex items-center space-x-3">
							<div className="flex justify-center items-center w-12 h-12 rounded-full backdrop-blur-sm bg-white/20">
								<UserPlus className="w-6 h-6 text-white" />
							</div>
							<div>
								<h2 className="text-2xl font-bold text-white">Add New User</h2>
								<p className="mt-1 text-sm text-blue-100">
									Create a new user account
								</p>
							</div>
						</div>
						<button
							onClick={handleClose}
							className="flex justify-center items-center w-10 h-10 rounded-full transition-all duration-200 text-white/80 bg-white/20 hover:bg-white/30 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
						>
							<X className="w-5 h-5" />
						</button>
					</div>
				</div>

				{/* Form with enhanced styling */}
				<div className="overflow-y-auto max-h-[calc(95vh-140px)]">
					<form onSubmit={handleSubmit} className="p-6 space-y-6 sm:p-8">
						{/* User ID and Level Row */}
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
							<div className="space-y-2">
								<Label
									htmlFor="id"
									className="flex items-center text-sm font-semibold text-gray-700"
								>
									<User className="mr-2 w-4 h-4 text-blue-500" />
									User ID
								</Label>
								<Input
									id="id"
									name="id"
									value={formData.id}
									onChange={handleInputChange}
									placeholder="Enter user ID"
									className="px-4 py-3 w-full bg-gray-50 rounded-xl border-2 border-gray-200 transition-colors duration-200 focus:border-blue-500 focus:ring-0 focus:bg-white"
									required
								/>
							</div>
							<div className="space-y-2">
								<Label
									htmlFor="userLevel"
									className="flex items-center text-sm font-semibold text-gray-700"
								>
									<Shield className="mr-2 w-4 h-4 text-purple-500" />
									User Level
								</Label>
								<select
									id="userLevel"
									name="userLevel"
									value={formData.userLevel}
									onChange={handleInputChange}
									className="px-4 py-3 w-full text-gray-900 bg-gray-50 rounded-xl border-2 border-gray-200 transition-colors duration-200 focus:border-purple-500 focus:outline-none focus:bg-white"
									required
									disabled={loadingLevels}
								>
									<option value="">
										{loadingLevels ? "Loading..." : "Select user level"}
									</option>
									{userLevels.map((level) => (
										<option key={level.id} value={level.id}>
											{level.name}
										</option>
									))}
								</select>
							</div>
						</div>

						{/* Grade Level select for Teacher */}
						{formData.userLevel === String(getTeacherLevelId()) && (
							<div className="mt-2 space-y-2">
								<Label
									htmlFor="gradeLevel"
									className="flex items-center text-sm font-semibold text-gray-700"
								>
									<Shield className="mr-2 w-4 h-4 text-green-500" />
									Grade Level
								</Label>
								<select
									id="gradeLevel"
									name="gradeLevel"
									value={formData.gradeLevel || ""}
									onChange={handleInputChange}
									className="px-4 py-3 w-full text-gray-900 bg-gray-50 rounded-xl border-2 border-gray-200 transition-colors duration-200 focus:border-green-500 focus:outline-none focus:bg-white"
									required
									disabled={loadingGrades}
								>
									<option value="">
										{loadingGrades ? "Loading..." : "Select grade level"}
									</option>
									{gradeLevels.map((level) => (
										<option key={level.id} value={level.id}>
											{level.name}
										</option>
									))}
								</select>
							</div>
						)}

						{/* Name Row */}
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
							<div className="space-y-2">
								<Label
									htmlFor="firstname"
									className="flex items-center text-sm font-semibold text-gray-700"
								>
									<User className="mr-2 w-4 h-4 text-green-500" />
									First Name
								</Label>
								<Input
									id="firstname"
									name="firstname"
									value={formData.firstname}
									onChange={handleInputChange}
									placeholder="Enter first name"
									className="px-4 py-3 w-full bg-gray-50 rounded-xl border-2 border-gray-200 transition-colors duration-200 focus:border-green-500 focus:ring-0 focus:bg-white"
									required
								/>
							</div>
							<div className="space-y-2">
								<Label
									htmlFor="lastname"
									className="flex items-center text-sm font-semibold text-gray-700"
								>
									<User className="mr-2 w-4 h-4 text-green-500" />
									Last Name
								</Label>
								<Input
									id="lastname"
									name="lastname"
									value={formData.lastname}
									onChange={handleInputChange}
									placeholder="Enter last name"
									className="px-4 py-3 w-full bg-gray-50 rounded-xl border-2 border-gray-200 transition-colors duration-200 focus:border-green-500 focus:ring-0 focus:bg-white"
									required
								/>
							</div>
						</div>

						{/* Email and PIN Row */}
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
							<div className="space-y-2">
								<Label
									htmlFor="email"
									className="flex items-center text-sm font-semibold text-gray-700"
								>
									<Mail className="mr-2 w-4 h-4 text-orange-500" />
									Email Address
								</Label>
								<Input
									id="email"
									name="email"
									type="email"
									value={formData.email}
									onChange={handleInputChange}
									placeholder="Enter email address"
									className="px-4 py-3 w-full bg-gray-50 rounded-xl border-2 border-gray-200 transition-colors duration-200 focus:border-orange-500 focus:ring-0 focus:bg-white"
									required
								/>
							</div>
							<div className="space-y-2">
								<Label
									htmlFor="pinCode"
									className="flex items-center text-sm font-semibold text-gray-700"
								>
									<Lock className="mr-2 w-4 h-4 text-red-500" />
									PIN Code (4 digits)
								</Label>
								<Input
									id="pinCode"
									name="pinCode"
									type="password"
									value={formData.pinCode}
									onChange={(e) => {
										const value = e.target.value.replace(/\D/g, "");
										if (value.length <= 4) {
											handleInputChange({
												target: { name: "pinCode", value },
											});
										}
									}}
									placeholder="Enter 4-digit PIN"
									maxLength="4"
									className="px-4 py-3 w-full font-mono text-lg tracking-widest text-center bg-gray-50 rounded-xl border-2 border-gray-200 transition-colors duration-200 focus:border-red-500 focus:ring-0 focus:bg-white"
									required
								/>
							</div>
						</div>

						{/* Password Info */}
						<div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
							<div className="flex items-start space-x-3">
								<div className="flex justify-center items-center w-6 h-6 bg-blue-100 rounded-full flex-shrink-0 mt-0.5">
									<Lock className="w-3 h-3 text-blue-600" />
								</div>
								<div>
									<p className="text-sm font-medium text-blue-800">
										Password Auto-Generation
									</p>
									<p className="mt-1 text-xs text-blue-600">
										The password will be automatically set to the user's last
										name. Users can change it after their first login.
									</p>
								</div>
							</div>
						</div>

						{/* Action Buttons */}
						<div className="flex flex-col justify-end pt-6 space-y-3 border-t border-gray-100 sm:flex-row sm:space-y-0 sm:space-x-4">
							<Button
								type="button"
								onClick={handleClose}
								disabled={loading}
								className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl border-2 border-gray-200 transition-all duration-200 hover:bg-gray-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:opacity-50"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={loading}
								className="flex justify-center items-center px-6 py-3 space-x-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl border-2 border-transparent transition-all duration-200 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{loading ? (
									<>
										<div className="w-4 h-4 rounded-full border-2 border-white animate-spin border-t-transparent" />
										<span>Adding User...</span>
									</>
								) : (
									<>
										<UserPlus className="w-4 h-4" />
										<span>Add User</span>
									</>
								)}
							</Button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
