import React, { useState, useRef } from "react";
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
} from "lucide-react";
import toast from "react-hot-toast";
import { downloadFile } from "../../../utils/teacher";
import { getDecryptedApiUrl } from "../../../utils/apiConfig";

export default function StudentModal({
	isOpen,
	onClose,
	student,
	onFileUpdate,
}) {
	const [uploading, setUploading] = useState(false);
	const [selectedFile, setSelectedFile] = useState(null);
	const fileInputRef = useRef(null);

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
				onClose();
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
							Student Information
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
					{/* Student Basic Info */}
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

					{/* Grade Levels */}
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

					{/* Current Files */}
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

					{/* Upload New File */}
					<div className="space-y-3">
						<Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
							Update SF10 File
						</Label>
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
