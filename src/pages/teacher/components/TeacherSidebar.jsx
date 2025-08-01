import React from "react";
import { Button } from "../../../components/ui/button";
import { Menu, FileText, Users, LogOut } from "lucide-react";

export default function TeacherSidebar({
	sidebarOpen,
	setSidebarOpen,
	onLogout,
}) {
	const navItems = [
		{ icon: <FileText className="w-5 h-5" />, label: "Students" },
		{ icon: <Users className="w-5 h-5" />, label: "Files" },
	];

	return (
		<>
			{/* Mobile Overlay */}
			{sidebarOpen && (
				<div
					className="fixed inset-0 z-20 bg-black/50 lg:hidden"
					onClick={() => setSidebarOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<aside
				className={`fixed top-0 left-0 z-30 flex flex-col bg-slate-900 dark:bg-slate-900 text-white dark:text-white transition-all duration-300 h-screen overflow-y-auto ${
					sidebarOpen
						? "w-64 translate-x-0"
						: "w-64 -translate-x-full lg:translate-x-0"
				} ${sidebarOpen ? "lg:w-64" : "lg:w-20"}`}
				style={{ backgroundColor: "#0f172a", color: "white" }}
			>
				{/* Top Section */}
				<div className="flex flex-col p-4 space-y-6">
					{/* Toggle button */}
					<button
						className="flex justify-center items-center mb-4 w-10 h-10 text-white bg-gray-600 rounded hover:bg-blue-700 dark:hover:bg-slate-800 focus:outline-none"
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
								sidebarOpen ? "h-20 w-22" : "w-12 h-12"
							}`}
						/>
					</div>

					{/* Nav */}
					<nav className="flex flex-col gap-2">
						{navItems.map((item, idx) => (
							<a
								href="#"
								key={item.label}
								className="flex gap-3 items-center px-3 py-2 text-white rounded transition-colors hover:bg-slate-800 dark:hover:bg-slate-800 dark:text-white"
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
					<Button
						className="flex gap-2 items-center px-4 py-2 w-full text-white bg-blue-600 rounded-md transition-colors hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
						style={{ backgroundColor: "#2563eb", color: "white" }}
						onClick={onLogout}
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
					</Button>
				</div>
			</aside>
		</>
	);
}
