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
	addMultipleDocumentRequest,
	getExpectedDays,
} from "../../../utils/student";
import toast from "react-hot-toast";

export default function RequestDocuments({
	isOpen,
	onClose,
	userId,
	onSuccess,
	studentGradeLevel,
	userRequests = [], // Add userRequests prop to check for duplicates
}) {
	const [selectedDocument, setSelectedDocument] = useState("");
	const [selectedDocuments, setSelectedDocuments] = useState([]);
	const [documentQuantities, setDocumentQuantities] = useState({}); // Store quantities for each document
	const [isMultipleSelection, setIsMultipleSelection] = useState(false);
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
	const [expectedDays, setExpectedDays] = useState(null);
	const [loadingExpectedDays, setLoadingExpectedDays] = useState(false);
	const [duplicateWarning, setDuplicateWarning] = useState(null);
	const [multipleDocumentRequirements, setMultipleDocumentRequirements] = useState({}); // Store requirements for each selected document
	const [multipleDocumentFiles, setMultipleDocumentFiles] = useState({}); // Store files for each document

	// Fetch documents and request types when modal opens
	React.useEffect(() => {
		if (isOpen) {
			console.log("=== Modal Opening Debug ===");
			console.log("userRequests prop:", userRequests);
			console.log("userRequests length:", userRequests?.length);
			if (userRequests?.length > 0) {
				console.log("Sample request:", userRequests[0]);
			}

			setLoadingDocs(true);
			setLoadingRequestTypes(true);
			setLoadingExpectedDays(true);

			Promise.all([
				getDocuments().then((data) => {
					setDocuments(Array.isArray(data) ? data : []);
				}),
				getRequirementsType().then((data) => {
					setRequestTypes(Array.isArray(data) ? data : []);
				}),
				getExpectedDays()
					.then((data) => {
						setExpectedDays(data);
					})
					.catch((error) => {
						console.error("Failed to fetch expected days:", error);
						// Set default values if fetch fails
						setExpectedDays({ days: 7, expectedReleaseDateFormatted: null });
					}),
			]).finally(() => {
				setLoadingDocs(false);
				setLoadingRequestTypes(false);
				setLoadingExpectedDays(false);
			});
		}
	}, [isOpen]);

	// Check for duplicates when documents are loaded and documents are selected
	React.useEffect(() => {
		if (documents.length > 0 && userRequests.length > 0) {
			let duplicateInfo = null;
			
			if (isMultipleSelection && selectedDocuments.length > 0) {
				// Check for duplicates in multiple selection mode
				for (const docId of selectedDocuments) {
					duplicateInfo = checkForDuplicateRequest(docId);
					if (duplicateInfo) {
						console.log("Found duplicate in multiple mode:", duplicateInfo);
						break; // Stop at first duplicate found
					}
				}
			} else if (selectedDocument) {
				// Check for duplicates in single selection mode
				console.log("Re-checking for duplicates after documents loaded");
				duplicateInfo = checkForDuplicateRequest(selectedDocument);
				if (duplicateInfo) {
					console.log("Found duplicate after documents loaded:", duplicateInfo);
				}
			}
			
			setDuplicateWarning(duplicateInfo);
		} else {
			setDuplicateWarning(null);
		}
	}, [selectedDocument, selectedDocuments, isMultipleSelection, documents, userRequests]);

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

	// Filter documents based on student's grade level
	const getFilteredDocuments = () => {
		if (!studentGradeLevel) return documents;

		// Grade 11 students can only request Certificate and SF10
		if (studentGradeLevel.toLowerCase().includes("grade 11")) {
			return documents.filter(
				(doc) =>
					doc.name.toLowerCase().includes("certificate") ||
					doc.name.toLowerCase().includes("sf10") ||
					doc.name.toLowerCase().includes("sf-10")
			);
		}

		// Grade 12 students can request all documents
		if (studentGradeLevel.toLowerCase().includes("grade 12")) {
			return documents;
		}

		// Default: return all documents if grade level is not recognized
		return documents;
	};

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

		if (selectedDocName.includes("diploma")) {
			return true; // Diploma requires Affidavit of Loss
		} else if (selectedDocName.includes("cav")) {
			return true; // CAV requires Diploma
		}

		return false;
	};

	// Check if any selected documents in multiple mode require attachments
	const requiresAttachmentsMultiple = () => {
		if (!isMultipleSelection || selectedDocuments.length === 0) {
			return false;
		}

		return selectedDocuments.some(docId => {
			const doc = documents.find(d => String(d.id) === String(docId));
			if (!doc) return false;

			// Check if this document has requirements in our state
			if (multipleDocumentRequirements[docId] && multipleDocumentRequirements[docId].length > 0) {
				return true;
			}

			// Fallback to old logic
			const docName = doc.name.toLowerCase();
			return docName.includes("diploma") || docName.includes("cav");
		});
	};

	// Fetch document requirements for multiple documents
	const fetchMultipleDocumentRequirements = async (docId) => {
		try {
			const requirements = await getDocumentRequirements(docId);
			setMultipleDocumentRequirements(prev => ({
				...prev,
				[docId]: Array.isArray(requirements) ? requirements : []
			}));
		} catch (error) {
			console.error(`Failed to fetch requirements for document ${docId}:`, error);
			setMultipleDocumentRequirements(prev => ({
				...prev,
				[docId]: []
			}));
		}
	};

	// Fetch document purposes for multiple document mode
	const fetchDocumentPurposesForMultiple = async (docId) => {
		try {
			const purposes = await getDocumentPurposes(docId);
			if (Array.isArray(purposes) && purposes.length > 0) {
				// If this document has purposes, set it as the main documentPurposes
				// This will make the dropdown appear for multiple document mode
				setDocumentPurposes(purposes);
			}
		} catch (error) {
			console.error(`Failed to fetch purposes for document ${docId}:`, error);
		}
	};

	const isSF10Document = () => {
		const selectedDocName = getSelectedDocumentName().toLowerCase();
		return (
			selectedDocName.includes("sf10") || selectedDocName.includes("sf-10")
		);
	};

	const handleFileChange = (event) => {
		const files = Array.from(event.target.files);
		setSelectedFiles(files);
	};

	// Handle file selection for multiple documents
	const handleMultipleFileChange = (docId, event) => {
		const files = Array.from(event.target.files);
		setMultipleDocumentFiles(prev => ({
			...prev,
			[docId]: files
		}));
	};

	// Get document name by ID
	const getDocumentNameById = (docId) => {
		const doc = documents.find(d => String(d.id) === String(docId));
		return doc ? doc.name : 'Unknown Document';
	};

	const clearAllPurposes = () => {
		setSelectedPurposeIds([]);
	};

	// Handle multiple document selection
	const handleDocumentToggle = (docId) => {
		setSelectedDocuments((prev) => {
			if (prev.includes(docId)) {
				// Remove document and its quantity
				setDocumentQuantities((prevQty) => {
					const newQty = { ...prevQty };
					delete newQty[docId];
					return newQty;
				});
				// Remove document requirements and files
				setMultipleDocumentRequirements(prev => {
					const newReqs = { ...prev };
					delete newReqs[docId];
					return newReqs;
				});
				setMultipleDocumentFiles(prev => {
					const newFiles = { ...prev };
					delete newFiles[docId];
					return newFiles;
				});
				
				// Check if the removed document was the one with predefined purposes
				const removedDoc = documents.find(d => String(d.id) === String(docId));
				if (removedDoc && removedDoc.name.toLowerCase().includes("cav")) {
					// If CAV was removed, clear the predefined purposes
					const remainingDocs = prev.filter((id) => id !== docId);
					const stillHasCav = remainingDocs.some(id => {
						const doc = documents.find(d => String(d.id) === String(id));
						return doc && doc.name.toLowerCase().includes("cav");
					});
					
					if (!stillHasCav) {
						setDocumentPurposes([]);
						setSelectedPurposeIds([]);
					}
				}
				
				return prev.filter((id) => id !== docId);
			} else {
				// Add document with default quantity of 1
				setDocumentQuantities((prevQty) => ({
					...prevQty,
					[docId]: 1,
				}));
				// Fetch requirements for this document
				fetchMultipleDocumentRequirements(docId);
				
				// Fetch purposes for this document (for documents like CAV that have predefined purposes)
				fetchDocumentPurposesForMultiple(docId);
				
				return [...prev, docId];
			}
		});
	};

	// Handle quantity change for a specific document
	const handleQuantityChange = (docId, quantity) => {
		const qty = Math.max(1, Math.min(10, parseInt(quantity) || 1)); // Limit between 1-10
		setDocumentQuantities(prev => ({
			...prev,
			[docId]: qty
		}));
	};

	const handleClose = () => {
		// Reset form when modal closes or mode changes
		const resetForm = () => {
			setSelectedDocument("");
			setSelectedDocuments([]);
			setDocumentQuantities({});
			setPurpose("");
			setSelectedPurposeIds([]);
			setSelectedFiles([]);
			setRequestBothDocuments(false);
			setDocumentRequirements([]);
			setSecondaryRequirements([]);
			setDocumentPurposes([]);
			setIsPurposeDropdownOpen(false);
			setPurposeSearchTerm("");
			setDuplicateWarning(null);
			setMultipleDocumentRequirements({});
			setMultipleDocumentFiles({});
		};

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
		return selectedDocName.includes("certificate");
	};

	// Check if any selected documents require attachments (for multiple selection)
	const anyDocumentRequiresAttachments = () => {
		if (!isMultipleSelection) {
			// For single selection, use existing logic
			return !isCertificateOfEnrollment() && !isSF10Document();
		}

		// For multiple selection, check if any selected document requires attachments
		return selectedDocuments.some(docId => {
			const doc = documents.find(d => d.id === docId);
			if (!doc) return false;
			
			const docName = doc.name.toLowerCase();
			// Return true if document is NOT Certificate and NOT SF10 (meaning it requires attachments)
			return !docName.includes("certificate") && 
			       !docName.includes("sf10") && 
			       !docName.includes("sf-10");
		});
	};

	const filteredPurposes = documentPurposes.filter((purpose) =>
		purpose.name.toLowerCase().includes(purposeSearchTerm.toLowerCase())
	);

	// Helper function to check for duplicate requests
	const checkForDuplicateRequest = (documentId) => {
		console.log("=== checkForDuplicateRequest Debug ===");
		console.log("documentId:", documentId);
		console.log("userRequests:", userRequests);
		console.log("documents:", documents);

		if (!documentId || !userRequests || userRequests.length === 0) {
			console.log("Early return: missing data");
			return null;
		}

		const selectedDoc = documents.find(
			(doc) => String(doc.id) === String(documentId)
		);

		console.log("selectedDoc:", selectedDoc);
		if (!selectedDoc) return null;

		// Find any existing request for the same document type that is not completed or cancelled
		const existingRequest = userRequests.find((request) => {
			console.log("Checking request:", request);
			console.log("request.document:", request.document);
			console.log("request.documents:", request.documents);
			console.log("selectedDoc.name:", selectedDoc.name);
			console.log("request.status:", request.status);

			let isSameDocument = false;

			// Check if this is a multiple document request
			if (request.isMultipleDocument && request.documents && Array.isArray(request.documents)) {
				// For multiple document requests, check if any of the documents match
				isSameDocument = request.documents.some(docName => {
					// Remove quantity info like "(2 copies)" from document name
					const cleanDocName = docName.replace(/\s*\(\d+\s+copies?\)/, '').trim();
					return cleanDocName.toLowerCase() === selectedDoc.name.toLowerCase();
				});
			} else {
				// For single document requests, compare directly but handle formatted strings
				const cleanRequestDoc = request.document ? 
					request.document.replace(/\s*\(\d+\s+copies?\)/, '').trim() : '';
				isSameDocument = cleanRequestDoc.toLowerCase() === selectedDoc.name.toLowerCase();
			}

			const isPending =
				request.status &&
				!["completed", "cancelled"].includes(request.status.toLowerCase());

			console.log("isSameDocument:", isSameDocument);
			console.log("isPending:", isPending);

			return isSameDocument && isPending;
		});

		console.log("existingRequest found:", existingRequest);

		if (existingRequest) {
			return {
				documentName: selectedDoc.name, // Use the clean document name
				existingStatus: existingRequest.status,
				requestDate: existingRequest.dateRequested,
				requestId: existingRequest.id,
			};
		}

		return null;
	};

	// Validation function for submit button
	const isSubmitDisabled = () => {
		if (isMultipleSelection) {
			// Multiple selection validation
			if (selectedDocuments.length === 0) return true;
			
			// Purpose validation for multiple documents
			const hasPredefined = hasPredefinedPurposes();
			const hasNonPredefined = hasDocumentsWithoutPredefinedPurposes();
			
			if (hasPredefined && hasNonPredefined) {
				// Both types: need either predefined purposes OR custom text
				if (selectedPurposeIds.length === 0 && !purpose.trim()) return true;
			} else if (hasPredefined) {
				// Only predefined: need selected purposes
				if (selectedPurposeIds.length === 0) return true;
			} else if (hasNonPredefined) {
				// Only custom: need custom text
				if (!purpose.trim()) return true;
			}
			
			// Check if any selected document requires attachments and validate them
			for (const docId of selectedDocuments) {
				const requirements = multipleDocumentRequirements[docId] || [];
				if (requirements.length > 0) {
					const files = multipleDocumentFiles[docId] || [];
					if (files.length === 0) return true; // Missing required attachments
				}
			}
			
			return false;
		} else {
			// Single selection validation
			if (!selectedDocument) return true;
			if (selectedPurposeIds.length === 0 && !purpose) return true;
			if (requiresAttachments() && selectedFiles.length === 0) return true;
			return false;
		}
	};

	// Submit handler
	const handleRequestSubmit = async (e) => {
		e.preventDefault();
		
		try {
			if (isMultipleSelection) {
				// Handle multiple document submission
				// Send documentIds as simple array of IDs
				const documentIds = selectedDocuments;

				// Prepare files for multiple documents
				const allFiles = [];
				const typeIds = [];
				for (const docId of selectedDocuments) {
					const files = multipleDocumentFiles[docId] || [];
					const doc = documents.find(d => String(d.id) === String(docId));
					
					files.forEach(file => {
						allFiles.push(file);
						
						// Get requirement type ID
						let typeId = "";
						const requirements = multipleDocumentRequirements[docId] || [];
						
						if (requirements.length > 0) {
							// Use database requirements
							typeId = requirements[0].requirementId;
						} else if (doc) {
							// Use fallback logic for documents like CAV
							const docName = doc.name.toLowerCase();
							if (docName.includes("cav")) {
								// For CAV, find the "Diploma" requirement type
								const diplomaType = requestTypes.find(type => 
									type.nameType && type.nameType.toLowerCase().includes("diploma")
								);
								typeId = diplomaType ? diplomaType.id : "";
							} else if (docName.includes("diploma")) {
								// For Diploma, find the "Affidavit of Loss" requirement type
								const affidavitType = requestTypes.find(type => 
									type.nameType && type.nameType.toLowerCase().includes("affidavit of loss")
								);
								typeId = affidavitType ? affidavitType.id : "";
							}
						}
						
						typeIds.push(typeId || "");
					});
				}

				// Prepare document quantities object
				const quantitiesObj = {};
				selectedDocuments.forEach(docId => {
					quantitiesObj[docId] = documentQuantities[docId] || 1;
				});

				const response = await addMultipleDocumentRequest({
					userId: userId,
					documentIds: documentIds,
					documentQuantities: quantitiesObj,
					purpose: purpose || null,
					purposeIds: selectedPurposeIds.length > 0 ? selectedPurposeIds : null,
					attachments: allFiles,
					typeIds: typeIds
				});
				
				if (response.success) {
					toast.success("Multiple document request submitted successfully!");
					onSuccess();
					handleClose();
				} else {
					toast.error(response.message || "Failed to submit request");
				}
			} else {
				// Handle single document submission
				const attachments = selectedFiles.map(fileObj => fileObj.file);
				const typeIds = selectedFiles.map(fileObj => fileObj.typeId || "");

				// Check if this is a CAV request with both documents
				if (requestBothDocuments) {
					const response = await addCombinedRequestDocument({
						userId: userId,
						documentId: selectedDocument,
						purpose: purpose || null,
						purposeIds: selectedPurposeIds.length > 0 ? selectedPurposeIds : null,
						attachments: attachments,
						typeIds: typeIds
					});
					if (response.success) {
						toast.success("Combined document request submitted successfully!");
						onSuccess();
						handleClose();
					} else {
						toast.error(response.message || "Failed to submit request");
					}
				} else {
					const response = await addRequestDocument({
						userId: userId,
						documentId: selectedDocument,
						purpose: purpose || null,
						purposeIds: selectedPurposeIds.length > 0 ? selectedPurposeIds : null,
						attachments: attachments,
						typeIds: typeIds
					});
					if (response.success) {
						toast.success("Document request submitted successfully!");
						onSuccess();
						handleClose();
					} else {
						toast.error(response.message || "Failed to submit request");
					}
				}
			}
		} catch (error) {
			console.error("Submit error:", error);
			toast.error("Failed to submit request. Please try again.");
		}
	};

	// Handle selection mode toggle
	const handleSelectionModeToggle = () => {
		setIsMultipleSelection(!isMultipleSelection);
		// Reset selections when switching modes
		setSelectedDocument("");
		setSelectedDocuments([]);
		setDocumentQuantities({});
		setMultipleDocumentRequirements({});
		setMultipleDocumentFiles({});
		setSelectedFiles([]);
		// Clear single document related states
		setDocumentPurposes([]); // Clear purposes so they can be fetched fresh for selected documents
		setDocumentRequirements([]);
		setPurpose("");
		setSelectedPurposeIds([]);
	};

	// Handle purpose checkbox change
	const handlePurposeCheckboxChange = (purposeId, checked) => {
		if (checked) {
			setSelectedPurposeIds(prev => [...prev, purposeId]);
		} else {
			setSelectedPurposeIds(prev => prev.filter(id => id !== purposeId));
		}
	};

	// Select all purposes
	const selectAllPurposes = () => {
		setSelectedPurposeIds(documentPurposes.map(p => p.id));
	};

	// Handle file removal for single mode
	const removeFile = (index) => {
		setSelectedFiles(prev => prev.filter((_, i) => i !== index));
	};

	// Handle adding more files for single mode
	const handleAddMoreFiles = (event) => {
		const newFiles = Array.from(event.target.files);
		setSelectedFiles(prev => [...prev, ...newFiles.map(file => ({ file, typeId: "" }))]);
	};

	// Update file type ID for single mode
	const updateFileTypeId = (index, typeId) => {
		setSelectedFiles(prev => prev.map((fileObj, i) => 
			i === index ? { ...fileObj, typeId } : fileObj
		));
	};

	// Handle document change for single selection mode
	const handleDocumentChange = async (documentId) => {
		setSelectedDocument(documentId);
		
		if (documentId) {
			// Fetch document requirements when document is selected
			setLoadingDocumentRequirements(true);
			try {
				const requirements = await getDocumentRequirements(documentId);
				setDocumentRequirements(Array.isArray(requirements) ? requirements : []);
			} catch (error) {
				console.error("Failed to fetch document requirements:", error);
				setDocumentRequirements([]);
			} finally {
				setLoadingDocumentRequirements(false);
			}

			// Fetch document purposes
			setLoadingDocumentPurposes(true);
			try {
				const purposes = await getDocumentPurposes(documentId);
				setDocumentPurposes(Array.isArray(purposes) ? purposes : []);
			} catch (error) {
				console.error("Failed to fetch document purposes:", error);
				setDocumentPurposes([]);
			} finally {
				setLoadingDocumentPurposes(false);
			}
		} else {
			setDocumentRequirements([]);
			setDocumentPurposes([]);
		}
	};

	// Check if document has predefined purposes
	const hasPredefinedPurposes = () => {
		if (!isMultipleSelection) {
			// Single document mode - check if current document has purposes
			return documentPurposes && documentPurposes.length > 0;
		} else {
			// Multiple document mode - check if any selected document has purposes
			return documentPurposes && documentPurposes.length > 0;
		}
	};

	// Check if any selected documents in multiple mode don't have predefined purposes
	const hasDocumentsWithoutPredefinedPurposes = () => {
		if (!isMultipleSelection || selectedDocuments.length === 0) {
			return false;
		}
		
		// Check if any selected document doesn't have predefined purposes
		// For simplicity, we'll assume documents other than CAV don't have predefined purposes
		// This could be enhanced to check each document individually
		return selectedDocuments.some(docId => {
			const doc = documents.find(d => String(d.id) === String(docId));
			if (!doc) return false;
			
			// Check if this is a document type that typically doesn't have predefined purposes
			const docName = doc.name.toLowerCase();
			return !docName.includes("cav"); // Assume non-CAV documents don't have predefined purposes
		});
	};

	return (
		<div className="flex fixed inset-0 z-50 justify-center items-center p-4 backdrop-blur-sm bg-black/40">
			<div className="relative w-full max-w-2xl bg-white rounded-2xl border shadow-2xl dark:bg-slate-800 dark:border-slate-700 border-slate-200 flex flex-col max-h-[90vh]">
				{/* Title Bar */}
				<div className="flex flex-shrink-0 justify-between items-center px-6 py-4 rounded-t-2xl border-b bg-slate-50 border-slate-100 dark:bg-slate-700 dark:border-slate-600">
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
				<form
					onSubmit={handleRequestSubmit}
					className="overflow-y-auto flex-1 px-6 py-6 space-y-5"
				>
					{/* Selection Mode Toggle */}
					<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-gray-800">
						<div>
							<h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
								Request Multiple Documents
							</h3>
							<p className="text-xs text-gray-500 dark:text-gray-400">
								{isMultipleSelection 
									? "Select multiple documents for a single request" 
									: "Select one document at a time"}
							</p>
						</div>
						<button
							type="button"
							onClick={handleSelectionModeToggle}
							className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
								isMultipleSelection ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
							}`}
						>
							<span
								className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
									isMultipleSelection ? 'translate-x-6' : 'translate-x-1'
								}`}
							/>
						</button>
					</div>

					<div>
						<Label
							htmlFor="document-type"
							className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-500"
						>
							{isMultipleSelection ? "Select Documents" : "Document Type"}
						</Label>

						{/* Grade-based document restrictions notice */}
						{studentGradeLevel && (
							<div className="p-3 mb-3 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-900 dark:border-blue-800">
								<div className="flex items-start space-x-2">
									<div className="flex-shrink-0 mt-0.5">
										<svg
											className="w-4 h-4 text-blue-600 dark:text-blue-400"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
									</div>
									<div>
										<p className="text-sm font-medium text-blue-800 dark:text-blue-200">
											Document Availability by Grade Level
										</p>
										{studentGradeLevel.toLowerCase().includes("grade 11") ? (
											<p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
												As a <strong>Grade 11</strong> student, you can only
												request <strong>Certificate</strong> and{" "}
												<strong>SF10</strong> documents.
											</p>
										) : studentGradeLevel.toLowerCase().includes("grade 12") ? (
											<p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
												As a <strong>Grade 12</strong> student, you can request{" "}
												<strong>all available documents</strong>.
											</p>
										) : (
											<p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
												Document availability depends on your grade level.
											</p>
										)}
									</div>
								</div>
							</div>
						)}
						{isMultipleSelection ? (
							// Multiple document selection with checkboxes
							<div className="space-y-2 max-h-48 overflow-y-auto border border-slate-300 rounded-lg p-3 bg-slate-50 dark:bg-slate-700 dark:border-slate-600">
								{loadingDocs ? (
									<div className="text-center py-4 text-slate-500">Loading...</div>
								) : getFilteredDocuments().length === 0 ? (
									<div className="text-center py-4 text-slate-500">No documents available</div>
								) : (
									getFilteredDocuments().map((doc) => (
										<div
											key={doc.id}
											className="flex items-center justify-between p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-600"
										>
											<label className="flex items-center space-x-3 cursor-pointer flex-1">
												<input
													type="checkbox"
													checked={selectedDocuments.includes(doc.id)}
													onChange={() => handleDocumentToggle(doc.id)}
													className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
												/>
												<span className="text-sm text-slate-900 dark:text-slate-100">
													{doc.name}
												</span>
											</label>
											{selectedDocuments.includes(doc.id) && (
												<div className="flex items-center space-x-2">
													<label className="text-xs text-slate-600 dark:text-slate-400">
														Qty:
													</label>
													<input
														type="number"
														min="1"
														max="10"
														value={documentQuantities[doc.id] || 1}
														onChange={(e) => handleQuantityChange(doc.id, e.target.value)}
														className="w-16 px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-600 dark:border-slate-500 dark:text-slate-100"
													/>
												</div>
											)}
										</div>
									))
								)}
							</div>
						) : (
							// Single document selection with dropdown
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
								{getFilteredDocuments().map((doc) => (
									<option key={doc.id} value={doc.id}>
										{doc.name}
									</option>
								))}
							</select>
						)}

						{/* Selected Documents Summary for Multiple Selection */}
						{isMultipleSelection && selectedDocuments.length > 0 && (
							<div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700">
								<h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
									Selected Documents ({selectedDocuments.length} types, {Object.values(documentQuantities).reduce((sum, qty) => sum + qty, 0)} total copies)
								</h4>
								<div className="flex flex-wrap gap-2">
									{selectedDocuments.map((docId) => {
										const doc = documents.find(d => d.id === docId);
										const quantity = documentQuantities[docId] || 1;
										return doc ? (
											<span
												key={docId}
												className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
											>
												{doc.name} ({quantity} {quantity === 1 ? 'copy' : 'copies'})
												<button
													type="button"
													onClick={() => handleDocumentToggle(docId)}
													className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200 dark:hover:bg-blue-700"
												>
													<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
													</svg>
												</button>
											</span>
										) : null;
									})}
								</div>
							</div>
						)}
					</div>

					{/* Duplicate Request Warning */}
					{duplicateWarning && (
						<div className="p-4 bg-amber-50 rounded-lg border border-amber-200 dark:bg-amber-900/20 dark:border-amber-700">
							<div className="flex items-start space-x-3">
								<div className="flex-shrink-0 mt-0.5">
									<svg
										className="w-5 h-5 text-amber-600 dark:text-amber-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
										/>
									</svg>
								</div>
								<div className="flex-1">
									<h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200">
										Duplicate Request Detected
									</h4>
									<p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
										You already have a pending request for{" "}
										<span className="font-semibold">
											{duplicateWarning.documentName}
										</span>{" "}
										submitted on{" "}
										<span className="font-semibold">
											{new Date(
												duplicateWarning.requestDate
											).toLocaleDateString("en-US", {
												month: "long",
												day: "numeric",
												year: "numeric",
											})}
										</span>
										.
									</p>
									<p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
										Current status:{" "}
										<span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-amber-800 bg-amber-100 rounded-full dark:bg-amber-900 dark:text-amber-200">
											{duplicateWarning.existingStatus}
										</span>
									</p>
									<div className="p-3 mt-3 bg-amber-100 rounded-md border border-amber-200 dark:bg-amber-900/30 dark:border-amber-600">
										<p className="text-xs font-medium text-amber-800 dark:text-amber-200">
											📋 What you can do:
										</p>
										<ul className="mt-1 space-y-1 text-xs text-amber-700 dark:text-amber-300">
											<li>• Wait for your current request to be completed</li>
											<li>• Check the status in "My Requests" section</li>
											<li>• Contact the registrar if you have concerns</li>
											<li>
												• You can submit a new request once the current one is
												completed
											</li>
										</ul>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Expected Release Date Display */}
					{expectedDays && !loadingExpectedDays && (
						<div className="p-4 bg-green-50 rounded-lg border border-green-200 dark:bg-green-900/20 dark:border-green-700">
							<div className="flex items-start space-x-3">
								<div className="flex-shrink-0 mt-0.5">
									<svg
										className="w-5 h-5 text-green-600 dark:text-green-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
										/>
									</svg>
								</div>
								<div className="flex-1">
									<h4 className="text-sm font-semibold text-green-800 dark:text-green-200">
										Expected Processing Time
									</h4>
									<p className="mt-1 text-sm text-green-700 dark:text-green-300">
										Your document will be ready for release in{" "}
										<span className="font-semibold">
											{expectedDays.days} days
										</span>
										{expectedDays.expectedReleaseDateFormatted && (
											<span>
												{" "}
												(Expected Release Date:{" "}
												<span className="font-semibold">
													{expectedDays.expectedReleaseDateFormatted}
												</span>
												)
											</span>
										)}
									</p>
									<p className="mt-2 text-xs text-green-600 dark:text-green-400">
										💡 This is an estimate based on normal processing times.
										Actual release dates may vary.
									</p>
								</div>
							</div>
						</div>
					)}

					{/* Only show Purpose and Attachments when a document is selected */}
					{(selectedDocument || (isMultipleSelection && selectedDocuments.length > 0)) && (
						<>
							<div>
								<Label
									htmlFor="purpose"
									className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-500"
								>
									Purpose
									<span className="text-red-500 dark:text-red-500">*</span>
								</Label>

								{/* Show predefined purposes dropdown if any selected document has them */}
								{hasPredefinedPurposes() && (
									<div className="space-y-2">
										{isMultipleSelection && (
											<div className="mb-2">
												<p className="text-xs text-slate-600 dark:text-slate-400">
													Select purposes for documents that have predefined options:
												</p>
												<div className="flex flex-wrap gap-1 mt-1">
													{selectedDocuments.map(docId => {
														const doc = documents.find(d => String(d.id) === String(docId));
														if (!doc) return null;
														const docName = doc.name.toLowerCase();
														if (docName.includes("cav")) {
															return (
																<span key={docId} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
																	{doc.name}
																</span>
															);
														}
														return null;
													})}
												</div>
											</div>
										)}
										{/* Multi-select dropdown */}
										<div className="relative purpose-dropdown">
											<button
												type="button"
												onClick={() =>
													setIsPurposeDropdownOpen(!isPurposeDropdownOpen)
												}
												className="px-3 py-1.5 w-full text-left bg-white rounded-lg border shadow-sm border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50"
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
																	className="inline-flex items-center px-1.5 py-0.5 max-w-full text-xs font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-200"
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
																		className="inline-flex flex-shrink-0 justify-center items-center ml-1 w-4 h-4 text-blue-400 hover:text-blue-600 dark:text-blue-300 dark:hover:text-blue-100"
																	>
																		×
																	</button>
																</span>
															);
														})}
														{selectedPurposeIds.length > 3 && (
															<span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
																+{selectedPurposeIds.length - 3} more
															</span>
														)}
													</div>
												)}
												<span className="flex absolute inset-y-0 right-0 items-center pr-2 pointer-events-none">
													{selectedPurposeIds.length > 0 && (
														<span className="inline-flex justify-center items-center mr-2 w-4 h-4 text-xs font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-200">
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
												<div className="overflow-y-auto absolute z-10 mt-1 w-full max-h-60 bg-white rounded-lg border shadow-lg border-slate-300 dark:bg-slate-700 dark:border-slate-600">
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
																className="px-3 py-2 w-full text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-slate-600 dark:border-slate-500 dark:text-slate-50"
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
																className="px-2 py-1 text-xs font-medium text-blue-600 rounded hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900"
															>
																Select All
															</button>
															<button
																type="button"
																onClick={clearAllPurposes}
																className="px-2 py-1 text-xs font-medium rounded text-slate-600 hover:text-slate-800 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:bg-slate-700"
															>
																Clear All
															</button>
														</div>

														{/* Purpose options */}
														<div className="space-y-1">
															{filteredPurposes.map((purposeItem) => (
																<label
																	key={purposeItem.id}
																	className="flex items-center px-3 py-2 text-sm rounded-md cursor-pointer text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-600"
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
																		className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:bg-blue-900 dark:border-blue-800 dark:text-blue-400"
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
												<div className="flex justify-between items-center mb-2">
													<p className="text-xs font-medium text-blue-800 dark:text-blue-200">
														Selected purposes ({selectedPurposeIds.length}):
													</p>
													<button
														type="button"
														onClick={clearAllPurposes}
														className="text-xs text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
													>
														Clear all
													</button>
												</div>
												<div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
													{selectedPurposeIds.map((purposeId) => {
														const purpose = documentPurposes.find(
															(p) => p.id === purposeId
														);
														return (
															<div
																key={purposeId}
																className="flex justify-between items-center px-2 py-1 bg-white rounded border border-blue-200 dark:bg-slate-700 dark:border-slate-600"
															>
																<span className="text-xs text-blue-800 truncate dark:text-blue-200">
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
																	className="flex flex-shrink-0 justify-center items-center ml-2 w-4 h-4 text-xs text-blue-400 rounded-full hover:text-blue-600 dark:text-blue-300 dark:hover:text-blue-100 hover:bg-blue-100 dark:hover:bg-blue-800"
																>
																	×
																</button>
															</div>
														);
													})}
												</div>
											</div>
										)}

										<p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
											Select one or more purposes for your request
										</p>
									</div>
								)}

								{/* Show custom purpose input field for documents without predefined purposes or in single mode when no predefined purposes */}
								{((!isMultipleSelection && !hasPredefinedPurposes()) || (isMultipleSelection && hasDocumentsWithoutPredefinedPurposes())) && (
									<div className={hasPredefinedPurposes() && isMultipleSelection ? "mt-4" : ""}>
										{isMultipleSelection && (
											<div className="mb-2">
												<p className="text-xs text-slate-600 dark:text-slate-400">
													{hasPredefinedPurposes() ? "Enter custom purpose for other documents:" : "Enter the purpose of your request:"}
												</p>
												<div className="flex flex-wrap gap-1 mt-1">
													{selectedDocuments.map(docId => {
														const doc = documents.find(d => String(d.id) === String(docId));
														if (!doc) return null;
														const docName = doc.name.toLowerCase();
														if (!docName.includes("cav")) {
															return (
																<span key={docId} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
																	{doc.name}
																</span>
															);
														}
														return null;
													})}
												</div>
											</div>
										)}
										<Input
											id="purpose"
											placeholder="Enter the purpose of your request"
											className="px-3 py-2 w-full rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-slate-50 text-slate-900 dark:bg-slate-700 dark:text-slate-50 dark:border-slate-600"
											value={purpose}
											onChange={(e) => setPurpose(e.target.value)}
											required={!hasPredefinedPurposes() || (isMultipleSelection && hasDocumentsWithoutPredefinedPurposes() && selectedPurposeIds.length === 0)}
										/>
									</div>
								)}
							</div>
							<div>
								{/* Show Document Attachments section based on selection mode */}
								{((!isMultipleSelection && requiresAttachments()) || (isMultipleSelection && requiresAttachmentsMultiple())) && (
									<div>
										<Label
											htmlFor="file-upload"
											className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-500"
										>
											Document Attachments
											{((!isMultipleSelection && requiresAttachments()) || (isMultipleSelection && requiresAttachmentsMultiple())) && (
												<span className="text-red-500 dark:text-red-500">
													*
												</span>
											)}
										</Label>
										{/* Show requirements for single document mode */}
										{!isMultipleSelection && getActiveRequirements() && getActiveRequirements().length > 0 && (
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

										{/* Show requirements for multiple document mode */}
										{isMultipleSelection && selectedDocuments.length > 0 && (
											<div className="space-y-2 mb-3">
												{selectedDocuments.map(docId => {
													const doc = documents.find(d => String(d.id) === String(docId));
													const requirements = multipleDocumentRequirements[docId] || [];
													
													if (!doc) return null;
													
													// Check if document requires attachments (either from DB or fallback logic)
													const docName = doc.name.toLowerCase();
													const requiresAttachmentsForDoc = requirements.length > 0 || 
														docName.includes("diploma") || docName.includes("cav");
													
													if (!requiresAttachmentsForDoc) return null;
													
													// Get required document name
													let requiredDocName = "";
													if (requirements.length > 0) {
														requiredDocName = requirements.map(req => req.requirementName).join(", ");
													} else if (docName.includes("diploma")) {
														requiredDocName = getRequiredTypeForDiploma();
													} else if (docName.includes("cav")) {
														requiredDocName = getRequiredTypeForCAV();
													}
													
													return (
														<div key={docId} className="p-2 bg-green-50 rounded border border-green-200 dark:bg-green-900 dark:border-green-800">
															<p className="text-xs text-green-800 dark:text-green-200">
																<strong>{doc.name}</strong> requires:{" "}
																<b>{requiredDocName}</b>
															</p>
														</div>
													);
												})}
											</div>
										)}

										{/* File input - single mode */}
										{!isMultipleSelection && (
											<>
												<Input
													type="file"
													id="file-upload"
													accept=".jpg, .jpeg, .png, .gif, .pdf"
													onChange={handleFileChange}
													className="block w-full text-sm rounded-lg border cursor-pointer text-slate-900 border-slate-300 bg-slate-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:text-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:file:bg-blue-600 dark:file:text-white dark:hover:file:bg-blue-700"
													multiple
												/>
												<p className="mt-1 text-xs text-slate-500">
													You can select multiple files (JPG, PNG, GIF, PDF). Max 5MB per file.
												</p>
											</>
										)}

										{/* File inputs for multiple documents */}
										{isMultipleSelection && selectedDocuments.length > 0 && (
											<div className="space-y-4">
												{selectedDocuments.map(docId => {
													const doc = documents.find(d => String(d.id) === String(docId));
													const requirements = multipleDocumentRequirements[docId] || [];
													
													if (!doc) return null;
													
													// Check if document requires attachments (either from DB or fallback logic)
													const docName = doc.name.toLowerCase();
													const requiresAttachmentsForDoc = requirements.length > 0 || 
														docName.includes("diploma") || docName.includes("cav");
													
													if (!requiresAttachmentsForDoc) return null;
													
													return (
														<div key={docId} className="p-3 border rounded-lg border-slate-200 dark:border-slate-600">
															<Label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
																Attachments for {doc.name}
																<span className="text-red-500 dark:text-red-500"> *</span>
															</Label>
															<Input
																type="file"
																id={`file-upload-${docId}`}
																accept=".jpg, .jpeg, .png, .gif, .pdf"
																onChange={(e) => handleMultipleFileChange(docId, e)}
																className="block w-full text-sm rounded-lg border cursor-pointer text-slate-900 border-slate-300 bg-slate-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:text-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:file:bg-blue-600 dark:file:text-white dark:hover:file:bg-blue-700"
																multiple
															/>
															<p className="mt-1 text-xs text-slate-500">
																Required: {
																	requirements.length > 0 
																		? requirements.map(req => req.requirementName).join(", ")
																		: docName.includes("diploma")
																			? getRequiredTypeForDiploma()
																			: docName.includes("cav")
																				? getRequiredTypeForCAV()
																				: "Required documents"
																}
															</p>
															{multipleDocumentFiles[docId] && multipleDocumentFiles[docId].length > 0 && (
																<div className="mt-2">
																	<p className="text-xs font-medium text-slate-600 dark:text-slate-400">
																		Selected files ({multipleDocumentFiles[docId].length}):
																	</p>
																	<div className="mt-1 space-y-1">
																		{multipleDocumentFiles[docId].map((file, index) => (
																			<div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded border dark:bg-slate-700">
																				<span className="text-xs text-slate-700 dark:text-slate-300 truncate">
																					{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
																				</span>
																				<button
																					type="button"
																					onClick={() => {
																						const newFiles = [...multipleDocumentFiles[docId]];
																						newFiles.splice(index, 1);
																						setMultipleDocumentFiles(prev => ({
																							...prev,
																							[docId]: newFiles
																						}));
																					}}
																					className="text-red-500 hover:text-red-700 text-xs ml-2"
																				>
																					✕
																				</button>
																			</div>
																		))}
																	</div>
																</div>
															)}
														</div>
													);
												})}
											</div>
										)}

										{/* Show warning messages for multiple document mode */}
										{isMultipleSelection && selectedDocuments.length > 0 && (
											<div className="space-y-2 mt-3">
												{selectedDocuments.map(docId => {
													const doc = documents.find(d => String(d.id) === String(docId));
													const requirements = multipleDocumentRequirements[docId] || [];
													const files = multipleDocumentFiles[docId] || [];
													
													if (!doc) return null;
													
													// Check if document requires attachments (either from DB or fallback logic)
													const docName = doc.name.toLowerCase();
													const requiresAttachmentsForDoc = requirements.length > 0 || 
														docName.includes("diploma") || docName.includes("cav");
													
													if (!requiresAttachmentsForDoc) return null;
													
													// Show warning if no files uploaded for this document
													if (files.length === 0) {
														// Get required document name
														let requiredDocName = "";
														if (requirements.length > 0) {
															requiredDocName = requirements.map(req => req.requirementName).join(", ");
														} else if (docName.includes("diploma")) {
															requiredDocName = getRequiredTypeForDiploma();
														} else if (docName.includes("cav")) {
															requiredDocName = getRequiredTypeForCAV();
														}
														
														return (
															<div key={docId} className="p-2 bg-red-50 rounded border border-red-200 dark:bg-red-900 dark:border-red-800">
																<p className="text-xs text-red-600 dark:text-red-400">
																	⚠️ <strong>{doc.name}</strong> requires file attachments.
																	Please upload the required documents:{" "}
																	<b>{requiredDocName}</b>.
																</p>
															</div>
														);
													}
													
													return null;
												})}
											</div>
										)}

										{/* Show message when no files selected for required documents - Single mode */}
										{!isMultipleSelection && requiresAttachments() && selectedFiles.length === 0 && (
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
														className="mt-0.5 w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:bg-blue-900 dark:border-blue-800 dark:text-blue-400"
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
