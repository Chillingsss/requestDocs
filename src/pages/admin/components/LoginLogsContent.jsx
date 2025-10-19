import React, { useState, useEffect } from "react";
import { RefreshCw, Search, Filter } from "lucide-react";
import { getLoginLogs, getUserLevel } from "../../../utils/admin";
import toast from "react-hot-toast";

export default function LoginLogsContent() {
	const [allLoginLogs, setAllLoginLogs] = useState([]);
	const [loading, setLoading] = useState(false);
	const [userLevels, setUserLevels] = useState([]);
	const [filters, setFilters] = useState({
		statusFilter: "",
		userLevelFilter: "",
		dateFrom: "",
		dateTo: "",
	});

	const statusOptions = [
		{ value: "", label: "All Statuses" },
		{ value: "success", label: "Success" },
		{ value: "failed", label: "Failed" },
		{ value: "blocked", label: "Blocked" },
	];

	useEffect(() => {
		fetchLoginLogs();
		fetchUserLevels();
	}, []);

	const fetchUserLevels = async () => {
		try {
			const data = await getUserLevel();
			setUserLevels(Array.isArray(data) ? data : []);
		} catch (error) {
			console.error("Failed to fetch user levels:", error);
			toast.error("Failed to load user levels");
			setUserLevels([]);
		}
	};

	const fetchLoginLogs = async () => {
		try {
			setLoading(true);
			// Fetch all logs without any filters
			const data = await getLoginLogs({ limit: 1000, offset: 0 });
			setAllLoginLogs(Array.isArray(data) ? data : []);
		} catch (error) {
			console.error("Failed to fetch login logs:", error);
			toast.error("Failed to load login logs");
			setAllLoginLogs([]);
		} finally {
			setLoading(false);
		}
	};

	// JavaScript filtering function
	const getFilteredLoginLogs = () => {
		return allLoginLogs.filter((log) => {
			// Status filter
			if (filters.statusFilter && log.loginStatus !== filters.statusFilter) {
				return false;
			}

			// User level filter
			if (
				filters.userLevelFilter &&
				log.userLevel !== filters.userLevelFilter
			) {
				return false;
			}

			// Date range filters
			if (filters.dateFrom) {
				const logDate = new Date(log.loginTime);
				const fromDate = new Date(filters.dateFrom);
				if (logDate < fromDate) {
					return false;
				}
			}

			if (filters.dateTo) {
				const logDate = new Date(log.loginTime);
				const toDate = new Date(filters.dateTo);
				toDate.setHours(23, 59, 59, 999); // End of day
				if (logDate > toDate) {
					return false;
				}
			}

			return true;
		});
	};

	// Get filtered logs
	const filteredLoginLogs = getFilteredLoginLogs();

	const handleFilterChange = (key, value) => {
		setFilters((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	const handleClearFilters = () => {
		setFilters({
			statusFilter: "",
			userLevelFilter: "",
			dateFrom: "",
			dateTo: "",
		});
	};

	const getStatusBadgeClass = (status) => {
		switch (status) {
			case "success":
				return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
			case "failed":
				return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
			case "blocked":
				return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
		}
	};

	const formatDateTime = (dateTime) => {
		if (!dateTime) return "N/A";
		return new Date(dateTime).toLocaleString("en-US", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		});
	};

	const truncateUserAgent = (userAgent) => {
		if (!userAgent) return "N/A";
		return userAgent.length > 50
			? userAgent.substring(0, 50) + "..."
			: userAgent;
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h2 className="text-2xl font-bold text-slate-900 dark:text-white">
						Login Logs
					</h2>
					<p className="text-slate-600 dark:text-slate-400">
						Monitor user login activities and security events
					</p>
				</div>
				<button
					onClick={fetchLoginLogs}
					disabled={loading}
					className="p-2 bg-white rounded-lg border shadow-sm transition-colors dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
					title="Refresh Data"
				>
					<RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
				</button>
			</div>

			{/* Filters */}
			<div className="p-6 bg-white rounded-lg border dark:bg-slate-800 border-slate-200 dark:border-slate-700">
				<div className="flex gap-2 items-center mb-4">
					<Filter className="w-5 h-5 text-slate-600 dark:text-slate-400" />
					<h3 className="text-lg font-semibold text-slate-900 dark:text-white">
						Filters
					</h3>
				</div>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
					<div className="space-y-2">
						<label
							htmlFor="statusFilter"
							className="block text-sm font-medium text-slate-700 dark:text-slate-300"
						>
							Status
						</label>
						<select
							id="statusFilter"
							value={filters.statusFilter}
							onChange={(e) =>
								handleFilterChange("statusFilter", e.target.value)
							}
							className="px-3 py-2 w-full bg-white rounded-md border border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						>
							{statusOptions.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="userLevelFilter"
							className="block text-sm font-medium text-slate-700 dark:text-slate-300"
						>
							User Level
						</label>
						<select
							id="userLevelFilter"
							value={filters.userLevelFilter}
							onChange={(e) =>
								handleFilterChange("userLevelFilter", e.target.value)
							}
							className="px-3 py-2 w-full bg-white rounded-md border border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						>
							<option value="">All User Levels</option>
							{userLevels.map((userLevel) => (
								<option key={userLevel.id} value={userLevel.name}>
									{userLevel.name}
								</option>
							))}
						</select>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="dateFrom"
							className="block text-sm font-medium text-slate-700 dark:text-slate-300"
						>
							Date From
						</label>
						<input
							id="dateFrom"
							type="date"
							value={filters.dateFrom}
							onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
							className="px-3 py-2 w-full bg-white rounded-md border border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="dateTo"
							className="block text-sm font-medium text-slate-700 dark:text-slate-300"
						>
							Date To
						</label>
						<input
							id="dateTo"
							type="date"
							value={filters.dateTo}
							onChange={(e) => handleFilterChange("dateTo", e.target.value)}
							className="px-3 py-2 w-full bg-white rounded-md border border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>
				</div>

				<div className="flex gap-2 mt-4">
					<button
						onClick={handleClearFilters}
						className="px-4 py-2 rounded-lg border transition-colors border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
					>
						Clear Filters
					</button>
				</div>
			</div>

			{/* Login Logs Table */}
			<div className="overflow-hidden bg-white rounded-lg border dark:bg-slate-800 border-slate-200 dark:border-slate-700">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-slate-50 dark:bg-slate-700">
							<tr>
								<th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500 dark:text-slate-300">
									User ID
								</th>
								<th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500 dark:text-slate-300">
									User Level
								</th>
								<th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500 dark:text-slate-300">
									Login Time
								</th>
								<th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500 dark:text-slate-300">
									Status
								</th>
								<th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500 dark:text-slate-300">
									IP Address
								</th>
								<th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500 dark:text-slate-300">
									User Agent
								</th>
								<th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500 dark:text-slate-300">
									Failure Reason
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y dark:bg-slate-800 divide-slate-200 dark:divide-slate-700">
							{loading ? (
								<tr>
									<td colSpan={7} className="px-6 py-8 text-center">
										<div className="flex justify-center items-center">
											<RefreshCw className="mr-2 w-6 h-6 animate-spin" />
											Loading login logs...
										</div>
									</td>
								</tr>
							) : filteredLoginLogs.length === 0 ? (
								<tr>
									<td
										colSpan={7}
										className="px-6 py-8 text-center text-slate-500 dark:text-slate-400"
									>
										No login logs found
									</td>
								</tr>
							) : (
								filteredLoginLogs.map((log) => (
									<tr
										key={log.id}
										className="hover:bg-slate-50 dark:hover:bg-slate-700"
									>
										<td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-slate-900 dark:text-white">
											{log.userId || "N/A"}
										</td>
										<td className="px-6 py-4 text-sm whitespace-nowrap text-slate-500 dark:text-slate-400">
											{log.userLevel || "N/A"}
										</td>
										<td className="px-6 py-4 text-sm whitespace-nowrap text-slate-500 dark:text-slate-400">
											{formatDateTime(log.loginTime)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(
													log.loginStatus
												)}`}
											>
												{log.loginStatus || "N/A"}
											</span>
										</td>
										<td className="px-6 py-4 text-sm whitespace-nowrap text-slate-500 dark:text-slate-400">
											{log.ipAddress || "N/A"}
										</td>
										<td
											className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400"
											title={log.userAgent}
										>
											{truncateUserAgent(log.userAgent)}
										</td>
										<td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
											{log.failureReason || "N/A"}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Summary */}
			<div className="p-6 bg-white rounded-lg border dark:bg-slate-800 border-slate-200 dark:border-slate-700">
				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					<div className="text-center">
						<div className="text-2xl font-bold text-green-600 dark:text-green-400">
							{
								filteredLoginLogs.filter((log) => log.loginStatus === "success")
									.length
							}
						</div>
						<div className="text-sm text-slate-600 dark:text-slate-400">
							Successful Logins
						</div>
					</div>
					<div className="text-center">
						<div className="text-2xl font-bold text-red-600 dark:text-red-400">
							{
								filteredLoginLogs.filter((log) => log.loginStatus === "failed")
									.length
							}
						</div>
						<div className="text-sm text-slate-600 dark:text-slate-400">
							Failed Logins
						</div>
					</div>
					<div className="text-center">
						<div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
							{
								filteredLoginLogs.filter((log) => log.loginStatus === "blocked")
									.length
							}
						</div>
						<div className="text-sm text-slate-600 dark:text-slate-400">
							Blocked Attempts
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
