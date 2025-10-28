import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import {
	getForgotLrnRequests,
	processLrnRequest,
	sendLrnEmail,
} from "../../../utils/registrar";
import toast from "react-hot-toast";
import ProcessLrnModal from "./ProcessLrnModal";

// Helper function to format date in human-readable format
const formatDate = (dateString) => {
	if (!dateString) return "N/A";
	const date = new Date(dateString);
	// Check if date is invalid
	if (isNaN(date.getTime())) return "N/A";
	return date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
};

export default function LrnRequestsTab({ userId, students }) {
	const [requests, setRequests] = useState([]);
	const [loading, setLoading] = useState(true);
	const [selectedRequest, setSelectedRequest] = useState(null);
	const [showProcessModal, setShowProcessModal] = useState(false);

	useEffect(() => {
		fetchRequests();
	}, []);

	const fetchRequests = async () => {
		try {
			const data = await getForgotLrnRequests();
			if (Array.isArray(data)) {
				setRequests(data);
			}
		} catch (error) {
			console.error("Failed to fetch requests:", error);
			toast.error("Failed to load LRN requests");
		} finally {
			setLoading(false);
		}
	};

	const handleProcess = async (requestId, studentId, lrn) => {
		try {
			const response = await processLrnRequest(
				requestId,
				userId,
				studentId,
				lrn
			);
			if (response.success) {
				// Send LRN email using the new API
				try {
					await sendLrnEmail({
						email: response.requestData.email,
						firstName: response.requestData.firstname,
						lastName: response.requestData.lastname,
						lrn: response.lrn,
					});
					toast.success("LRN request processed and email sent successfully");
				} catch (emailError) {
					console.error("Failed to send LRN email:", emailError);
					toast.success(
						"LRN request processed successfully, but email failed to send"
					);
				}
				fetchRequests(); // Refresh the list
			} else {
				toast.error(response.error || "Failed to process request");
			}
		} catch (error) {
			console.error("Failed to process request:", error);
			toast.error("Failed to process request");
		}
	};

	const handleRowClick = (request) => {
		setSelectedRequest(request);
		setShowProcessModal(true);
	};

	return (
		<Card className="dark:bg-slate-800 dark:border-slate-700">
			<CardContent className="p-4 lg:p-6">
				<div className="mb-6">
					<h2 className="text-xl font-semibold text-slate-900 dark:text-white">
						LRN Retrieval Requests
					</h2>
					<p className="text-sm text-slate-500 dark:text-slate-400">
						Manage student LRN retrieval requests
					</p>
				</div>

				{loading ? (
					<div className="py-4 text-center">Loading requests...</div>
				) : requests.length === 0 ? (
					<div className="py-4 text-center">No pending LRN requests</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-b dark:border-slate-700">
									<th className="px-4 py-2 text-left">Name</th>
									<th className="px-4 py-2 text-left">Email</th>
									<th className="px-4 py-2 text-left">Birth Date</th>
									<th className="px-4 py-2 text-left">Status</th>
									<th className="px-4 py-2 text-left">Requested</th>
								</tr>
							</thead>
							<tbody>
								{requests.map((request) => (
									<tr
										key={request.id}
										onClick={() =>
											!request.is_processed && handleRowClick(request)
										}
										className={`border-b dark:border-slate-700 ${
											!request.is_processed
												? "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700"
												: ""
										}`}
									>
										<td className="px-4 py-2">
											{request.firstname} {request.lastname}
										</td>
										<td className="px-4 py-2">{request.email}</td>
										<td className="px-4 py-2">
											{formatDate(request.birthDate)}
										</td>
										<td className="px-4 py-2">
											{request.is_processed ? (
												<span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium text-green-800 bg-green-100 rounded-full dark:bg-green-900/20 dark:text-green-400">
													Processed
												</span>
											) : (
												<span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full dark:bg-yellow-900/20 dark:text-yellow-400">
													Pending
												</span>
											)}
										</td>
										<td className="px-4 py-2">
											{formatDate(request.created_at)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</CardContent>

			{/* Process LRN Modal */}
			<ProcessLrnModal
				isOpen={showProcessModal}
				onClose={() => {
					setShowProcessModal(false);
					setSelectedRequest(null);
				}}
				request={selectedRequest}
				onProcess={handleProcess}
				students={students}
			/>
		</Card>
	);
}
