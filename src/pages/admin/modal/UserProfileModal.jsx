import React, { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../../components/ui/select";
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
	KeyIcon,
	Settings,
	ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import {
	getUserProfile,
	updateUserProfile,
	getAllSections,
	resetPassword,
	resetPin,
} from "../../../utils/admin";
import { getSchoolYear } from "../../../utils/registrar";

export default function UserProfileModal({
	isOpen,
	onClose,
	userId,
	userType,
	onSuccess,
}) {
	const [profile, setProfile] = useState(null);
	const [isEditing, setIsEditing] = useState(false);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [formData, setFormData] = useState({});
	const [sectionOptions, setSectionOptions] = useState([]);
	const [schoolYearOptions, setSchoolYearOptions] = useState([]);
	const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
	const [isResetPinDialogOpen, setIsResetPinDialogOpen] = useState(false);
	const [isSettingsDropdownOpen, setIsSettingsDropdownOpen] = useState(false);

	// Fetch profile data when modal opens
	useEffect(() => {
		if (isOpen && userId && userType) {
			fetchProfile();
			// Fetch section options for all user types (needed for admin/teacher section editing)
			fetchOptions();
		}
	}, [isOpen, userId, userType]);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (isSettingsDropdownOpen && !event.target.closest(".relative")) {
				setIsSettingsDropdownOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isSettingsDropdownOpen]);

	const fetchProfile = async () => {
		setLoading(true);
		try {
			const data = await getUserProfile(userId, userType);
			if (data.error) {
				toast.error(data.error);
			} else {
				setProfile(data);
				initializeFormData(data);
			}
		} catch (error) {
			console.error("Failed to fetch profile:", error);
			toast.error("Failed to load profile");
		} finally {
			setLoading(false);
		}
	};

	const fetchOptions = async (gradeLevelId = null) => {
		try {
			// Only fetch sections for teachers and students
			if (
				userType?.toLowerCase() === "teacher" ||
				userType?.toLowerCase() === "student"
			) {
				const sections = await getAllSections(gradeLevelId);
				setSectionOptions(Array.isArray(sections) ? sections : []);
			}

			// Only fetch school years for students
			if (userType?.toLowerCase() === "student") {
				const schoolYears = await getSchoolYear();
				setSchoolYearOptions(Array.isArray(schoolYears) ? schoolYears : []);
			}
		} catch (error) {
			console.error("Failed to fetch options:", error);
		}
	};

	// Filter sections based on selected grade level
	const filteredSectionOptions =
		userType?.toLowerCase() === "student"
			? sectionOptions
			: sectionOptions.filter(
					(section) =>
						!formData.gradeLevelId ||
						section.gradeLevelId == formData.gradeLevelId
			  );

	const initializeFormData = (data) => {
		if (userType?.toLowerCase() === "student") {
			setFormData({
				firstname: data.firstname || "",
				middlename: data.middlename || "",
				lastname: data.lastname || "",
				email: data.email || "",
				birthDate: data.birthDate || "",
				age: data.age || "",
				religion: data.religion || "",
				completeAddress: data.completeAddress || "",
				fatherName: data.fatherName || "",
				motherName: data.motherName || "",
				guardianName: data.guardianName || "",
				guardianRelationship: data.guardianRelationship || "",
			});
		} else if (userType?.toLowerCase() === "teacher") {
			setFormData({
				firstname: data.firstname || "",
				middlename: data.middlename || "",
				lastname: data.lastname || "",
				email: data.email || "",
				gradeLevelId: data.gradeLevelId || "",
				sectionId: data.sectionId || "",
			});
		} else {
			// For admin, registrar, and other non-teacher users
			setFormData({
				firstname: data.firstname || "",
				middlename: data.middlename || "",
				lastname: data.lastname || "",
				email: data.email || "",
			});
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSelectChange = (name, value) => {
		setFormData((prev) => ({ ...prev, [name]: value }));

		// If grade level changes, clear section selection and refetch sections (only for teachers)
		if (name === "gradeLevelId" && userType?.toLowerCase() === "teacher") {
			setFormData((prev) => ({ ...prev, sectionId: "" }));
			fetchOptions(value);
		}
	};

	const handleEdit = () => {
		setIsEditing(true);
	};

	const handleCancel = () => {
		setIsEditing(false);
		// Reset form data to original profile data
		if (profile) {
			initializeFormData(profile);
		}
	};

	const handleResetPassword = async () => {
		setIsResetDialogOpen(true);
	};

	const confirmResetPassword = async () => {
		try {
			const result = await resetPassword(userId, userType, profile.lastname);
			if (result.status === "success") {
				toast.success("Password has been reset successfully");
				setIsResetDialogOpen(false);
			} else {
				toast.error(result.message || "Failed to reset password");
			}
		} catch (error) {
			console.error("Failed to reset password:", error);
			toast.error("Failed to reset password");
		}
	};

	const handleResetPin = async () => {
		setIsResetPinDialogOpen(true);
	};

	const confirmResetPin = async () => {
		try {
			const result = await resetPin(userId, userType);
			if (result.status === "success") {
				toast.success("PIN has been reset successfully");
				setIsResetPinDialogOpen(false);
			} else {
				toast.error(result.message || "Failed to reset PIN");
			}
		} catch (error) {
			console.error("Failed to reset PIN:", error);
			toast.error("Failed to reset PIN");
		}
	};

	const handleSave = async () => {
		setSaving(true);
		try {
			const result = await updateUserProfile(userId, userType, formData);
			if (result.success) {
				toast.success("Profile updated successfully!");
				setIsEditing(false);
				// Refresh profile data
				await fetchProfile();
				// Notify parent component
				if (onSuccess) onSuccess();
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

	if (!isOpen) return null;

	return (
		<div>
			<div className="flex fixed inset-0 z-50 justify-center items-center p-2 sm:p-4">
				{/* Backdrop */}
				<div
					className="absolute inset-0 backdrop-blur-sm bg-black/50"
					onClick={onClose}
				/>

				{/* Modal */}
				<div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[98vh] sm:max-h-[95vh] overflow-hidden transform transition-all duration-300 scale-100 dark:bg-gray-800 flex flex-col">
					{/* Header */}
					<div className="flex flex-shrink-0 justify-between items-center p-4 border-b border-gray-200 sm:p-6 dark:border-gray-700">
						<div className="flex items-center space-x-2 min-w-0 sm:space-x-3">
							<User className="flex-shrink-0 w-5 h-5 text-blue-600 sm:w-6 sm:h-6" />
							<h2 className="text-lg font-bold text-gray-900 truncate sm:text-2xl dark:text-white">
								{userType === "student" ? "Student" : "User"} Profile
							</h2>
							<span className="flex-shrink-0 px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full dark:text-blue-200 dark:bg-blue-900">
								{profile?.userLevel || userType}
							</span>
						</div>
						<div className="flex flex-shrink-0 items-center space-x-2">
							{!isEditing ? (
								<div className="relative">
									<Button
										onClick={() =>
											setIsSettingsDropdownOpen(!isSettingsDropdownOpen)
										}
										variant="outline"
										size="sm"
										className="flex items-center px-3 space-x-2 text-xs sm:text-sm sm:px-4"
									>
										<Settings className="w-4 h-4" />
										<span>Settings</span>
										<ChevronDown className="w-3 h-3" />
									</Button>

									{/* Dropdown Menu */}
									{isSettingsDropdownOpen && (
										<div className="absolute right-0 top-full z-50 mt-1 w-48 bg-white rounded-md border border-gray-200 shadow-lg dark:bg-gray-800 dark:border-gray-700">
											<div className="py-1">
												<button
													onClick={() => {
														handleResetPassword();
														setIsSettingsDropdownOpen(false);
													}}
													className="flex items-center px-4 py-2 w-full text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-red-400"
												>
													<KeyIcon className="mr-3 w-4 h-4" />
													Reset Password
												</button>
												{userType !== "student" && (
													<button
														onClick={() => {
															handleResetPin();
															setIsSettingsDropdownOpen(false);
														}}
														className="flex items-center px-4 py-2 w-full text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-red-400"
													>
														<KeyIcon className="mr-3 w-4 h-4" />
														Reset PIN
													</button>
												)}
												<button
													onClick={() => {
														handleEdit();
														setIsSettingsDropdownOpen(false);
													}}
													className="flex items-center px-4 py-2 w-full text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:text-blue-400"
												>
													<Edit className="mr-3 w-4 h-4" />
													Edit Profile
												</button>
											</div>
										</div>
									)}
								</div>
							) : null}
							<button
								onClick={onClose}
								className="flex-shrink-0 p-1.5 text-gray-400 rounded-full transition-colors sm:p-2 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
							>
								<X className="w-4 h-4 sm:w-5 sm:h-5" />
							</button>
						</div>
					</div>

					{/* Content */}
					<div className="overflow-y-auto flex-1 p-4 pb-20 sm:p-6 sm:pb-6">
						{loading ? (
							<div className="flex justify-center items-center py-12">
								<div className="w-12 h-12 rounded-full border-b-2 border-blue-600 animate-spin"></div>
							</div>
						) : profile ? (
							<div className="space-y-4 sm:space-y-8">
								{/* Basic Information */}
								<div className="p-4 bg-gray-50 rounded-lg sm:p-6 dark:bg-gray-700">
									<h3 className="flex items-center mb-3 text-base font-semibold text-gray-900 sm:mb-4 sm:text-lg dark:text-white">
										<User className="mr-2 w-4 h-4 text-blue-600 sm:w-5 sm:h-5" />
										Basic Information
									</h3>
									<div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
										<div className="space-y-1 sm:space-y-2">
											<Label className="text-xs font-medium text-gray-700 sm:text-sm dark:text-gray-300">
												User ID
											</Label>
											<div className="p-2 text-sm text-gray-600 bg-gray-100 rounded-md border border-gray-200 sm:p-3 sm:text-base dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300">
												{profile.id}
											</div>
										</div>
										<div className="space-y-1 sm:space-y-2">
											<Label className="text-xs font-medium text-gray-700 sm:text-sm dark:text-gray-300">
												User Level
											</Label>
											<div className="p-2 text-sm text-gray-600 bg-gray-100 rounded-md border border-gray-200 sm:p-3 sm:text-base dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300">
												{profile.userLevel}
											</div>
										</div>
										<div className="space-y-2">
											<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
												First Name
											</Label>
											{isEditing ? (
												<Input
													name="firstname"
													value={formData.firstname}
													onChange={handleInputChange}
													className="w-full"
												/>
											) : (
												<div className="p-3 bg-white rounded-md border border-gray-200 dark:bg-gray-600 dark:border-gray-500">
													{profile.firstname || "N/A"}
												</div>
											)}
										</div>
										<div className="space-y-2">
											<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
												Middle Name
											</Label>
											{isEditing ? (
												<Input
													name="middlename"
													value={formData.middlename}
													onChange={handleInputChange}
													className="w-full"
												/>
											) : (
												<div className="p-3 bg-white rounded-md border border-gray-200 dark:bg-gray-600 dark:border-gray-500">
													{profile.middlename || "N/A"}
												</div>
											)}
										</div>
										<div className="space-y-2">
											<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
												Last Name
											</Label>
											{isEditing ? (
												<Input
													name="lastname"
													value={formData.lastname}
													onChange={handleInputChange}
													className="w-full"
												/>
											) : (
												<div className="p-3 bg-white rounded-md border border-gray-200 dark:bg-gray-600 dark:border-gray-500">
													{profile.lastname || "N/A"}
												</div>
											)}
										</div>
										{userType === "student" && (
											<div className="space-y-2">
												<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
													LRN
												</Label>
												<div className="p-3 text-gray-600 bg-gray-100 rounded-md border border-gray-200 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300">
													{profile.lrn || "N/A"}
												</div>
											</div>
										)}
										<div className="space-y-2">
											<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
												Email
											</Label>
											{isEditing ? (
												<Input
													name="email"
													type="email"
													value={formData.email}
													onChange={handleInputChange}
													className="w-full"
												/>
											) : (
												<div className="flex items-center p-3 bg-white rounded-md border border-gray-200 dark:bg-gray-600 dark:border-gray-500">
													<Mail className="mr-2 w-4 h-4 text-gray-500" />
													{profile.email || "N/A"}
												</div>
											)}
										</div>
										{userType?.toLowerCase() === "teacher" && (
											<>
												<div className="space-y-2">
													<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
														Grade Level
													</Label>
													{isEditing ? (
														<Select
															value={formData.gradeLevelId}
															onValueChange={(value) =>
																handleSelectChange("gradeLevelId", value)
															}
														>
															<SelectTrigger>
																<SelectValue placeholder="Select Grade Level" />
															</SelectTrigger>
															<SelectContent>
																<SelectItem value="1">Grade 11</SelectItem>
																<SelectItem value="2">Grade 12</SelectItem>
															</SelectContent>
														</Select>
													) : (
														<div className="p-3 bg-white rounded-md border border-gray-200 dark:bg-gray-600 dark:border-gray-500">
															{profile.gradeLevel || "N/A"}
														</div>
													)}
												</div>
												<div className="space-y-2">
													<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
														Section
													</Label>
													{isEditing ? (
														<Select
															value={formData.sectionId}
															onValueChange={(value) =>
																handleSelectChange("sectionId", value)
															}
														>
															<SelectTrigger>
																<SelectValue placeholder="Select Section" />
															</SelectTrigger>
															<SelectContent>
																{filteredSectionOptions.map((section) => (
																	<SelectItem
																		key={section.id}
																		value={section.id}
																	>
																		{section.name}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													) : (
														<div className="p-3 bg-white rounded-md border border-gray-200 dark:bg-gray-600 dark:border-gray-500">
															{profile.sectionName || "N/A"}
														</div>
													)}
												</div>
											</>
										)}
										{userType === "student" && (
											<>
												<div className="space-y-2">
													<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
														Birth Date
													</Label>
													{isEditing ? (
														<Input
															name="birthDate"
															type="date"
															value={formData.birthDate}
															onChange={handleInputChange}
															className="w-full"
														/>
													) : (
														<div className="flex items-center p-3 bg-white rounded-md border border-gray-200 dark:bg-gray-600 dark:border-gray-500">
															<Calendar className="mr-2 w-4 h-4 text-gray-500" />
															{profile.birthDate &&
															profile.birthDate !== "0000-00-00"
																? new Date(
																		profile.birthDate
																  ).toLocaleDateString()
																: "N/A"}
														</div>
													)}
												</div>
												<div className="space-y-2">
													<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
														Age
													</Label>
													{isEditing ? (
														<Input
															name="age"
															type="number"
															value={formData.age}
															onChange={handleInputChange}
															className="w-full"
														/>
													) : (
														<div className="p-3 bg-white rounded-md border border-gray-200 dark:bg-gray-600 dark:border-gray-500">
															{profile.age || "N/A"}
														</div>
													)}
												</div>
											</>
										)}
									</div>
								</div>

								{/* Academic Information - Only for students */}
								{userType === "student" && (
									<div className="p-4 bg-gray-50 rounded-lg sm:p-6 dark:bg-gray-700">
										<h3 className="flex items-center mb-3 text-base font-semibold text-gray-900 sm:mb-4 sm:text-lg dark:text-white">
											<Shield className="mr-2 w-4 h-4 text-green-600 sm:w-5 sm:h-5" />
											Academic Information
										</h3>
										<div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
											<div className="space-y-2">
												<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
													Section
												</Label>
												<div className="p-3 text-gray-600 bg-gray-100 rounded-md border border-gray-200 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300">
													{profile.sectionName || "N/A"}
												</div>
											</div>
											<div className="space-y-2">
												<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
													Strand
												</Label>
												<div className="p-3 text-gray-600 bg-gray-100 rounded-md border border-gray-200 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300">
													{profile.strand || "N/A"}
												</div>
											</div>
											<div className="space-y-2">
												<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
													Track
												</Label>
												<div className="p-3 text-gray-600 bg-gray-100 rounded-md border border-gray-200 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300">
													{profile.track || "N/A"}
												</div>
											</div>
											<div className="space-y-2">
												<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
													School Year
												</Label>
												<div className="p-3 text-gray-600 bg-gray-100 rounded-md border border-gray-200 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300">
													{profile.schoolYear || "N/A"}
												</div>
											</div>
										</div>
									</div>
								)}

								{/* Student-specific sections */}
								{userType === "student" && (
									<>
										{/* Personal Information */}
										<div className="p-4 bg-gray-50 rounded-lg sm:p-6 dark:bg-gray-700">
											<h3 className="flex items-center mb-3 text-base font-semibold text-gray-900 sm:mb-4 sm:text-lg dark:text-white">
												<User className="mr-2 w-4 h-4 text-purple-600 sm:w-5 sm:h-5" />
												Personal Information
											</h3>
											<div className="space-y-3 sm:space-y-4">
												<div className="space-y-2">
													<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
														Religion
													</Label>
													{isEditing ? (
														<Input
															name="religion"
															value={formData.religion}
															onChange={handleInputChange}
															className="w-full"
														/>
													) : (
														<div className="p-3 bg-white rounded-md border border-gray-200 dark:bg-gray-600 dark:border-gray-500">
															{profile.religion || "N/A"}
														</div>
													)}
												</div>
												<div className="space-y-2">
													<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
														Complete Address
													</Label>
													{isEditing ? (
														<Textarea
															name="completeAddress"
															value={formData.completeAddress}
															onChange={handleInputChange}
															className="w-full"
															rows={3}
														/>
													) : (
														<div className="flex items-start p-3 bg-white rounded-md border border-gray-200 dark:bg-gray-600 dark:border-gray-500">
															<MapPin className="flex-shrink-0 mt-1 mr-2 w-4 h-4 text-gray-500" />
															<span>{profile.completeAddress || "N/A"}</span>
														</div>
													)}
												</div>
											</div>
										</div>

										{/* Family Information */}
										<div className="p-4 bg-gray-50 rounded-lg sm:p-6 dark:bg-gray-700">
											<h3 className="flex items-center mb-3 text-base font-semibold text-gray-900 sm:mb-4 sm:text-lg dark:text-white">
												<Users className="mr-2 w-4 h-4 text-orange-600 sm:w-5 sm:h-5" />
												Family Information
											</h3>
											<div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
												<div className="space-y-2">
													<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
														Father's Name
													</Label>
													{isEditing ? (
														<Input
															name="fatherName"
															value={formData.fatherName}
															onChange={handleInputChange}
															className="w-full"
														/>
													) : (
														<div className="p-3 bg-white rounded-md border border-gray-200 dark:bg-gray-600 dark:border-gray-500">
															{profile.fatherName || "N/A"}
														</div>
													)}
												</div>
												<div className="space-y-2">
													<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
														Mother's Name
													</Label>
													{isEditing ? (
														<Input
															name="motherName"
															value={formData.motherName}
															onChange={handleInputChange}
															className="w-full"
														/>
													) : (
														<div className="p-3 bg-white rounded-md border border-gray-200 dark:bg-gray-600 dark:border-gray-500">
															{profile.motherName || "N/A"}
														</div>
													)}
												</div>
												<div className="space-y-2">
													<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
														Guardian's Name
													</Label>
													{isEditing ? (
														<Input
															name="guardianName"
															value={formData.guardianName}
															onChange={handleInputChange}
															className="w-full"
														/>
													) : (
														<div className="p-3 bg-white rounded-md border border-gray-200 dark:bg-gray-600 dark:border-gray-500">
															{profile.guardianName || "N/A"}
														</div>
													)}
												</div>
												<div className="space-y-2">
													<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
														Guardian's Relationship
													</Label>
													{isEditing ? (
														<Input
															name="guardianRelationship"
															value={formData.guardianRelationship}
															onChange={handleInputChange}
															className="w-full"
														/>
													) : (
														<div className="p-3 bg-white rounded-md border border-gray-200 dark:bg-gray-600 dark:border-gray-500">
															{profile.guardianRelationship || "N/A"}
														</div>
													)}
												</div>
											</div>
										</div>
									</>
								)}
							</div>
						) : (
							<div className="py-12 text-center">
								<p className="text-gray-500 dark:text-gray-400">
									No profile data available
								</p>
							</div>
						)}
					</div>

					{/* Sticky Footer - Only show when editing */}
					{isEditing && (
						<div className="flex-shrink-0 p-4 bg-white border-t border-gray-200 dark:border-gray-700 dark:bg-gray-800 sm:p-6">
							<div className="flex justify-end space-x-3">
								<Button
									onClick={handleCancel}
									variant="outline"
									size="sm"
									className="flex items-center px-4 py-2 space-x-2 text-sm"
								>
									<XCircle className="w-4 h-4" />
									<span>Cancel</span>
								</Button>
								<Button
									onClick={handleSave}
									disabled={saving}
									size="sm"
									className="flex items-center px-4 py-2 space-x-2 text-sm text-white bg-green-600 hover:bg-green-700"
								>
									<Save className="w-4 h-4" />
									<span>{saving ? "Saving..." : "Save Changes"}</span>
								</Button>
							</div>
						</div>
					)}
				</div>
			</div>
			{isResetDialogOpen && (
				<div className="flex fixed inset-0 z-50 justify-center items-center">
					{/* Backdrop */}
					<div
						className="absolute inset-0 backdrop-blur-sm bg-black/50"
						onClick={() => setIsResetDialogOpen(false)}
					/>

					{/* Modal */}
					<div className="relative p-6 space-y-6 w-full max-w-md bg-white rounded-lg shadow-xl dark:bg-gray-800">
						{/* Header */}
						<div className="space-y-2">
							<h3 className="text-xl font-semibold text-gray-900 dark:text-white">
								Reset Password Confirmation
							</h3>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Are you sure you want to reset the password for{" "}
								{profile?.firstname} {profile?.lastname}? The password will be
								reset to their lastname.
							</p>
						</div>

						{/* Footer */}
						<div className="flex justify-end space-x-2">
							<Button
								variant="outline"
								onClick={() => setIsResetDialogOpen(false)}
							>
								Cancel
							</Button>
							<Button
								variant="destructive"
								onClick={confirmResetPassword}
								className="flex items-center space-x-2"
							>
								<KeyIcon className="w-4 h-4" />
								<span>Reset Password</span>
							</Button>
						</div>

						{/* Close button */}
						<button
							onClick={() => setIsResetDialogOpen(false)}
							className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 dark:hover:text-gray-400"
						>
							<X className="w-5 h-5" />
						</button>
					</div>
				</div>
			)}
			{isResetPinDialogOpen && (
				<div className="flex fixed inset-0 z-50 justify-center items-center">
					{/* Backdrop */}
					<div
						className="absolute inset-0 backdrop-blur-sm bg-black/50"
						onClick={() => setIsResetPinDialogOpen(false)}
					/>

					{/* Modal */}
					<div className="relative p-6 space-y-6 w-full max-w-md bg-white rounded-lg shadow-xl dark:bg-gray-800">
						{/* Header */}
						<div className="space-y-2">
							<h3 className="text-xl font-semibold text-gray-900 dark:text-white">
								Reset PIN Confirmation
							</h3>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Are you sure you want to reset the PIN for {profile?.firstname}{" "}
								{profile?.lastname}? The PIN will be reset to the last 4 digits
								of their ID ({profile?.id?.slice(-4)}).
							</p>
						</div>

						{/* Footer */}
						<div className="flex justify-end space-x-2">
							<Button
								variant="outline"
								onClick={() => setIsResetPinDialogOpen(false)}
							>
								Cancel
							</Button>
							<Button
								variant="destructive"
								onClick={confirmResetPin}
								className="flex items-center space-x-2"
							>
								<KeyIcon className="w-4 h-4" />
								<span>Reset PIN</span>
							</Button>
						</div>

						{/* Close button */}
						<button
							onClick={() => setIsResetPinDialogOpen(false)}
							className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 dark:hover:text-gray-400"
						>
							<X className="w-5 h-5" />
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
