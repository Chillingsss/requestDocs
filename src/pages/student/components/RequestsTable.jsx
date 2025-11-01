import React, { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { FileText, Plus, MessageSquare } from "lucide-react";
import RequestDetailsModal from "../modal/RequestDetailsModal";
import {
	getRequirementComments,
	getRequestTracking,
} from "../../../utils/student";

export default function RequestsTable({
	userRequests,
	loadingRequests,
	onRequestFormOpen,
	refreshTrigger,
	onRequestSuccess,
}) {
	const [selectedRequest, setSelectedRequest] = useState(null);
	const [showDetailsModal, setShowDetailsModal] = useState(false);
	const [expandedTimeline, setExpandedTimeline] = useState(null);
	const [requirementComments, setRequirementComments] = useState({});
	const [requestTracking, setRequestTracking] = useState({});

	const handleRowClick = (request) => {
		setSelectedRequest(request);
		setShowDetailsModal(true);
	};

	const handleCloseModal = () => {
		setShowDetailsModal(false);
		setSelectedRequest(null);
	};

	const toggleTimeline = async (requestId) => {
		if (expandedTimeline === requestId) {
			setExpandedTimeline(null);
		} else {
			setExpandedTimeline(requestId);
			// Fetch tracking data if not already fetched
			if (!requestTracking[requestId]) {
				try {
					const data = await getRequestTracking(requestId);
					setRequestTracking((prev) => ({ ...prev, [requestId]: data }));
				} catch (error) {
					console.error(
						"Failed to fetch tracking for request",
						requestId,
						error
					);
				}
			}
		}
	};

	const STATUS_STEPS = [
		{ key: "Pending", label: "Pending", shortLabel: "P", color: "yellow" },
		{ key: "Processed", label: "Processed", shortLabel: "Pr", color: "blue" },
		{ key: "Signatory", label: "Signatory", shortLabel: "S", color: "purple" },
		{ key: "Release", label: "Release", shortLabel: "R", color: "orange" },
		{ key: "Completed", label: "Completed", shortLabel: "✓", color: "green" },
	];

	const getStepIndex = (status) => {
		const normalizedStatus = status?.toLowerCase();
		return STATUS_STEPS.findIndex(
			(step) =>
				step.key.toLowerCase() === normalizedStatus ||
				(normalizedStatus === "processing" && step.key === "Processed") ||
				(normalizedStatus === "signatories" && step.key === "Signatory")
		);
	};

	const formatDate = (dateString) => {
		if (!dateString) return null;
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString("en-US", {
				month: "long",
				day: "numeric",
				year: "numeric",
			});
		} catch {
			return dateString;
		}
	};

	const getTimelineDetails = (status) => {
		switch (status.toLowerCase()) {
			case "pending":
				return {
					description: "Request submitted and awaiting processing",
					color: "text-yellow-600",
				};
			case "processed":
				return {
					description: "Documents are being processed by registrar",
					color: "text-blue-600",
				};
			case "signatory":
				return {
					description: "Done for signatory approval",
					color: "text-purple-600",
				};
			case "release":
				return {
					description: "Document is ready for release",
					color: "text-green-600",
				};
			case "completed":
				return {
					description: "Document has been completed",
					color: "text-green-600",
				};
			default:
				return { description: "Status unknown", color: "text-gray-600" };
		}
	};

	// Refresh requirement comments when userRequests changes
	useEffect(() => {
		const fetchComments = async () => {
			const comments = {};
			for (const request of userRequests) {
				comments[request.id] = await getRequirementComments(request.id);
			}
			setRequirementComments(comments);
		};

		if (userRequests.length > 0) {
			fetchComments();
		}
	}, [userRequests]);

	if (loadingRequests) {
		return (
			<div className="flex justify-center items-center py-8">
				<div className="text-gray-500">Loading requests...</div>
			</div>
		);
	}

	if (userRequests.length === 0) {
		return (
			<div className="py-12 text-center">
				<FileText className="mx-auto mb-4 w-16 h-16 text-gray-400" />
				<h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
					No document requests yet
				</h3>
				<p className="mb-6 text-gray-500 dark:text-gray-400">
					Start by requesting your first document
				</p>
			</div>
		);
	}

	return (
		<>
			<div className="bg-white rounded-lg border shadow-sm dark:bg-slate-800 border-slate-200 dark:border-slate-700">
				<div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
					<h2 className="text-lg font-semibold text-slate-900 dark:text-white">
						My Document Requests
					</h2>

					{/* Tip for users - moved here for immediate visibility */}
					<div className="p-3 mt-3 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-900/10 dark:border-blue-700">
						<p className="text-xs text-blue-600 dark:text-blue-400">
							💡 <strong>Tip:</strong> Click on any request row to view full
							details, progress timeline, and registrar comments.
						</p>
					</div>
				</div>

				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-slate-50 dark:bg-slate-700">
							<tr>
								<th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500 dark:text-slate-300">
									Document
								</th>
								<th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500 dark:text-slate-300">
									Progress
								</th>
								<th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500 dark:text-slate-300">
									Status
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y dark:bg-slate-800 divide-slate-200 dark:divide-slate-700">
							{userRequests.map((request) => (
								<tr
									key={request.id}
									onClick={() => handleRowClick(request)}
									className={`cursor-pointer transition-colors ${
										requirementComments[request.id] &&
										requirementComments[request.id].length > 0
											? "bg-amber-50 dark:bg-amber-900/10 border-l-4 border-l-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/20"
											: "hover:bg-slate-100 dark:hover:bg-slate-700"
									}`}
								>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm font-medium text-slate-900 dark:text-white">
											{request.document}
										</div>
										{/* Show additional info for multiple document requests */}
										{request.isMultipleDocument && (
											<div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
												📋 Multiple Documents ({request.documentCount} types, {request.totalCopies} total copies)
											</div>
										)}
										{/* Release Date (if officially scheduled) - Hide for Completed status since we show actual completion date below */}
										{request.releaseDate &&
											request.status?.toLowerCase() !== "completed" && (
												<div className="mt-1 text-xs text-green-600 dark:text-green-400">
													📅 Releasing Date: {request.releaseDateFormatted}
												</div>
											)}
										{/* Expected Release Date and Countdown - Hide for Cancelled status */}
										{request.expectedReleaseDateFormatted &&
											request.status?.toLowerCase() !== "cancelled" && (
												<div className="mt-1 text-xs">
													{request.status?.toLowerCase() === "completed" ? (
														<span className="font-medium text-green-600 dark:text-green-400">
															✅ Released Date:{" "}
															{request.expectedReleaseDateFormatted}
														</span>
													) : request.daysRemaining === 0 ? (
														<span className="font-medium text-green-600 dark:text-green-400">
															📅 Expected release: Today!
														</span>
													) : request.daysRemaining > 0 ? (
														<span className="text-blue-600 dark:text-blue-400">
															📅 Expected release:{" "}
															{request.expectedReleaseDateFormatted}
															<span className="font-medium text-blue-700 dark:text-blue-300">
																({request.daysRemaining}{" "}
																{request.daysRemaining === 1 ? "day" : "days"}{" "}
																left)
															</span>
														</span>
													) : (
														<span className="font-medium text-red-600 dark:text-red-400">
															⚠️ Expected release was:{" "}
															{request.expectedReleaseDateFormatted}
															<span className="text-red-700 dark:text-red-300">
																({Math.abs(request.daysRemaining)}{" "}
																{Math.abs(request.daysRemaining) === 1
																	? "day"
																	: "days"}{" "}
																overdue)
															</span>
														</span>
													)}
												</div>
											)}
										{requirementComments[request.id] &&
											requirementComments[request.id].length > 0 && (
												<div className="flex gap-2 items-center mt-2">
													<div className="relative">
														<MessageSquare className="w-4 h-4 text-amber-600" />
														<div className="flex absolute -top-1 -right-1 justify-center items-center w-3 h-3 bg-red-500 rounded-full">
															<span className="text-xs font-bold text-white">
																{requirementComments[request.id].length}
															</span>
														</div>
													</div>
													<div className="flex flex-col">
														<span className="text-xs font-medium text-amber-700 dark:text-amber-300">
															Registrar Comment
														</span>
														<span className="text-xs text-amber-600 dark:text-amber-400">
															Click to view details
														</span>
													</div>
												</div>
											)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="flex gap-1">
											{["P", "Pr", "S", "R", "✓"].map((step, index) => {
												const isCompleted = getStepStatus(
													request.status,
													index
												);
												return (
													<div
														key={index}
														className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
															isCompleted
																? "text-white bg-blue-600"
																: "bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-400"
														}`}
													>
														{step}
													</div>
												);
											})}
										</div>
										<button
											onClick={(e) => {
												e.stopPropagation();
												toggleTimeline(request.id);
											}}
											className="mt-2 text-xs text-blue-600 transition-colors cursor-pointer dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
										>
											{expandedTimeline === request.id
												? "Hide Timeline"
												: "Show Timeline"}
										</button>

										{/* Inline Timeline Details */}
										{expandedTimeline === request.id && (
											<div className="p-3 mt-3 rounded-lg border bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600">
												<div className="space-y-2">
													{STATUS_STEPS.map((step, index) => {
														const isCompleted = getStepStatus(
															request.status,
															index
														);
														const isCurrent =
															request.status.toLowerCase() ===
															step.key.toLowerCase();
														const timelineDetails = getTimelineDetails(
															step.key
														);
														const stepTracking = requestTracking[
															request.id
														]?.find((t) => getStepIndex(t.status) === index);
														const statusDate =
															stepTracking?.createdAt ||
															stepTracking?.dateFormatted;

														return (
															<div
																key={step.key}
																className="flex gap-3 items-start"
															>
																<div
																	className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
																		isCompleted
																			? "text-white bg-blue-600"
																			: isCurrent
																			? "text-white bg-blue-500 animate-pulse"
																			: "bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-400"
																	}`}
																>
																	{index + 1}
																</div>
																<div className="flex-1 min-w-0">
																	<div
																		className={`text-sm font-medium ${
																			isCompleted
																				? "text-blue-600 dark:text-blue-400"
																				: isCurrent
																				? "text-blue-600 dark:text-blue-400"
																				: "text-slate-600 dark:text-slate-400"
																		}`}
																	>
																		{step.label}
																	</div>
																	<div
																		className={`text-xs ${timelineDetails.color}`}
																	>
																		{isCompleted || isCurrent
																			? timelineDetails.description
																			: "Not yet reached"}
																	</div>
																	{isCurrent && (
																		<div className="mt-1 text-xs font-medium text-blue-600 dark:text-blue-400">
																			← Current Status
																		</div>
																	)}
																	{statusDate && (isCompleted || isCurrent) && (
																		<div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
																			Date: {formatDate(statusDate)}
																		</div>
																	)}
																</div>
															</div>
														);
													})}
												</div>
											</div>
										)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span
											className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
												request.status
											)}`}
										>
											{request.status}
										</span>
										<div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
											{new Date(request.currentStatusDate).toLocaleDateString(
												"en-US",
												{
													month: "long",
													day: "numeric",
													year: "numeric",
												}
											)}
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Request Details Modal */}
			{showDetailsModal && selectedRequest && (
				<RequestDetailsModal
					isOpen={showDetailsModal}
					onClose={handleCloseModal}
					request={selectedRequest}
					userId={selectedRequest.studentId || localStorage.getItem("userId")}
					onSuccess={onRequestSuccess}
				/>
			)}
		</>
	);
}

// Helper functions
function getStepStatus(currentStatus, stepIndex) {
	const statusOrder = [
		"pending",
		"processed",
		"signatory",
		"release",
		"completed",
	];
	const currentIndex = statusOrder.indexOf(currentStatus.toLowerCase());
	return currentIndex >= stepIndex;
}

function getStatusColor(status) {
	switch (status.toLowerCase()) {
		case "pending":
			return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
		case "processed":
			return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
		case "signatory":
			return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
		case "release":
			return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
		case "completed":
			return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
		case "cancelled":
			return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
		default:
			return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
	}
}
