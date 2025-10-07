import React from "react";
import { X, Check } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../../../components/ui/select";

export default function DocumentRequirementModal({
	showModal,
	documents,
	requirementTypes,
	formData,
	onFormDataChange,
	onSubmit,
	onCancel,
}) {
	if (!showModal) return null;

	const handleRequirementTypeToggle = (reqTypeId) => {
		const currentSelected = formData.requirementTypeIds || [];
		let newSelected;

		if (currentSelected.includes(reqTypeId)) {
			// Remove if already selected
			newSelected = currentSelected.filter((id) => id !== reqTypeId);
		} else {
			// Add if not selected
			newSelected = [...currentSelected, reqTypeId];
		}

		onFormDataChange({
			...formData,
			requirementTypeIds: newSelected,
		});
	};

	const isRequirementTypeSelected = (reqTypeId) => {
		return (formData.requirementTypeIds || []).includes(reqTypeId);
	};

	return (
		<div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-40">
			<div className="relative mx-4 w-full max-w-md bg-white rounded-lg shadow-lg border dark:bg-slate-800 border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-700">
					<h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
						Add Document Requirements
					</h2>
					<button
						onClick={onCancel}
						className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200"
						aria-label="Close"
					>
						<span className="text-2xl">&times;</span>
					</button>
				</div>

				{/* Form */}
				<form onSubmit={onSubmit}>
					<div className="px-6 py-4 space-y-4">
						{/* Document Selection */}
						<div>
							<label
								htmlFor="documentId"
								className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300"
							>
								Document <span className="text-red-500">*</span>
							</label>
							<Select
								value={formData.documentId || ""}
								onValueChange={(value) =>
									onFormDataChange({
										...formData,
										documentId: value,
									})
								}
								required
							>
								<SelectTrigger className="w-full bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100">
									<SelectValue placeholder="Select a document" />
								</SelectTrigger>
								<SelectContent className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600">
									{documents.map((doc) => (
										<SelectItem
											key={doc.id}
											value={doc.id}
											className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-600"
										>
											{doc.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Requirement Types Selection */}
						<div>
							<label className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
								Requirement Types <span className="text-red-500">*</span>
							</label>
							<div className="overflow-y-auto p-2 max-h-48 rounded-md border border-slate-300 dark:border-slate-600">
								{requirementTypes.map((reqType) => (
									<div
										key={reqType.id}
										className="flex items-center p-2 rounded cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700"
										onClick={() => handleRequirementTypeToggle(reqType.id)}
									>
										<div
											className={`w-5 h-5 border-2 rounded flex items-center justify-center mr-3 ${
												isRequirementTypeSelected(reqType.id)
													? "bg-blue-500 border-blue-500"
													: "border-slate-300 dark:border-slate-600"
											}`}
										>
											{isRequirementTypeSelected(reqType.id) && (
												<Check className="w-3 h-3 text-white" />
											)}
										</div>
										<span className="text-sm text-slate-700 dark:text-slate-300">
											{reqType.nameType}
										</span>
									</div>
								))}
							</div>
							{formData.requirementTypeIds &&
								formData.requirementTypeIds.length > 0 && (
									<p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
										{formData.requirementTypeIds.length} requirement type(s)
										selected
									</p>
								)}
						</div>
					</div>

					{/* Buttons */}
					<div className="flex justify-end pt-4 space-x-3">
						<button
							type="button"
							onClick={onCancel}
							className="px-4 py-2 text-sm font-medium bg-white rounded-md border text-slate-700 dark:text-slate-300 dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={
								!formData.documentId ||
								!formData.requirementTypeIds ||
								formData.requirementTypeIds.length === 0
							}
							className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md border border-transparent hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Add{" "}
							{formData.requirementTypeIds
								? formData.requirementTypeIds.length
								: 0}{" "}
							Requirement(s)
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
