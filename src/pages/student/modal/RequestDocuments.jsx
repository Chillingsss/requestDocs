import React, { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "@radix-ui/react-label";
import {
	getDocuments,
	getRequirementsType,
	getDocumentRequirements,
	getDocumentPurposes,
	addRequestDocument,
	addCombinedRequestDocument,
} from "../../../utils/student";
import toast from "react-hot-toast";

export default function RequestDocuments({
	isOpen,
	onClose,
	userId,
	onSuccess,
}) {
	const [selectedDocument, setSelectedDocument] = useState("");
	const [purpose, setPurpose] = useState("");
	const [selectedPurposeIds, setSelectedPurposeIds] = useState([]);
	const [documents, setDocuments] = useState([]);
	const [loadingDocs, setLoadingDocs] = useState(false);
	const [selectedFiles, setSelectedFiles] = useState([]);
	const [requestTypes, setRequestTypes] = useState([]);
	const [loadingRequestTypes, setLoadingRequestTypes] = useState(false);
	const [requestBothDocuments, setRequestBothDocuments] = useState(false);
	const [documentRequirements, setDocumentRequirements] = useState([]);
	const [loadingDocumentRequirements, setLoadingDocumentRequirements] =
		useState(false);
	const [secondaryRequirements, setSecondaryRequirements] = useState([]);
	const [loadingSecondaryRequirements, setLoadingSecondaryRequirements] =
		useState(false);
	const [documentPurposes, setDocumentPurposes] = useState([]);
	const [loadingDocumentPurposes, setLoadingDocumentPurposes] = useState(false);
	const [isPurposeDropdownOpen, setIsPurposeDropdownOpen] = useState(false);
	const [purposeSearchTerm, setPurposeSearchTerm] = useState("");

	// Fetch documents and request types when modal opens
	React.useEffect(() => {
		if (isOpen) {
			setLoadingDocs(true);
			setLoadingRequestTypes(true);

			Promise.all([
				getDocuments().then((data) => {
					setDocuments(Array.isArray(data) ? data : []);
				}),
				getRequirementsType().then((data) => {
					setRequestTypes(Array.isArray(data) ? data : []);
				}),
			]).finally(() => {
				setLoadingDocs(false);
				setLoadingRequestTypes(false);
			});
		}
	}, [isOpen]);

	// Handle clicking outside dropdown to close it
	React.useEffect(() => {
		const handleClickOutside = (event) => {
			if (isPurposeDropdownOpen && !event.target.closest(".purpose-dropdown")) {
				setIsPurposeDropdownOpen(false);
			}
		};

		const handleEscape = (event) => {
			if (event.key === "Escape" && isPurposeDropdownOpen) {
				setIsPurposeDropdownOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleEscape);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleEscape);
		};
	}, [isPurposeDropdownOpen]);

	// Get the selected document name
	const getSelectedDocumentName = () => {
		const selectedDoc = documents.find(
			(doc) => String(doc.id) === String(selectedDocument)
		);
		return selectedDoc ? selectedDoc.name : "";
	};
	console.log("selectedDocument", selectedDocument, typeof selectedDocument);
	console.log("documents", documents);
	const selectedDoc = documents.find(
		(doc) => String(doc.id) === String(selectedDocument)
	);
	console.log("selectedDoc", selectedDoc);

	// Get filtered requirement types based on selected document
	const getFilteredRequirementTypes = () => {
		// If we have dynamic document requirements, use those
		const activeReqs = getActiveRequirements();
		if (activeReqs && activeReqs.length > 0) {
			return activeReqs.map((req) => ({
				id: req.requirementId,
				nameType: req.requirementName,
			}));
		}

		// Fallback to old logic for documents without requirements in database
		const selectedDocName = getSelectedDocumentName().toLowerCase();

		if (selectedDocName.includes("diploma")) {
			// For Diploma, only show Affidavit of Loss
			return requestTypes.filter(
				(type) =>
					type.nameType &&
					type.nameType.toLowerCase().includes("affidavit of loss")
			);
		} else if (selectedDocName.includes("cav")) {
			// For CAV, only show Diploma
			return requestTypes.filter(
				(type) =>
					type.nameType && type.nameType.toLowerCase().includes("diploma")
			);
		}

		// For other documents, show all requirement types
		return requestTypes;
	};

	// Get active requirements depending on selection
	const getActiveRequirements = () => {
		const isCav = getSelectedDocumentName().toLowerCase().includes("cav");
		if (isCav && requestBothDocuments && secondaryRequirements.length > 0) {
			return secondaryRequirements;
		}
		return documentRequirements;
	};

	// Check if selected document requires attachments
	const requiresAttachments = () => {
		// If we have active requirements from the database, use that
		const activeReqs = getActiveRequirements();
		if (activeReqs && activeReqs.length > 0) {
			return true;
		}

		// Fallback to old logic for documents without requirements in database
		const selectedDocName = getSelectedDocumentName().toLowerCase();
		return (
			selectedDocName.includes("diploma") || selectedDocName.includes("cav")
		);
	};

	// Check if selected document is SF10
	const isSF10Document = () => {
		const selectedDocName = getSelectedDocumentName().toLowerCase();
		return (
			selectedDocName.includes("sf10") || selectedDocName.includes("sf-10")
		);
	};

	// Check if submit button should be disabled
	const isSubmitDisabled = () => {
		console.log("=== isSubmitDisabled Debug ===");
		console.log("selectedDocument:", selectedDocument);
		console.log("purpose:", purpose);
		console.log("selectedPurposeIds:", selectedPurposeIds);
		console.log("selectedFiles:", selectedFiles);

		if (!selectedDocument) {
			console.log("Missing document");
			return true;
		}

		// Check purpose validation
		if (hasPredefinedPurposes()) {
			// If document has predefined purposes, at least one must be selected
			if (selectedPurposeIds.length === 0) {
				console.log("No predefined purposes selected");
				return true;
			}
		} else {
			// If no predefined purposes, custom purpose is required
			if (!purpose || purpose.trim() === "") {
				console.log("Missing custom purpose");
				return true;
			}
		}

		if (isSF10Document()) {
			console.log("SF10 document - no file validation needed");
			return false;
		}

		// Special case: CAV with combined request doesn't need attachments
		const isCavDocument = getSelectedDocumentName()
			.toLowerCase()
			.includes("cav");
		if (isCavDocument && requestBothDocuments) {
			console.log("CAV combined request - no attachment validation");
			return false; // No attachment validation needed for combined requests
		}

		// For Diploma and CAV (without combined request), require attachments
		if (requiresAttachments() && selectedFiles.length === 0) {
			console.log("Requires attachments but no files selected");
			return true;
		}

		// If files are selected, require all files to have a requirement type
		if (selectedFiles.length > 0) {
			const filesWithoutType = selectedFiles.filter(
				(fileObj) => !fileObj.typeId
			);
			console.log("Files without typeId:", filesWithoutType);
			if (filesWithoutType.length > 0) {
				console.log("Some files don't have typeId - button disabled");
				return true;
			}
		}

		console.log("All validations passed - button enabled");
		return false;
	};

	// Handle document type change
	const handleDocumentChange = async (documentId) => {
		setSelectedDocument(documentId);
		setPurpose("");
		setSelectedPurposeIds([]);
		setSelectedFiles([]);
		setDocumentRequirements([]);
		setSecondaryRequirements([]);
		setDocumentPurposes([]);
		setRequestBothDocuments(false);

		// Reset file inputs
		const fileInput = document.getElementById("file-upload");
		const addMoreInput = document.getElementById("add-more-files");
		if (fileInput) fileInput.value = "";
		if (addMoreInput) addMoreInput.value = "";

		// Fetch document requirements and purposes dynamically
		if (documentId) {
			setLoadingDocumentRequirements(true);
			setLoadingDocumentPurposes(true);
			try {
				const [requirements, purposes] = await Promise.all([
					getDocumentRequirements(documentId),
					getDocumentPurposes(documentId),
				]);

				setDocumentRequirements(
					Array.isArray(requirements) ? requirements : []
				);
				setDocumentPurposes(Array.isArray(purposes) ? purposes : []);
			} catch (error) {
				console.error(
					"Failed to fetch document requirements or purposes:",
					error
				);
				setDocumentRequirements([]);
				setDocumentPurposes([]);
			} finally {
				setLoadingDocumentRequirements(false);
				setLoadingDocumentPurposes(false);
			}
		}
	};

	const handleFileChange = (e) => {
		if (isSF10Document()) return;
		const files = Array.from(e.target.files);
		if (files.length > 0) {
			// Validate file type
			const allowedTypes = [
				"image/jpeg",
				"image/jpg",
				"image/png",
				"image/gif",
				"application/pdf",
			];
			const invalidFiles = files.filter(
				(file) => !allowedTypes.includes(file.type)
			);
			if (invalidFiles.length > 0) {
				toast.error(
					"Invalid file type. Only JPG, PNG, GIF, and PDF files are allowed."
				);
				e.target.value = "";
				return;
			}

			// Validate file size (5MB max)
			const largeFiles = files.filter((file) => file.size > 5 * 1024 * 1024);
			if (largeFiles.length > 0) {
				toast.error("File size too large. Maximum size is 5MB.");
				e.target.value = "";
				return;
			}

			// Use dynamic requirements if available, otherwise fallback to old logic
			const fileObjects = files.map((file, index) => {
				let typeId = "";

				const activeReqs = getActiveRequirements();
				if (activeReqs && activeReqs.length > 0) {
					// If we have multiple requirements, assign them in order
					// If more files than requirements, use the first requirement as default
					const requirementIndex = Math.min(index, activeReqs.length - 1);
					typeId = activeReqs[requirementIndex]?.requirementId || "";
				} else {
					// Fallback to old logic
					const isDiploma = getSelectedDocumentName()
						.toLowerCase()
						.includes("diploma");
					const isCAV = getSelectedDocumentName().toLowerCase().includes("cav");
					const affidavitTypeId = getAffidavitTypeId();
					const diplomaTypeId = getRequiredTypeForCAVId();
					typeId = isDiploma ? affidavitTypeId : isCAV ? diplomaTypeId : "";
				}

				return {
					file: file,
					typeId: typeId,
				};
			});

			console.log(
				"Created fileObjects with dynamic requirements:",
				fileObjects
			);
			setSelectedFiles(fileObjects);
		}
	};

	const handleAddMoreFiles = (e) => {
		if (isSF10Document()) return;
		const newFiles = Array.from(e.target.files);
		if (newFiles.length > 0) {
			// Validate file type
			const allowedTypes = [
				"image/jpeg",
				"image/jpg",
				"image/png",
				"image/gif",
				"application/pdf",
			];
			const invalidFiles = newFiles.filter(
				(file) => !allowedTypes.includes(file.type)
			);
			if (invalidFiles.length > 0) {
				toast.error(
					"Invalid file type. Only JPG, PNG, GIF, and PDF files are allowed."
				);
				e.target.value = "";
				return;
			}

			// Validate file size (5MB max)
			const largeFiles = newFiles.filter((file) => file.size > 5 * 1024 * 1024);
			if (largeFiles.length > 0) {
				toast.error("File size too large. Maximum size is 5MB.");
				e.target.value = "";
				return;
			}

			// Use dynamic requirements if available, otherwise fallback to old logic
			const newFileObjects = newFiles.map((file, index) => {
				let typeId = "";

				const activeReqs = getActiveRequirements();
				if (activeReqs && activeReqs.length > 0) {
					// For additional files, cycle through available requirements
					const currentFileCount = selectedFiles.length;
					const requirementIndex =
						(currentFileCount + index) % activeReqs.length;
					typeId = activeReqs[requirementIndex]?.requirementId || "";
				} else {
					// Fallback to old logic
					const isDiploma = getSelectedDocumentName()
						.toLowerCase()
						.includes("diploma");
					const isCAV = getSelectedDocumentName().toLowerCase().includes("cav");
					const affidavitTypeId = getAffidavitTypeId();
					const diplomaTypeId = getRequiredTypeForCAVId();
					typeId = isDiploma ? affidavitTypeId : isCAV ? diplomaTypeId : "";
				}

				return {
					file: file,
					typeId: typeId,
				};
			});

			setSelectedFiles((prev) => [...prev, ...newFileObjects]);
			e.target.value = "";
		}
	};

	const removeFile = (indexToRemove) => {
		setSelectedFiles((prev) => {
			const newFiles = prev.filter((_, index) => index !== indexToRemove);
			return newFiles;
		});
	};

	const updateFileTypeId = (index, typeId) => {
		setSelectedFiles((prev) => {
			const newFiles = [...prev];
			newFiles[index].typeId = typeId;
			return newFiles;
		});
	};

	const handlePurposeCheckboxChange = (purposeId, checked) => {
		if (checked) {
			setSelectedPurposeIds((prev) => [...prev, purposeId]);
		} else {
			setSelectedPurposeIds((prev) => prev.filter((id) => id !== purposeId));
		}
	};

	const hasPredefinedPurposes = () => {
		return documentPurposes && documentPurposes.length > 0;
	};

	const selectAllPurposes = () => {
		setSelectedPurposeIds(documentPurposes.map((p) => p.id));
	};

	const clearAllPurposes = () => {
		setSelectedPurposeIds([]);
	};

	const handleRequestSubmit = async (e) => {
		e.preventDefault();

		// Use the centralized validation
		if (isSubmitDisabled()) {
			if (!selectedDocument) {
				toast.error("Please select a document type");
				return;
			}

			// Check purpose validation
			if (hasPredefinedPurposes()) {
				if (selectedPurposeIds.length === 0) {
					toast.error("Please select at least one purpose");
					return;
				}
			} else {
				if (!purpose || purpose.trim() === "") {
					toast.error("Please enter a purpose");
					return;
				}
			}

			// Special handling for CAV combined requests
			const isCavDocument = getSelectedDocumentName()
				.toLowerCase()
				.includes("cav");
			if (isCavDocument && requestBothDocuments) {
				// No attachment validation needed for combined requests
			} else if (requiresAttachments() && selectedFiles.length === 0) {
				toast.error("This document type requires file attachments");
				return;
			}

			if (selectedFiles.length > 0) {
				const filesWithoutType = selectedFiles.filter(
					(fileObj) => !fileObj.typeId
				);
				if (filesWithoutType.length > 0) {
					toast.error("Please select a requirement type for all attachments");
					return;
				}
			}

			return;
		}

		try {
			// Extract just the files for the API call
			const attachments = selectedFiles.map((fileObj) => fileObj.file);
			const typeIds = selectedFiles.map((fileObj) => fileObj.typeId);

			// Validate that we have matching files and typeIds
			if (attachments.length !== typeIds.length) {
				toast.error("Mismatch between files and requirement types");
				return;
			}

			// Check if this is a combined CAV + Diploma request
			const isCavDocument = getSelectedDocumentName()
				.toLowerCase()
				.includes("cav");
			if (isCavDocument && requestBothDocuments) {
				// Find Diploma document ID
				const diplomaDocument = documents.find((doc) =>
					doc.name.toLowerCase().includes("diploma")
				);

				if (!diplomaDocument) {
					toast.error("Diploma document type not found");
					return;
				}

				await addCombinedRequestDocument({
					userId,
					primaryDocumentId: selectedDocument, // CAV
					secondaryDocumentId: diplomaDocument.id, // Diploma
					purpose: hasPredefinedPurposes() ? "" : purpose,
					purposeIds: hasPredefinedPurposes() ? selectedPurposeIds : [],
					attachments: attachments,
					typeIds: typeIds,
				});
				toast.success(
					"Combined request for Diploma and CAV submitted successfully!"
				);
			} else {
				await addRequestDocument({
					userId,
					documentId: selectedDocument,
					purpose: hasPredefinedPurposes() ? "" : purpose,
					purposeIds: hasPredefinedPurposes() ? selectedPurposeIds : [],
					attachments: attachments,
					typeIds: typeIds, // Send array of typeIds
				});
				toast.success("Request submitted successfully!");
			}

			// Reset form
			setSelectedDocument("");
			setPurpose("");
			setSelectedPurposeIds([]);
			setSelectedFiles([]);
			setRequestBothDocuments(false);
			setDocumentRequirements([]);
			setSecondaryRequirements([]);
			setDocumentPurposes([]);
			// Reset file inputs
			const fileInput = document.getElementById("file-upload");
			const addMoreInput = document.getElementById("add-more-files");
			if (fileInput) fileInput.value = "";
			if (addMoreInput) addMoreInput.value = "";

			// Close modal and call success callback
			onClose();
			if (onSuccess) onSuccess();
		} catch (err) {
			toast.error("Failed to submit request");
		}
	};

	const handleClose = () => {
		// Reset form when closing
		setSelectedDocument("");
		setPurpose("");
		setSelectedFiles([]);
		setRequestBothDocuments(false);
		setDocumentRequirements([]);
		setSecondaryRequirements([]);
		setDocumentPurposes([]);
		setIsPurposeDropdownOpen(false);
		setPurposeSearchTerm("");
		// Reset file inputs
		const fileInput = document.getElementById("file-upload");
		const addMoreInput = document.getElementById("add-more-files");
		if (fileInput) fileInput.value = "";
		if (addMoreInput) addMoreInput.value = "";
		onClose();
	};

	if (!isOpen) return null;

	const getAffidavitTypeId = () => {
		console.log("All requestTypes:", requestTypes);
		const type = requestTypes.find(
			(t) =>
				t.nameType &&
				(t.nameType.toLowerCase().includes("affidavit of loss") ||
					t.nameType.toLowerCase().includes("affidavit"))
		);
		console.log("Found affidavit type:", type);
		return type ? type.id : "";
	};

	const getRequiredTypeForDiploma = () => {
		const type = requestTypes.find(
			(t) => t.nameType && t.nameType.toLowerCase().includes("affidavit")
		);
		return type ? type.nameType : "Affidavit of Loss";
	};
	const getRequiredTypeForCAV = () => {
		const type = requestTypes.find(
			(t) => t.nameType && t.nameType.toLowerCase().includes("diploma")
		);
		return type ? type.nameType : "Diploma";
	};

	const getRequiredTypeForCAVId = () => {
		const type = requestTypes.find(
			(t) => t.nameType && t.nameType.toLowerCase().includes("diploma")
		);
		return type ? type.id : "";
	};

	const isCertificateOfEnrollment = () => {
		const selectedDocName = getSelectedDocumentName().toLowerCase();
		return selectedDocName.includes("certificate of enrollment");
	};

	const filteredPurposes = documentPurposes.filter((purpose) =>
		purpose.name.toLowerCase().includes(purposeSearchTerm.toLowerCase())
	);

	return (
		<div className="flex fixed inset-0 z-50 justify-center items-center backdrop-blur-sm bg-black/40">
			<div className="relative mx-2 w-full max-w-2xl bg-white rounded-2xl border shadow-2xl dark:bg-slate-800 dark:border-slate-700 border-slate-200">
				{/* Title Bar */}
				<div className="flex justify-between items-center px-6 py-4 rounded-t-2xl border-b bg-slate-50 border-slate-100 dark:bg-slate-700 dark:border-slate-600">
					<h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
						Request Document
					</h3>
					<button
						onClick={handleClose}
						className="p-1 rounded-full transition-colors text-slate-400 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:text-slate-200 dark:hover:text-slate-400"
						aria-label="Close"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="w-5 h-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
				<form onSubmit={handleRequestSubmit} className="px-6 py-6 space-y-5">
					<div>
						<Label
							htmlFor="document-type"
							className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-500"
						>
							Document Type
						</Label>
						<select
							id="document-type"
							value={selectedDocument}
							onChange={(e) => handleDocumentChange(e.target.value)}
							className="block px-3 py-2 w-full rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-slate-50 text-slate-900 dark:bg-slate-700 dark:text-slate-50 dark:border-slate-600"
							required
							disabled={loadingDocs}
						>
							<option value="">
								{loadingDocs ? "Loading..." : "Select a document"}
							</option>
							{documents.map((doc) => (
								<option key={doc.id} value={doc.id}>
									{doc.name}
								</option>
							))}
						</select>
					</div>

					{/* Only show Purpose and Attachments when a document is selected */}
					{selectedDocument && (
						<>
							<div>
								<Label
									htmlFor="purpose"
									className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-500"
								>
									Purpose
									<span className="text-red-500 dark:text-red-500">*</span>
								</Label>

								{/* Show predefined purposes as checkboxes if they exist */}
								{hasPredefinedPurposes() ? (
									<div className="space-y-2">
										{/* Multi-select dropdown */}
										<div className="relative purpose-dropdown">
											<button
												type="button"
												onClick={() =>
													setIsPurposeDropdownOpen(!isPurposeDropdownOpen)
												}
												className="w-full px-3 py-1.5 text-left bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50"
											>
												{selectedPurposeIds.length === 0 ? (
													<span className="text-slate-500 dark:text-slate-400">
														Select purposes for your request
													</span>
												) : (
													<div className="flex flex-wrap gap-1 max-w-full">
														{selectedPurposeIds.slice(0, 3).map((purposeId) => {
															const purpose = documentPurposes.find(
																(p) => p.id === purposeId
															);
															return (
																<span
																	key={purposeId}
																	className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900 dark:text-blue-200 max-w-full"
																>
																	<span className="truncate">
																		{purpose?.name}
																	</span>
																	<button
																		type="button"
																		onClick={(e) => {
																			e.stopPropagation();
																			handlePurposeCheckboxChange(
																				purposeId,
																				false
																			);
																		}}
																		className="ml-1 inline-flex items-center justify-center w-4 h-4 text-blue-400 hover:text-blue-600 dark:text-blue-300 dark:hover:text-blue-100 flex-shrink-0"
																	>
																		×
																	</button>
																</span>
															);
														})}
														{selectedPurposeIds.length > 3 && (
															<span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-full dark:bg-slate-700 dark:text-slate-300">
																+{selectedPurposeIds.length - 3} more
															</span>
														)}
													</div>
												)}
												<span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
													{selectedPurposeIds.length > 0 && (
														<span className="mr-2 inline-flex items-center justify-center w-4 h-4 text-xs font-medium bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900 dark:text-blue-200">
															{selectedPurposeIds.length}
														</span>
													)}
													<svg
														className={`w-5 h-5 text-slate-400 transition-transform ${
															isPurposeDropdownOpen ? "rotate-180" : ""
														}`}
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M19 9l-7 7-7-7"
														/>
													</svg>
												</span>
											</button>

											{/* Dropdown menu */}
											{isPurposeDropdownOpen && (
												<div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto dark:bg-slate-700 dark:border-slate-600">
													<div className="p-2">
														{/* Search input */}
														<div className="relative mb-2">
															<input
																type="text"
																placeholder="Search purposes..."
																value={purposeSearchTerm}
																onChange={(e) =>
																	setPurposeSearchTerm(e.target.value)
																}
																className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-slate-600 dark:border-slate-500 dark:text-slate-50"
															/>
															<svg
																className="absolute right-2 top-2.5 w-4 h-4 text-slate-400"
																fill="none"
																stroke="currentColor"
																viewBox="0 0 24 24"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={2}
																	d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
																/>
															</svg>
														</div>

														{/* Select All / Clear All buttons */}
														<div className="flex gap-2 mb-2">
															<button
																type="button"
																onClick={selectAllPurposes}
																className="px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900"
															>
																Select All
															</button>
															<button
																type="button"
																onClick={clearAllPurposes}
																className="px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded dark:text-slate-400 dark:hover:text-slate-300 dark:hover:bg-slate-700"
															>
																Clear All
															</button>
														</div>

														{/* Purpose options */}
														<div className="space-y-1">
															{filteredPurposes.map((purposeItem) => (
																<label
																	key={purposeItem.id}
																	className="flex items-center px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer rounded-md dark:text-slate-300 dark:hover:bg-slate-600"
																>
																	<input
																		type="checkbox"
																		checked={selectedPurposeIds.includes(
																			purposeItem.id
																		)}
																		onChange={(e) =>
																			handlePurposeCheckboxChange(
																				purposeItem.id,
																				e.target.checked
																			)
																		}
																		className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:bg-blue-900 dark:border-blue-800 dark:text-blue-400"
																	/>
																	<span className="ml-3">
																		{purposeItem.name}
																	</span>
																</label>
															))}
														</div>

														{/* No results message */}
														{filteredPurposes.length === 0 && (
															<div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
																No purposes found matching "{purposeSearchTerm}"
															</div>
														)}
													</div>
												</div>
											)}
										</div>

										{/* Selected purposes summary */}
										{selectedPurposeIds.length > 0 && (
											<div className="p-2 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-900 dark:border-blue-800">
												<div className="flex items-center justify-between mb-2">
													<p className="text-xs font-medium text-blue-800 dark:text-blue-200">
														Selected purposes ({selectedPurposeIds.length}):
													</p>
													<button
														type="button"
														onClick={clearAllPurposes}
														className="text-xs text-blue-600 hover:text-blue-800 underline dark:text-blue-400 dark:hover:text-blue-300"
													>
														Clear all
													</button>
												</div>
												<div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
													{selectedPurposeIds.map((purposeId) => {
														const purpose = documentPurposes.find(
															(p) => p.id === purposeId
														);
														return (
															<div
																key={purposeId}
																className="flex items-center justify-between px-2 py-1 bg-white rounded border border-blue-200 dark:bg-slate-700 dark:border-slate-600"
															>
																<span className="text-xs text-blue-800 dark:text-blue-200 truncate">
																	{purpose?.name}
																</span>
																<button
																	type="button"
																	onClick={() =>
																		handlePurposeCheckboxChange(
																			purposeId,
																			false
																		)
																	}
																	className="ml-2 flex-shrink-0 w-4 h-4 text-blue-400 hover:text-blue-600 dark:text-blue-300 dark:hover:text-blue-100 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-full flex items-center justify-center text-xs"
																>
																	×
																</button>
															</div>
														);
													})}
												</div>
											</div>
										)}

										<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
											Select one or more purposes for your request
										</p>
									</div>
								) : (
									/* Show custom purpose input field */
									<Input
										id="purpose"
										placeholder="Enter the purpose of your request"
										className="px-3 py-2 w-full rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-slate-50 text-slate-900 dark:bg-slate-700 dark:text-slate-50 dark:border-slate-600"
										value={purpose}
										onChange={(e) => setPurpose(e.target.value)}
										required
									/>
								)}
							</div>
							<div>
								{/* Only show Document Attachments section if not SF10 or Certificate of Enrollment */}
								{!isCertificateOfEnrollment() && !isSF10Document() && (
									<div>
										<Label
											htmlFor="file-upload"
											className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-500"
										>
											Document Attachments
											{!isSF10Document() &&
												(requiresAttachments() ? (
													<span className="text-red-500 dark:text-red-500">
														*
													</span>
												) : (
													" (Optional)"
												))}
										</Label>
										{getActiveRequirements() &&
											getActiveRequirements().length > 0 && (
												<div className="p-2 mb-2 bg-green-50 rounded border border-green-200 dark:bg-green-900 dark:border-green-800">
													<p className="text-xs text-green-800 dark:text-green-200">
														Required document(s):{" "}
														<b>
															{getActiveRequirements()
																.map((req) => req.requirementName)
																.join(", ")}
														</b>
													</p>
												</div>
											)}
										{/* Only show file input and file management for non-SF10 */}
										<Input
											type="file"
											id="file-upload"
											accept=".jpg, .jpeg, .png, .gif, .pdf"
											onChange={handleFileChange}
											className="block w-full text-sm rounded-lg border cursor-pointer text-slate-900 border-slate-300 bg-slate-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:text-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:file:bg-blue-600 dark:file:text-white dark:hover:file:bg-blue-700"
											multiple
										/>
										<p className="mt-1 text-xs text-slate-500">
											You can select multiple files (JPG, PNG, GIF, PDF). Max
											5MB per file.
										</p>
										{/* Show message when no files selected for required documents */}
										{requiresAttachments() && selectedFiles.length === 0 && (
											<div className="p-2 mt-2 bg-red-50 rounded border border-red-200 dark:bg-red-900 dark:border-red-800">
												<p className="text-xs text-red-600 dark:text-red-400">
													⚠️ This document type requires file attachments.
													Please upload the required documents:{" "}
													<b>
														{documentRequirements &&
														documentRequirements.length > 0
															? documentRequirements
																	.map((req) => req.requirementName)
																	.join(", ")
															: getSelectedDocumentName()
																	.toLowerCase()
																	.includes("diploma")
															? getRequiredTypeForDiploma()
															: getSelectedDocumentName()
																	.toLowerCase()
																	.includes("cav")
															? getRequiredTypeForCAV()
															: "the required documents"}
													</b>
													.
												</p>
											</div>
										)}

										{/* CAV Combined Request Option */}
										{getSelectedDocumentName()
											.toLowerCase()
											.includes("cav") && (
											<div className="p-3 mt-2 bg-blue-50 rounded border border-blue-200 dark:bg-blue-900 dark:border-blue-800">
												<div className="flex items-start space-x-2">
													<input
														type="checkbox"
														id="requestBothDocuments"
														checked={requestBothDocuments}
														onChange={async (e) => {
															const checked = e.target.checked;
															setRequestBothDocuments(checked);
															if (checked) {
																// find diploma document id
																const diplomaDoc = documents.find((d) =>
																	(String(d.name) || "")
																		.toLowerCase()
																		.includes("diploma")
																);
																if (diplomaDoc) {
																	setLoadingSecondaryRequirements(true);
																	try {
																		const reqs = await getDocumentRequirements(
																			diplomaDoc.id
																		);
																		setSecondaryRequirements(
																			Array.isArray(reqs) ? reqs : []
																		);
																	} catch (err) {
																		setSecondaryRequirements([]);
																	} finally {
																		setLoadingSecondaryRequirements(false);
																	}
																}
															} else {
																setSecondaryRequirements([]);
															}
														}}
														className="mt-0.5 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:bg-blue-900 dark:border-blue-800 dark:text-blue-400"
													/>
													<div className="flex-1">
														<label
															htmlFor="requestBothDocuments"
															className="text-sm font-medium text-blue-800 cursor-pointer dark:text-blue-400"
														>
															Request both Diploma and CAV together
														</label>
														<p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
															If you don't have a Diploma yet, check this option
															to request both documents in a single request. The
															Diploma will be processed first, then the CAV will
															be processed once the Diploma is ready.
														</p>
													</div>
												</div>
											</div>
										)}
									</div>
								)}

								{/* SF10: Show dynamic requirements note (no uploads) */}
								{isSF10Document() && (
									<div className="p-3 mb-3 bg-green-50 rounded-lg border border-green-200 dark:bg-green-900 dark:border-green-800">
										<p className="text-sm text-green-800 dark:text-green-200">
											Please bring{" "}
											<strong>
												{getActiveRequirements() &&
												getActiveRequirements().length > 0
													? getActiveRequirements()
															.map((req) => req.requirementName)
															.join(", ")
													: "Request Letter"}
											</strong>{" "}
											to the office when you collect your document.
										</p>
									</div>
								)}

								{/* Only show file management for non-SF10 documents */}
								{!isSF10Document() && (
									<>
										{/* Hidden input for adding more files */}
										<input
											type="file"
											id="add-more-files"
											accept=".jpg, .jpeg, .png, .gif, .pdf"
											onChange={handleAddMoreFiles}
											className="hidden"
											multiple
										/>

										{selectedFiles.length > 0 && (
											<div className="mt-3">
												<div className="flex justify-between items-center mb-2">
													<p className="text-xs font-medium text-slate-600 dark:text-slate-400">
														Selected files ({selectedFiles.length}):
													</p>
													<button
														type="button"
														onClick={() =>
															document.getElementById("add-more-files").click()
														}
														className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600"
													>
														+ Add More Files
													</button>
												</div>
												<div className="overflow-y-auto p-2 space-y-3 max-h-64 rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
													{selectedFiles.map((fileObj, index) => (
														<div
															key={index}
															className="p-3 bg-white rounded-lg border border-slate-300 dark:bg-slate-800 dark:border-slate-700"
														>
															{/* File Info */}
															<div className="flex justify-between items-start mb-2">
																<div className="flex-1 min-w-0">
																	<p className="text-xs font-medium truncate text-slate-700 dark:text-slate-400">
																		{fileObj.file.name}
																	</p>
																	<p className="text-xs text-slate-500 dark:text-slate-400">
																		{(fileObj.file.size / 1024 / 1024).toFixed(
																			2
																		)}{" "}
																		MB
																	</p>
																</div>
																<button
																	type="button"
																	onClick={() => removeFile(index)}
																	className="flex-shrink-0 ml-2 text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-600"
																	title="Remove file"
																>
																	✕
																</button>
															</div>

															{/* Requirement Type Dropdown for this file */}
															<div>
																<Label
																	htmlFor={`requirement-type-${index}`}
																	className="block mb-1 text-xs font-medium text-slate-700 dark:text-slate-50"
																>
																	Requirement Type{" "}
																	<span className="text-red-500 dark:text-red-400">
																		*
																	</span>
																</Label>
																{documentRequirements &&
																documentRequirements.length > 0 ? (
																	// Show dynamic requirements
																	documentRequirements.length === 1 ? (
																		<div className="text-xs font-semibold text-slate-700 dark:text-slate-400">
																			Requirement Type:{" "}
																			{documentRequirements[0].requirementName}
																		</div>
																	) : (
																		<select
																			id={`requirement-type-${index}`}
																			value={fileObj.typeId}
																			onChange={(e) =>
																				updateFileTypeId(index, e.target.value)
																			}
																			className="block px-2 py-1 w-full text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-slate-50 text-slate-900 dark:bg-slate-700 dark:text-slate-50 dark:border-slate-600"
																			required
																			disabled={loadingDocumentRequirements}
																		>
																			<option value="">
																				{loadingDocumentRequirements
																					? "Loading..."
																					: "Select requirement type"}
																			</option>
																			{documentRequirements.map((req) => (
																				<option
																					key={req.requirementId}
																					value={req.requirementId}
																				>
																					{req.requirementName}
																				</option>
																			))}
																		</select>
																	)
																) : // Fallback to old logic
																getSelectedDocumentName()
																		.toLowerCase()
																		.includes("diploma") ? (
																	<div className="text-xs font-semibold text-slate-700 dark:text-slate-400">
																		Requirement Type:{" "}
																		{getRequiredTypeForDiploma()}
																	</div>
																) : getSelectedDocumentName()
																		.toLowerCase()
																		.includes("cav") ? (
																	<div className="text-xs font-semibold text-slate-700 dark:text-slate-400">
																		Requirement Type: {getRequiredTypeForCAV()}
																	</div>
																) : (
																	<select
																		id={`requirement-type-${index}`}
																		value={fileObj.typeId}
																		onChange={(e) =>
																			updateFileTypeId(index, e.target.value)
																		}
																		className="block px-2 py-1 w-full text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-slate-50 text-slate-900 dark:bg-slate-700 dark:text-slate-50 dark:border-slate-600"
																		required
																		disabled={loadingRequestTypes}
																	>
																		<option value="">
																			{loadingRequestTypes
																				? "Loading..."
																				: "Select requirement type"}
																		</option>
																		{getFilteredRequirementTypes().map(
																			(type) => (
																				<option key={type.id} value={type.id}>
																					{type.nameType}
																				</option>
																			)
																		)}
																	</select>
																)}
															</div>
														</div>
													))}
												</div>
											</div>
										)}
									</>
								)}
							</div>
						</>
					)}

					<div className="flex gap-3 pt-2">
						<Button
							type="submit"
							className={`flex-1 h-11 text-base font-semibold rounded-lg shadow-md ${
								isSubmitDisabled()
									? "text-gray-600 bg-gray-400 cursor-not-allowed dark:text-gray-400 dark:bg-gray-600"
									: "text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-400 dark:to-indigo-400 dark:hover:from-blue-500 dark:hover:to-indigo-500"
							}`}
							disabled={isSubmitDisabled()}
						>
							Submit Request
						</Button>
						<Button
							type="button"
							variant="outline"
							className="flex-1 h-11 text-base font-semibold text-white bg-gradient-to-r from-red-600 to-red-600 rounded-lg shadow-md border-slate-300 hover:from-red-700 hover:to-red-700 dark:from-red-400 dark:to-red-400 dark:hover:from-red-500 dark:hover:to-red-500"
							onClick={handleClose}
						>
							Cancel
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
