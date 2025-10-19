import React, { useState, useMemo } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";

export default function StudentsContent({
	students,
	studentsLoading,
	sectionOptions,
	schoolYearOptions,
	selectedSectionFilter,
	selectedSchoolYearFilter,
	onSectionFilterChange,
	onSchoolYearFilterChange,
	onAddStudent,
	onEditStudent,
}) {
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const studentsPerPage = 10;

	// Filter students based on search term and existing filters
	const filteredStudents = useMemo(() => {
		let filtered = students;

		// Apply search filter
		if (searchTerm.trim()) {
			const searchLower = searchTerm.toLowerCase().trim();
			filtered = filtered.filter((student) => {
				const fullName =
					`${student.firstname} ${student.middlename} ${student.lastname}`.toLowerCase();
				const lrn = student.lrn ? student.lrn.toString().toLowerCase() : "";
				const email = student.email ? student.email.toLowerCase() : "";
				const gradeLevelName = student.gradeLevelName
					? student.gradeLevelName.toLowerCase()
					: "";
				const sectionName = student.sectionName
					? student.sectionName.toLowerCase()
					: "";
				const schoolYear = student.schoolYear
					? student.schoolYear.toLowerCase()
					: "";
				const track = student.track ? student.track.toLowerCase() : "";
				const strand = student.strand ? student.strand.toLowerCase() : "";

				return (
					lrn.includes(searchLower) ||
					fullName.includes(searchLower) ||
					email.includes(searchLower) ||
					gradeLevelName.includes(searchLower) ||
					sectionName.includes(searchLower) ||
					schoolYear.includes(searchLower) ||
					track.includes(searchLower) ||
					strand.includes(searchLower) ||
					student.firstname.toLowerCase().includes(searchLower) ||
					student.lastname.toLowerCase().includes(searchLower)
				);
			});
		}

		return filtered;
	}, [students, searchTerm]);

	// Pagination calculations
	const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
	const startIndex = (currentPage - 1) * studentsPerPage;
	const endIndex = startIndex + studentsPerPage;
	const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

	// Reset to first page when search changes
	const handleSearchChange = (e) => {
		setSearchTerm(e.target.value);
		setCurrentPage(1);
	};

	// Pagination handlers
	const goToPage = (page) => {
		setCurrentPage(Math.max(1, Math.min(page, totalPages)));
	};

	const goToPreviousPage = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
		}
	};

	const goToNextPage = () => {
		if (currentPage < totalPages) {
			setCurrentPage(currentPage + 1);
		}
	};

	return (
		<>
			{/* Students List */}
			<Card className="dark:bg-slate-800 dark:border-slate-700">
				<CardContent className="p-4 lg:p-6">
					<div className="mb-4 text-base font-semibold lg:text-lg text-slate-900 dark:text-white">
						Students Management
					</div>

					{/* Search Bar */}
					<div className="mb-4">
						<div className="flex gap-4 justify-between items-center">
							<div className="relative flex-1 max-w-md">
								<Search className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2" />
								<Input
									type="text"
									placeholder="Search by LRN, name, email, grade level, section, track/strand..."
									value={searchTerm}
									onChange={handleSearchChange}
									className="pl-10 w-full"
								/>
							</div>
							{searchTerm && (
								<div className="text-sm text-gray-500 dark:text-gray-400">
									{filteredStudents.length} of {students.length} students
								</div>
							)}
						</div>
					</div>

					{/* Filters */}
					<div className="flex flex-col gap-4 mb-6 sm:flex-row sm:gap-6">
						<div className="flex-1">
							<Label
								htmlFor="sectionFilter"
								className="text-sm font-medium text-slate-700 dark:text-gray-200"
							>
								Filter by Section
							</Label>
							<select
								id="sectionFilter"
								value={selectedSectionFilter}
								onChange={onSectionFilterChange}
								className="px-3 py-2 mt-1 w-full bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-700 dark:text-white dark:border-gray-600"
							>
								<option value="">All Sections</option>
								{sectionOptions.map((section) => (
									<option key={section.id} value={section.id}>
										{section.name}
									</option>
								))}
							</select>
						</div>
						<div className="flex-1">
							<Label
								htmlFor="schoolYearFilter"
								className="text-sm font-medium text-slate-700 dark:text-gray-200"
							>
								Filter by School Year
							</Label>
							<select
								id="schoolYearFilter"
								value={selectedSchoolYearFilter}
								onChange={onSchoolYearFilterChange}
								className="px-3 py-2 mt-1 w-full bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-700 dark:text-white dark:border-gray-600"
							>
								<option value="">All School Years</option>
								{schoolYearOptions.map((sy) => (
									<option key={sy.id} value={sy.id}>
										{sy.year}
									</option>
								))}
							</select>
						</div>
					</div>

					<div className="flex justify-between items-center mb-4">
						<div className="text-sm text-slate-600 dark:text-slate-400">
							{searchTerm
								? `Showing ${paginatedStudents.length} of ${filteredStudents.length} filtered students (${students.length} total)`
								: `Showing ${paginatedStudents.length} of ${filteredStudents.length} students`}
						</div>
						<Button
							onClick={onAddStudent}
							className="text-white bg-green-600 hover:bg-green-700"
						>
							<Plus className="mr-2 w-4 h-4" />
							Add Student
						</Button>
					</div>

					{studentsLoading ? (
						<div className="py-8 text-center text-slate-500 dark:text-slate-400">
							Loading students...
						</div>
					) : students.length === 0 ? (
						<div className="py-8 text-center text-slate-500 dark:text-slate-400">
							No students found
						</div>
					) : filteredStudents.length === 0 ? (
						<div className="py-8 text-center text-slate-500 dark:text-slate-400">
							No students match your search criteria
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full border-collapse">
								<thead>
									<tr className="border-b border-slate-200 dark:border-slate-600">
										<th className="px-4 py-3 font-medium text-left text-slate-700 dark:text-white">
											LRN
										</th>
										<th className="px-4 py-3 font-medium text-left text-slate-700 dark:text-white">
											Name
										</th>
										<th className="px-4 py-3 font-medium text-left text-slate-700 dark:text-white">
											Email
										</th>
										<th className="px-4 py-3 font-medium text-left text-slate-700 dark:text-white">
											Grade Level
										</th>
										<th className="px-4 py-3 font-medium text-left text-slate-700 dark:text-white">
											Section
										</th>
										<th className="px-4 py-3 font-medium text-left text-slate-700 dark:text-white">
											School Year
										</th>
										<th className="px-4 py-3 font-medium text-left text-slate-700 dark:text-white">
											Track/Strand
										</th>
									</tr>
								</thead>
								<tbody>
									{paginatedStudents.map((student, index) => (
										<tr
											key={student.id}
											className={`border-b border-slate-100 dark:border-slate-600 cursor-pointer transition-colors hover:bg-slate-100 dark:hover:bg-slate-600 ${
												index % 2 === 0
													? "bg-slate-50 dark:bg-slate-700"
													: "bg-white dark:bg-slate-700"
											}`}
											onClick={() => onEditStudent(student)}
										>
											<td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
												{student.lrn}
											</td>
											<td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
												<div className="flex justify-between items-center">
													<span>
														{student.firstname} {student.middlename}{" "}
														{student.lastname}
													</span>
												</div>
											</td>
											<td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
												{student.email}
											</td>
											<td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
												{student.gradeLevelName || "N/A"}
											</td>
											<td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
												{student.sectionName || "N/A"}
											</td>
											<td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
												{student.schoolYear || "N/A"}
											</td>
											<td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
												{student.track && student.strand
													? `${student.track} - ${student.strand}`
													: "N/A"}
											</td>
										</tr>
									))}
								</tbody>
							</table>

							{/* Pagination Controls */}
							{totalPages > 1 && (
								<div className="flex justify-between items-center px-4 mt-6">
									<div className="flex items-center space-x-2">
										<Button
											onClick={goToPreviousPage}
											disabled={currentPage === 1}
											variant="outline"
											size="sm"
											className="flex items-center space-x-1"
										>
											<ChevronLeft className="w-4 h-4" />
											<span>Previous</span>
										</Button>

										<div className="flex items-center space-x-1">
											{Array.from(
												{ length: Math.min(5, totalPages) },
												(_, i) => {
													const pageNumber =
														currentPage <= 3
															? i + 1
															: currentPage >= totalPages - 2
															? totalPages - 4 + i
															: currentPage - 2 + i;

													if (pageNumber < 1 || pageNumber > totalPages)
														return null;

													return (
														<Button
															key={pageNumber}
															onClick={() => goToPage(pageNumber)}
															variant={
																currentPage === pageNumber
																	? "default"
																	: "outline"
															}
															size="sm"
															className="p-0 w-8 h-8"
														>
															{pageNumber}
														</Button>
													);
												}
											)}
										</div>

										<Button
											onClick={goToNextPage}
											disabled={currentPage === totalPages}
											variant="outline"
											size="sm"
											className="flex items-center space-x-1"
										>
											<span>Next</span>
											<ChevronRight className="w-4 h-4" />
										</Button>
									</div>

									<div className="text-sm text-gray-500 dark:text-gray-400">
										Page {currentPage} of {totalPages}
									</div>
								</div>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</>
	);
}
