import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Menu, FilePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import toast, { Toaster } from "react-hot-toast";
import { getStudentRecords } from "../../utils/teacher";
import TeacherSidebar from "./components/TeacherSidebar";
import DashboardStats from "./components/DashboardStats";
import StudentFileManagement from "./components/StudentFileManagement";

export default function TeacherDashboard() {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [students, setStudents] = useState([]);
	const navigate = useNavigate();

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

	// Fetch data on component mount
	useEffect(() => {
		fetchStudents();
	}, []);

	const fetchStudents = async () => {
		try {
			const data = await getStudentRecords();
			console.log("API data:", data);
			let studentsArray = data;
			if (typeof data === "string") {
				try {
					studentsArray = JSON.parse(data);
				} catch (e) {
					studentsArray = [];
				}
			}
			setStudents(Array.isArray(studentsArray) ? studentsArray : []);
		} catch (error) {
			console.error("Error fetching students:", error);
			toast.error("Failed to load students");
		}
	};

	const logout = () => {
		Cookies.remove("mogchs_user");
		navigate("/");
	};

	// Calculate stats - need to group by student id first
	const studentGroups = students.reduce((acc, record) => {
		const id = record.id;
		if (!acc[id]) {
			acc[id] = {
				id: record.id,
				firstname: record.firstname,
				lastname: record.lastname,
				email: record.email,
				sectionName: record.sectionName,
				gradeLevel: record.gradeLevel,
				files: [],
			};
		}
		if (record.fileName && record.fileName.trim() !== "") {
			acc[id].files.push({
				fileName: record.fileName,
				sfType: record.gradeLevel, // This is the Grade Level (Grade 11 or Grade 12)
			});
		}
		return acc;
	}, {});

	const groupedStudents = Object.values(studentGroups);
	const totalStudents = groupedStudents.length;
	const studentsWithFiles = groupedStudents.filter(
		(s) => s.files.length > 0
	).length;
	const totalFiles = groupedStudents.reduce(
		(acc, s) => acc + s.files.length,
		0
	);

	return (
		<div className="flex min-h-screen bg-slate-50">
			<Toaster position="top-right" />

			{/* Sidebar */}
			<TeacherSidebar
				sidebarOpen={sidebarOpen}
				setSidebarOpen={setSidebarOpen}
				onLogout={logout}
			/>

			{/* Main Content */}
			<main
				className={`flex-1 p-4 w-full min-w-0 lg:p-8 transition-all duration-300 ${
					sidebarOpen ? "lg:ml-64" : "lg:ml-20"
				}`}
			>
				{/* Mobile Menu Button */}
				<div className="flex justify-between items-center mb-4 lg:hidden">
					<button
						onClick={() => setSidebarOpen(true)}
						className="p-2 bg-white rounded-lg border shadow-sm text-slate-600 border-slate-200"
					>
						<Menu className="w-5 h-5" />
					</button>
					<h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
				</div>

				{/* Desktop Header */}
				<header className="hidden justify-between items-center mb-8 lg:flex">
					<h1 className="text-3xl font-bold text-slate-900">
						Teacher Dashboard
					</h1>
					<Button className="flex gap-2 items-center text-white bg-blue-600 hover:bg-blue-700">
						<FilePlus className="w-4 h-4" /> Upload Files
					</Button>
				</header>

				{/* Stats Cards */}
				<DashboardStats
					totalStudents={totalStudents}
					totalFiles={totalFiles}
					studentsWithFiles={studentsWithFiles}
				/>

				{/* Student File Management */}
				<StudentFileManagement />
			</main>
		</div>
	);
}
