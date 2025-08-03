import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import toast, { Toaster } from "react-hot-toast";
import { getStudentRecords } from "../../utils/teacher";
import TeacherSidebar from "./components/TeacherSidebar";
import DashboardStats from "./components/DashboardStats";
import StudentFileManagement from "./components/StudentFileManagement";
import ThemeToggle from "../../components/ThemeToggle";
import CryptoJS from "crypto-js";

export default function TeacherDashboard() {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [students, setStudents] = useState([]);
	const [teacherGradeLevelId, setTeacherGradeLevelId] = useState(null);
	const navigate = useNavigate();
	const COOKIE_KEY = "mogchs_user";
	const SECRET_KEY = "mogchs_secret_key";

	// Get teacher's grade level from stored user data
	useEffect(() => {
		const encrypted = Cookies.get(COOKIE_KEY);
		if (encrypted) {
			try {
				const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
				const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

				// Check if decrypted text is not empty
				if (decryptedText && decryptedText.trim() !== "") {
					const decrypted = JSON.parse(decryptedText);
					console.log("Decrypted user data:", decrypted);

					// Check if user is a teacher and has gradeLevelId
					if (
						decrypted &&
						decrypted.userLevel === "Teacher" &&
						decrypted.gradeLevelId
					) {
						setTeacherGradeLevelId(decrypted.gradeLevelId);
					} else if (decrypted && decrypted.userLevel === "Teacher") {
						console.warn("Teacher user found but no gradeLevelId assigned");
						// You might want to redirect to an error page or show a message
						toast.error(
							"Teacher account not properly configured. Please contact administrator."
						);
					}
				} else {
					console.warn("Empty decrypted text");
				}
			} catch (e) {
				console.error("Error decrypting user data:", e);
				// If decryption fails, try to get user data from a different approach
				// or redirect to login
				toast.error("Session expired. Please login again.");
				logout();
			}
		} else {
			console.warn("No user cookie found");
			// Redirect to login if no cookie found
			logout();
		}
	}, []);

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
		if (teacherGradeLevelId) {
			fetchStudents();
		}
	}, [teacherGradeLevelId]);

	const fetchStudents = async () => {
		try {
			const data = await getStudentRecords(teacherGradeLevelId);
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
		navigate("/mogchs");
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
				teacherGradeLevel: record.teacherGradeLevel,
				sectionGradeLevel: record.sectionGradeLevel,
				files: [],
			};
		}
		if (record.fileName && record.fileName.trim() !== "") {
			acc[id].files.push({
				fileName: record.fileName,
				sfType: record.teacherGradeLevel, // This is the Teacher's Grade Level (Grade 11 or Grade 12)
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
						className="p-2 bg-white rounded-lg border shadow-sm dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
					>
						<Menu className="w-5 h-5" />
					</button>
					<h1 className="text-xl font-bold text-slate-900 dark:text-white">
						Teacher Dashboard
					</h1>
				</div>

				{/* Desktop Header */}
				<header className="hidden justify-between items-center mb-8 lg:flex">
					<h1 className="text-3xl font-bold text-slate-900 dark:text-white">
						Teacher Dashboard
					</h1>
					<div className="flex gap-4 items-center">
						<ThemeToggle />
						<Button
							className="text-white bg-blue-600 hover:bg-blue-700"
							onClick={fetchStudents}
						>
							Refresh Data
						</Button>
					</div>
				</header>

				{/* Mobile Header */}
				<header className="flex flex-col gap-4 mb-6 lg:hidden">
					<div className="flex justify-between items-center">
						<h1 className="text-xl font-bold text-slate-900 dark:text-white">
							Teacher Dashboard
						</h1>
						<ThemeToggle />
					</div>
					<Button
						className="flex gap-2 items-center w-full bg-blue-600 hover:bg-blue-700"
						onClick={fetchStudents}
					>
						Refresh Data
					</Button>
				</header>

				{/* Dashboard Content */}
				<div className="space-y-6">
					<DashboardStats
						totalStudents={totalStudents}
						studentsWithFiles={studentsWithFiles}
						totalFiles={totalFiles}
					/>
					<StudentFileManagement teacherGradeLevelId={teacherGradeLevelId} />
				</div>
			</main>
		</div>
	);
}
