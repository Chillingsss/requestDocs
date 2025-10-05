import React, { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
	getRequestAnalytics,
	getRequestStats,
	getCompletedRequests,
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
	const [analyticsData, setAnalyticsData] = useState(null);
	const [requestStats, setRequestStats] = useState([]);
	const [completedRequests, setCompletedRequests] = useState([]);
	const [dateFrom, setDateFrom] = useState(null);
	const [dateTo, setDateTo] = useState(null);
	const [loading, setLoading] = useState(false);
	const [granularity, setGranularity] = useState("day"); // day | week | month | year
	const [activeReportType, setActiveReportType] = useState("overview");
	const [selectedPresetRange, setSelectedPresetRange] = useState("custom"); // 'custom', 'today', 'last7days', 'last30days', 'thismonth', 'lastmonth'
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

	// Fetch all analytics data
	const fetchAllAnalyticsData = async () => {
		try {
			setLoading(true);

			let effectiveDateFrom = dateFrom;
			let effectiveDateTo = dateTo;

			if (selectedPresetRange !== "custom") {
				const { from, to } = calculateDatesFromPreset(selectedPresetRange);
				effectiveDateFrom = from;
				effectiveDateTo = to;
			}

			const [analyticsResponse, statsResponse, completedResponse] =
				await Promise.all([
					getRequestAnalytics(effectiveDateFrom, effectiveDateTo, granularity),
					getRequestStats(),
					getCompletedRequests(),
				]);

			setAnalyticsData(analyticsResponse);
			setRequestStats(Array.isArray(statsResponse) ? statsResponse : []);
			setCompletedRequests(
				Array.isArray(completedResponse) ? completedResponse : []
			);
		} catch (error) {
			console.error("Failed to fetch analytics:", error);
			toast.error("Failed to load analytics");
		} finally {
			setLoading(false);
		}
	};

	// Filter completed requests based on date range
	const filteredCompletedRequests = useMemo(() => {
		if (!completedRequests || completedRequests.length === 0) return [];

		const fromDate = dateFrom ? parseISO(dateFrom) : null;
		const toDate = dateTo ? parseISO(dateTo) : null;

		return completedRequests.filter((request) => {
			const requestedDate = parseISO(request.dateRequested);
			const completedDate = request.dateCompleted
				? parseISO(request.dateCompleted)
				: null;

			const isInRange =
				(!fromDate || requestedDate >= fromDate) &&
				(!toDate || requestedDate <= toDate);

			return isInRange;
		});
	}, [completedRequests, dateFrom, dateTo]);

	// Trigger data fetch on component mount and when date range or granularity changes
	useEffect(() => {
		fetchAllAnalyticsData();
	}, [dateFrom, dateTo, granularity, selectedPresetRange]);

	// Memoized chart data
	const dailyCompletedChart = useMemo(() => {
		if (!analyticsData?.dailyCompleted) return null;
		const labels = analyticsData.dailyCompleted.map((d) =>
			format(parseISO(d.day), "LLL dd, y")
		);
		const data = analyticsData.dailyCompleted.map((d) => Number(d.cnt));
		return {
			labels,
			datasets: [
				{
					label: "Completed Requests",
					data,
					backgroundColor: "rgba(75, 192, 192, 0.6)",
					borderColor: "rgba(75, 192, 192, 1)",
					borderWidth: 2,
					tension: 0.4,
				},
			],
		};
	}, [analyticsData]);

	const statusDistributionChart = useMemo(() => {
		if (!analyticsData?.statusCounts) return null;
		const labels = analyticsData.statusCounts.map((stat) => stat.status);
		const data = analyticsData.statusCounts.map((stat) => Number(stat.count));
		return {
			labels,
			datasets: [
				{
					label: "Request Status Distribution",
					data,
					backgroundColor: [
						"rgba(255, 99, 132, 0.8)", // Pending - Pink
						"rgba(54, 162, 235, 0.8)", // Processed - Blue
						"rgba(255, 206, 86, 0.8)", // Signatory - Yellow
						"rgba(75, 192, 192, 0.8)", // Release - Teal
						"rgba(153, 102, 255, 0.8)", // Completed - Purple
					],
					borderColor: [
						"rgba(255, 99, 132, 1)",
						"rgba(54, 162, 235, 1)",
						"rgba(255, 206, 86, 1)",
						"rgba(75, 192, 192, 1)",
						"rgba(153, 102, 255, 1)",
					],
					borderWidth: 1,
				},
			],
		};
	}, [analyticsData]);

	// Derived chart data from timeSeries
	const timeSeriesChart = useMemo(() => {
		if (!analyticsData?.timeSeries) return null;
		const labels = analyticsData.timeSeries.map((d) =>
			format(parseISO(d.label), "LLL dd, y")
		);
		const data = analyticsData.timeSeries.map((d) => Number(d.cnt));
		return {
			labels,
			datasets: [
				{
					label: "Completed Requests",
					data,
					backgroundColor: "rgba(75, 192, 192, 0.6)",
					borderColor: "rgba(75, 192, 192, 1)",
					borderWidth: 2,
					tension: 0.4,
				},
			],
		};
	}, [analyticsData]);

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
											Completed Requests Over Time
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
											Request Status Distribution
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
									Recently Completed Requests
								</h3>
								<div className="overflow-x-auto">
									<table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
										<thead className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white">
											<tr>
												<th className="px-4 py-3">Student</th>
												<th className="px-4 py-3">Document</th>
												<th className="px-4 py-3">Purpose</th>
												<th className="px-4 py-3">Requested Date</th>
												<th className="px-4 py-3">Completed Date</th>
												<th className="px-4 py-3">Status</th>
											</tr>
										</thead>
										<tbody>
											{filteredCompletedRequests.map((request, index) => {
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
															{request.dateCompleted ? (
																<>
																	{format(
																		parseISO(request.dateCompleted),
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
								Filter by date and compare today vs yesterday
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
							Completed in Range
						</div>
						<div className="mt-2 text-xl font-bold lg:text-2xl text-slate-900 dark:text-white">
							{analyticsData ? analyticsData.completedInRange : "-"}
						</div>
					</CardContent>
				</Card>
				<Card className="dark:bg-slate-800 dark:border-slate-700">
					<CardContent className="p-4 lg:p-6">
						<div className="text-xs lg:text-sm text-slate-500 dark:text-slate-400">
							Today Completed
						</div>
						<div className="mt-2 text-xl font-bold lg:text-2xl text-slate-900 dark:text-white">
							{analyticsData ? analyticsData.todayCompleted : "-"}
						</div>
					</CardContent>
				</Card>
				<Card className="dark:bg-slate-800 dark:border-slate-700">
					<CardContent className="p-4 lg:p-6">
						<div className="text-xs lg:text-sm text-slate-500 dark:text-slate-400">
							Yesterday Completed
						</div>
						<div className="mt-2 text-xl font-bold lg:text-2xl text-slate-900 dark:text-white">
							{analyticsData ? analyticsData.yesterdayCompleted : "-"}
						</div>
					</CardContent>
				</Card>
				<Card className="dark:bg-slate-800 dark:border-slate-700">
					<CardContent className="p-4 lg:p-6">
						<div className="text-xs lg:text-sm text-slate-500 dark:text-slate-400">
							Today vs Yesterday
						</div>
						<div className="mt-2 text-xl font-bold lg:text-2xl text-slate-900 dark:text-white">
							{analyticsData
								? `${analyticsData.percentChange.toFixed(1)}%`
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
