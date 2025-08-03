import React, { useState, useEffect } from "react";
import {
	Upload,
	FileSpreadsheet,
	X,
	Save,
	Trash2,
	Edit3,
	Users,
} from "lucide-react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import axios from "axios";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import { getDecryptedApiUrl } from "../utils/apiConfig";
import { getSection } from "../utils/registrar";

const StudentImport = ({ onClose, onImportComplete }) => {
	const [file, setFile] = useState(null);
	const [previewData, setPreviewData] = useState([]);
	const [headers, setHeaders] = useState([]);
	const [isParsing, setIsParsing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [saveResult, setSaveResult] = useState(null);
	const [dragActive, setDragActive] = useState(false);
	const [editingCell, setEditingCell] = useState(null); // { rowIndex, colIndex }
	const [sections, setSections] = useState([]);
	const [selectedSection, setSelectedSection] = useState("");
	const [loadingSections, setLoadingSections] = useState(false);

	// Constants for authentication
	const COOKIE_KEY = "mogchs_user";
	const SECRET_KEY = "mogchs_secret_key";

	let userId = "";
	const encrypted = Cookies.get(COOKIE_KEY);
	if (encrypted) {
		try {
			const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
			const user = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
			userId = user?.id;
		} catch {}
	}

	// Load sections when component mounts
	useEffect(() => {
		loadSections();
	}, []);

	const loadSections = async () => {
		setLoadingSections(true);
		try {
			const sectionsData = await getSection();
			setSections(sectionsData);
		} catch (error) {
			console.error("Failed to load sections:", error);
			toast.error("Failed to load sections");
		} finally {
			setLoadingSections(false);
		}
	};

	const handleDrag = (e) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			setDragActive(true);
		} else if (e.type === "dragleave") {
			setDragActive(false);
		}
	};

	const handleDrop = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);

		if (e.dataTransfer.files && e.dataTransfer.files[0]) {
			const droppedFile = e.dataTransfer.files[0];
			if (validateFile(droppedFile)) {
				setFile(droppedFile);
				parseFile(droppedFile);
			}
		}
	};

	const handleFileSelect = (e) => {
		if (e.target.files && e.target.files[0]) {
			const selectedFile = e.target.files[0];
			if (validateFile(selectedFile)) {
				setFile(selectedFile);
				parseFile(selectedFile);
			}
		}
	};

	const validateFile = (file) => {
		const allowedTypes = [
			"text/csv",
			"application/csv",
			"text/plain",
			"application/vnd.ms-excel",
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		];
		const fileExtension = file.name.split(".").pop().toLowerCase();
		const allowedExtensions = ["csv", "xls", "xlsx"];
		if (
			!allowedTypes.includes(file.type) &&
			!allowedExtensions.includes(fileExtension)
		) {
			toast.error(
				"Please select a valid CSV or Excel file (.csv, .xls, .xlsx)"
			);
			return false;
		}
		if (file.size > 10 * 1024 * 1024) {
			toast.error("File size should be less than 10MB");
			return false;
		}
		return true;
	};

	const parseFile = (file) => {
		setIsParsing(true);
		const reader = new FileReader();
		reader.onload = (e) => {
			let data = new Uint8Array(e.target.result);
			let workbook = XLSX.read(data, { type: "array" });
			const firstSheetName = workbook.SheetNames[0];
			const worksheet = workbook.Sheets[firstSheetName];
			const allRows = XLSX.utils.sheet_to_json(worksheet, {
				header: 1,
				raw: false,
			});

			// Find the header row (row with LRN and NAME)
			let headerRowIndex = allRows.findIndex(
				(row) =>
					row &&
					row.some(
						(cell) =>
							typeof cell === "string" &&
							(cell.trim().toUpperCase() === "LRN" ||
								cell.trim().toUpperCase().includes("LRN"))
					)
			);
			if (headerRowIndex === -1) {
				toast.error("Could not find header row with 'LRN'.");
				setIsParsing(false);
				return;
			}
			const header = allRows[headerRowIndex];
			const dataRows = allRows
				.slice(headerRowIndex + 1)
				.filter(
					(row) =>
						row &&
						row.length > 0 &&
						row.some((cell) => cell && cell.toString().trim() !== "")
				);

			// Clean up LRN values by removing trailing dots
			const cleanedDataRows = dataRows.map((row) => {
				const cleanedRow = [...row];
				// Find LRN column index
				const lrnColumnIndex = header.findIndex(
					(h) => h && h.toString().toUpperCase().includes("LRN")
				);

				if (lrnColumnIndex !== -1 && cleanedRow[lrnColumnIndex]) {
					// Remove trailing dots from LRN
					cleanedRow[lrnColumnIndex] = cleanedRow[lrnColumnIndex]
						.toString()
						.replace(/\.+$/, "");
				}

				return cleanedRow;
			});

			setHeaders(header);
			setPreviewData(cleanedDataRows);
			setIsParsing(false);
		};
		reader.readAsArrayBuffer(file);
	};

	const handleSave = async () => {
		if (!previewData.length) {
			toast.error("No data to save.");
			return;
		}
		if (!selectedSection) {
			toast.error("Please select a section for the students.");
			return;
		}
		setIsSaving(true);
		setSaveResult(null);
		const apiUrl = getDecryptedApiUrl();
		try {
			const response = await axios.post(`${apiUrl}/import_students.php`, {
				operation: "savePreviewedStudents",
				data: previewData,
				headers,
				sectionId: selectedSection,
				userId: userId,
			});
			setSaveResult(response.data);
			if (response.data.success) {
				toast.success(
					`Successfully imported ${response.data.imported} students`
				);
				if (onImportComplete) onImportComplete(response.data);
			} else {
				toast.error(response.data.error || "Save failed");
			}
		} catch (error) {
			console.error("Save error:", error);
			toast.error("Save failed. Please try again.");
		} finally {
			setIsSaving(false);
		}
	};

	const resetForm = () => {
		setFile(null);
		setPreviewData([]);
		setHeaders([]);
		setIsParsing(false);
		setIsSaving(false);
		setSaveResult(null);
		setSelectedSection("");
	};

	const removeRow = (rowIndex) => {
		const updatedData = previewData.filter((_, index) => index !== rowIndex);
		setPreviewData(updatedData);
	};

	const updateCellValue = (rowIndex, colIndex, newValue) => {
		const updatedData = [...previewData];
		if (!updatedData[rowIndex]) {
			updatedData[rowIndex] = [];
		}
		updatedData[rowIndex][colIndex] = newValue;
		setPreviewData(updatedData);
	};

	const startEditing = (rowIndex, colIndex) => {
		setEditingCell({ rowIndex, colIndex });
	};

	const stopEditing = () => {
		setEditingCell(null);
	};

	const handleCellKeyPress = (e, rowIndex, colIndex) => {
		if (e.key === "Enter") {
			updateCellValue(rowIndex, colIndex, e.target.value);
			stopEditing();
		} else if (e.key === "Escape") {
			stopEditing();
		}
	};

	return (
		<div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
			<div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="flex justify-between items-center p-6 border-b">
					<div className="flex items-center space-x-2">
						<FileSpreadsheet className="w-6 h-6 text-green-600" />
						<h2 className="text-xl font-semibold text-gray-900">
							Import Students from CSV/Excel
						</h2>
					</div>
					<button
						onClick={onClose}
						className="text-gray-400 transition-colors hover:text-gray-600"
					>
						<X className="w-6 h-6" />
					</button>
				</div>

				<div className="p-6">
					{!file ? (
						<>
							{/* Instructions */}
							<div className="p-4 mb-6 bg-blue-50 rounded-lg">
								<h3 className="mb-2 font-medium text-blue-900">
									File Requirements:
								</h3>
								<ul className="space-y-1 text-sm text-blue-800">
									<li>
										• <strong>CSV format (.csv) is recommended</strong> for best
										compatibility
									</li>
									<li>
										• Excel formats (.xls, .xlsx) are supported but may require
										additional server components
									</li>
									<li>
										• Required columns: LRN, Name, Birth Date, Age, Religion,
										Address
									</li>
									<li>
										• Names should be in "LAST NAME, FIRST NAME MIDDLE NAME"
										format
									</li>
									<li>• Dates should be in MM/DD/YYYY format</li>
									<li>• File size should be less than 10MB</li>
								</ul>
							</div>

							{/* File Upload Area */}
							<div
								className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
									dragActive
										? "bg-green-50 border-green-400"
										: file
										? "bg-green-50 border-green-300"
										: "border-gray-300 hover:border-gray-400"
								}`}
								onDragEnter={handleDrag}
								onDragLeave={handleDrag}
								onDragOver={handleDrag}
								onDrop={handleDrop}
							>
								<input
									type="file"
									id="file-input"
									accept=".csv,.xls,.xlsx"
									onChange={handleFileSelect}
									className="hidden"
								/>

								<div className="space-y-4">
									<Upload className="mx-auto w-12 h-12 text-gray-400" />
									<div>
										<p className="text-lg font-medium text-gray-900">
											Drop your CSV or Excel file here, or{" "}
											<label
												htmlFor="file-input"
												className="text-green-600 cursor-pointer hover:text-green-500"
											>
												browse
											</label>
										</p>
										<p className="mt-1 text-sm text-gray-500">
											Supports .csv, .xls, and .xlsx files up to 10MB
										</p>
									</div>
								</div>
							</div>
						</>
					) : (
						<>
							{/* Section Selection */}
							<div className="mb-4">
								<div className="flex items-center mb-2 space-x-2">
									<Users className="w-5 h-5 text-blue-600" />
									<label className="font-medium text-gray-900">
										Select Section for All Students:
									</label>
								</div>
								<select
									value={selectedSection}
									onChange={(e) => setSelectedSection(e.target.value)}
									className="px-3 py-2 w-full bg-white rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									disabled={loadingSections}
								>
									<option value="">
										{loadingSections
											? "Loading sections..."
											: "Select a section"}
									</option>
									{sections.map((section) => (
										<option key={section.id} value={section.id}>
											{section.name}
										</option>
									))}
								</select>
								<p className="mt-1 text-sm text-gray-600">
									All imported students will be assigned to the selected
									section.
								</p>
							</div>

							{/* Preview Table */}
							<div className="mb-4">
								<div className="flex justify-between items-center mb-2">
									<h3 className="font-medium text-green-900">
										Preview Data ({previewData.length} rows)
									</h3>
									<div className="text-sm text-gray-600">
										Click on cells to edit • Click trash icon to remove rows
									</div>
								</div>
								{isParsing ? (
									<div className="text-center text-gray-500">
										Parsing file...
									</div>
								) : (
									<div className="overflow-x-auto max-h-[50vh] border rounded-lg">
										<table className="min-w-full text-xs lg:text-sm text-slate-700">
											<thead>
												<tr>
													<th className="px-3 py-2 w-16 font-semibold text-left bg-gray-100">
														Actions
													</th>
													{headers.map((header, idx) => (
														<th
															key={idx}
															className="px-3 py-2 font-semibold text-left bg-gray-100"
														>
															{header}
														</th>
													))}
												</tr>
											</thead>
											<tbody>
												{previewData.map((row, rIdx) => (
													<tr
														key={rIdx}
														className={
															rIdx % 2 === 0 ? "bg-white" : "bg-gray-50"
														}
													>
														<td className="px-3 py-2">
															<button
																onClick={() => removeRow(rIdx)}
																className="p-1 text-red-500 rounded transition-colors hover:text-red-700 hover:bg-red-50"
																title="Remove this row"
															>
																<Trash2 className="w-4 h-4" />
															</button>
														</td>
														{headers.map((_, cIdx) => (
															<td
																key={cIdx}
																className="relative px-3 py-2 group"
															>
																{editingCell?.rowIndex === rIdx &&
																editingCell?.colIndex === cIdx ? (
																	<input
																		type="text"
																		defaultValue={row[cIdx] || ""}
																		onBlur={(e) => {
																			updateCellValue(
																				rIdx,
																				cIdx,
																				e.target.value
																			);
																			stopEditing();
																		}}
																		onKeyPress={(e) =>
																			handleCellKeyPress(e, rIdx, cIdx)
																		}
																		className="px-2 py-1 w-full text-sm rounded border border-blue-300 focus:outline-none focus:border-blue-500"
																		autoFocus
																	/>
																) : (
																	<div
																		onClick={() => startEditing(rIdx, cIdx)}
																		className="min-h-[24px] cursor-pointer hover:bg-blue-50 rounded px-1 py-1 flex items-center group"
																		title="Click to edit"
																	>
																		<span className="overflow-hidden flex-1 whitespace-nowrap text-ellipsis">
																			{row[cIdx] || ""}
																		</span>
																		<Edit3 className="ml-1 w-3 h-3 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
																	</div>
																)}
															</td>
														))}
													</tr>
												))}
											</tbody>
										</table>
									</div>
								)}
								{previewData.length === 0 && !isParsing && (
									<div className="py-8 text-center text-gray-500">
										No data to preview. All rows may have been removed.
									</div>
								)}
							</div>

							{/* Save Button */}
							<div className="flex justify-end mt-6 space-x-3">
								<button
									onClick={resetForm}
									className="px-4 py-2 text-gray-700 rounded-md border border-gray-300 transition-colors hover:bg-gray-50"
								>
									Cancel
								</button>
								<button
									onClick={handleSave}
									disabled={
										isSaving ||
										isParsing ||
										!previewData.length ||
										!selectedSection
									}
									className="flex items-center px-6 py-2 space-x-2 text-white bg-green-600 rounded-md transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{isSaving ? (
										<>
											<div className="w-4 h-4 rounded-full border-b-2 border-white animate-spin"></div>
											<span>Saving...</span>
										</>
									) : (
										<>
											<Save className="w-4 h-4" />
											<span>
												{!selectedSection
													? "Select Section to Save"
													: "Save to Database"}
											</span>
										</>
									)}
								</button>
							</div>

							{/* Save Result */}
							{saveResult && (
								<div className="mt-6">
									{saveResult.success ? (
										<div className="font-semibold text-green-700">
											{saveResult.message}
										</div>
									) : (
										<div className="font-semibold text-red-700">
											{saveResult.error}
										</div>
									)}
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default StudentImport;
