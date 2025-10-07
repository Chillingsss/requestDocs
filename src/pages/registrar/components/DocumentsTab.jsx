import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
	Filter,
	ChevronLeft,
	ChevronRight,
	FileText,
	Download,
	Eye,
	Upload,
	GraduationCap,
	FileSpreadsheet,
	File,
} from "lucide-react";
import toast from "react-hot-toast";
import { getAllStudentFiles } from "../../../utils/registrar";
import { getDecryptedApiUrl } from "../../../utils/apiConfig";
import DocumentUpload from "./DocumentUpload";

export default function DocumentsTab() {
	const [documents, setDocuments] = useState([]);
	const [filteredDocuments, setFilteredDocuments] = useState([]);
	const [documentsLoading, setDocumentsLoading] = useState(true);
	const [showUploadModal, setShowUploadModal] = useState(false);

	// Pagination state
	const [currentPage, setCurrentPage] = useState(1);
	const [documentsPerPage] = useState(10);

	// Filter state
	const [selectedDocumentType, setSelectedDocumentType] = useState("");
	const [selectedTrack, setSelectedTrack] = useState("");
	const [selectedGradeLevel, setSelectedGradeLevel] = useState("");
	const [searchTerm, setSearchTerm] = useState("");

	// Get unique document types, tracks, and grade levels for filters
	const documentTypes = [
		...new Set(
			documents.flatMap((student) =>
				student.files.map((file) => file.documentType)
			)
		),
	];
	const tracks = [
		...new Set(documents.map((student) => student.track).filter(Boolean)),
	];

	// Get unique grade levels using Map to avoid duplicates
	const gradeLevelsMap = new Map();
	documents.forEach((student) => {
		if (student.gradeLevelId) {
			gradeLevelsMap.set(student.gradeLevelId, {
				id: student.gradeLevelId,
				name: student.gradeLevelName || `Grade ${student.gradeLevelId}`,
			});
		}
	});
	const gradeLevels = Array.from(gradeLevelsMap.values());

	// Fetch documents when component mounts
	useEffect(() => {
		fetchDocuments();
	}, []);

	// Apply filters when documents or filter states change
	useEffect(() => {
		applyFilters();
	}, [
		documents,
		selectedDocumentType,
		selectedTrack,
		selectedGradeLevel,
		searchTerm,
	]);

	// Reset to page 1 when filters change
	useEffect(() => {
		setCurrentPage(1);
	}, [selectedDocumentType, selectedTrack, selectedGradeLevel, searchTerm]);

	const fetchDocuments = async () => {
		setDocumentsLoading(true);
		try {
			const data = await getAllStudentFiles();
			console.log("Student files data:", data);
			let filesArray = data;
			if (typeof data === "string") {
				try {
					filesArray = JSON.parse(data);
				} catch (e) {
					filesArray = [];
				}
			}
			setDocuments(Array.isArray(filesArray) ? filesArray : []);
		} catch (error) {
			console.error("Error fetching student files:", error);
			toast.error("Failed to load student files");
		} finally {
			setDocumentsLoading(false);
		}
	};

	const applyFilters = () => {
		let filtered = [...documents];

		// Apply document type filter
		if (selectedDocumentType && selectedDocumentType !== "") {
			filtered = filtered.filter((student) =>
				student.files.some((file) => file.documentType === selectedDocumentType)
			);
		}

		// Apply track filter
		if (selectedTrack && selectedTrack !== "") {
			filtered = filtered.filter((student) => student.track === selectedTrack);
		}

		// Apply grade level filter
		if (selectedGradeLevel && selectedGradeLevel !== "") {
			filtered = filtered.filter(
				(student) => student.gradeLevelId == selectedGradeLevel
			);
		}

		// Apply search term filter
		if (searchTerm && searchTerm.trim() !== "") {
			const searchLower = searchTerm.toLowerCase();
			filtered = filtered.filter(
				(student) =>
					student.firstname?.toLowerCase().includes(searchLower) ||
					student.lastname?.toLowerCase().includes(searchLower) ||
					student.middlename?.toLowerCase().includes(searchLower) ||
					student.lrn?.toLowerCase().includes(searchLower) ||
					student.files.some(
						(file) =>
							file.fileName?.toLowerCase().includes(searchLower) ||
							file.documentType?.toLowerCase().includes(searchLower)
					) ||
					(student.gradeLevelName || `Grade ${student.gradeLevelId}`)
						?.toLowerCase()
						.includes(searchLower)
			);
		}

		setFilteredDocuments(filtered);
	};

	const handleDownload = (fileName) => {
		console.log("Download clicked for:", fileName);
		try {
			const apiUrl = getDecryptedApiUrl();
			console.log("API URL:", apiUrl);
			const downloadUrl = `${apiUrl}/documents/${fileName}`;
			console.log("Download URL:", downloadUrl);
			window.open(downloadUrl, "_blank");
		} catch (error) {
			console.error("Download error:", error);
			toast.error("Failed to download document");
		}
	};

	const handleView = (fileName) => {
		console.log("View clicked for:", fileName);
		try {
			const apiUrl = getDecryptedApiUrl();
			console.log("API URL:", apiUrl);
			const viewUrl = `${apiUrl}/documents/${fileName}`;
			console.log("View URL:", viewUrl);
			window.open(viewUrl, "_blank");
		} catch (error) {
			console.error("View error:", error);
			toast.error("Failed to view document");
		}
	};

	// Generate page numbers for pagination
	const getPageNumbers = () => {
		const pageNumbers = [];
		const maxPagesToShow = 5;

		if (totalPages <= maxPagesToShow) {
			for (let i = 1; i <= totalPages; i++) {
				pageNumbers.push(i);
			}
		} else {
			if (currentPage <= 3) {
				for (let i = 1; i <= 4; i++) {
					pageNumbers.push(i);
				}
				pageNumbers.push("...");
				pageNumbers.push(totalPages);
			} else if (currentPage >= totalPages - 2) {
				pageNumbers.push(1);
				pageNumbers.push("...");
				for (let i = totalPages - 3; i <= totalPages; i++) {
					pageNumbers.push(i);
				}
			} else {
				pageNumbers.push(1);
				pageNumbers.push("...");
				for (let i = currentPage - 1; i <= currentPage + 1; i++) {
					pageNumbers.push(i);
				}
				pageNumbers.push("...");
				pageNumbers.push(totalPages);
			}
		}

		return pageNumbers;
	};

	const handleUploadSuccess = () => {
		fetchDocuments(); // Refresh the documents list
		setShowUploadModal(false);
	};

	// Function to get file icon based on file type
	const getFileIcon = (documentType) => {
		switch (documentType) {
			case "Excel File":
				return <FileSpreadsheet className="w-4 h-4 text-green-600" />;
			case "PDF File":
				return <FileText className="w-4 h-4 text-red-600" />;
			default:
				return <File className="w-4 h-4 text-slate-500" />;
		}
	};

	// Function to get source badge
	const getSourceBadge = (sourceTable) => {
		switch (sourceTable) {
			case "sfrecord":
				return (
					<span className="inline-flex px-1.5 py-0.5 text-xs font-medium text-blue-800 bg-blue-100 rounded dark:text-blue-300 dark:bg-blue-900/20">
						SF10
					</span>
				);
			case "studentdocument":
				return (
					<span className="inline-flex px-1.5 py-0.5 text-xs font-medium text-purple-800 bg-purple-100 rounded dark:text-purple-300 dark:bg-purple-900/20">
						PDF
					</span>
				);
			default:
				return null;
		}
	};

	// Calculate pagination
	const indexOfLastDocument = currentPage * documentsPerPage;
	const indexOfFirstDocument = indexOfLastDocument - documentsPerPage;
	const currentDocuments = filteredDocuments.slice(
		indexOfFirstDocument,
		indexOfLastDocument
	);
	const totalPages = Math.ceil(filteredDocuments.length / documentsPerPage);

	// Handle pagination
	const handlePageChange = (pageNumber) => {
		setCurrentPage(pageNumber);
	};

	const handlePrevPage = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
		}
	};

	const handleNextPage = () => {
		if (currentPage < totalPages) {
			setCurrentPage(currentPage + 1);
		}
	};

	return (
		<>
			<Card className="dark:bg-slate-800 dark:border-slate-700">
				<CardContent className="p-4 lg:p-6">
					<div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
						<div className="text-lg font-semibold text-slate-900 dark:text-white">
							Student Files ({filteredDocuments.length})
						</div>
						<Button
							onClick={() => setShowUploadModal(true)}
							className="flex gap-2 items-center text-white bg-green-600 hover:bg-green-700"
						>
							<Upload className="w-4 h-4" /> Upload Documents
						</Button>
					</div>

					{/* Filter Controls */}
					<div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center">
						{/* Search Input */}
						<div className="flex gap-2 items-center">
							<input
								type="text"
								placeholder="Search by name, LRN, file name, or document type..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="px-3 py-2 text-sm bg-white dark:bg-slate-800 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white min-w-[250px]"
							/>
						</div>

						{/* Document Type Filter */}
						<div className="flex gap-2 items-center">
							<Filter className="w-4 h-4 text-slate-500 dark:text-slate-400" />
							<select
								value={selectedDocumentType}
								onChange={(e) => setSelectedDocumentType(e.target.value)}
								className="px-3 py-2 text-sm bg-white rounded-md border dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
							>
								<option value="">All Document Types</option>
								{documentTypes.map((type) => (
									<option key={type} value={type}>
										{type}
									</option>
								))}
							</select>
						</div>

						{/* Track Filter */}
						<div className="flex gap-2 items-center">
							<select
								value={selectedTrack}
								onChange={(e) => setSelectedTrack(e.target.value)}
								className="px-3 py-2 text-sm bg-white rounded-md border dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
							>
								<option value="">All Tracks</option>
								{tracks.map((track) => (
									<option key={track} value={track}>
										{track}
									</option>
								))}
							</select>
						</div>

						{/* Grade Level Filter */}
						<div className="flex gap-2 items-center">
							<GraduationCap className="w-4 h-4 text-slate-500 dark:text-slate-400" />
							<select
								value={selectedGradeLevel}
								onChange={(e) => setSelectedGradeLevel(e.target.value)}
								className="px-3 py-2 text-sm bg-white rounded-md border dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
							>
								<option value="">All Grade Levels</option>
								{gradeLevels.map((level) => (
									<option key={level.id} value={level.id}>
										{level.name}
									</option>
								))}
							</select>
						</div>
					</div>

					{/* Active Filters Display */}
					{(selectedDocumentType ||
						selectedTrack ||
						selectedGradeLevel ||
						searchTerm) && (
						<div className="flex flex-wrap gap-2 mb-4 text-sm text-slate-600 dark:text-slate-400">
							<span>Active filters:</span>
							{selectedDocumentType && (
								<span className="px-2 py-1 text-blue-800 bg-blue-100 rounded dark:text-blue-300 dark:bg-blue-900/20">
									Type: {selectedDocumentType}
								</span>
							)}
							{selectedTrack && (
								<span className="px-2 py-1 text-green-800 bg-green-100 rounded dark:text-green-300 dark:bg-green-900/20">
									Track: {selectedTrack}
								</span>
							)}
							{selectedGradeLevel && (
								<span className="px-2 py-1 text-purple-800 bg-purple-100 rounded dark:text-purple-300 dark:bg-purple-900/20">
									Grade:{" "}
									{gradeLevels.find((level) => level.id == selectedGradeLevel)
										?.name || `Grade ${selectedGradeLevel}`}
								</span>
							)}
							{searchTerm && (
								<span className="px-2 py-1 text-purple-800 bg-purple-100 rounded dark:text-purple-300 dark:bg-purple-900/20">
									Search: "{searchTerm}"
								</span>
							)}
						</div>
					)}

					{documentsLoading ? (
						<div className="py-6 text-center lg:py-8">
							<p className="text-sm text-slate-500 dark:text-slate-400 lg:text-base">
								Loading student files...
							</p>
						</div>
					) : filteredDocuments.length === 0 ? (
						<div className="py-6 text-center lg:py-8">
							<p className="text-sm text-slate-500 dark:text-slate-400 lg:text-base">
								{documents.length === 0
									? "No student files found in the system."
									: "No files match the current filters."}
							</p>
						</div>
					) : (
						<>
							{/* Pagination Info */}
							<div className="mb-4 text-sm text-slate-600 dark:text-slate-400">
								Showing {indexOfFirstDocument + 1} to{" "}
								{Math.min(indexOfLastDocument, filteredDocuments.length)} of{" "}
								{filteredDocuments.length} files
								{totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
							</div>

							{/* Documents Table */}
							<div className="overflow-x-auto -mx-4 mb-6 lg:mx-0">
								<table className="min-w-full text-xs lg:text-sm text-slate-700 dark:text-slate-300">
									<thead>
										<tr className="border-b border-slate-200 dark:border-slate-700">
											<th className="px-3 py-2 font-semibold text-left lg:px-4">
												Student Name
											</th>
											<th className="px-3 py-2 font-semibold text-left lg:px-4">
												LRN
											</th>
											<th className="hidden px-3 py-2 font-semibold text-left lg:px-4 sm:table-cell">
												Track/Strand
											</th>
											<th className="px-3 py-2 font-semibold text-left lg:px-4">
												Grade Level
											</th>
											<th className="px-3 py-2 font-semibold text-left lg:px-4">
												Files (
												{filteredDocuments.reduce(
													(total, student) => total + student.files.length,
													0
												)}
												)
											</th>
										</tr>
									</thead>
									<tbody>
										{currentDocuments.map((student, index) => (
											<React.Fragment key={`${student.studentId}-${index}`}>
												{/* Main student row */}
												<tr className="border-b transition-colors border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
													<td className="px-3 py-3 lg:px-4 lg:py-2">
														<div className="flex gap-2 items-center">
															<div className="font-medium dark:text-white">
																{`${student.firstname} ${
																	student.middlename
																		? student.middlename + " "
																		: ""
																}${student.lastname}`}
															</div>
															{student.files.length > 1 && (
																<span className="inline-flex px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full dark:text-blue-300 dark:bg-blue-900/20">
																	{student.files.length} files
																</span>
															)}
														</div>
													</td>
													<td className="px-3 py-3 lg:px-4 lg:py-2 dark:text-white">
														{student.lrn || "N/A"}
													</td>
													<td className="hidden px-3 py-3 lg:px-4 lg:py-2 sm:table-cell">
														<div className="text-xs">
															{student.track && (
																<div className="font-medium dark:text-white">
																	{student.track}
																</div>
															)}
															{student.strand && (
																<div className="text-slate-500 dark:text-slate-400">
																	{student.strand}
																</div>
															)}
														</div>
													</td>
													<td className="px-3 py-3 lg:px-4 lg:py-2">
														<div className="flex gap-1 items-center">
															<GraduationCap className="w-3 h-3 text-slate-500" />
															<span
																className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
																	student.gradeLevelId === 1
																		? "text-blue-800 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/20"
																		: student.gradeLevelId === 2
																		? "text-green-800 bg-green-100 dark:text-green-300 dark:bg-green-900/20"
																		: "text-gray-800 bg-gray-100 dark:text-gray-300 dark:bg-gray-900/20"
																}`}
															>
																{student.gradeLevelName ||
																	`Grade ${student.gradeLevelId}`}
															</span>
														</div>
													</td>
													<td className="px-3 py-3 w-72 lg:px-4 lg:py-2 max-w-72">
														<div className="space-y-1">
															{student.files.map((file, fileIndex) => (
																<div
																	key={`${file.id}-${fileIndex}`}
																	className="flex gap-1.5 justify-between items-center p-1.5 rounded border bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
																>
																	<div className="flex flex-1 gap-1.5 items-center min-w-0">
																		{getFileIcon(file.documentType)}
																		<div className="flex flex-col flex-1 min-w-0">
																			<span className="text-xs font-medium truncate text-slate-900 dark:text-white">
																				{file.fileName}
																			</span>
																			<div className="flex gap-1 items-center">
																				<span
																					className={`inline-flex px-1.5 py-0.5 text-xs font-medium rounded-full ${
																						file.documentType === "Excel File"
																							? "text-green-800 bg-green-100 dark:text-green-300 dark:bg-green-900/20"
																							: file.documentType === "PDF File"
																							? "text-red-800 bg-red-100 dark:text-red-300 dark:bg-red-900/20"
																							: "text-blue-800 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/20"
																					}`}
																				>
																					{file.documentType}
																				</span>
																				{getSourceBadge(file.sourceTable)}
																			</div>
																		</div>
																	</div>
																	<div className="flex gap-0.5">
																		<Button
																			size="sm"
																			variant="ghost"
																			onClick={(e) => {
																				e.stopPropagation();
																				handleView(file.fileName);
																			}}
																			className="p-1 w-6 h-6"
																			title="View File"
																		>
																			<Eye className="w-3 h-3" />
																		</Button>
																		<Button
																			size="sm"
																			variant="ghost"
																			onClick={(e) => {
																				e.stopPropagation();
																				handleDownload(file.fileName);
																			}}
																			className="p-1 w-6 h-6"
																			title="Download File"
																		>
																			<Download className="w-3 h-3" />
																		</Button>
																	</div>
																</div>
															))}
														</div>
													</td>
												</tr>
											</React.Fragment>
										))}
									</tbody>
								</table>
							</div>

							{/* Pagination */}
							{totalPages > 1 && (
								<div className="flex flex-col gap-4 items-center sm:flex-row sm:justify-between">
									<div className="text-sm text-slate-600 dark:text-slate-400">
										Page {currentPage} of {totalPages}
									</div>
									<div className="flex gap-2 items-center">
										<Button
											variant="outline"
											size="sm"
											onClick={handlePrevPage}
											disabled={currentPage === 1}
											className="flex gap-1 items-center"
										>
											<ChevronLeft className="w-4 h-4" />
											Previous
										</Button>

										<div className="flex gap-1">
											{getPageNumbers().map((pageNum, index) => (
												<React.Fragment key={index}>
													{pageNum === "..." ? (
														<span className="px-3 py-1 text-slate-400 dark:text-slate-500">
															...
														</span>
													) : (
														<Button
															variant={
																pageNum === currentPage ? "default" : "outline"
															}
															size="sm"
															onClick={() => handlePageChange(pageNum)}
															className="p-0 w-8 h-8"
														>
															{pageNum}
														</Button>
													)}
												</React.Fragment>
											))}
										</div>

										<Button
											variant="outline"
											size="sm"
											onClick={handleNextPage}
											disabled={currentPage === totalPages}
											className="flex gap-1 items-center"
										>
											Next
											<ChevronRight className="w-4 h-4" />
										</Button>
									</div>
								</div>
							)}
						</>
					)}
				</CardContent>
			</Card>

			{/* Upload Modal */}
			<DocumentUpload
				isOpen={showUploadModal}
				onClose={() => setShowUploadModal(false)}
				onSuccess={handleUploadSuccess}
			/>
		</>
	);
}
