import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
	X,
	User,
	Mail,
	Calendar,
	MapPin,
	Users,
	GraduationCap,
} from "lucide-react";
import toast from "react-hot-toast";
import {
	getStrands,
	getSection,
	getSchoolYear,
	getGradeLevels,
	getSectionsByGradeLevel,
} from "../utils/registrar";

export default function EditStudentModal({
	isOpen,
	onClose,
	student,
	onSuccess,
	userId,
}) {
	const [loading, setLoading] = useState(false);
	const [loadingSections, setLoadingSections] = useState(false);
	const [strands, setStrands] = useState([]);
	const [sections, setSections] = useState([]);
	const [filteredSections, setFilteredSections] = useState([]);
	const [schoolYears, setSchoolYears] = useState([]);
	const [gradeLevels, setGradeLevels] = useState([]);
	const [formData, setFormData] = useState({
		firstname: "",
		middlename: "",
		lastname: "",
		lrn: "",
		email: "",
		birthDate: "",
		age: "",
		religion: "",
		completeAddress: "",
		fatherName: "",
		motherName: "",
		guardianName: "",
		guardianRelationship: "",
		contactNo: "",
		birthPlace: "",
		strandId: "",
		sectionId: "",
		schoolyearId: "",
		gradeLevelId: "",
	});

	// Load data when modal opens
	useEffect(() => {
		if (isOpen) {
			fetchStrands();
			fetchSections();
			fetchSchoolYears();
			fetchGradeLevels();
		}
	}, [isOpen]);

	// Populate form when student data changes
	useEffect(() => {
		if (student) {
			setFormData({
				firstname: student.firstname || "",
				middlename: student.middlename || "",
				lastname: student.lastname || "",
				lrn: student.lrn || "",
				email: student.email || "",
				birthDate: student.birthDate || "",
				age: student.age || "",
				religion: student.religion || "",
				completeAddress: student.completeAddress || "",
				fatherName: student.fatherName || "",
				motherName: student.motherName || "",
				guardianName: student.guardianName || "",
				guardianRelationship: student.guardianRelationship || "",
				contactNo: student.contactNo || "",
				birthPlace: student.birthPlace || "",
				strandId: student.strandId || "",
				sectionId: student.sectionId || "",
				schoolyearId: student.schoolyearId || "",
				gradeLevelId: student.gradeLevelId || "",
			});

			// If student has a grade level, fetch sections for that grade level
			if (student.gradeLevelId) {
				fetchSectionsByGradeLevel(student.gradeLevelId);
			}
		}
	}, [student]);

	const fetchStrands = async () => {
		try {
			const data = await getStrands();
			let strandsArray = data;
			if (typeof data === "string") {
				try {
					strandsArray = JSON.parse(data);
				} catch (e) {
					strandsArray = [];
				}
			}
			setStrands(Array.isArray(strandsArray) ? strandsArray : []);
		} catch (error) {
			console.error("Error fetching strands:", error);
		}
	};

	const fetchSections = async () => {
		try {
			const data = await getSection();
			let sectionsArray = data;
			if (typeof data === "string") {
				try {
					sectionsArray = JSON.parse(data);
				} catch (e) {
					sectionsArray = [];
				}
			}
			setSections(Array.isArray(sectionsArray) ? sectionsArray : []);
		} catch (error) {
			console.error("Error fetching sections:", error);
		}
	};

	const fetchSchoolYears = async () => {
		try {
			const data = await getSchoolYear();
			let schoolYearsArray = data;
			if (typeof data === "string") {
				try {
					schoolYearsArray = JSON.parse(data);
				} catch (e) {
					schoolYearsArray = [];
				}
			}
			setSchoolYears(Array.isArray(schoolYearsArray) ? schoolYearsArray : []);
		} catch (error) {
			console.error("Error fetching school years:", error);
		}
	};

	const fetchGradeLevels = async () => {
		try {
			const data = await getGradeLevels();
			let gradeLevelsArray = data;
			if (typeof data === "string") {
				try {
					gradeLevelsArray = JSON.parse(data);
				} catch (e) {
					gradeLevelsArray = [];
				}
			}
			setGradeLevels(Array.isArray(gradeLevelsArray) ? gradeLevelsArray : []);
		} catch (error) {
			console.error("Error fetching grade levels:", error);
		}
	};

	const fetchSectionsByGradeLevel = async (gradeLevelId) => {
		if (!gradeLevelId) {
			setFilteredSections([]);
			return;
		}

		setLoadingSections(true);
		try {
			const data = await getSectionsByGradeLevel(gradeLevelId);
			let sectionsArray = data;
			if (typeof data === "string") {
				try {
					sectionsArray = JSON.parse(data);
				} catch (e) {
					sectionsArray = [];
				}
			}
			setFilteredSections(Array.isArray(sectionsArray) ? sectionsArray : []);
		} catch (error) {
			console.error("Error fetching sections by grade level:", error);
			setFilteredSections([]);
		} finally {
			setLoadingSections(false);
		}
	};

	const handleInputChange = (field, value) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));

		// If grade level changes, fetch sections for that grade level and clear section selection
		if (field === "gradeLevelId") {
			fetchSectionsByGradeLevel(value);
			// Clear section selection when grade level changes
			setFormData((prev) => ({
				...prev,
				sectionId: "",
			}));
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			// Import the update function
			const { updateStudent } = await import("../utils/registrar");

			const result = await updateStudent(student.id, formData, userId);

			if (result.success) {
				toast.success("Student information updated successfully!");
				onSuccess();
				onClose();
			} else {
				toast.error(result.error || "Failed to update student information");
			}
		} catch (error) {
			console.error("Error updating student:", error);
			toast.error("Failed to update student information");
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="flex fixed inset-0 z-50 justify-center items-center">
			<div className="fixed inset-0 bg-black/50" onClick={onClose} />
			<div className="relative w-full max-w-4xl max-h-[90vh] mx-4 bg-white rounded-lg shadow-xl dark:bg-slate-800 overflow-hidden">
				{/* Header */}
				<div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
					<div className="flex gap-3 items-center">
						<div className="flex justify-center items-center w-10 h-10 bg-blue-100 rounded-lg dark:bg-blue-900">
							<User className="w-5 h-5 text-blue-600 dark:text-blue-300" />
						</div>
						<div>
							<h2 className="text-xl font-semibold text-slate-900 dark:text-white">
								Edit Student Information
							</h2>
							<p className="text-sm text-slate-500 dark:text-slate-400">
								Update student details and information
							</p>
						</div>
					</div>
					<Button
						variant="ghost"
						size="sm"
						onClick={onClose}
						className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
					>
						<X className="w-5 h-5" />
					</Button>
				</div>

				{/* Content */}
				<div className="overflow-y-auto max-h-[calc(90vh-140px)]">
					<form onSubmit={handleSubmit} className="p-6 space-y-6">
						{/* Personal Information */}
						<div className="space-y-4">
							<h3 className="flex gap-2 items-center text-lg font-medium text-slate-900 dark:text-white">
								<User className="w-5 h-5" />
								Personal Information
							</h3>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
								<div>
									<Label htmlFor="firstname">First Name *</Label>
									<Input
										id="firstname"
										value={formData.firstname}
										onChange={(e) =>
											handleInputChange("firstname", e.target.value)
										}
										required
										className="mt-1"
									/>
								</div>
								<div>
									<Label htmlFor="middlename">Middle Name</Label>
									<Input
										id="middlename"
										value={formData.middlename}
										onChange={(e) =>
											handleInputChange("middlename", e.target.value)
										}
										className="mt-1"
									/>
								</div>
								<div>
									<Label htmlFor="lastname">Last Name *</Label>
									<Input
										id="lastname"
										value={formData.lastname}
										onChange={(e) =>
											handleInputChange("lastname", e.target.value)
										}
										required
										className="mt-1"
									/>
								</div>
								<div>
									<Label htmlFor="lrn">LRN *</Label>
									<Input
										id="lrn"
										value={formData.lrn}
										onChange={(e) => handleInputChange("lrn", e.target.value)}
										required
										className="mt-1"
									/>
								</div>
								<div>
									<Label htmlFor="email">Email *</Label>
									<Input
										id="email"
										type="email"
										value={formData.email}
										onChange={(e) => handleInputChange("email", e.target.value)}
										required
										className="mt-1"
									/>
								</div>
								<div>
									<Label htmlFor="contactNo">Contact Number</Label>
									<Input
										id="contactNo"
										value={formData.contactNo}
										onChange={(e) =>
											handleInputChange("contactNo", e.target.value)
										}
										className="mt-1"
									/>
								</div>
							</div>
						</div>

						{/* Academic Information */}
						<div className="space-y-4">
							<h3 className="flex gap-2 items-center text-lg font-medium text-slate-900 dark:text-white">
								<GraduationCap className="w-5 h-5" />
								Academic Information
							</h3>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
								<div>
									<Label htmlFor="gradeLevelId">Grade Level *</Label>
									<select
										id="gradeLevelId"
										value={formData.gradeLevelId}
										onChange={(e) =>
											handleInputChange("gradeLevelId", e.target.value)
										}
										required
										className="px-3 py-2 mt-1 w-full text-sm bg-white rounded-md border border-slate-300 dark:bg-slate-800 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
									>
										<option value="">Select Grade Level</option>
										{gradeLevels.map((gradeLevel) => (
											<option key={gradeLevel.id} value={gradeLevel.id}>
												{gradeLevel.name}
											</option>
										))}
									</select>
								</div>
								<div>
									<Label htmlFor="strandId">Strand *</Label>
									<select
										id="strandId"
										value={formData.strandId}
										onChange={(e) =>
											handleInputChange("strandId", e.target.value)
										}
										required
										className="px-3 py-2 mt-1 w-full text-sm bg-white rounded-md border border-slate-300 dark:bg-slate-800 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
									>
										<option value="">Select Strand</option>
										{strands.map((strand) => (
											<option key={strand.id} value={strand.id}>
												{strand.name} ({strand.trackName})
											</option>
										))}
									</select>
								</div>
								<div>
									<Label htmlFor="sectionId">Section</Label>
									<select
										id="sectionId"
										value={formData.sectionId}
										onChange={(e) =>
											handleInputChange("sectionId", e.target.value)
										}
										disabled={loadingSections}
										className="px-3 py-2 mt-1 w-full text-sm bg-white rounded-md border border-slate-300 dark:bg-slate-800 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
									>
										<option value="">
											{loadingSections
												? "Loading sections..."
												: filteredSections.length === 0 && formData.gradeLevelId
												? "No sections available for this grade level"
												: "Select Section"}
										</option>
										{filteredSections.map((section) => (
											<option key={section.id} value={section.id}>
												{section.name}
											</option>
										))}
									</select>
								</div>
								<div>
									<Label htmlFor="schoolyearId">School Year *</Label>
									<select
										id="schoolyearId"
										value={formData.schoolyearId}
										onChange={(e) =>
											handleInputChange("schoolyearId", e.target.value)
										}
										required
										className="px-3 py-2 mt-1 w-full text-sm bg-white rounded-md border border-slate-300 dark:bg-slate-800 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
									>
										<option value="">Select School Year</option>
										{schoolYears.map((schoolYear) => (
											<option key={schoolYear.id} value={schoolYear.id}>
												{schoolYear.year}
											</option>
										))}
									</select>
								</div>
							</div>
						</div>

						{/* Personal Details */}
						<div className="space-y-4">
							<h3 className="flex gap-2 items-center text-lg font-medium text-slate-900 dark:text-white">
								<Calendar className="w-5 h-5" />
								Personal Details
							</h3>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
								<div>
									<Label htmlFor="birthDate">Birth Date</Label>
									<Input
										id="birthDate"
										type="date"
										value={formData.birthDate}
										onChange={(e) =>
											handleInputChange("birthDate", e.target.value)
										}
										className="mt-1"
									/>
								</div>
								<div>
									<Label htmlFor="age">Age</Label>
									<Input
										id="age"
										type="number"
										value={formData.age}
										onChange={(e) => handleInputChange("age", e.target.value)}
										className="mt-1"
									/>
								</div>
								<div>
									<Label htmlFor="religion">Religion</Label>
									<Input
										id="religion"
										value={formData.religion}
										onChange={(e) =>
											handleInputChange("religion", e.target.value)
										}
										className="mt-1"
									/>
								</div>
								<div>
									<Label htmlFor="birthPlace">Birth Place</Label>
									<Input
										id="birthPlace"
										value={formData.birthPlace}
										onChange={(e) =>
											handleInputChange("birthPlace", e.target.value)
										}
										className="mt-1"
									/>
								</div>
							</div>
							<div>
								<Label htmlFor="completeAddress">Complete Address</Label>
								<Textarea
									id="completeAddress"
									value={formData.completeAddress}
									onChange={(e) =>
										handleInputChange("completeAddress", e.target.value)
									}
									rows={3}
									className="mt-1"
								/>
							</div>
						</div>

						{/* Family Information */}
						<div className="space-y-4">
							<h3 className="flex gap-2 items-center text-lg font-medium text-slate-900 dark:text-white">
								<Users className="w-5 h-5" />
								Family Information
							</h3>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div>
									<Label htmlFor="fatherName">Father's Name</Label>
									<Input
										id="fatherName"
										value={formData.fatherName}
										onChange={(e) =>
											handleInputChange("fatherName", e.target.value)
										}
										className="mt-1"
									/>
								</div>
								<div>
									<Label htmlFor="motherName">Mother's Name</Label>
									<Input
										id="motherName"
										value={formData.motherName}
										onChange={(e) =>
											handleInputChange("motherName", e.target.value)
										}
										className="mt-1"
									/>
								</div>
								<div>
									<Label htmlFor="guardianName">Guardian's Name</Label>
									<Input
										id="guardianName"
										value={formData.guardianName}
										onChange={(e) =>
											handleInputChange("guardianName", e.target.value)
										}
										className="mt-1"
									/>
								</div>
								<div>
									<Label htmlFor="guardianRelationship">
										Guardian Relationship
									</Label>
									<Input
										id="guardianRelationship"
										value={formData.guardianRelationship}
										onChange={(e) =>
											handleInputChange("guardianRelationship", e.target.value)
										}
										className="mt-1"
									/>
								</div>
							</div>
						</div>

						{/* Action Buttons */}
						<div className="flex gap-3 justify-end pt-6 border-t border-slate-200 dark:border-slate-700">
							<Button
								type="button"
								variant="outline"
								onClick={onClose}
								disabled={loading}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={loading}
								className="text-white bg-blue-600 hover:bg-blue-700"
							>
								{loading ? "Updating..." : "Update Student"}
							</Button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
