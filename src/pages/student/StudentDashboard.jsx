"use client";

import React, { useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
	Menu,
	FileText,
	Clock,
	CheckCircle2,
	LogOut,
	Plus,
	User,
	ChevronDown,
	ChevronUp,
	RefreshCw,
} from "lucide-react";
import { getUserRequests, getRequestTracking } from "../../utils/student";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import RequestDocuments from "./modal/RequestDocuments";

// Enhanced Progress Component with complete timeline
const InlineTrackingProgress = ({ requestId }) => {
	const [tracking, setTracking] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showFullTimeline, setShowFullTimeline] = useState(false);

	const STATUS_STEPS = [
		{ key: "Pending", label: "Pending", shortLabel: "P", color: "yellow" },
		{ key: "Processed", label: "Processed", shortLabel: "Pr", color: "blue" },
		{ key: "Signatory", label: "Signatory", shortLabel: "S", color: "purple" },
		{ key: "Release", label: "Release", shortLabel: "R", color: "orange" },
		{ key: "Completed", label: "Completed", shortLabel: "✓", color: "green" },
	];

	React.useEffect(() => {
		if (requestId) {
			getRequestTracking(requestId)
				.then((data) => {
					setTracking(Array.isArray(data) ? data : []);
				})
				.catch((err) => {
					console.error("Failed to fetch tracking:", err);
				})
				.finally(() => setLoading(false));
		}
	}, [requestId]);

	if (loading) {
		return (
			<div className="flex flex-col space-y-2">
				<div className="flex overflow-x-auto items-center pb-1 space-x-1">
					{STATUS_STEPS.map((_, idx) => (
						<div key={idx} className="flex flex-shrink-0 items-center">
							<div className="flex justify-center items-center w-7 h-7 bg-gray-200 rounded-full animate-pulse sm:w-8 sm:h-8">
								<div className="w-2 h-2 bg-gray-300 rounded-full"></div>
							</div>
							{idx < STATUS_STEPS.length - 1 && (
								<div className="w-3 sm:w-4 h-0.5 bg-gray-200 animate-pulse flex-shrink-0"></div>
							)}
						</div>
					))}
				</div>
				<div className="text-xs text-gray-400">Loading timeline...</div>
			</div>
		);
	}

	// Find the latest status and determine current step
	const latestStatus = tracking.length
		? tracking[tracking.length - 1].status
		: null;

	const getStepIndex = (status) => {
		const normalizedStatus = status?.toLowerCase();
		return STATUS_STEPS.findIndex(
			(step) =>
				step.key.toLowerCase() === normalizedStatus ||
				(normalizedStatus === "processing" && step.key === "Processed") ||
				(normalizedStatus === "signatories" && step.key === "Signatory")
		);
	};

	const currentStep = getStepIndex(latestStatus);

	// Get tracking data for each step
	const getStepData = (stepIndex) => {
		const step = STATUS_STEPS[stepIndex];
		const trackingEntry = tracking.find(
			(t) => getStepIndex(t.status) === stepIndex
		);
		return {
			...step,
			completed: stepIndex <= currentStep,
			isCurrent: stepIndex === currentStep,
			date: trackingEntry?.createdAt || trackingEntry?.dateFormatted,
			trackingData: trackingEntry,
		};
	};

	const formatDate = (dateString) => {
		if (!dateString) return null;
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			});
		} catch {
			return dateString;
		}
	};

	const getStatusColor = (step, completed, isCurrent) => {
		if (!completed) return "bg-gray-100 border-gray-300 text-gray-400";

		if (step.color === "green") {
			return "bg-green-100 border-green-500 text-green-700";
		} else if (isCurrent) {
			return "bg-blue-100 border-blue-500 text-blue-700 ring-2 ring-blue-200";
		} else {
			return "bg-blue-50 border-blue-400 text-blue-600";
		}
	};

	return (
		<div className="flex flex-col space-y-2 w-full">
			{/* Compact Progress Steps - Horizontally Scrollable on Mobile */}
			<div className="flex overflow-x-auto items-center pb-1 space-x-1 scrollbar-hide">
				<div className="flex flex-shrink-0 items-center space-x-1">
					{STATUS_STEPS.map((step, idx) => {
						const stepData = getStepData(idx);
						return (
							<div key={step.key} className="flex flex-shrink-0 items-center">
								<div
									className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-all duration-200 flex items-center justify-center text-xs sm:text-sm font-medium border-2 cursor-pointer ${getStatusColor(
										step,
										stepData.completed,
										stepData.isCurrent
									)}`}
									onClick={() => setShowFullTimeline(!showFullTimeline)}
									title={`${step.label} - Click to ${
										showFullTimeline ? "hide" : "show"
									} full timeline`}
								>
									<span className="text-xs font-semibold">
										{step.shortLabel}
									</span>
								</div>
								{idx < STATUS_STEPS.length - 1 && (
									<div
										className={`w-3 sm:w-4 h-0.5 transition-colors duration-200 flex-shrink-0 ${
											idx < currentStep ? "bg-blue-400" : "bg-gray-200"
										}`}
									></div>
								)}
							</div>
						);
					})}
				</div>
			</div>

			{/* Toggle Timeline Button */}
			<div className="flex justify-between items-center">
				<button
					onClick={() => setShowFullTimeline(!showFullTimeline)}
					className="flex gap-1 items-center text-xs text-blue-600 transition-colors sm:text-sm hover:text-blue-800"
				>
					{showFullTimeline ? (
						<>
							<ChevronUp className="w-3 h-3" />
							Hide Timeline
						</>
					) : (
						<>
							<ChevronDown className="w-3 h-3" />
							Show Timeline
						</>
					)}
				</button>

				{/* Current Status Badge */}
				{currentStep !== -1 && (
					<div className="flex flex-col gap-1 items-start">
						<span
							className={`px-2 py-1 rounded-full text-xs font-medium ${
								currentStep === STATUS_STEPS.length - 1
									? "bg-green-100 text-green-700"
									: "bg-blue-100 text-blue-700"
							}`}
						>
							{STATUS_STEPS[currentStep].label}
						</span>
						<span className="text-xs text-gray-500">
							{formatDate(
								tracking[tracking.length - 1]?.createdAt ||
									tracking[tracking.length - 1]?.dateFormatted
							)}
						</span>
					</div>
				)}
			</div>

			{/* Full Timeline View */}
			{showFullTimeline && (
				<div className="p-3 space-y-3 bg-gray-50 rounded-lg border sm:p-4">
					<div className="flex justify-between items-center mb-3">
						<h4 className="text-sm font-semibold text-gray-700">
							Document Processing Timeline
						</h4>
						<button
							onClick={() => setShowFullTimeline(false)}
							className="text-gray-400 hover:text-gray-600"
						>
							<ChevronUp className="w-4 h-4" />
						</button>
					</div>

					<div className="space-y-3">
						{STATUS_STEPS.map((step, idx) => {
							const stepData = getStepData(idx);
							return (
								<div
									key={step.key}
									className="flex gap-3 justify-between items-start py-2"
								>
									<div className="flex flex-1 gap-3 items-center min-w-0">
										<div
											className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
												stepData.completed
													? idx === STATUS_STEPS.length - 1
														? "bg-green-600 text-white"
														: "bg-blue-600 text-white"
													: "bg-gray-300 text-gray-500"
											}`}
										>
											{stepData.completed ? "✓" : idx + 1}
										</div>
										<div className="flex-1 min-w-0">
											<div className="flex flex-wrap gap-2 items-center">
												<span
													className={`text-sm font-medium ${
														stepData.isCurrent
															? "text-blue-700"
															: stepData.completed
															? "text-gray-700"
															: "text-gray-400"
													}`}
												>
													{step.label}
												</span>
												{stepData.isCurrent && (
													<span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full whitespace-nowrap">
														Current
													</span>
												)}
											</div>
										</div>
									</div>
									<div className="flex-shrink-0 text-xs text-right text-gray-500 sm:text-sm">
										{stepData.date
											? formatDate(stepData.date)
											: stepData.completed
											? "Completed"
											: "Pending"}
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
};

export default function StudentDashboard() {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [showRequestForm, setShowRequestForm] = useState(false);
	const [userRequests, setUserRequests] = useState([]);
	const [loadingRequests, setLoadingRequests] = useState(false);
	const navigate = useNavigate();

	// Get userId from cookie
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

	// Fetch user requests on component mount
	React.useEffect(() => {
		if (userId) {
			fetchUserRequests();
		}
	}, [userId]);

	const fetchUserRequests = () => {
		setLoadingRequests(true);
		getUserRequests(userId)
			.then((data) => {
				setUserRequests(Array.isArray(data) ? data : []);
			})
			.catch((err) => {
				console.error("Failed to fetch user requests:", err);
				toast.error("Failed to load your requests.");
			})
			.finally(() => setLoadingRequests(false));
	};

	const navItems = [
		{ icon: <FileText className="w-5 h-5" />, label: "My Requests" },
		{ icon: <User className="w-5 h-5" />, label: "Profile" },
	];

	// Initialize sidebar state based on screen size
	React.useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth >= 1024) {
				setSidebarOpen(true);
			} else {
				setSidebarOpen(false);
			}
		};

		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const logout = () => {
		Cookies.remove("mogchs_user");
		navigate("/");
	};

	const handleRequestSuccess = () => {
		fetchUserRequests();
	};

	return (
		<div className="flex min-h-screen bg-gray-50">
			<Toaster position="top-right" />

			{/* Mobile Overlay */}
			{sidebarOpen && (
				<div
					className="fixed inset-0 z-20 bg-black/50 lg:hidden"
					onClick={() => setSidebarOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<aside
				className={`fixed top-0 left-0 lg:sticky lg:top-0 z-30 flex flex-col bg-slate-900 text-white transition-all duration-300 h-screen ${
					sidebarOpen
						? "w-64 translate-x-0"
						: "w-64 -translate-x-full lg:translate-x-0"
				} ${sidebarOpen ? "lg:w-64" : "lg:w-20"} overflow-y-auto`}
				style={{ backgroundColor: "#0f172a", color: "white" }}
			>
				{/* Top Section */}
				<div className="flex flex-col p-4 space-y-6">
					{/* Toggle button */}
					<button
						className="flex justify-center items-center mb-4 w-10 h-10 text-white bg-gray-600 rounded transition-colors hover:bg-blue-700 focus:outline-none"
						style={{ color: "white" }}
						onClick={() => setSidebarOpen((open) => !open)}
					>
						<Menu className="w-6 h-6" />
					</button>

					{/* Logo Centered */}
					<div className="flex justify-center items-center mb-8 w-full transition-all">
						<img
							src="/images/mogchs.jpg"
							alt="MOGCHS Logo"
							className={`transition-all duration-300 rounded-full bg-white object-cover ${
								sidebarOpen ? "w-20 h-20" : "w-12 h-12"
							}`}
						/>
					</div>

					{/* Nav */}
					<nav className="flex flex-col gap-2">
						{navItems.map((item, idx) => (
							<a
								href="#"
								key={item.label}
								className="flex gap-3 items-center px-3 py-2 text-white rounded transition-colors hover:bg-slate-800 bg-slate-800"
								style={{ color: "white" }}
							>
								{item.icon}
								<span
									className={`transition-all duration-200 origin-left ${
										sidebarOpen
											? "ml-2 opacity-100"
											: "overflow-hidden ml-0 w-0 opacity-0"
									}`}
									style={{ color: "white" }}
								>
									{item.label}
								</span>
							</a>
						))}
					</nav>
				</div>

				{/* Bottom Section - Logout Button */}
				<div className="p-4 mt-auto">
					<button
						className="flex gap-2 items-center px-4 py-2 w-full text-white bg-blue-600 rounded-md transition-colors hover:bg-blue-700"
						style={{ backgroundColor: "#2563eb", color: "white" }}
						onClick={logout}
					>
						<LogOut className="w-5 h-5" />
						<span
							className={`transition-all duration-200 origin-left ${
								sidebarOpen
									? "ml-2 opacity-100"
									: "overflow-hidden ml-0 w-0 opacity-0"
							}`}
							style={{ color: "white" }}
						>
							Logout
						</span>
					</button>
				</div>
			</aside>

			{/* Main Content */}
			<main className="flex-1 p-3 w-full min-w-0 sm:p-4 lg:p-8">
				{/* Mobile Menu Button */}
				<div className="flex justify-between items-center mb-4 lg:hidden">
					<button
						onClick={() => setSidebarOpen(true)}
						className="p-2 bg-white rounded-lg border shadow-sm transition-colors text-slate-600 border-slate-200 hover:bg-gray-50"
					>
						<Menu className="w-5 h-5" />
					</button>
					<h1 className="text-lg font-bold sm:text-xl text-slate-900">
						Student Portal
					</h1>
				</div>

				{/* Desktop Header */}
				<header className="hidden justify-between items-center mb-8 lg:flex">
					<div>
						<h1 className="text-3xl font-bold text-slate-900">
							Student Portal
						</h1>
						<p className="text-base text-slate-600">
							Request and track your documents
						</p>
					</div>
					<div className="flex gap-2">
						<Button
							className="flex gap-2 items-center text-white bg-blue-600 hover:bg-blue-700"
							onClick={() => setShowRequestForm(true)}
						>
							<Plus className="w-4 h-4" /> Request Document
						</Button>
						<Button
							onClick={fetchUserRequests}
							disabled={loadingRequests}
							className="flex gap-2 items-center text-white bg-gray-600 hover:bg-gray-700 disabled:opacity-75 disabled:cursor-not-allowed"
						>
							<RefreshCw
								className={`w-4 h-4 ${loadingRequests ? "animate-spin" : ""}`}
							/>
							Refresh
						</Button>
					</div>
				</header>

				{/* Mobile Header */}
				<header className="flex flex-col gap-4 mb-6 lg:hidden">
					<div>
						<p className="text-sm text-slate-600">
							Request and track your documents
						</p>
					</div>
					<div className="flex gap-2">
						<Button
							className="flex gap-2 items-center w-full text-white bg-blue-600 hover:bg-blue-700"
							onClick={() => setShowRequestForm(true)}
						>
							<Plus className="w-4 h-4" /> Request Document
						</Button>
						<Button
							onClick={fetchUserRequests}
							disabled={loadingRequests}
							className="flex gap-2 items-center w-full text-white bg-gray-600 hover:bg-gray-700 disabled:opacity-75 disabled:cursor-not-allowed"
						>
							<RefreshCw
								className={`w-4 h-4 ${loadingRequests ? "animate-spin" : ""}`}
							/>
							Refresh
						</Button>
					</div>
				</header>

				{/* Enhanced Stats Cards */}
				<div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4 sm:gap-4 lg:gap-6 lg:mb-8">
					<Card className="transition-shadow hover:shadow-md">
						<CardContent className="p-3 sm:p-4 lg:p-6">
							<div className="flex gap-2 items-center text-xs lg:text-sm text-slate-500">
								<Clock className="flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4" />
								<span className="truncate">Pending</span>
							</div>
							<div className="mt-2 text-lg font-bold sm:text-xl lg:text-2xl text-slate-900">
								{userRequests.filter((req) => req.status === "Pending").length}
							</div>
							<div className="mt-1 text-xs text-yellow-600">
								Awaiting processing
							</div>
						</CardContent>
					</Card>

					<Card className="transition-shadow hover:shadow-md">
						<CardContent className="p-3 sm:p-4 lg:p-6">
							<div className="flex gap-2 items-center text-xs lg:text-sm text-slate-500">
								<FileText className="flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4" />
								<span className="truncate">Processing</span>
							</div>
							<div className="mt-2 text-lg font-bold sm:text-xl lg:text-2xl text-slate-900">
								{
									userRequests.filter((req) =>
										["Processing", "Processed", "Signatory"].includes(
											req.status
										)
									).length
								}
							</div>
							<div className="mt-1 text-xs text-blue-600">In progress</div>
						</CardContent>
					</Card>

					<Card className="transition-shadow hover:shadow-md">
						<CardContent className="p-3 sm:p-4 lg:p-6">
							<div className="flex gap-2 items-center text-xs lg:text-sm text-slate-500">
								<CheckCircle2 className="flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4" />
								<span className="truncate">Completed</span>
							</div>
							<div className="mt-2 text-lg font-bold sm:text-xl lg:text-2xl text-slate-900">
								{
									userRequests.filter((req) => req.status === "Completed")
										.length
								}
							</div>
							<div className="mt-1 text-xs text-green-600">
								Ready for pickup
							</div>
						</CardContent>
					</Card>

					<Card className="transition-shadow hover:shadow-md">
						<CardContent className="p-3 sm:p-4 lg:p-6">
							<div className="flex gap-2 items-center text-xs lg:text-sm text-slate-500">
								<FileText className="flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4" />
								<span className="truncate">Total</span>
							</div>
							<div className="mt-2 text-lg font-bold sm:text-xl lg:text-2xl text-slate-900">
								{userRequests.length}
							</div>
							<div className="mt-1 text-xs text-slate-600">All time</div>
						</CardContent>
					</Card>
				</div>

				{/* Request Form Modal */}
				{showRequestForm && (
					<RequestDocuments
						isOpen={showRequestForm}
						onClose={() => setShowRequestForm(false)}
						userId={userId}
						onSuccess={handleRequestSuccess}
					/>
				)}

				{/* My Requests Table */}
				<Card className="shadow-sm">
					<CardContent className="p-0">
						<div className="p-4 border-b border-gray-100 sm:p-6">
							<h2 className="text-lg font-semibold lg:text-xl text-slate-900">
								My Document Requests
							</h2>
						</div>

						{loadingRequests ? (
							<div className="py-8 text-center lg:py-12">
								<div className="inline-flex gap-2 items-center text-sm text-slate-500 lg:text-base">
									<div className="w-4 h-4 rounded-full border-2 border-blue-600 animate-spin border-t-transparent"></div>
									Loading your requests...
								</div>
							</div>
						) : userRequests.length === 0 ? (
							<div className="py-8 text-center lg:py-12">
								<FileText className="mx-auto mb-4 w-12 h-12 text-gray-300" />
								<p className="text-sm text-slate-500 lg:text-base">
									No document requests yet.
								</p>
								<Button
									className="mt-4 text-white bg-blue-600 hover:bg-blue-700"
									onClick={() => setShowRequestForm(true)}
								>
									<Plus className="mr-2 w-4 h-4" />
									Request Your First Document
								</Button>
							</div>
						) : (
							<div className="overflow-hidden">
								{/* Mobile Card Layout */}
								<div className="block sm:hidden">
									{userRequests.map((req, index) => (
										<div
											key={req.id}
											className={`p-4 space-y-3 ${
												index !== userRequests.length - 1
													? "border-b border-gray-100"
													: ""
											}`}
										>
											<div className="flex justify-between items-start">
												<div className="flex-1 min-w-0">
													<h3 className="font-medium truncate text-slate-900">
														{req.document}
													</h3>
												</div>
											</div>
											<div className="w-full">
												<InlineTrackingProgress requestId={req.id} />
											</div>
										</div>
									))}
								</div>

								{/* Desktop Table Layout */}
								<div className="hidden overflow-x-auto sm:block">
									<table className="min-w-full text-sm lg:text-base text-slate-700">
										<thead className="bg-gray-50">
											<tr className="border-b border-slate-200">
												<th className="px-4 py-3 font-semibold text-left text-slate-900">
													Document
												</th>
												<th className="px-4 py-3 font-semibold text-left text-slate-900">
													Progress
												</th>
											</tr>
										</thead>
										<tbody>
											{userRequests.map((req, index) => (
												<tr
													key={req.id}
													className={`hover:bg-slate-50 transition-colors ${
														index !== userRequests.length - 1
															? "border-b border-slate-100"
															: ""
													}`}
												>
													<td className="px-4 py-4">
														<div className="font-medium text-slate-900">
															{req.document}
														</div>
													</td>
													<td className="px-4 py-4">
														<InlineTrackingProgress requestId={req.id} />
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</main>
		</div>
	);
}
