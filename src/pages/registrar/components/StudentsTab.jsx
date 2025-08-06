import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Upload, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import StudentImport from "../../../components/StudentImport";
import { getStudent } from "../../../utils/teacher";
import { getSection } from "../../../utils/registrar";
import { getStrands } from "../../../utils/registrar";
import { getSchoolYear } from "../../../utils/registrar";

export default function StudentsTab() {
	const [students, setStudents] = useState([]);
	const [filteredStudents, setFilteredStudents] = useState([]);
	const [sections, setSections] = useState([]);
	const [studentsLoading, setStudentsLoading] = useState(true);
	const [showImportModal, setShowImportModal] = useState(false);

	// Pagination state
	const [currentPage, setCurrentPage] = useState(1);
	const [studentsPerPage] = useState(10);

	// Filter state
	const [selectedSection, setSelectedSection] = useState("");
	const [strands, setStrands] = useState([]);
	const [selectedStrand, setSelectedStrand] = useState("");
	const [schoolYears, setSchoolYears] = useState([]);
	const [selectedSchoolYear, setSelectedSchoolYear] = useState("");

	// Fetch students and sections when component mounts
	useEffect(() => {
		fetchStudents();
		fetchSections();
		fetchStrands();
		fetchSchoolYears();
	}, []);

	// Apply section filter when selectedSection, selectedStrand, or selectedSchoolYear changes
	useEffect(() => {
		applyFilters();
	}, [students, selectedSection, selectedStrand, selectedSchoolYear]);

	// Reset to page 1 when filters change
	useEffect(() => {
		setCurrentPage(1);
	}, [selectedSection, selectedStrand, selectedSchoolYear]);

	const fetchStudents = async () => {
		setStudentsLoading(true);
		try {
			const data = await getStudent();
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
		} catch (error) {
			console.error("Error fetching students:", error);
			toast.error("Failed to load students");
		} finally {
			setStudentsLoading(false);
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
			toast.error("Failed to load sections");
		}
	};

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
			toast.error("Failed to load strands");
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
			toast.error("Failed to load school years");
		}
	};

	const applyFilters = () => {
		let filtered = [...students];

		// Apply section filter
		if (selectedSection && selectedSection !== "") {
			filtered = filtered.filter(
				(student) =>
					student.sectionName === selectedSection ||
					student.sectionId === selectedSection
			);
		}
		// Apply strand filter
		if (selectedStrand && selectedStrand !== "") {
			console.log("Filtering by strand:", selectedStrand);
			console.log(
				"Available students:",
				students.map((s) => ({
					id: s.id,
					strandId: s.strandId,
					strand: s.strand,
				}))
			);
			filtered = filtered.filter((student) => {
				const matches =
					student.strandId == selectedStrand ||
					student.strand === selectedStrand;
				console.log(
					`Student ${student.id}: strandId=${student.strandId}, strand=${student.strand}, matches=${matches}`
				);
				return matches;
			});
			console.log("Filtered students:", filtered.length);
		}

		// Apply school year filter
		if (selectedSchoolYear && selectedSchoolYear !== "") {
			filtered = filtered.filter((student) => {
				const matches =
					student.schoolyearId == selectedSchoolYear ||
					student.schoolYear === selectedSchoolYear;
				return matches;
			});
		}

		setFilteredStudents(filtered);
	};

	const handleSectionChange = (sectionValue) => {
		setSelectedSection(sectionValue);
	};
	const handleStrandChange = (strandValue) => {
		setSelectedStrand(strandValue);
	};
	const handleSchoolYearChange = (schoolYearValue) => {
		setSelectedSchoolYear(schoolYearValue);
	};

	// Calculate pagination
	const indexOfLastStudent = currentPage * studentsPerPage;
	const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
	const currentStudents = filteredStudents.slice(
		indexOfFirstStudent,
		indexOfLastStudent
	);
	const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

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

	// Handle import completion
	const handleImportComplete = (results) => {
		fetchStudents(); // Refresh students list
		setShowImportModal(false);
		toast.success(`Successfully imported ${results.imported} students!`);
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
		<>
			<Card className="dark:bg-slate-800 dark:border-slate-700">
				<CardContent className="p-4 lg:p-6">
					<div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
						<div className="text-lg font-semibold text-slate-900 dark:text-white">
							Students ({filteredStudents.length})
						</div>
						<Button
							onClick={() => setShowImportModal(true)}
							className="flex gap-2 items-center text-white bg-green-600 hover:bg-green-700"
						>
							<Upload className="w-4 h-4" /> Import Students
						</Button>
					</div>

					{/* Filter Controls */}
					<div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center">
						<div className="flex gap-2 items-center">
							<Filter className="w-4 h-4 text-slate-500 dark:text-slate-400" />
							<select
								value={selectedSection}
								onChange={(e) => handleSectionChange(e.target.value)}
								className="px-3 py-2 text-sm bg-white rounded-md border dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
							>
								<option value="">All Sections</option>
								{sections.map((section) => (
									<option key={section.id} value={section.name}>
										{section.name}
									</option>
								))}
							</select>
							<select
								value={selectedStrand}
								onChange={(e) => handleStrandChange(e.target.value)}
								className="px-3 py-2 text-sm bg-white rounded-md border dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
							>
								<option value="">All Strands</option>
								{strands.map((strand) => (
									<option key={strand.id} value={strand.id}>
										{strand.name} ({strand.trackName})
									</option>
								))}
							</select>
							<select
								value={selectedSchoolYear}
								onChange={(e) => handleSchoolYearChange(e.target.value)}
								className="px-3 py-2 text-sm bg-white rounded-md border dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
							>
								<option value="">All School Years</option>
								{schoolYears.map((schoolYear) => (
									<option key={schoolYear.id} value={schoolYear.id}>
										{schoolYear.year}
									</option>
								))}
							</select>
						</div>
					</div>

					{studentsLoading ? (
						<div className="py-6 text-center lg:py-8">
							<p className="text-sm text-slate-500 dark:text-slate-400 lg:text-base">
								Loading students...
							</p>
						</div>
					) : filteredStudents.length === 0 ? (
						<div className="py-6 text-center lg:py-8">
							<p className="text-sm text-slate-500 dark:text-slate-400 lg:text-base">
								{selectedSection
									? `No students found in section "${selectedSection}".`
									: "No students found. Import students to get started."}
							</p>
						</div>
					) : (
						<>
							{/* Pagination Info */}
							<div className="mb-4 text-sm text-slate-600 dark:text-slate-400">
								Showing {indexOfFirstStudent + 1} to{" "}
								{Math.min(indexOfLastStudent, filteredStudents.length)} of{" "}
								{filteredStudents.length} students
								{totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
							</div>

							{/* Students Table */}
							<div className="overflow-x-auto -mx-4 mb-6 lg:mx-0">
								<table className="min-w-full text-xs lg:text-sm text-slate-700 dark:text-slate-300">
									<thead>
										<tr className="border-b border-slate-200 dark:border-slate-700">
											<th className="px-3 py-2 font-semibold text-left lg:px-4">
												Student
											</th>
											<th className="px-3 py-2 font-semibold text-left lg:px-4">
												LRN
											</th>
											<th className="hidden px-3 py-2 font-semibold text-left lg:px-4 sm:table-cell">
												Email
											</th>
											<th className="px-3 py-2 font-semibold text-left lg:px-4">
												Section
											</th>
											<th className="px-3 py-2 font-semibold text-left lg:px-4">
												School Year
											</th>
											<th className="px-3 py-2 font-semibold text-left lg:px-4">
												Track & Strand
											</th>
										</tr>
									</thead>
									<tbody>
										{currentStudents.map((student) => (
											<tr
												key={student.id}
												className="border-b transition-colors border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
											>
												<td className="px-3 py-3 lg:px-4 lg:py-2">
													<div className="flex items-center">
														<div className="flex-shrink-0 mr-3 w-8 h-8">
															<div className="flex justify-center items-center w-8 h-8 bg-blue-100 rounded-full dark:bg-blue-900">
																<span className="text-xs font-medium text-blue-600 dark:text-blue-300">
																	{student.firstname?.[0]}
																	{student.lastname?.[0]}
																</span>
															</div>
														</div>
														<div>
															<div className="font-medium dark:text-white">
																{student.firstname} {student.middlename}{" "}
																{student.lastname}
															</div>
														</div>
													</div>
												</td>
												<td className="px-3 py-3 lg:px-4 lg:py-2 dark:text-white">
													{student.lrn || "N/A"}
												</td>
												<td className="hidden px-3 py-3 lg:px-4 lg:py-2 sm:table-cell dark:text-white">
													{student.email || "N/A"}
												</td>
												<td className="px-3 py-3 lg:px-4 lg:py-2">
													<span className="inline-flex px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full dark:text-blue-300 dark:bg-blue-900/20">
														{student.sectionName || "N/A"}
													</span>
												</td>
												<td className="px-3 py-3 lg:px-4 lg:py-2">
													<span className="inline-flex px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full dark:text-green-300 dark:bg-green-900/20">
														{student.schoolYear || "N/A"}
													</span>
												</td>
												<td className="px-3 py-3 lg:px-4 lg:py-2">
													<div>
														<div className="text-xs font-medium dark:text-white">
															{student.track || "N/A"}
														</div>
														<div className="text-xs text-slate-500 dark:text-slate-400">
															{student.strand || "N/A"}
														</div>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

							{/* Pagination Controls */}
							{totalPages > 1 && (
								<div className="flex flex-col gap-4 justify-between items-center sm:flex-row">
									<div className="text-sm text-slate-600 dark:text-slate-400">
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
														<span className="px-3 py-1 text-sm text-slate-400 dark:text-slate-500">
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

			{/* Import Modal */}
			{showImportModal && (
				<StudentImport
					onClose={() => setShowImportModal(false)}
					onImportComplete={handleImportComplete}
				/>
			)}
		</>
	);
}
