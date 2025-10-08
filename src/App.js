import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import LoginPage from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PrivateRoute from "./components/PrivateRoute";
import RegistrarDashboard from "./pages/registrar/RegistrarDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";
import { initializeApiUrl } from "./utils/apiConfig";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SecurityProvider } from "./contexts/SecurityContext";
import InactivityWarningModal from "./components/InactivityWarningModal";

function App() {
	// Initialize encrypted API URL in session storage when app starts
	useEffect(() => {
		initializeApiUrl();
	}, []);
	return (
		<ThemeProvider>
			<SecurityProvider>
				<Routes>
					<Route path="/" element={<LoginPage />} />
					<Route
						path="/AdminDashboard"
						element={
							<PrivateRoute allowedRole="Admin">
								<AdminDashboard />
							</PrivateRoute>
						}
					/>
					<Route
						path="/RegistrarDashboard"
						element={
							<PrivateRoute allowedRole="Registrar">
								<RegistrarDashboard />
							</PrivateRoute>
						}
					/>
					<Route
						path="/StudentDashboard"
						element={
							<PrivateRoute allowedRole="Student">
								<StudentDashboard />
							</PrivateRoute>
						}
					/>
					<Route
						path="/TeacherDashboard"
						element={
							<PrivateRoute allowedRole="Teacher">
								<TeacherDashboard />
							</PrivateRoute>
						}
					/>
				</Routes>
				<InactivityWarningModal />
			</SecurityProvider>
		</ThemeProvider>
	);
}

export default App;
