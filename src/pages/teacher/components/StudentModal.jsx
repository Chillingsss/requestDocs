import React, { useState, useRef, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
	X,
	Upload,
	Download,
	User,
	Mail,
	GraduationCap,
	BookOpen,
	Trash2,
	CheckSquare,
	Square,
	Users,
} from "lucide-react";
import toast from "react-hot-toast";
import { downloadFile } from "../../../utils/teacher";
import { getDecryptedApiUrl } from "../../../utils/apiConfig";

export default function StudentModal({
	isOpen,
	onClose,
	student,
	onFileUpdate,
	allStudents = [], // Pass selected students for bulk operations
}) {
	const [uploading, setUploading] = useState(false);
	const [selectedFile, setSelectedFile] = useState(null);
	const [uploadMode, setUploadMode] = useState("individual"); // individual, multiple, all
	const [selectedStudents, setSelectedStudents] = useState(new Set());
	const [bulkFiles, setBulkFiles] = useState({});
	const fileInputRef = useRef(null);

	// Auto-set upload mode based on number of students
	useEffect(() => {
		if (allStudents.length === 1) {
			setUploadMode("individual");
		} else if (allStudents.length > 1) {
			setUploadMode("multiple");
			// Auto-select all students when multiple are passed
			setSelectedStudents(new Set(allStudents.map((s) => s.id)));
		}
	}, [allStudents]);

	if (!isOpen || !student) return null;

	const handleFileSelect = (e) => {
		const file = e.target.files[0];
		if (file) {
			// Check if it's an Excel file
			const allowedTypes = [
				"application/vnd.ms-excel",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				".xlsx",
				".xls",
			];

			const fileExtension = file.name.toLowerCase().split(".").pop();
			const isValidType =
				allowedTypes.includes(file.type) ||
				file.name.toLowerCase().endsWith(".xlsx") ||
				file.name.toLowerCase().endsWith(".xls");

			if (!isValidType) {
				toast.error("Please select a valid Excel file (.xlsx or .xls)");
				return;
			}

			// Check file size (max 10MB)
			if (file.size > 10 * 1024 * 1024) {
				toast.error("File size too large. Maximum size is 10MB.");
				return;
			}

			setSelectedFile(file);
		}
	};

	const handleUpload = async () => {
		if (!selectedFile) {
			toast.error("Please select a file first");
			return;
		}

		setUploading(true);

		try {
			const formData = new FormData();
			formData.append("operation", "updateStudentFile");
			formData.append("studentId", student.id);
			formData.append("file", selectedFile);

			// Get the encrypted API URL from session storage
			const apiUrl = getDecryptedApiUrl();

			const response = await fetch(`${apiUrl}/teacher.php`, {
				method: "POST",
				body: formData,
			});

			const result = await response.json();

			if (result.success) {
				toast.success("SF10 file updated successfully");
				onFileUpdate(); // Refresh the parent component
				onClose(); // Close the modal
			} else {
				toast.error(result.error || "Failed to update file");
			}
		} catch (error) {
			console.error("Upload error:", error);
			toast.error("Failed to upload file");
		} finally {
			setUploading(false);
		}
	};

	const handleDownload = async (fileName) => {
		try {
			await downloadFile(fileName);
			toast.success("File downloaded successfully");
		} catch (error) {
			console.error("Download error:", error);
			toast.error("Failed to download file");
		}
	};

	// Selection handlers
	const handleSelectStudent = (studentId) => {
		const newSelected = new Set(selectedStudents);
		if (newSelected.has(studentId)) {
			newSelected.delete(studentId);
		} else {
			newSelected.add(studentId);
		}
		setSelectedStudents(newSelected);
	};

	const handleSelectAll = () => {
		if (selectedStudents.size === allStudents.length) {
			setSelectedStudents(new Set());
		} else {
			const allStudentIds = allStudents.map((s) => s.id);
			setSelectedStudents(new Set(allStudentIds));
		}
	};

	const handleBulkFileSelect = (studentId, file) => {
		if (file) {
			// Validate file type
			const allowedTypes = [
				"application/vnd.ms-excel",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				".xlsx",
				".xls",
			];

			const fileExtension = file.name.toLowerCase().split(".").pop();
			const isValidType =
				allowedTypes.includes(file.type) ||
				file.name.toLowerCase().endsWith(".xlsx") ||
				file.name.toLowerCase().endsWith(".xls");

			if (!isValidType) {
				toast.error("Please select a valid Excel file (.xlsx or .xls)");
				return;
			}

			// Check file size (max 10MB)
			if (file.size > 10 * 1024 * 1024) {
				toast.error("File size too large. Maximum size is 10MB.");
				return;
			}

			setBulkFiles((prev) => ({
				...prev,
				[studentId]: file,
			}));
		}
	};

	const handleBulkUpload = async () => {
		const selectedIds = Array.from(selectedStudents);
		const filesToUpload = selectedIds.filter((id) => bulkFiles[id]);

		if (filesToUpload.length === 0) {
			toast.error("Please select files for at least one student");
			return;
		}

		setUploading(true);

		try {
			const uploadPromises = filesToUpload.map(async (studentId) => {
				const file = bulkFiles[studentId];
				const student = allStudents.find((s) => s.id === studentId);

				const formData = new FormData();
				formData.append("operation", "updateStudentFile");
				formData.append("studentId", studentId);
				formData.append("file", file);

				const apiUrl = getDecryptedApiUrl();
				const response = await fetch(`${apiUrl}/teacher.php`, {
					method: "POST",
					body: formData,
				});

				const result = await response.json();
				return {
					studentId,
					studentName: student
						? `${student.firstname} ${student.lastname}`
						: studentId,
					success: result.success,
					error: result.error,
				};
			});

			const results = await Promise.all(uploadPromises);
			const successful = results.filter((r) => r.success).length;
			const failed = results.filter((r) => !r.success).length;

			if (successful > 0) {
				toast.success(`Successfully uploaded ${successful} files`);
				onFileUpdate(); // Refresh the parent component
				onClose(); // Close the modal
			}
			if (failed > 0) {
				toast.error(`Failed to upload ${failed} files`);
			}

			// Reset states
			setUploadMode("individual");
			setSelectedStudents(new Set());
			setBulkFiles({});
			setSelectedFile(null);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}

			// Refresh data
			onFileUpdate();
		} catch (error) {
			console.error("Bulk upload error:", error);
			toast.error("Failed to upload files");
		} finally {
			setUploading(false);
		}
	};

	return (
		<div className="flex fixed inset-0 z-50 justify-center items-center">
			{/* Backdrop */}
			<div
				className="absolute inset-0 backdrop-blur-sm bg-black/50"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
					<div className="flex gap-3 items-center">
						<User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
						<h2 className="text-xl font-semibold text-slate-900 dark:text-white">
							{allStudents.length > 1
								? `Student Information (${allStudents.length} Selected)`
								: "Student Information"}
						</h2>
					</div>
					<Button
						variant="ghost"
						size="sm"
						onClick={onClose}
						className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
					>
						<X className="w-5 h-5" />
					</Button>
				</div>

				{/* Content */}
				<div className="p-6 space-y-6">
					{/* Student Basic Info - Only show for individual student */}
					{allStudents.length === 1 && (
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
									First Name
								</Label>
								<div className="font-medium text-slate-900 dark:text-white">
									{student.firstname}
								</div>
							</div>
							<div className="space-y-2">
								<Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
									Last Name
								</Label>
								<div className="font-medium text-slate-900 dark:text-white">
									{student.lastname}
								</div>
							</div>
							<div className="space-y-2">
								<Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
									LRN
								</Label>
								<div className="font-medium text-slate-900 dark:text-white">
									{student.lrn || "N/A"}
								</div>
							</div>
							<div className="space-y-2">
								<Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
									Email
								</Label>
								<div className="flex gap-2 items-center text-slate-900 dark:text-white">
									<Mail className="w-4 h-4 text-slate-500" />
									{student.email}
								</div>
							</div>
							<div className="space-y-2">
								<Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
									Section
								</Label>
								<div className="flex gap-2 items-center">
									<BookOpen className="w-4 h-4 text-slate-500" />
									<span className="inline-flex px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full dark:text-blue-200 dark:bg-blue-900">
										{student.sectionName || "N/A"}
									</span>
								</div>
							</div>
						</div>
					)}

					{/* Multiple Students Summary */}
					{allStudents.length > 1 && (
						<div className="space-y-3">
							<Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
								Selected Students Summary
							</Label>
							<div className="grid grid-cols-1 gap-2 md:grid-cols-2">
								<div className="space-y-2">
									<Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
										Total Students
									</Label>
									<div className="font-medium text-slate-900 dark:text-white">
										{allStudents.length} students
									</div>
								</div>
								<div className="space-y-2">
									<Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
										Sections
									</Label>
									<div className="flex flex-wrap gap-1">
										{[...new Set(allStudents.map((s) => s.sectionName))].map(
											(section, idx) => (
												<span
													key={idx}
													className="inline-flex px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full dark:text-blue-200 dark:bg-blue-900"
												>
													{section || "N/A"}
												</span>
											)
										)}
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Grade Levels - Only show for individual student */}
					{allStudents.length === 1 && (
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
									Section Grade Level
								</Label>
								<div className="flex gap-2 items-center">
									<GraduationCap className="w-4 h-4 text-green-500" />
									<span className="inline-flex px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full dark:text-green-200 dark:bg-green-900">
										{student.sectionGradeLevel || "N/A"}
									</span>
								</div>
							</div>
						</div>
					)}

					{/* Current Files - Only show for individual student */}
					{allStudents.length === 1 && (
						<div className="space-y-3">
							<Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
								Current SF10 Files
							</Label>
							{student.files && student.files.length > 0 ? (
								<div className="space-y-2">
									{student.files.map((file, index) => (
										<div
											key={index}
											className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-700"
										>
											<div className="flex-1">
												<div className="text-sm font-medium text-slate-900 dark:text-white">
													{file.sfType}
												</div>
												<div className="text-xs text-slate-500 dark:text-slate-400">
													{file.fileName}
												</div>
											</div>
											<Button
												size="sm"
												variant="outline"
												onClick={() => handleDownload(file.fileName)}
												className="flex gap-1 items-center"
											>
												<Download className="w-3 h-3" />
												Download
											</Button>
										</div>
									))}
								</div>
							) : (
								<div className="text-sm italic text-slate-500 dark:text-slate-400">
									No SF10 files uploaded yet
								</div>
							)}
						</div>
					)}

					{/* Upload New File */}
					<div className="space-y-3">
						<Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
							Update SF10 File
						</Label>

						{/* Upload Mode Selection */}
						<div className="flex gap-2 mb-4">
							{allStudents.length === 1 && (
								<Button
									variant={uploadMode === "individual" ? "default" : "outline"}
									size="sm"
									onClick={() => setUploadMode("individual")}
									disabled={uploading}
								>
									<User className="mr-1 w-4 h-4" />
									Individual
								</Button>
							)}
							{allStudents.length > 1 && (
								<Button
									variant={uploadMode === "multiple" ? "default" : "outline"}
									size="sm"
									onClick={() => setUploadMode("multiple")}
									disabled={uploading}
								>
									<Users className="mr-1 w-4 h-4" />
									Selected Students ({allStudents.length})
								</Button>
							)}
						</div>

						{/* Individual Upload Mode */}
						{uploadMode === "individual" && (
							<div className="space-y-3">
								<div className="flex gap-3 items-center">
									<Input
										type="file"
										accept=".xlsx,.xls"
										onChange={handleFileSelect}
										className="flex-1 border-slate-300 dark:border-slate-700"
										disabled={uploading}
										ref={fileInputRef}
									/>
									{selectedFile && (
										<button
											onClick={() => {
												setSelectedFile(null);
												fileInputRef.current.value = ""; // Clear file input value
											}}
											disabled={uploading}
											className="p-1 text-red-600 rounded hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
										>
											<X className="w-4 h-4" />
										</button>
									)}
									<Button
										onClick={handleUpload}
										disabled={!selectedFile || uploading}
										className="flex gap-2 items-center text-white bg-blue-600 hover:bg-blue-700"
									>
										{uploading ? (
											<>
												<div className="w-4 h-4 rounded-full border-b-2 border-white animate-spin"></div>
												Uploading...
											</>
										) : (
											<>
												<Upload className="w-4 h-4" />
												Upload
											</>
										)}
									</Button>
								</div>
								{selectedFile && (
									<div className="text-sm text-slate-600 dark:text-slate-400">
										Selected: {selectedFile.name}
									</div>
								)}
							</div>
						)}

						{/* Multiple/Select All Upload Mode */}
						{(uploadMode === "multiple" || uploadMode === "all") && (
							<div className="space-y-4">
								{/* Selection Controls */}
								<div className="flex gap-4 items-center">
									<div className="flex gap-2 items-center">
										<span className="text-sm text-slate-600 dark:text-slate-400">
											Selected Students ({selectedStudents.size}/
											{allStudents.length})
										</span>
									</div>
									{selectedStudents.size > 0 && (
										<Button
											variant="outline"
											size="sm"
											onClick={() => {
												setSelectedStudents(new Set());
												setBulkFiles({});
											}}
											className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
										>
											Clear Selection
										</Button>
									)}
								</div>

								{/* Student List with File Selection */}
								<div className="overflow-y-auto max-h-60 rounded-lg border border-slate-200 dark:border-slate-700">
									{allStudents.map((s) => (
										<div
											key={s.id}
											className={`flex items-center gap-3 p-3 border-b border-slate-100 dark:border-slate-700 ${
												selectedStudents.has(s.id)
													? "bg-blue-50 dark:bg-blue-900/20"
													: ""
											}`}
										>
											<input
												type="checkbox"
												checked={selectedStudents.has(s.id)}
												onChange={() => handleSelectStudent(s.id)}
												className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
											/>
											<div className="flex-1">
												<div className="text-sm font-medium text-slate-900 dark:text-white">
													{s.firstname} {s.lastname}
												</div>
												<div className="text-xs text-slate-500 dark:text-slate-400">
													{s.sectionName}
												</div>
											</div>
											{selectedStudents.has(s.id) && (
												<div className="flex gap-2 items-center">
													<input
														type="file"
														accept=".xlsx,.xls"
														onChange={(e) =>
															handleBulkFileSelect(s.id, e.target.files[0])
														}
														className="hidden"
														id={`bulk-file-${s.id}`}
													/>
													<Button
														size="sm"
														variant="outline"
														onClick={() =>
															document
																.getElementById(`bulk-file-${s.id}`)
																.click()
														}
														className={`p-1 w-6 h-6 ${
															bulkFiles[s.id]
																? "bg-green-100 text-green-600 border-green-300 dark:bg-green-900 dark:text-green-400 dark:border-green-700"
																: ""
														}`}
														title={
															bulkFiles[s.id]
																? `Selected: ${bulkFiles[s.id].name}`
																: "Upload file"
														}
													>
														<Upload className="w-3 h-3" />
													</Button>
													{bulkFiles[s.id] && (
														<span className="text-xs text-green-600 dark:text-green-400">
															✓
														</span>
													)}
												</div>
											)}
										</div>
									))}
								</div>

								{/* Bulk Upload Button */}
								{selectedStudents.size > 0 && (
									<Button
										onClick={handleBulkUpload}
										disabled={uploading || Object.keys(bulkFiles).length === 0}
										className="flex gap-2 items-center text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
									>
										{uploading ? (
											<>
												<div className="w-4 h-4 rounded-full border-b-2 border-white animate-spin"></div>
												Uploading...
											</>
										) : (
											<>
												<Upload className="w-4 h-4" />
												Upload {Object.keys(bulkFiles).length} Files
											</>
										)}
									</Button>
								)}
							</div>
						)}
					</div>
				</div>

				{/* Footer */}
				<div className="flex gap-3 justify-end p-6 border-t border-slate-200 dark:border-slate-700">
					<Button variant="outline" onClick={onClose} disabled={uploading}>
						Close
					</Button>
				</div>
			</div>
		</div>
	);
}
