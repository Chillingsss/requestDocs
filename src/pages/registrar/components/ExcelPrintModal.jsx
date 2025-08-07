import React, { useState, useEffect } from "react";
import { X, Printer, Download, Eye } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { getDecryptedApiUrl } from "../../../utils/apiConfig";
import toast from "react-hot-toast";

const ExcelPrintModal = ({ isOpen, onClose, fileName, apiUrl }) => {
	const [loading, setLoading] = useState(false);
	const [excelHtml, setExcelHtml] = useState(null);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (isOpen && fileName) {
			fetchExcelHtml();
		}
	}, [isOpen, fileName]);

	const fetchExcelHtml = async () => {
		setLoading(true);
		setError(null);
		try {
			const url = `${apiUrl}/excel_to_html.php?file=${encodeURIComponent(
				fileName
			)}`;

			const response = await fetch(url);
			const responseText = await response.text();

			let data;
			try {
				data = JSON.parse(responseText);
			} catch (parseError) {
				console.error("Failed to parse JSON:", parseError);
				setError("Invalid response from server");
				toast.error("Invalid response from server");
				return;
			}

			if (data.success) {
				setExcelHtml(data.html);
				// Show info if file was truncated
				if (data.truncated) {
					toast.success(data.message || "Excel file loaded successfully!");
				}
			} else {
				setError(data.error || "Failed to load Excel file");
				toast.error(data.error || "Failed to load Excel file");
			}
		} catch (error) {
			console.error("Error fetching Excel HTML:", error);
			setError("Failed to load Excel file");
			toast.error("Failed to load Excel file");
		} finally {
			setLoading(false);
		}
	};

	const handlePrint = () => {
		if (!excelHtml) return;

		const printWindow = window.open("", "_blank");
		printWindow.document.write(excelHtml);
		printWindow.document.close();
		printWindow.focus();

		setTimeout(() => {
			printWindow.print();
			setTimeout(() => {
				printWindow.close();
			}, 1000);
		}, 500);
	};

	const handleDownload = () => {
		if (!excelHtml) return;

		const blob = new Blob([excelHtml], { type: "text/html" });
		const url = window.URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = fileName.replace(/\.(xlsx|xls)$/i, ".html");
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		window.URL.revokeObjectURL(url);
	};

	if (!isOpen) return null;

	return (
		<div className="flex fixed inset-0 z-50 justify-center items-center p-4 backdrop-blur-sm bg-black/50">
			<div className="relative w-full max-w-4xl bg-white rounded-lg shadow-2xl max-h-[90vh] overflow-hidden">
				{/* Header */}
				<div className="flex justify-between items-center px-6 py-4 border-b bg-slate-50">
					<div className="flex gap-3 items-center">
						<Eye className="w-5 h-5 text-blue-600" />
						<h2 className="text-lg font-semibold text-slate-900">
							Excel File Preview - {fileName}
						</h2>
					</div>
					<button
						onClick={onClose}
						className="p-2 rounded-full transition-colors text-slate-500 hover:text-slate-700 hover:bg-slate-100"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Content */}
				<div className="flex flex-col h-full">
					{/* Action Buttons */}
					<div className="flex gap-3 px-6 py-4 bg-white border-b">
						<Button
							onClick={handlePrint}
							disabled={loading || !excelHtml}
							className="flex gap-2 items-center text-white bg-blue-600 hover:bg-blue-700"
						>
							<Printer className="w-4 h-4" />
							Print Excel
						</Button>
						<Button
							onClick={handleDownload}
							disabled={loading || !excelHtml}
							variant="outline"
							className="flex gap-2 items-center"
						>
							<Download className="w-4 h-4" />
							Download HTML
						</Button>
					</div>

					{/* Excel Content */}
					<div className="overflow-auto flex-1 p-6">
						{loading && (
							<div className="flex justify-center items-center h-64">
								<div className="text-center">
									<div className="mx-auto mb-4 w-8 h-8 rounded-full border-b-2 border-blue-600 animate-spin"></div>
									<p className="text-slate-600">Loading Excel file...</p>
								</div>
							</div>
						)}

						{error && (
							<div className="flex justify-center items-center h-64">
								<div className="text-center">
									<div className="mb-4 text-red-500">
										<X className="mx-auto w-12 h-12" />
									</div>
									<p className="font-medium text-red-600">Error</p>
									<p className="mt-2 text-slate-600">{error}</p>
									<Button
										onClick={fetchExcelHtml}
										className="mt-4 text-white bg-blue-600 hover:bg-blue-700"
									>
										Try Again
									</Button>
								</div>
							</div>
						)}

						{excelHtml && !loading && (
							<div className="overflow-hidden bg-white rounded-lg border">
								<div
									className="p-4"
									dangerouslySetInnerHTML={{ __html: excelHtml }}
								/>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default ExcelPrintModal;
