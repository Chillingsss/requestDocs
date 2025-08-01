import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
	Download,
	ChevronLeft,
	ChevronRight,
	Filter,
	DownloadCloud,
	GraduationCap,
	BookOpen,
} from "lucide-react";
import toast from "react-hot-toast";
import {
	getStudentRecords,
	downloadFile,
	getSectionsByGradeLevel,
} from "../../../utils/teacher";

export default function StudentFileManagement() {
	const [students, setStudents] = useState([]);
	const [filteredStudents, setFilteredStudents] = useState([]);
	const [loading, setLoading] = useState(true);
	const [downloadingAll, setDownloadingAll] = useState(false);

	// Pagination state
	const [currentPage, setCurrentPage] = useState(1);
	const [studentsPerPage] = useState(10);

	// Filter state
	const [selectedSection, setSelectedSection] = useState("");
	const [selectedGradeLevel, setSelectedGradeLevel] = useState("");
	const [sections, setSections] = useState([]);
	const [sectionsByGradeLevel, setSectionsByGradeLevel] = useState({});

	// Fetch data on component mount
	useEffect(() => {
		fetchStudents();
		fetchSectionsByGradeLevel();
	}, []);

	// Apply section filter when selectedSection changes
	useEffect(() => {
		applyFilters();
	}, [students, selectedSection, selectedGradeLevel]);

	// Reset to page 1 when filters change
	useEffect(() => {
		setCurrentPage(1);
	}, [selectedSection, selectedGradeLevel]);

	const fetchStudents = async () => {
		try {
			const data = await getStudentRecords();
			console.log("API data:", data);
			let studentsArray = data;
			if (typeof data === "string") {
				try {
					studentsArray = JSON.parse(data);
				} catch (e) {
					studentsArray = [];
				}
			}
			setStudents(Array.isArray(studentsArray) ? studentsArray : []);

			// Extract unique sections from student data
			const uniqueSections = [
				...new Set(
					studentsArray
						.filter((student) => student.sectionName)
						.map((student) => student.sectionName)
				),
			];
			setSections(uniqueSections);

			setLoading(false);
		} catch (error) {
			console.error("Error fetching students:", error);
			toast.error("Failed to load students");
			setLoading(false);
		}
	};

	const fetchSectionsByGradeLevel = async () => {
		try {
			const data = await getSectionsByGradeLevel();
			let sectionsData = data;
			if (typeof data === "string") {
				try {
					sectionsData = JSON.parse(data);
				} catch (e) {
					sectionsData = [];
				}
			}

			// Group sections by grade level
			const grouped = sectionsData.reduce((acc, item) => {
				const gradeLevel = item.gradeLevel;
				if (!acc[gradeLevel]) {
					acc[gradeLevel] = [];
				}
				acc[gradeLevel].push(item.sectionName);
				return acc;
			}, {});

			setSectionsByGradeLevel(grouped);
		} catch (error) {
			console.error("Error fetching sections by grade level:", error);
		}
	};

	const applyFilters = () => {
		let filtered = [...students];

		// Apply grade level filter
		if (selectedGradeLevel && selectedGradeLevel !== "") {
			filtered = filtered.filter(
				(student) => student.gradeLevel === selectedGradeLevel
			);
		}

		// Apply section filter
		if (selectedSection && selectedSection !== "") {
			filtered = filtered.filter(
				(student) => student.sectionName === selectedSection
			);
		}

		setFilteredStudents(filtered);
	};

	const handleGradeLevelChange = (gradeLevel) => {
		setSelectedGradeLevel(gradeLevel);
		setSelectedSection(""); // Reset section when grade level changes
	};

	const handleSectionChange = (sectionValue) => {
		setSelectedSection(sectionValue);
	};

	const handleFileDownload = async (fileName) => {
		try {
			await downloadFile(fileName);
			toast.success("File downloaded successfully");
		} catch (error) {
			console.error("Download error:", error);
			toast.error("Failed to download file");
		}
	};

	const handleDownloadAllFiles = async () => {
		if (!selectedSection) {
			toast.error("Please select a section first");
			return;
		}

		const filesInSection = groupedStudents
			.filter((student) => student.files && student.files.length > 0)
			.flatMap((student) =>
				student.files.map((file) => ({
					...file,
					studentName: `${student.firstname}_${student.lastname}`,
				}))
			);

		if (filesInSection.length === 0) {
			toast.error(`No files found in section "${selectedSection}"`);
			return;
		}

		setDownloadingAll(true);

		try {
			// Create a promise for each file download
			const downloadPromises = filesInSection.map(async (file, index) => {
				try {
					// Add a small delay between downloads to avoid overwhelming the server
					await new Promise((resolve) => setTimeout(resolve, index * 100));
					await downloadFile(file.fileName);
					return { success: true, fileName: file.fileName };
				} catch (error) {
					console.error(`Failed to download ${file.fileName}:`, error);
					return { success: false, fileName: file.fileName, error };
				}
			});

			const results = await Promise.allSettled(downloadPromises);
			const successful = results.filter(
				(result) => result.status === "fulfilled" && result.value.success
			).length;
			const failed = results.length - successful;

			if (successful > 0) {
				toast.success(
					`Successfully downloaded ${successful} files from "${selectedSection}"`
				);
			}
			if (failed > 0) {
				toast.error(`Failed to download ${failed} files`);
			}
		} catch (error) {
			console.error("Download all error:", error);
			toast.error("Failed to download files");
		} finally {
			setDownloadingAll(false);
		}
	};

	// Calculate stats - need to group by student id first
	const studentGroups = filteredStudents.reduce((acc, record) => {
		const id = record.id;
		if (!acc[id]) {
			acc[id] = {
				id: record.id,
				firstname: record.firstname,
				lastname: record.lastname,
				email: record.email,
				sectionName: record.sectionName,
				gradeLevel: record.gradeLevel,
				files: [],
			};
		}
		if (record.fileName && record.fileName.trim() !== "") {
			acc[id].files.push({
				fileName: record.fileName,
				sfType: record.gradeLevel, // This is the Grade Level (Grade 11 or Grade 12)
			});
		}
		return acc;
	}, {});

	const groupedStudents = Object.values(studentGroups);
	const totalStudents = groupedStudents.length;
	const studentsWithFiles = groupedStudents.filter(
		(s) => s.files.length > 0
	).length;
	const totalFiles = groupedStudents.reduce(
		(acc, s) => acc + s.files.length,
		0
	);

	// Calculate pagination
	const indexOfLastStudent = currentPage * studentsPerPage;
	const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
	const currentStudents = groupedStudents.slice(
		indexOfFirstStudent,
		indexOfLastStudent
	);
	const totalPages = Math.ceil(groupedStudents.length / studentsPerPage);

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

	return (
		<Card>
			<CardContent className="p-4 lg:p-6">
				<div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
					<div className="text-lg font-semibold text-slate-900">
						Student File Management ({totalStudents})
					</div>
				</div>

				{/* Grade Level Tabs */}
				<div className="mb-6">
					<div className="flex flex-wrap gap-2 mb-4">
						<Button
							variant="outline"
							onClick={() => handleGradeLevelChange("")}
							className={`flex gap-2 items-center ${
								selectedGradeLevel === ""
									? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:text-white"
									: "hover:bg-slate-100"
							}`}
						>
							<GraduationCap className="w-4 h-4" />
							All Grade Levels
						</Button>
						{Object.keys(sectionsByGradeLevel).map((gradeLevel) => (
							<Button
								key={gradeLevel}
								variant="outline"
								onClick={() => handleGradeLevelChange(gradeLevel)}
								className={`flex gap-2 items-center ${
									selectedGradeLevel === gradeLevel
										? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:text-white"
										: "hover:bg-slate-100"
								}`}
							>
								<BookOpen className="w-4 h-4" />
								{gradeLevel}
							</Button>
						))}
					</div>

					{/* Section Filter */}
					{selectedGradeLevel && sectionsByGradeLevel[selectedGradeLevel] && (
						<div className="mb-4">
							<div className="flex gap-2 items-center mb-2">
								<Filter className="w-4 h-4 text-slate-500" />
								<span className="text-sm font-medium text-slate-700">
									Sections in {selectedGradeLevel}:
								</span>
							</div>
							<div className="flex flex-wrap gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => handleSectionChange("")}
									className={`${
										selectedSection === ""
											? "bg-green-600 text-white border-green-600 hover:bg-green-700 hover:text-white"
											: "hover:bg-slate-100"
									}`}
								>
									All Sections
								</Button>
								{sectionsByGradeLevel[selectedGradeLevel].map((section) => (
									<Button
										key={section}
										variant="outline"
										size="sm"
										onClick={() => handleSectionChange(section)}
										className={`${
											selectedSection === section
												? "bg-green-600 text-white border-green-600 hover:bg-green-700 hover:text-white"
												: "hover:bg-slate-100"
										}`}
									>
										{section}
									</Button>
								))}
							</div>
						</div>
					)}
				</div>

				{/* Filter Summary */}
				{(selectedGradeLevel || selectedSection) && (
					<div className="p-3 mb-4 bg-blue-50 rounded-lg">
						<div className="text-sm text-blue-800">
							<strong>Current Filters:</strong>
							{selectedGradeLevel && (
								<span className="ml-2">
									Grade Level:{" "}
									<span className="font-medium">{selectedGradeLevel}</span>
								</span>
							)}
							{selectedSection && (
								<span className="ml-2">
									Section:{" "}
									<span className="font-medium">{selectedSection}</span>
								</span>
							)}
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									setSelectedGradeLevel("");
									setSelectedSection("");
								}}
								className="ml-4"
							>
								Clear Filters
							</Button>
						</div>
					</div>
				)}

				{/* Download All Files Button */}
				{selectedSection &&
					groupedStudents.some(
						(student) => student.files && student.files.length > 0
					) && (
						<div className="mb-4">
							<Button
								onClick={handleDownloadAllFiles}
								disabled={downloadingAll}
								className="flex gap-2 items-center text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
							>
								{downloadingAll ? (
									<>
										<div className="w-4 h-4 rounded-full border-b-2 border-white animate-spin"></div>
										<span>Downloading...</span>
									</>
								) : (
									<>
										<DownloadCloud className="w-4 h-4" />
										<span>Download All Files from {selectedSection}</span>
									</>
								)}
							</Button>
						</div>
					)}

				{loading ? (
					<div className="py-6 text-center lg:py-8">
						<p className="text-sm text-slate-500 lg:text-base">
							Loading students...
						</p>
					</div>
				) : groupedStudents.length === 0 ? (
					<div className="py-6 text-center lg:py-8">
						<p className="text-sm text-slate-500 lg:text-base">
							{selectedGradeLevel && selectedSection
								? `No students found in ${selectedGradeLevel} - ${selectedSection}.`
								: selectedGradeLevel
								? `No students found in ${selectedGradeLevel}.`
								: selectedSection
								? `No students found in section "${selectedSection}".`
								: "No students found."}
						</p>
					</div>
				) : (
					<>
						{/* Pagination Info */}
						<div className="mb-4 text-sm text-slate-600">
							Showing {indexOfFirstStudent + 1} to{" "}
							{Math.min(indexOfLastStudent, groupedStudents.length)} of{" "}
							{groupedStudents.length} students
							{totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
						</div>

						<div className="overflow-x-auto -mx-4 lg:mx-0">
							<table className="min-w-full text-xs lg:text-sm text-slate-700">
								<thead>
									<tr className="border-b border-slate-200">
										<th className="px-3 py-2 font-semibold text-left lg:px-4">
											First Name
										</th>
										<th className="px-3 py-2 font-semibold text-left lg:px-4">
											Last Name
										</th>
										<th className="px-3 py-2 font-semibold text-left lg:px-4">
											Email
										</th>
										<th className="px-3 py-2 font-semibold text-left lg:px-4">
											Grade Level
										</th>
										<th className="px-3 py-2 font-semibold text-left lg:px-4">
											Section
										</th>
										<th className="px-3 py-2 font-semibold text-left lg:px-4">
											Files
										</th>
									</tr>
								</thead>
								<tbody>
									{currentStudents.map((student, idx) => (
										<tr
											key={student.id || idx}
											className="border-b transition-colors border-slate-100 hover:bg-slate-50"
										>
											<td className="px-3 py-3 lg:px-4 lg:py-2">
												<div className="font-medium">{student.firstname}</div>
											</td>
											<td className="px-3 py-3 lg:px-4 lg:py-2">
												<div className="font-medium">{student.lastname}</div>
											</td>
											<td className="px-3 py-3 lg:px-4 lg:py-2">
												<div className="truncate max-w-[120px] lg:max-w-none">
													{student.email}
												</div>
											</td>
											<td className="px-3 py-3 lg:px-4 lg:py-2">
												<span className="inline-flex px-2 py-1 text-xs font-medium text-purple-800 bg-purple-100 rounded-full">
													{student.gradeLevel || "N/A"}
												</span>
											</td>
											<td className="px-3 py-3 lg:px-4 lg:py-2">
												<span className="inline-flex px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
													{student.sectionName || "N/A"}
												</span>
											</td>
											<td className="px-3 py-3 lg:px-4 lg:py-2">
												<div className="max-w-xs">
													{student.files && student.files.length > 0 ? (
														student.files.map((file, fileIdx) => (
															<div
																key={`${student.id}-${fileIdx}`}
																className="flex justify-between items-center p-2 mb-2 bg-gray-50 rounded-md"
															>
																<div className="flex-1 mr-2">
																	<div className="mb-1 text-xs font-medium text-blue-600">
																		{file.sfType}
																	</div>
																	<div className="text-xs text-gray-700 truncate">
																		{file.fileName}
																	</div>
																</div>
																<div className="flex gap-1">
																	<Button
																		size="sm"
																		variant="outline"
																		className="p-1 w-6 h-6"
																		onClick={() =>
																			handleFileDownload(file.fileName)
																		}
																		title="Download file"
																	>
																		<Download className="w-3 h-3" />
																	</Button>
																</div>
															</div>
														))
													) : (
														<span className="text-xs italic text-gray-500">
															No file uploaded
														</span>
													)}
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* Pagination Controls */}
						{totalPages > 1 && (
							<div className="flex flex-col gap-4 justify-between items-center mt-6 sm:flex-row">
								<div className="text-sm text-slate-600">
									Page {currentPage} of {totalPages}
								</div>

								<div className="flex gap-2 items-center">
									{/* Previous Button */}
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

									{/* Page Numbers */}
									<div className="flex gap-1">
										{getPageNumbers().map((pageNum, index) => (
											<React.Fragment key={index}>
												{pageNum === "..." ? (
													<span className="px-3 py-1 text-sm text-slate-400">
														...
													</span>
												) : (
													<Button
														variant={
															currentPage === pageNum ? "default" : "outline"
														}
														size="sm"
														onClick={() => handlePageChange(pageNum)}
														className="min-w-[36px]"
													>
														{pageNum}
													</Button>
												)}
											</React.Fragment>
										))}
									</div>

									{/* Next Button */}
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
	);
}
