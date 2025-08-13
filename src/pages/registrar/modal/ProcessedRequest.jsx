import React, { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { X, FileText, User, Calendar, MessageSquare } from "lucide-react";
import {
	processRequest,
	getRequestAttachments,
	getStudentDocuments,
	getStudentInfo,
	updateStudentInfo,
} from "../../../utils/registrar";
import toast from "react-hot-toast";
import StudentDocumentsSection from "../components/StudentDocumentsSection";
import AttachmentsSection from "../components/AttachmentsSection";
import ImageZoomModal from "../components/ImageZoomModal";
import DiplomaTemplateModal from "../components/DiplomaTemplateModal";
import CertificateTemplateModal from "../components/CertificateTemplateModal";

export default function ProcessedRequest({
	request,
	isOpen,
	onClose,
	onSuccess,
}) {
	const [processing, setProcessing] = useState(false);
	const [attachments, setAttachments] = useState([]);
	const [studentDocuments, setStudentDocuments] = useState([]);
	const [selectedImage, setSelectedImage] = useState(null);
	const [imageZoom, setImageZoom] = useState(1);
	const [groupByType, setGroupByType] = useState(false);
	const [studentInfo, setStudentInfo] = useState(null);
	const [showDiplomaTemplate, setShowDiplomaTemplate] = useState(false);
	const [showCertificateTemplate, setShowCertificateTemplate] = useState(false);
	const [currentRequest, setCurrentRequest] = useState(request);

	// Update currentRequest when request prop changes
	useEffect(() => {
		setCurrentRequest(request);
	}, [request]);

	// Check if this is a diploma request
	const isDiplomaRequest = () => {
		return currentRequest?.document?.toLowerCase().includes("diploma");
	};

	// Check if this is a certificate of enrollment request
	const isCertificateRequest = () => {
		return (
			currentRequest?.document?.toLowerCase().includes("certificate") &&
			currentRequest?.document?.toLowerCase().includes("enrollment")
		);
	};

	// Function to get file extension
	const getFileExtension = (filename) => {
		return filename.split(".").pop().toLowerCase();
	};

	// Function to check if file is an image
	const isImageFile = (filename) => {
		const imageExtensions = ["jpg", "jpeg", "png", "gif"];
		return imageExtensions.includes(getFileExtension(filename));
	};

	// Image zoom handlers - updated to work with attachment objects
	const openImageZoom = (attachment) => {
		setSelectedImage(attachment);
		setImageZoom(1);
	};

	const closeImageZoom = () => {
		setSelectedImage(null);
		setImageZoom(1);
	};

	const zoomIn = () => {
		setImageZoom((prev) => Math.min(prev + 0.25, 3));
	};

	const zoomOut = () => {
		setImageZoom((prev) => Math.max(prev - 0.25, 0.5));
	};

	const resetZoom = () => {
		setImageZoom(1);
	};

	const fetchStudentInfo = async () => {
		if (isDiplomaRequest() || isCertificateRequest()) {
			try {
				const studentData = await getStudentInfo(currentRequest.id);
				if (studentData && !studentData.error) {
					setStudentInfo(studentData);
				}
			} catch (error) {
				console.error("Failed to fetch student info:", error);
			}
		}
	};

	// Fetch attachments when modal opens
	useEffect(() => {
		if (isOpen && currentRequest) {
			const fetchAttachments = async () => {
				try {
					const attachmentsData = await getRequestAttachments(
						currentRequest.id
					);
					if (Array.isArray(attachmentsData)) {
						// Store the full attachment objects with requirement types
						setAttachments(attachmentsData);
					}
				} catch (error) {
					console.error("Failed to fetch attachments:", error);
					// Fallback to single attachment if available
					if (currentRequest.attachment) {
						setAttachments([
							{
								filepath: currentRequest.attachment,
								requirementType: "Unknown",
							},
						]);
					}
				}
			};

			const fetchStudentDocuments = async () => {
				try {
					const documentsData = await getStudentDocuments(currentRequest.id);
					if (Array.isArray(documentsData)) {
						setStudentDocuments(documentsData);
					}
				} catch (error) {
					console.error("Failed to fetch student documents:", error);
					setStudentDocuments([]);
				}
			};

			fetchAttachments();
			fetchStudentDocuments();
			fetchStudentInfo();
		}
	}, [isOpen, currentRequest]);

	const handleProcess = async () => {
		setProcessing(true);
		try {
			const response = await processRequest(currentRequest.id);
			if (response.success) {
				toast.success(response.message);

				// Update the local request status based on current status
				const currentStatus = currentRequest.status.toLowerCase();
				let newStatus;

				switch (currentStatus) {
					case "pending":
						newStatus = "Processed";
						break;
					case "processed":
						newStatus = "Signatory";
						break;
					case "signatory":
						newStatus = "Release";
						break;
					case "release":
						newStatus = "Completed";
						break;
					default:
						newStatus = currentRequest.status;
				}

				// Update the local currentRequest state
				setCurrentRequest((prev) => ({
					...prev,
					status: newStatus,
				}));

				onSuccess(); // Refresh the data in parent component
			} else {
				toast.error(response.error || "Failed to process request");
			}
		} catch (error) {
			console.error("Failed to process request:", error);
			toast.error("Failed to process request");
		} finally {
			setProcessing(false);
		}
	};

	const handleDiplomaSave = async (diplomaData) => {
		try {
			const updateResponse = await updateStudentInfo(
				currentRequest.id,
				diplomaData.lrn,
				diplomaData.strandId,
				diplomaData.firstname,
				diplomaData.middlename,
				diplomaData.lastname
			);

			if (updateResponse.success) {
				toast.success("Diploma information saved successfully!");
				// Refresh the student information to show updated data
				await fetchStudentInfo();
				onSuccess();
			} else {
				toast.error(
					updateResponse.error || "Failed to save diploma information"
				);
			}
		} catch (error) {
			console.error("Failed to save diploma:", error);
			toast.error("Failed to save diploma information");
		} finally {
			setProcessing(false);
		}
	};

	const handleCertificateSave = async (certificateData) => {
		try {
			const updateResponse = await updateStudentInfo(
				currentRequest.id,
				certificateData.lrn,
				certificateData.strandId,
				certificateData.firstname,
				certificateData.middlename,
				certificateData.lastname
			);

			if (updateResponse.success) {
				toast.success("Certificate information saved successfully!");
				// Refresh the student information to show updated data
				await fetchStudentInfo();
				onSuccess();
			} else {
				toast.error(
					updateResponse.error || "Failed to save certificate information"
				);
			}
		} catch (error) {
			console.error("Failed to save certificate:", error);
			toast.error("Failed to save certificate information");
		} finally {
			setProcessing(false);
		}
	};

	const handleDiplomaCancel = () => {
		setShowDiplomaTemplate(false);
	};

	const handleCertificateCancel = () => {
		setShowCertificateTemplate(false);
	};

	// Function to get button text and color based on status
	const getButtonConfig = () => {
		if (!currentRequest || !currentRequest.status) {
			return {
				text: processing ? "Processing..." : "Process Request",
				bgColor: "bg-green-600 hover:bg-green-700",
				disabled: false,
			};
		}

		const statusName = currentRequest.status.toLowerCase();

		// Check if student documents are required and available for pending status
		// For diploma and certificate requests, we don't need existing documents since we generate a template
		const hasRequiredDocuments =
			statusName !== "pending" ||
			studentDocuments.length > 0 ||
			isDiplomaRequest() ||
			isCertificateRequest();

		switch (statusName) {
			case "pending":
				// Always show 'Mark as Processed' for diploma and certificate requests
				const buttonText = isDiplomaRequest()
					? "Mark as Processed"
					: isCertificateRequest()
					? "Mark as Processed"
					: "Mark as Processed";

				return {
					text: processing ? "Processing..." : buttonText,
					bgColor: hasRequiredDocuments
						? "bg-green-600 hover:bg-green-700"
						: "bg-gray-400",
					disabled: !hasRequiredDocuments || processing,
				};
			case "processed":
				return {
					text: processing ? "Processing..." : "Proceed to Signatory",
					bgColor: "bg-blue-600 hover:bg-blue-700",
					disabled: processing,
				};
			case "signatory":
				return {
					text: processing ? "Processing..." : "Release Document",
					bgColor: "bg-green-600 hover:bg-green-700",
					disabled: processing,
				};
			case "release":
				return {
					text: processing ? "Processing..." : "Mark as Completed",
					bgColor: "bg-orange-600 hover:bg-orange-700",
					disabled: processing,
				};
			case "completed":
				return {
					text: "Document Completed",
					bgColor: "bg-gray-400",
					disabled: true,
				};
			default:
				return {
					text: processing ? "Processing..." : "Process Request",
					bgColor: hasRequiredDocuments
						? "bg-green-600 hover:bg-green-700"
						: "bg-gray-400",
					disabled: !hasRequiredDocuments || processing,
				};
		}
	};

	const buttonConfig = getButtonConfig();

	// Function to get status styling based on status
	const getStatusStyling = () => {
		if (!currentRequest || !currentRequest.status) {
			return {
				bgColor: "bg-gray-50",
				borderColor: "border-gray-200",
				dotColor: "bg-gray-500",
				textColor: "text-gray-700",
				titleColor: "text-gray-800",
			};
		}

		const statusName = currentRequest.status.toLowerCase();

		switch (statusName) {
			case "pending":
				return {
					bgColor: "bg-yellow-50",
					borderColor: "border-yellow-200",
					dotColor: "bg-yellow-500",
					textColor: "text-yellow-700",
					titleColor: "text-yellow-800",
				};
			case "processed":
				return {
					bgColor: "bg-green-50",
					borderColor: "border-green-200",
					dotColor: "bg-green-500",
					textColor: "text-green-700",
					titleColor: "text-green-800",
				};
			case "signatory":
				return {
					bgColor: "bg-blue-50",
					borderColor: "border-blue-200",
					dotColor: "bg-blue-500",
					textColor: "text-blue-700",
					titleColor: "text-blue-800",
				};
			case "release":
			case "completed":
				return {
					bgColor: "bg-purple-50",
					borderColor: "border-purple-200",
					dotColor: "bg-purple-500",
					textColor: "text-purple-700",
					titleColor: "text-purple-800",
				};
			default:
				return {
					bgColor: "bg-gray-50",
					borderColor: "border-gray-200",
					dotColor: "bg-gray-500",
					textColor: "text-gray-700",
					titleColor: "text-gray-800",
				};
		}
	};

	if (!isOpen || !currentRequest) return null;

	return (
		<>
			<div className="flex fixed inset-0 z-50 justify-center items-center p-1 backdrop-blur-sm bg-black/50 sm:p-4">
				<div className="relative w-full max-w-md sm:max-w-2xl lg:max-w-4xl bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl shadow-2xl max-h-[98vh] sm:max-h-[90vh] overflow-hidden">
					{/* Header */}
					<div className="flex justify-between items-center px-4 py-3 text-white bg-[#5409DA] sm:px-6 sm:py-4">
						<div className="flex gap-2 items-center sm:gap-3">
							<FileText className="w-5 h-5 sm:w-6 sm:h-6" />
							<h2 className="text-base font-semibold sm:text-xl">
								Document Request Details
							</h2>
						</div>
						<button
							onClick={onClose}
							className="p-1.5 sm:p-2 text-white bg-transparent hover:text-gray-200 rounded-full transition-colors"
							aria-label="Close"
						>
							<X className="w-5 h-5" />
						</button>
					</div>

					{/* Scrollable Content */}
					<div className="overflow-y-auto max-h-[calc(98vh-120px)] sm:max-h-[calc(90vh-140px)]">
						<div className="p-4 space-y-4 sm:p-6 sm:space-y-6">
							{/* Request Information */}
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								{/* Student Info */}
								<div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700">
									<div className="flex gap-3 items-center mb-3">
										<User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
										<span className="text-sm font-medium text-slate-600 dark:text-slate-300">
											Student
										</span>
									</div>
									<p className="text-lg font-semibold break-words text-slate-900 dark:text-white">
										{currentRequest.student}
									</p>
								</div>

								{/* Document Info */}
								<div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700">
									<div className="flex gap-3 items-center mb-3">
										<FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
										<span className="text-sm font-medium text-slate-600 dark:text-slate-300">
											Document
										</span>
									</div>
									<p className="text-lg font-semibold break-words text-slate-900 dark:text-white">
										{currentRequest.document}
									</p>
								</div>

								{/* Date Requested */}
								<div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700">
									<div className="flex gap-3 items-center mb-3">
										<Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
										<span className="text-sm font-medium text-slate-600 dark:text-slate-300">
											Date Requested
										</span>
									</div>
									<p className="text-lg font-semibold text-slate-900 dark:text-white">
										{currentRequest.dateRequested}
									</p>
								</div>

								{/* Current Status */}
								<div
									className={`rounded-lg p-4 border ${
										getStatusStyling().bgColor
									} ${getStatusStyling().borderColor}`}
								>
									<div className="flex gap-3 items-center mb-3">
										<div
											className={`w-3 h-3 rounded-full ${
												getStatusStyling().dotColor
											}`}
										></div>
										<span
											className={`text-sm font-medium ${
												getStatusStyling().textColor
											}`}
										>
											Current Status
										</span>
									</div>
									<p
										className={`text-lg font-semibold ${
											getStatusStyling().titleColor
										}`}
									>
										{currentRequest.status}
									</p>
								</div>
							</div>

							{/* Purpose */}
							{currentRequest?.purpose && (
								<div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700">
									<div className="flex gap-3 items-center mb-3">
										<MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
										<span className="text-sm font-medium text-slate-600 dark:text-slate-300">
											Purpose
										</span>
									</div>
									<p className="text-base leading-relaxed break-words text-slate-900 dark:text-white">
										{currentRequest.purpose}
									</p>
								</div>
							)}

							{/* Student Documents */}
							{!isDiplomaRequest() && !isCertificateRequest() && (
								<StudentDocumentsSection
									studentDocuments={studentDocuments}
									request={currentRequest}
								/>
							)}

							{/* Diploma Template Info - Show for diploma requests */}
							{isDiplomaRequest() && (
								<div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200 border-dashed dark:bg-blue-900/20 dark:border-blue-700">
									<div className="flex gap-3 items-center mb-3">
										<FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
										<span className="text-sm font-medium text-blue-700 dark:text-blue-300">
											Diploma Template Ready
										</span>
									</div>
									<div className="mb-2 text-sm text-blue-600 dark:text-blue-400">
										A diploma template will be generated for this student. Click
										"Generate Diploma Template" to review and edit the student
										information before processing.
									</div>
									{studentInfo && (
										<div className="p-3 mt-3 bg-white rounded border border-blue-200 dark:bg-slate-800 dark:border-blue-600">
											<div className="mb-2 text-xs font-medium text-blue-600 dark:text-blue-400">
												Current Student Information:
											</div>
											<div className="grid grid-cols-2 gap-2 text-xs text-slate-900 dark:text-white">
												<div>
													<span className="font-medium">Name:</span>{" "}
													{studentInfo.firstname} {studentInfo.middlename}{" "}
													{studentInfo.lastname}
												</div>
												<div>
													<span className="font-medium">LRN:</span>{" "}
													{studentInfo.lrn || "Not set"}
												</div>
												<div>
													<span className="font-medium">Track:</span>{" "}
													{studentInfo.track || "Not set"}
												</div>
												<div>
													<span className="font-medium">Strand:</span>{" "}
													{studentInfo.strand || "Not set"}
												</div>
											</div>
										</div>
									)}
									{/* Generate Diploma Template Button */}
									<Button
										onClick={() => setShowDiplomaTemplate(true)}
										className="mt-3 text-white bg-blue-600 hover:bg-blue-700"
									>
										Generate Diploma Template
									</Button>
								</div>
							)}

							{/* Certificate Template Info - Show for certificate requests */}
							{isCertificateRequest() && (
								<div className="p-4 bg-green-50 rounded-lg border-2 border-green-200 border-dashed dark:bg-green-900/20 dark:border-green-700">
									<div className="flex gap-3 items-center mb-3">
										<FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
										<span className="text-sm font-medium text-green-700 dark:text-green-300">
											Certificate of Enrollment Template Ready
										</span>
									</div>
									<div className="mb-2 text-sm text-green-600 dark:text-green-400">
										A certificate of enrollment template will be generated for
										this student. Click "Generate Certificate Template" to
										review and edit the student information before processing.
									</div>
									{studentInfo && (
										<div className="p-3 mt-3 bg-white rounded border border-green-200 dark:bg-slate-800 dark:border-green-600">
											<div className="mb-2 text-xs font-medium text-green-600 dark:text-green-400">
												Current Student Information:
											</div>
											<div className="grid grid-cols-2 gap-2 text-xs text-slate-900 dark:text-white">
												<div>
													<span className="font-medium">Name:</span>{" "}
													{studentInfo.firstname} {studentInfo.middlename}{" "}
													{studentInfo.lastname}
												</div>
												<div>
													<span className="font-medium">LRN:</span>{" "}
													{studentInfo.lrn || "Not set"}
												</div>
												<div>
													<span className="font-medium">Track:</span>{" "}
													{studentInfo.track || "Not set"}
												</div>
												<div>
													<span className="font-medium">Strand:</span>{" "}
													{studentInfo.strand || "Not set"}
												</div>
											</div>
										</div>
									)}
									{/* Generate Certificate Template Button */}
									<Button
										onClick={() => setShowCertificateTemplate(true)}
										className="mt-3 text-white bg-green-600 hover:bg-green-700"
									>
										Generate Certificate Template
									</Button>
								</div>
							)}

							{/* Attachments */}
							<AttachmentsSection
								attachments={attachments}
								groupByType={groupByType}
								setGroupByType={setGroupByType}
								openImageZoom={openImageZoom}
								isImageFile={isImageFile}
							/>
						</div>
					</div>

					{/* Actions Footer */}
					<div className="flex flex-col gap-3 px-4 py-4 border-t sm:flex-row sm:px-6 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600">
						{/* Warning message when documents are missing */}
						{buttonConfig.reason && (
							<div className="flex gap-2 items-center p-3 text-sm text-amber-700 bg-amber-50 rounded-lg border border-amber-200 dark:text-amber-300 dark:bg-amber-900/20 dark:border-amber-700">
								<span className="text-amber-600 dark:text-amber-400">⚠️</span>
								<span>{buttonConfig.reason}</span>
							</div>
						)}

						<div className="flex flex-col gap-3 w-full sm:flex-row">
							<Button
								onClick={handleProcess}
								disabled={buttonConfig.disabled}
								className={`w-full sm:flex-1 py-3 text-base font-medium text-white ${
									buttonConfig.bgColor
								} ${
									buttonConfig.disabled ? "cursor-not-allowed opacity-75" : ""
								}`}
								title={buttonConfig.reason || ""}
							>
								{buttonConfig.text}
							</Button>
							<Button
								onClick={onClose}
								variant="outline"
								className="py-3 w-full text-base font-medium sm:flex-1 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-900 hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-slate-900"
							>
								Cancel
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Image Zoom Modal */}
			{selectedImage && (
				<ImageZoomModal
					selectedImage={selectedImage}
					imageZoom={imageZoom}
					zoomIn={zoomIn}
					zoomOut={zoomOut}
					resetZoom={resetZoom}
					closeImageZoom={closeImageZoom}
				/>
			)}

			{/* Diploma Template Modal */}
			{showDiplomaTemplate && (
				<DiplomaTemplateModal
					isOpen={showDiplomaTemplate}
					onClose={handleDiplomaCancel}
					request={currentRequest}
					studentInfo={studentInfo}
					onSave={handleDiplomaSave}
					fetchStudentInfo={fetchStudentInfo}
				/>
			)}

			{/* Certificate Template Modal */}
			{showCertificateTemplate && (
				<CertificateTemplateModal
					isOpen={showCertificateTemplate}
					onClose={handleCertificateCancel}
					request={currentRequest}
					studentInfo={studentInfo}
					onSave={handleCertificateSave}
					fetchStudentInfo={fetchStudentInfo}
				/>
			)}
		</>
	);
}
