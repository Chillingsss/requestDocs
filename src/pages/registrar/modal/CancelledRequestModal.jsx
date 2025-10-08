import React, { useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { X, AlertTriangle, RefreshCw } from "lucide-react";

export default function CancelledRequestModal({
	isOpen,
	onClose,
	onRefresh,
	message = "We apologize, but this document request has been cancelled by the student. Please refresh the page to see the updated status.",
}) {
	// Refresh data immediately when modal opens
	useEffect(() => {
		if (isOpen) {
			onRefresh();
		}
	}, [isOpen, onRefresh]);

	if (!isOpen) return null;

	return (
		<div className="flex fixed inset-0 z-50 justify-center items-center p-4 backdrop-blur-sm bg-black/60">
			<div className="relative w-full max-w-md bg-white rounded-lg shadow-2xl dark:bg-slate-800">
				{/* Header */}
				<div className="flex justify-between items-center px-6 py-4 text-white bg-red-600 rounded-t-lg">
					<div className="flex gap-3 items-center">
						<AlertTriangle className="w-6 h-6" />
						<h2 className="text-lg font-semibold">Request Cancelled</h2>
					</div>
					<button
						onClick={onClose}
						className="p-2 text-white bg-transparent rounded-full transition-colors hover:text-red-200"
						aria-label="Close"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Content */}
				<div className="p-6">
					<div className="mb-6">
						<div className="flex gap-3 items-start mb-4">
							<div className="flex-shrink-0 mt-1">
								<div className="flex justify-center items-center w-10 h-10 bg-red-100 rounded-full dark:bg-red-900/30">
									<AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
								</div>
							</div>
							<div className="flex-1">
								<h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
									Request No Longer Available
								</h3>
								<p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
									{message}
								</p>
							</div>
						</div>

						<div className="p-4 bg-red-50 rounded-lg border border-red-200 dark:bg-red-900/20 dark:border-red-700">
							<div className="flex gap-2 items-start">
								<AlertTriangle className="flex-shrink-0 mt-0.5 w-4 h-4 text-red-600 dark:text-red-400" />
								<div className="text-sm text-red-700 dark:text-red-300">
									<p className="mb-1 font-medium">
										This request has been cancelled by the student.
									</p>
									<p>
										You can no longer process, update, or release this document
										request.
									</p>
								</div>
							</div>
						</div>

						{/* Data refreshed notification */}
						<div className="p-3 bg-green-50 rounded-lg border border-green-200 dark:bg-green-900/20 dark:border-green-700">
							<div className="flex gap-2 justify-center items-center">
								<RefreshCw className="w-4 h-4 text-green-600 dark:text-green-400" />
								<span className="text-sm text-green-700 dark:text-green-300">
									Data has been refreshed. You can now see the updated status.
								</span>
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex justify-end">
						<Button
							onClick={onClose}
							variant="outline"
							className="text-slate-700 border-slate-300 hover:bg-slate-50 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700"
						>
							Close
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
