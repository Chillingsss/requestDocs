import React, { useState } from "react";
import { Button } from "../../../components/ui/button";
import { FileText, Plus } from "lucide-react";
import RequestDetailsModal from "../modal/RequestDetailsModal";

export default function RequestsTable({
	userRequests,
	loadingRequests,
	onRequestFormOpen,
}) {
	const [selectedRequest, setSelectedRequest] = useState(null);
	const [showDetailsModal, setShowDetailsModal] = useState(false);
	const [expandedTimeline, setExpandedTimeline] = useState(null);

	const handleRowClick = (request) => {
		setSelectedRequest(request);
		setShowDetailsModal(true);
	};

	const handleCloseModal = () => {
		setShowDetailsModal(false);
		setSelectedRequest(null);
	};

	const handleRequestSuccess = () => {
		// This will be called when requirements are uploaded
		// You can add any refresh logic here
	};

	const toggleTimeline = (requestId) => {
		setExpandedTimeline(expandedTimeline === requestId ? null : requestId);
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

	const getStatusDate = (request, stepIndex) => {
		// This is a simplified version - you might want to fetch actual status change dates from the backend
		const statusOrder = [
			"pending",
			"processed",
			"signatory",
			"release",
			"completed",
		];
		const currentIndex = statusOrder.indexOf(request.status.toLowerCase());

		if (stepIndex <= currentIndex) {
			// For completed or current status, show the request date or a placeholder
			if (stepIndex === 0) {
				// Pending status - show when request was submitted
				return new Date(request.dateRequested).toLocaleDateString("en-US", {
					month: "long",
					day: "numeric",
					year: "numeric",
				});
			} else if (stepIndex === currentIndex) {
				// Current status - show when it was reached (use request date as approximation)
				return new Date(request.dateRequested).toLocaleDateString("en-US", {
					month: "long",
					day: "numeric",
					year: "numeric",
				});
			} else {
				// Completed status - show estimated date (you can enhance this with actual status change dates)
				const estimatedDate = new Date(request.dateRequested);
				estimatedDate.setDate(estimatedDate.getDate() + stepIndex * 2); // Add 2 days per step
				return estimatedDate.toLocaleDateString("en-US", {
					month: "long",
					day: "numeric",
					year: "numeric",
				});
			}
		}
		return null; // Future status
	};

	if (loadingRequests) {
		return (
			<div className="flex justify-center items-center py-8">
				<div className="text-gray-500">Loading requests...</div>
			</div>
		);
	}

	if (userRequests.length === 0) {
		return (
			<div className="text-center py-12">
				<FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
				<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
					No document requests yet
				</h3>
				<p className="text-gray-500 dark:text-gray-400 mb-6">
					Start by requesting your first document
				</p>
				<Button
					onClick={onRequestFormOpen}
					className="flex gap-2 items-center text-white bg-blue-600 hover:bg-blue-700"
				>
					<Plus className="w-4 h-4" />
					Request Document
				</Button>
			</div>
		);
	}

	return (
		<>
			<div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
				<div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
					<h2 className="text-lg font-semibold text-slate-900 dark:text-white">
						My Document Requests
					</h2>
				</div>

				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-slate-50 dark:bg-slate-700">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
									Document
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
									Progress
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
									Status
								</th>
							</tr>
						</thead>
						<tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
							{userRequests.map((request) => (
								<tr
									key={request.id}
									onClick={() => handleRowClick(request)}
									className="hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
								>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm font-medium text-slate-900 dark:text-white">
											{request.document}
										</div>
										{request.releaseDate && (
											<div className="text-xs text-green-600 dark:text-green-400 mt-1">
												📅 Releasing Date: {request.releaseDateFormatted}
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
																? "bg-blue-600 text-white"
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
											className="text-xs text-blue-600 dark:text-blue-400 mt-2 hover:text-blue-800 dark:hover:text-blue-300 hover:underline cursor-pointer transition-colors"
										>
											{expandedTimeline === request.id
												? "Hide Timeline"
												: "Show Timeline"}
										</button>

										{/* Inline Timeline Details */}
										{expandedTimeline === request.id && (
											<div className="mt-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
												<div className="space-y-2">
													{[
														"Pending",
														"Processed",
														"Signatory",
														"Release",
														"Completed",
													].map((step, index) => {
														const isCompleted = getStepStatus(
															request.status,
															index
														);
														const isCurrent =
															request.status.toLowerCase() ===
															step.toLowerCase();
														const timelineDetails = getTimelineDetails(step);
														const statusDate = getStatusDate(request, index);

														return (
															<div
																key={step}
																className="flex items-start gap-3"
															>
																<div
																	className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
																		isCompleted
																			? "bg-blue-600 text-white"
																			: isCurrent
																			? "bg-blue-500 text-white animate-pulse"
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
																		{step}
																	</div>
																	<div
																		className={`text-xs ${timelineDetails.color}`}
																	>
																		{isCompleted || isCurrent
																			? timelineDetails.description
																			: "Pending"}
																	</div>
																	{isCurrent && (
																		<div className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
																			← Current Status
																		</div>
																	)}
																	{statusDate && (isCompleted || isCurrent) && (
																		<div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
																			Date: {statusDate}
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
										<div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
											{new Date(request.dateRequested).toLocaleDateString(
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
					onSuccess={handleRequestSuccess}
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
		default:
			return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
	}
}
