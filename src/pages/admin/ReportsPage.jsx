import React, { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
	getRequestStats,
	getAllRequestsWithDetails,
	getRequestStatuses,
	exportRequestAnalytics,
} from "../../utils/admin";
import toast from "react-hot-toast";
import { format, parseISO } from "date-fns";
import {
	Download,
	Printer,
	Filter,
	BarChart2,
	PieChart,
	TrendingUp,
} from "lucide-react";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	LineElement,
	PointElement,
	Title,
	Tooltip,
	Legend,
	ArcElement,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	LineElement,
	PointElement,
	Title,
	Tooltip,
	Legend,
	ArcElement
);

export default function ReportsPage() {
	const [allRequests, setAllRequests] = useState([]);
	const [requestStats, setRequestStats] = useState([]);
	const [requestStatuses, setRequestStatuses] = useState([]);
	const [dateFrom, setDateFrom] = useState(null);
	const [dateTo, setDateTo] = useState(null);
	const [loading, setLoading] = useState(false);
	const [granularity, setGranularity] = useState("day"); // day | week | month | year
	const [activeReportType, setActiveReportType] = useState("overview");
	const [selectedPresetRange, setSelectedPresetRange] = useState("custom"); // 'custom', 'today', 'last7days', 'last30days', 'thismonth', 'lastmonth'
	const [selectedStatusFilter, setSelectedStatusFilter] = useState(""); // Filter by specific status
	const printRef = useRef();

	// Function to calculate dates based on preset
	const calculateDatesFromPreset = (preset) => {
		const today = new Date();
		let from = null;
		let to = today;

		switch (preset) {
			case "today":
				from = today;
				break;
			case "last7days":
				from = new Date(today.setDate(today.getDate() - 6));
				break;
			case "last30days":
				from = new Date(today.setDate(today.getDate() - 29));
				break;
			case "thismonth":
				from = new Date(today.getFullYear(), today.getMonth(), 1);
				break;
			case "lastmonth":
				from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
				to = new Date(today.getFullYear(), today.getMonth(), 0);
				break;
			case "yesterday":
				from = new Date(today.setDate(today.getDate() - 1));
				to = from;
				break;
			default:
				// Custom range, do nothing here, dates are set by inputs
				return { from: dateFrom, to: dateTo };
		}

		return {
			from: from ? format(from, "yyyy-MM-dd") : null,
			to: to ? format(to, "yyyy-MM-dd") : null,
		};
	};

	// Fetch all data once on component mount
	const fetchAllData = async () => {
		try {
			setLoading(true);

			const [statsResponse, requestsResponse, statusesResponse] =
				await Promise.all([
					getRequestStats(),
					getAllRequestsWithDetails(),
					getRequestStatuses(),
				]);

			setRequestStats(Array.isArray(statsResponse) ? statsResponse : []);
			setAllRequests(Array.isArray(requestsResponse) ? requestsResponse : []);
			setRequestStatuses(
				Array.isArray(statusesResponse) ? statusesResponse : []
			);
		} catch (error) {
			console.error("Failed to fetch data:", error);
			toast.error("Failed to load data");
		} finally {
			setLoading(false);
		}
	};

	// Frontend filtering logic
	const filteredRequests = useMemo(() => {
		if (!allRequests || allRequests.length === 0) return [];

		let filtered = allRequests;

		// Apply status filter
		if (selectedStatusFilter) {
			filtered = filtered.filter(
				(request) => request.status === selectedStatusFilter
			);
		}

		// Apply date range filter
		let effectiveDateFrom = dateFrom;
		let effectiveDateTo = dateTo;

		if (selectedPresetRange !== "custom") {
			const { from, to } = calculateDatesFromPreset(selectedPresetRange);
			effectiveDateFrom = from;
			effectiveDateTo = to;
		}

		if (effectiveDateFrom || effectiveDateTo) {
			const fromDate = effectiveDateFrom ? parseISO(effectiveDateFrom) : null;
			const toDate = effectiveDateTo ? parseISO(effectiveDateTo) : null;

			filtered = filtered.filter((request) => {
				// Use statusDate for filtering when looking at status history
				const filterDate = parseISO(request.statusDate);
				return (
					(!fromDate || filterDate >= fromDate) &&
					(!toDate || filterDate <= toDate)
				);
			});
		}

		return filtered;
	}, [
		allRequests,
		selectedStatusFilter,
		dateFrom,
		dateTo,
		selectedPresetRange,
	]);

	// Fetch data once on component mount
	useEffect(() => {
		fetchAllData();
	}, []);

	// Generate time series data from filtered requests
	const timeSeriesData = useMemo(() => {
		if (!filteredRequests || filteredRequests.length === 0) return [];

		// Group requests by date based on granularity
		const grouped = {};

		filteredRequests.forEach((request) => {
			// Use statusDate for time series when looking at status history
			const requestDate = parseISO(request.statusDate);
			let key;

			switch (granularity) {
				case "year":
					key = requestDate.getFullYear().toString();
					break;
				case "month":
					key = `${requestDate.getFullYear()}-${String(
						requestDate.getMonth() + 1
					).padStart(2, "0")}`;
					break;
				case "week":
					const year = requestDate.getFullYear();
					const week = Math.ceil(
						(requestDate - new Date(year, 0, 1)) / (7 * 24 * 60 * 60 * 1000)
					);
					key = `${year}-W${week}`;
					break;
				case "day":
				default:
					key = format(requestDate, "yyyy-MM-dd");
					break;
			}

			grouped[key] = (grouped[key] || 0) + 1;
		});

		return Object.entries(grouped)
			.map(([label, count]) => ({ label, cnt: count }))
			.sort((a, b) => a.label.localeCompare(b.label));
	}, [filteredRequests, granularity]);

	// Memoized chart data
	const timeSeriesChart = useMemo(() => {
		if (!timeSeriesData || timeSeriesData.length === 0) return null;

		const labels = timeSeriesData.map((d) => {
			const date = parseISO(d.label);
			switch (granularity) {
				case "year":
					return d.label;
				case "month":
					return format(date, "LLL y");
				case "week":
					return d.label;
				case "day":
				default:
					return format(date, "LLL dd, y");
			}
		});

		const data = timeSeriesData.map((d) => Number(d.cnt));

		return {
			labels,
			datasets: [
				{
					label: selectedStatusFilter
						? `${selectedStatusFilter} Requests`
						: "All Requests",
					data,
					backgroundColor: "rgba(75, 192, 192, 0.6)",
					borderColor: "rgba(75, 192, 192, 1)",
					borderWidth: 2,
					tension: 0.4,
				},
			],
		};
	}, [timeSeriesData, selectedStatusFilter, granularity]);

	// Generate status distribution data from filtered requests
	const statusDistributionData = useMemo(() => {
		if (!filteredRequests || filteredRequests.length === 0) return {};

		const statusCounts = {};
		filteredRequests.forEach((request) => {
			statusCounts[request.status] = (statusCounts[request.status] || 0) + 1;
		});

		return statusCounts;
	}, [filteredRequests]);

	const statusDistributionChart = useMemo(() => {
		if (
			!statusDistributionData ||
			Object.keys(statusDistributionData).length === 0
		)
			return null;

		const labels = Object.keys(statusDistributionData);
		const data = Object.values(statusDistributionData);

		// Dynamic color assignment based on status
		const getStatusColor = (status) => {
			const colorMap = {
				Pending: "rgba(255, 99, 132, 0.8)", // Pink
				Processed: "rgba(54, 162, 235, 0.8)", // Blue
				Signatory: "rgba(255, 206, 86, 0.8)", // Yellow
				Release: "rgba(75, 192, 192, 0.8)", // Teal
				Completed: "rgba(153, 102, 255, 0.8)", // Purple
				Cancelled: "rgba(255, 159, 64, 0.8)", // Orange
			};
			return colorMap[status] || "rgba(128, 128, 128, 0.8)"; // Default gray
		};

		const getBorderColor = (status) => {
			const colorMap = {
				Pending: "rgba(255, 99, 132, 1)",
				Processed: "rgba(54, 162, 235, 1)",
				Signatory: "rgba(255, 206, 86, 1)",
				Release: "rgba(75, 192, 192, 1)",
				Completed: "rgba(153, 102, 255, 1)",
				Cancelled: "rgba(255, 159, 64, 1)",
			};
			return colorMap[status] || "rgba(128, 128, 128, 1)"; // Default gray
		};

		return {
			labels,
			datasets: [
				{
					label: "Request Status Distribution",
					data,
					backgroundColor: labels.map(getStatusColor),
					borderColor: labels.map(getBorderColor),
					borderWidth: 1,
				},
			],
		};
	}, [statusDistributionData]);

	// Print functionality
	const handlePrint = () => {
		// Focus on the detailed report section for printing
		const printSection = document.getElementById("print-completed-requests");
		if (printSection) {
			const printContents = printSection.innerHTML;
			const originalContents = document.body.innerHTML;

			document.body.innerHTML = printContents;
			window.print();
			document.body.innerHTML = originalContents;

			// Rebind event listeners if needed
			window.location.reload();
		} else {
			// Fallback to default print
			window.print();
		}
	};

	// Export to CSV
	const handleExportCSV = async () => {
		try {
			await exportRequestAnalytics(dateFrom, dateTo);
			toast.success("CSV exported successfully");
		} catch (error) {
			toast.error("Failed to export CSV");
		}
	};

	// Render report sections
	const renderReportContent = () => {
		switch (activeReportType) {
			case "overview":
				return (
					<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
						{timeSeriesChart && (
							<Card className="dark:bg-slate-800 dark:border-slate-700">
								<CardContent className="p-4 lg:p-6">
									<div className="flex justify-between items-center mb-4">
										<h3 className="text-lg font-semibold text-slate-900 dark:text-white">
											{selectedStatusFilter
												? `${selectedStatusFilter} Requests Over Time`
												: "All Requests Over Time"}
										</h3>
										<TrendingUp className="w-6 h-6 text-blue-500" />
									</div>
									<Line
										data={timeSeriesChart}
										options={{
											responsive: true,
											plugins: {
												legend: { position: "top" },
												title: { display: false },
											},
										}}
									/>
								</CardContent>
							</Card>
						)}
						{statusDistributionChart && (
							<Card className="dark:bg-slate-800 dark:border-slate-700">
								<CardContent className="p-4 lg:p-6">
									<div className="flex justify-between items-center mb-4">
										<h3 className="text-lg font-semibold text-slate-900 dark:text-white">
											{selectedStatusFilter
												? `${selectedStatusFilter} Status Details`
												: "Request Status Distribution"}
										</h3>
										<PieChart className="w-6 h-6 text-purple-500" />
									</div>
									<Doughnut
										data={statusDistributionChart}
										options={{
											responsive: true,
											plugins: {
												legend: { position: "bottom" },
												title: { display: false },
											},
										}}
									/>
								</CardContent>
							</Card>
						)}
					</div>
				);
			case "detailed":
				return (
					<div className="space-y-6">
						<Card className="dark:bg-slate-800 dark:border-slate-700">
							<CardContent className="p-4 lg:p-6">
								<h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
									Detailed Request Breakdown
								</h3>
								<div className="overflow-x-auto">
									<table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
										<thead className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white">
											<tr>
												<th className="px-4 py-3">Status</th>
												<th className="px-4 py-3">Total Requests</th>
												<th className="px-4 py-3">Today's Requests</th>
											</tr>
										</thead>
										<tbody>
											{requestStats.map((stat, index) => (
												<tr
													key={index}
													className="border-b dark:border-slate-700"
												>
													<td className="px-4 py-3">{stat.status}</td>
													<td className="px-4 py-3">{stat.count}</td>
													<td className="px-4 py-3">{stat.todayCount || 0}</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</CardContent>
						</Card>

						<Card
							id="print-completed-requests"
							className="dark:bg-slate-800 dark:border-slate-700"
						>
							<CardContent className="p-4 lg:p-6">
								<h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
									{selectedStatusFilter
										? `${selectedStatusFilter} Requests (Recent)`
										: "All Requests (Recent)"}
								</h3>
								<div className="overflow-x-auto">
									<table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
										<thead className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white">
											<tr>
												<th className="px-4 py-3">Student</th>
												<th className="px-4 py-3">Document</th>
												<th className="px-4 py-3">Purpose</th>
												<th className="px-4 py-3">Requested Date</th>
												<th className="px-4 py-3">Status Date</th>
												<th className="px-4 py-3">Status</th>
											</tr>
										</thead>
										<tbody>
											{filteredRequests.map((request, index) => {
												// Combine free text and predefined purposes
												const purposeDisplay = [
													request.freeTextPurpose,
													request.predefinedPurposes,
												]
													.filter(Boolean)
													.join(" | ");

												return (
													<tr
														key={index}
														className="border-b dark:border-slate-700"
													>
														<td className="px-4 py-3">{request.student}</td>
														<td className="px-4 py-3">{request.document}</td>
														<td className="px-4 py-3">{purposeDisplay}</td>
														<td className="px-4 py-3">
															{request.dateRequested ? (
																<>
																	{format(
																		parseISO(request.dateRequested),
																		"LLL dd, y"
																	)}
																</>
															) : (
																format(
																	parseISO(request.dateRequested),
																	"LLL dd, y"
																)
															)}
														</td>
														<td className="px-4 py-3">
															{request.statusDate ? (
																<>
																	{format(
																		parseISO(request.statusDate),
																		"LLL dd, y"
																	)}
																</>
															) : (
																"N/A"
															)}
														</td>
														<td className="px-4 py-3">{request.status}</td>
													</tr>
												);
											})}
										</tbody>
									</table>
								</div>
							</CardContent>
						</Card>
					</div>
				);
			default:
				return null;
		}
	};

	return (
		<div className="p-4 lg:p-8 print:p-0" ref={printRef}>
			<div className="flex justify-between items-center mb-6 print:hidden">
				<div>
					<h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
						Request Reports
					</h1>
					<p className="text-slate-600 dark:text-slate-300">
						Detailed analytics and insights into document requests
					</p>
				</div>
				<div className="flex gap-2">
					<Button
						variant="outline"
						className="flex gap-2 items-center"
						onClick={handleExportCSV}
					>
						<Download className="w-4 h-4" /> Export CSV
					</Button>
					<Button
						variant="outline"
						className="flex gap-2 items-center"
						onClick={handlePrint}
					>
						<Printer className="w-4 h-4" /> Print Report
					</Button>
				</div>
			</div>

			{/* Date Range Filter */}
			<Card className="mb-6 dark:bg-slate-800 dark:border-slate-700 print:hidden">
				<CardContent className="p-4 lg:p-6">
					<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
						<div>
							<div className="text-base font-semibold lg:text-lg text-slate-900 dark:text-white">
								Request Analytics
							</div>
							<div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
								Filter by date and view all request statuses
							</div>
						</div>
						<div className="flex gap-2 items-center">
							<select
								className="p-2 rounded border dark:bg-slate-700 dark:border-slate-600"
								value={selectedPresetRange}
								onChange={(e) => setSelectedPresetRange(e.target.value)}
							>
								<option value="custom">Custom Range</option>
								<option value="today">Today</option>
								<option value="yesterday">Yesterday</option>
								<option value="last7days">Last 7 Days</option>
								<option value="last30days">Last 30 Days</option>
								<option value="thismonth">This Month</option>
								<option value="lastmonth">Last Month</option>
							</select>
							<select
								className="p-2 rounded border dark:bg-slate-700 dark:border-slate-600"
								value={granularity}
								onChange={(e) => setGranularity(e.target.value)}
							>
								<option value="day">Per Day</option>
								<option value="week">Per Week</option>
								<option value="month">Per Month</option>
								<option value="year">Per Year</option>
							</select>
							<select
								className="p-2 rounded border dark:bg-slate-700 dark:border-slate-600"
								value={selectedStatusFilter}
								onChange={(e) => setSelectedStatusFilter(e.target.value)}
							>
								<option value="">All Statuses</option>
								{requestStatuses.map((status) => (
									<option key={status.id} value={status.name}>
										{status.name}
									</option>
								))}
							</select>
							{selectedPresetRange === "custom" && (
								<>
									<input
										type="date"
										className="p-2 rounded border dark:bg-slate-700 dark:border-slate-600"
										value={dateFrom || ""}
										onChange={(e) => setDateFrom(e.target.value || null)}
									/>
									<span className="text-slate-500">to</span>
									<input
										type="date"
										className="p-2 rounded border dark:bg-slate-700 dark:border-slate-600"
										value={dateTo || ""}
										onChange={(e) => setDateTo(e.target.value || null)}
									/>
								</>
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Report Type Selector */}
			<div className="flex gap-4 mb-6 print:hidden">
				<Button
					variant={activeReportType === "overview" ? "default" : "outline"}
					onClick={() => setActiveReportType("overview")}
					className="flex gap-2 items-center"
				>
					<BarChart2 className="w-4 h-4" /> Overview
				</Button>
				<Button
					variant={activeReportType === "detailed" ? "default" : "outline"}
					onClick={() => setActiveReportType("detailed")}
					className="flex gap-2 items-center"
				>
					<PieChart className="w-4 h-4" /> Detailed Report
				</Button>
			</div>

			{/* Analytics KPIs */}
			<div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6 print:grid-cols-4">
				<Card className="dark:bg-slate-800 dark:border-slate-700">
					<CardContent className="p-4 lg:p-6">
						<div className="text-xs lg:text-sm text-slate-500 dark:text-slate-400">
							{selectedStatusFilter
								? `${selectedStatusFilter} in Range`
								: "Total in Range"}
						</div>
						<div className="mt-2 text-xl font-bold lg:text-2xl text-slate-900 dark:text-white">
							{filteredRequests ? filteredRequests.length : "-"}
						</div>
					</CardContent>
				</Card>
				<Card className="dark:bg-slate-800 dark:border-slate-700">
					<CardContent className="p-4 lg:p-6">
						<div className="text-xs lg:text-sm text-slate-500 dark:text-slate-400">
							Completed in Range
						</div>
						<div className="mt-2 text-xl font-bold lg:text-2xl text-slate-900 dark:text-white">
							{filteredRequests
								? filteredRequests.filter((r) => r.status === "Completed")
										.length
								: "-"}
						</div>
					</CardContent>
				</Card>
				<Card className="dark:bg-slate-800 dark:border-slate-700">
					<CardContent className="p-4 lg:p-6">
						<div className="text-xs lg:text-sm text-slate-500 dark:text-slate-400">
							Today Completed
						</div>
						<div className="mt-2 text-xl font-bold lg:text-2xl text-slate-900 dark:text-white">
							{filteredRequests
								? filteredRequests.filter(
										(r) =>
											r.status === "Completed" &&
											format(parseISO(r.dateCompleted), "yyyy-MM-dd") ===
												format(new Date(), "yyyy-MM-dd")
								  ).length
								: "-"}
						</div>
					</CardContent>
				</Card>
				<Card className="dark:bg-slate-800 dark:border-slate-700">
					<CardContent className="p-4 lg:p-6">
						<div className="text-xs lg:text-sm text-slate-500 dark:text-slate-400">
							Completion Rate
						</div>
						<div className="mt-2 text-xl font-bold lg:text-2xl text-slate-900 dark:text-white">
							{filteredRequests && filteredRequests.length > 0
								? `${(
										(filteredRequests.filter((r) => r.status === "Completed")
											.length /
											filteredRequests.length) *
										100
								  ).toFixed(1)}%`
								: "-"}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Report Content */}
			{renderReportContent()}

			{/* Print-specific styles */}
			<style jsx global>{`
				@media print {
					body * {
						visibility: hidden;
					}
					#printable-section,
					#printable-section * {
						visibility: visible;
					}
					#printable-section {
						position: absolute;
						left: 0;
						top: 0;
						width: 100%;
					}
					.print:hidden {
						display: none !important;
					}
				}
			`}</style>
		</div>
	);
}
