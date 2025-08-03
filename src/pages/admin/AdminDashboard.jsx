import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
	Menu,
	LayoutDashboard,
	Users,
	FileText,
	Settings,
	LogOut,
	Plus,
} from "lucide-react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import {
	getUsers,
	getRequestStats,
	getCompletedRequests,
	getRecentActivity,
	getTotalUsers,
} from "../../utils/admin";
import AddUserModal from "./modal/AddUserModal";
import toast, { Toaster } from "react-hot-toast";
import ThemeToggle from "../../components/ThemeToggle";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
	ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
	ArcElement
);

export default function AdminDashboard() {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [activeSection, setActiveSection] = useState("Dashboard");
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(false);
	const [showAddUserModal, setShowAddUserModal] = useState(false);
	const [dashboardData, setDashboardData] = useState({
		requestStats: [],
		completedRequests: [],
		recentActivity: [],
		totalUsers: { totalUsers: 0, adminUsers: 0, studentUsers: 0 },
	});
	const [dashboardLoading, setDashboardLoading] = useState(false);
	const navigate = useNavigate();

	const navItems = [
		{ icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard" },
		{ icon: <Users className="w-5 h-5" />, label: "Users" },
		{ icon: <FileText className="w-5 h-5" />, label: "Reports" },
		{ icon: <Settings className="w-5 h-5" />, label: "Settings" },
	];

	// Initialize sidebar state based on screen size
	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth >= 1024) {
				// Desktop - sidebar should be open by default
				setSidebarOpen(true);
			}
		};

		// Set initial state
		handleResize();

		// Add event listener
		window.addEventListener("resize", handleResize);

		// Cleanup
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// Fetch dashboard data when Dashboard section is active
	useEffect(() => {
		if (activeSection === "Dashboard") {
			fetchDashboardData();
		}
	}, [activeSection]);

	// Fetch users when Users section is active
	useEffect(() => {
		if (activeSection === "Users") {
			fetchUsers();
		}
	}, [activeSection]);

	const fetchDashboardData = async () => {
		try {
			setDashboardLoading(true);
			const [requestStats, completedRequests, recentActivity, totalUsers] =
				await Promise.all([
					getRequestStats(),
					getCompletedRequests(),
					getRecentActivity(),
					getTotalUsers(),
				]);

			setDashboardData({
				requestStats: Array.isArray(requestStats) ? requestStats : [],
				completedRequests: Array.isArray(completedRequests)
					? completedRequests
					: [],
				recentActivity: Array.isArray(recentActivity) ? recentActivity : [],
				totalUsers: totalUsers || {
					totalUsers: 0,
					adminUsers: 0,
					studentUsers: 0,
				},
			});
		} catch (error) {
			console.error("Failed to fetch dashboard data:", error);
			toast.error("Failed to load dashboard data");
		} finally {
			setDashboardLoading(false);
		}
	};

	const fetchUsers = async () => {
		try {
			setLoading(true);
			const data = await getUsers();
			setUsers(Array.isArray(data) ? data : []);
		} catch (error) {
			console.error("Failed to fetch users:", error);
			toast.error("Failed to load users");
			setUsers([]);
		} finally {
			setLoading(false);
		}
	};

	const handleNavClick = (label) => {
		setActiveSection(label);
		if (window.innerWidth < 1024) {
			setSidebarOpen(false);
		}
	};

	const logout = () => {
		Cookies.remove("mogchs_user");
		navigate("/mogchs");
	};

	const handleAddUserSuccess = () => {
		fetchUsers(); // Refresh the user list
		toast.success("User list updated");
	};

	// Chart data for request status
	const requestStatusChartData = {
		labels: dashboardData.requestStats.map((stat) => stat.status),
		datasets: [
			{
				label: "Total Requests",
				data: dashboardData.requestStats.map((stat) => stat.count),
				backgroundColor: [
					"rgba(255, 99, 132, 0.8)",
					"rgba(54, 162, 235, 0.8)",
					"rgba(255, 206, 86, 0.8)",
					"rgba(75, 192, 192, 0.8)",
					"rgba(153, 102, 255, 0.8)",
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

	// Chart data for user distribution
	const userDistributionChartData = {
		labels: ["Admin Users", "Student Users"],
		datasets: [
			{
				data: [
					dashboardData.totalUsers.adminUsers,
					dashboardData.totalUsers.studentUsers,
				],
				backgroundColor: ["rgba(54, 162, 235, 0.8)", "rgba(255, 99, 132, 0.8)"],
				borderColor: ["rgba(54, 162, 235, 1)", "rgba(255, 99, 132, 1)"],
				borderWidth: 1,
			},
		],
	};

	const renderDashboardContent = () => {
		return (
			<>
				{/* Stats Cards */}
				<div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6 lg:mb-8">
					<Card className="dark:bg-slate-800 dark:border-slate-700">
						<CardContent className="p-4 lg:p-6">
							<div className="text-xs lg:text-sm text-slate-500 dark:text-slate-400">
								Total Users
							</div>
							<div className="mt-2 text-xl font-bold lg:text-2xl text-slate-900 dark:text-white">
								{dashboardLoading ? "..." : dashboardData.totalUsers.totalUsers}
							</div>
							<div className="mt-1 text-xs text-green-600">
								{dashboardData.totalUsers.adminUsers} Admin,{" "}
								{dashboardData.totalUsers.studentUsers} Students
							</div>
						</CardContent>
					</Card>
					<Card className="dark:bg-slate-800 dark:border-slate-700">
						<CardContent className="p-4 lg:p-6">
							<div className="text-xs lg:text-sm text-slate-500 dark:text-slate-400">
								Total Requests
							</div>
							<div className="mt-2 text-xl font-bold lg:text-2xl text-slate-900 dark:text-white">
								{dashboardLoading
									? "..."
									: dashboardData.requestStats.reduce(
											(sum, stat) => sum + stat.count,
											0
									  )}
							</div>
							<div className="mt-1 text-xs text-blue-600">
								All time requests
							</div>
						</CardContent>
					</Card>
					<Card className="dark:bg-slate-800 dark:border-slate-700">
						<CardContent className="p-4 lg:p-6">
							<div className="text-xs lg:text-sm text-slate-500 dark:text-slate-400">
								Completed Requests
							</div>
							<div className="mt-2 text-xl font-bold lg:text-2xl text-slate-900 dark:text-white">
								{dashboardLoading
									? "..."
									: dashboardData.completedRequests.length}
							</div>
							<div className="mt-1 text-xs text-green-600">
								Successfully processed
							</div>
						</CardContent>
					</Card>
					<Card className="dark:bg-slate-800 dark:border-slate-700">
						<CardContent className="p-4 lg:p-6">
							<div className="text-xs lg:text-sm text-slate-500 dark:text-slate-400">
								Pending Requests
							</div>
							<div className="mt-2 text-xl font-bold lg:text-2xl text-slate-900 dark:text-white">
								{dashboardLoading
									? "..."
									: dashboardData.requestStats.find(
											(stat) => stat.status === "Pending"
									  )?.count || 0}
							</div>
							<div className="mt-1 text-xs text-orange-600">
								Awaiting processing
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Charts Section */}
				<div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-2">
					<Card className="dark:bg-slate-800 dark:border-slate-700">
						<CardContent className="p-4 lg:p-6">
							<div className="mb-4 text-base font-semibold lg:text-lg text-slate-900 dark:text-white">
								Request Status Distribution
							</div>
							{dashboardLoading ? (
								<div className="py-8 text-center text-slate-500 dark:text-slate-400">
									Loading chart...
								</div>
							) : (
								<Bar
									data={requestStatusChartData}
									options={{
										responsive: true,
										plugins: {
											legend: {
												position: "top",
											},
											title: {
												display: false,
											},
										},
									}}
								/>
							)}
						</CardContent>
					</Card>

					<Card className="dark:bg-slate-800 dark:border-slate-700">
						<CardContent className="p-4 lg:p-6">
							<div className="mb-4 text-base font-semibold lg:text-lg text-slate-900 dark:text-white">
								User Distribution
							</div>
							{dashboardLoading ? (
								<div className="py-8 text-center text-slate-500 dark:text-slate-400">
									Loading chart...
								</div>
							) : (
								<Doughnut
									data={userDistributionChartData}
									options={{
										responsive: true,
										plugins: {
											legend: {
												position: "bottom",
											},
											title: {
												display: false,
											},
										},
									}}
								/>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Recent Activity and Completed Requests */}
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
					<Card className="dark:bg-slate-800 dark:border-slate-700">
						<CardContent className="p-4 lg:p-6">
							<div className="mb-4 text-base font-semibold lg:text-lg text-slate-900 dark:text-white">
								Recent Activity
							</div>
							{dashboardLoading ? (
								<div className="py-8 text-center text-slate-500 dark:text-slate-400">
									Loading activities...
								</div>
							) : dashboardData.recentActivity.length === 0 ? (
								<div className="py-8 text-center text-slate-500 dark:text-slate-400">
									No recent activity
								</div>
							) : (
								<div className="space-y-3">
									{dashboardData.recentActivity.map((activity, index) => (
										<div
											key={index}
											className="flex justify-between items-start p-3 rounded-lg bg-slate-50 dark:bg-slate-700"
										>
											<div className="flex-1">
												<div className="text-sm font-medium text-slate-900 dark:text-white">
													{activity.student}
												</div>
												<div className="text-xs text-slate-600 dark:text-slate-300">
													{activity.document}
												</div>
												<div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
													{activity.formattedDate}
												</div>
											</div>
											<span
												className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${
													activity.status === "Released"
														? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
														: activity.status === "Pending"
														? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
														: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
												}`}
											>
												{activity.status}
											</span>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>

					<Card className="dark:bg-slate-800 dark:border-slate-700">
						<CardContent className="p-4 lg:p-6">
							<div className="mb-4 text-base font-semibold lg:text-lg text-slate-900 dark:text-white">
								Recently Completed Requests
							</div>
							{dashboardLoading ? (
								<div className="py-8 text-center text-slate-500 dark:text-slate-400">
									Loading completed requests...
								</div>
							) : dashboardData.completedRequests.length === 0 ? (
								<div className="py-8 text-center text-slate-500 dark:text-slate-400">
									No completed requests
								</div>
							) : (
								<div className="space-y-3">
									{dashboardData.completedRequests
										.slice(0, 5)
										.map((request, index) => (
											<div key={index} className="p-3 bg-green-50 rounded-lg">
												<div className="flex justify-between items-start">
													<div>
														<div className="text-sm font-medium text-slate-900">
															{request.student}
														</div>
														<div className="text-xs text-slate-600">
															{request.document} - {request.purpose}
														</div>
													</div>
													<div className="text-xs text-right text-slate-500">
														<div>Requested: {request.dateRequested}</div>
														<div>Completed: {request.dateCompleted}</div>
													</div>
												</div>
											</div>
										))}
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</>
		);
	};

	const renderUsersContent = () => {
		return (
			<>
				{/* Users List */}
				<Card className="dark:bg-slate-800 dark:border-slate-700">
					<CardContent className="p-4 lg:p-6">
						<div className="flex justify-between items-center mb-4">
							<div className="text-base font-semibold lg:text-lg text-slate-900 dark:text-white">
								Users Management
							</div>
							<Button
								onClick={() => setShowAddUserModal(true)}
								className="text-white bg-blue-600 hover:bg-blue-700"
							>
								<Plus className="mr-2 w-4 h-4" />
								Add User
							</Button>
						</div>

						{loading ? (
							<div className="py-8 text-center text-slate-500 dark:text-slate-400">
								Loading users...
							</div>
						) : users.length === 0 ? (
							<div className="py-8 text-center text-slate-500 dark:text-slate-400">
								No users found
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full border-collapse">
									<thead>
										<tr className="border-b border-slate-200">
											<th className="px-4 py-3 font-medium text-left text-slate-700">
												User ID
											</th>
											<th className="px-4 py-3 font-medium text-left text-slate-700">
												Name
											</th>
											<th className="px-4 py-3 font-medium text-left text-slate-700">
												Email
											</th>
											<th className="px-4 py-3 font-medium text-left text-slate-700">
												User Level
											</th>
										</tr>
									</thead>
									<tbody>
										{users.map((user, index) => (
											<tr
												key={user.id}
												className={`border-b border-slate-100 ${
													index % 2 === 0 ? "bg-slate-50" : "bg-white"
												}`}
											>
												<td className="px-4 py-3 text-sm text-slate-900">
													{user.id}
												</td>
												<td className="px-4 py-3 text-sm text-slate-900">
													{user.firstname} {user.lastname}
												</td>
												<td className="px-4 py-3 text-sm text-slate-900">
													{user.email}
												</td>
												<td className="px-4 py-3 text-sm text-slate-900">
													<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
														{user.userLevel}
													</span>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</CardContent>
				</Card>
			</>
		);
	};

	const renderContent = () => {
		switch (activeSection) {
			case "Users":
				return renderUsersContent();
			case "Reports":
				return (
					<Card className="dark:bg-slate-800 dark:border-slate-700">
						<CardContent className="p-4 lg:p-6">
							<div className="py-8 text-center text-slate-500 dark:text-slate-400">
								Reports section coming soon...
							</div>
						</CardContent>
					</Card>
				);
			case "Settings":
				return (
					<Card className="dark:bg-slate-800 dark:border-slate-700">
						<CardContent className="p-4 lg:p-6">
							<div className="py-8 text-center text-slate-500 dark:text-slate-400">
								Settings section coming soon...
							</div>
						</CardContent>
					</Card>
				);
			default:
				return renderDashboardContent();
		}
	};

	return (
		<div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
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
				className={`fixed lg:sticky top-0 z-30 flex flex-col bg-slate-900 text-white transition-all duration-300 h-screen ${
					sidebarOpen
						? "w-64 translate-x-0"
						: "w-64 -translate-x-full lg:translate-x-0"
				} ${sidebarOpen ? "lg:w-64" : "lg:w-20"}`}
				style={{ backgroundColor: "#0f172a", color: "white" }}
			>
				{/* Top Section */}
				<div className="flex flex-col p-4 space-y-6 h-full">
					{/* Toggle button */}
					<button
						className="flex justify-center items-center mb-4 w-10 h-10 text-white bg-gray-600 rounded hover:bg-blue-700 focus:outline-none"
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
					<nav className="flex flex-col flex-1 gap-2">
						{navItems.map((item, idx) => (
							<button
								key={item.label}
								onClick={() => handleNavClick(item.label)}
								className={`flex gap-3 items-center px-3 py-2 text-white rounded transition-colors hover:bg-slate-800 ${
									activeSection === item.label ? "bg-slate-800" : "bg-slate-700"
								}`}
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
							</button>
						))}
					</nav>

					{/* Bottom Section - Logout Button */}
					<div className="mt-auto">
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
				</div>
			</aside>

			{/* Main Content */}
			<main className="flex-1 p-4 w-full min-w-0 lg:p-8">
				{/* Mobile Menu Button */}
				<div className="flex justify-between items-center mb-4 lg:hidden">
					<button
						onClick={() => setSidebarOpen(true)}
						className="p-2 bg-white rounded-lg border shadow-sm dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
					>
						<Menu className="w-5 h-5" />
					</button>
					<h1 className="text-xl font-bold text-slate-900 dark:text-white">
						Admin {activeSection}
					</h1>
				</div>

				{/* Desktop Header */}
				<header className="hidden justify-between items-center mb-8 lg:flex">
					<h1 className="text-3xl font-bold text-slate-900 dark:text-white">
						Admin {activeSection}
					</h1>
					<div className="flex gap-4 items-center">
						<ThemeToggle />
						{activeSection === "Dashboard" && (
							<Button
								className="text-white bg-blue-600 hover:bg-blue-700"
								onClick={fetchDashboardData}
							>
								Refresh Data
							</Button>
						)}
					</div>
				</header>

				{/* Mobile Header */}
				<header className="flex flex-col gap-4 mb-6 lg:hidden">
					<div className="flex justify-between items-center">
						<h1 className="text-xl font-bold text-slate-900 dark:text-white">
							Admin {activeSection}
						</h1>
						<ThemeToggle />
					</div>
					{activeSection === "Dashboard" && (
						<Button
							className="flex gap-2 items-center w-full bg-blue-600 hover:bg-blue-700"
							onClick={fetchDashboardData}
						>
							Refresh Data
						</Button>
					)}
				</header>

				{/* Dynamic Content */}
				{renderContent()}
			</main>

			{/* Add User Modal */}
			<AddUserModal
				isOpen={showAddUserModal}
				onClose={() => setShowAddUserModal(false)}
				onSuccess={handleAddUserSuccess}
			/>
		</div>
	);
}
